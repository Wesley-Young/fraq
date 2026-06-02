import mitt from 'mitt';

import { createMilkyClient, type MilkyClient } from '../protocol/client';
import type { EventMap } from '../protocol/endpoint';
import type { Event, IncomingMessage } from '../protocol/types';
import { Router, type Session } from '../routing/router';
import type { Filter } from './filter';
import { Logger, type LogHandler } from './logging';
import type { Injection, ParameterList, Plugin } from './plugin';
import { getServiceName, type ServiceClass } from './service';

const DEFAULT_INITIAL_RECONNECT_DELAY_MS = 1_000;
const DEFAULT_MAX_RECONNECT_DELAY_MS = 30_000;

type InstalledPlugin = {
  plugin: Plugin<ParameterList, Injection | undefined>;
  args: ParameterList;
};

export interface ContextOptions {
  reconnect?: {
    initialDelayMs?: number;
    maxDelayMs?: number;
  };
  logHandler?: LogHandler;
}

export interface ContextUrlOptions {
  accessToken?: string;
}

export class Context {
  readonly router = new Router();
  readonly logger: Logger;
  readonly name: string;

  private readonly parent?: Context;
  private readonly filter?: Filter;
  private readonly eventBus = mitt<EventMap>();
  private readonly plugins: InstalledPlugin[] = [];
  private readonly services = new Map<ServiceClass, object>();
  private readonly subContexts: Context[] = [];

  private readonly initialReconnectDelayMs: number;
  private readonly maxReconnectDelayMs: number;
  private readonly logHandler?: LogHandler;

  private isStarted = false;

  private constructor(
    readonly client: MilkyClient,
    options?: ContextOptions,
    name?: string,
    parent?: Context,
    filter?: Filter,
  ) {
    this.initialReconnectDelayMs = options?.reconnect?.initialDelayMs ?? DEFAULT_INITIAL_RECONNECT_DELAY_MS;
    this.maxReconnectDelayMs = options?.reconnect?.maxDelayMs ?? DEFAULT_MAX_RECONNECT_DELAY_MS;
    this.logHandler = options?.logHandler ?? parent?.logHandler;
    this.name = name ?? 'root';
    this.logger = new Logger((message) => this.logHandler?.(message), this.name);

    this.parent = parent;
    this.filter = filter;
    parent?.eventBus.on('*', (type, event) => {
      if (!this.acceptsParentEvent(type, event)) {
        return;
      }
      this.eventBus.emit(type, event);
    });
    this.eventBus.on('message_receive', async ({ data: message }) => {
      try {
        await this.router.dispatch(this.createSession(message), message);
      } catch (error) {
        this.logger.error(
          `Error routing command (scene=${message.message_scene} peer=${message.peer_id} sender=${message.sender_id} seq=${message.message_seq})`,
          error,
        );
      }
    });
  }

  on<K extends keyof EventMap>(type: K, handler: (event: EventMap[K]) => void | Promise<void>): void {
    this.eventBus.on(type, async (event) => {
      try {
        await handler(event);
      } catch (error) {
        this.logger.error(`Error handling event ${type}`, error);
      }
    });
  }

  install<T extends ParameterList, I extends Injection | undefined>(plugin: Plugin<T, I>, ...args: T): void {
    this.plugins.push({ plugin: plugin as Plugin<ParameterList, Injection | undefined>, args });
  }

  provide<T extends object>(service: ServiceClass<T>, instance: T): void {
    if (this.services.has(service)) {
      throw new Error(`Service ${getServiceName(service)} has already been provided in this context.`);
    }
    this.services.set(service, instance);
  }

  resolve<T extends object>(service: ServiceClass<T>): T {
    const instance = this.tryResolve(service);
    if (instance === undefined) {
      throw new Error(`Service ${getServiceName(service)} has not been provided.`);
    }
    return instance;
  }

  tryResolve<T extends object>(service: ServiceClass<T>): T | undefined {
    if (this.services.has(service)) {
      return this.services.get(service) as T;
    }
    return this.parent?.tryResolve(service);
  }

  isProvided<T extends object>(service: ServiceClass<T>): boolean {
    return this.tryResolve(service) !== undefined;
  }

  fork(name: string, filter?: Filter): Context {
    const subContext = new Context(this.client, undefined, name, this, filter);
    this.subContexts.push(subContext);
    return subContext;
  }

  async start(): Promise<void> {
    if (this.isStarted) {
      return;
    }
    await this.applyPlugins();
    for (const subContext of this.subContexts) {
      await subContext.start();
    }
    this.isStarted = true;
    if (!this.parent) {
      void this.runEventStream();
    }
  }

  private acceptsParentEvent<K extends keyof EventMap>(type: K, event: EventMap[K]): boolean {
    if (!this.filter) {
      return true;
    }
    const predicate = this.filter[type];
    return predicate?.(event) === true;
  }

  private async applyPlugins(): Promise<void> {
    for (const { plugin, args } of this.sortPlugins()) {
      const providedBeforeApply = new Set(this.services.keys());
      this.logger.info(`Applying plugin ${plugin.name}`);
      await plugin.apply(this.createProxyContextForPlugin(plugin), ...args);
      for (const service of plugin.provides ?? []) {
        if (!this.services.has(service) || providedBeforeApply.has(service)) {
          throw new Error(`${plugin.name} declares service ${getServiceName(service)} but did not provide it.`);
        }
      }
      this.logger.debug(`Applied plugin ${plugin.name}`);
    }
  }

  private sortPlugins(): InstalledPlugin[] {
    // validate that no service is provided by multiple plugins
    const providers = new Map<ServiceClass, Plugin<ParameterList, Injection | undefined>>();
    for (const { plugin } of this.plugins) {
      for (const service of plugin.provides ?? []) {
        const existingProvider = providers.get(service);
        if (existingProvider) {
          throw new Error(
            `Service ${getServiceName(service)} is declared by multiple plugins: ${existingProvider.name} and ${plugin.name}.`,
          );
        }
        providers.set(service, plugin);
      }
    }

    const pending = [...this.plugins];
    const sorted: InstalledPlugin[] = [];
    const available = new Set<ServiceClass>();
    for (const service of this.collectAvailableServices()) {
      available.add(service);
    }

    while (pending.length > 0) {
      const nextIndex = pending.findIndex(({ plugin }) =>
        (plugin.requires ?? []).every((service) => available.has(service)),
      );
      if (nextIndex === -1) {
        throw this.createUnresolvablePluginError(pending, available);
      }

      const [next] = pending.splice(nextIndex, 1);
      sorted.push(next);
      for (const service of next.plugin.provides ?? []) {
        available.add(service);
      }
    }

    return sorted;
  }

  private collectAvailableServices(): ServiceClass[] {
    const services = [...this.services.keys()];
    if (this.parent) {
      services.push(...this.parent.collectAvailableServices());
    }
    return services;
  }

  private createUnresolvablePluginError(pending: InstalledPlugin[], available: Set<ServiceClass>): Error {
    const missingRequirements = new Map<ServiceClass, Plugin<ParameterList, Injection | undefined>[]>();
    const pendingProviders = new Set<ServiceClass>();
    for (const { plugin } of pending) {
      for (const service of plugin.provides ?? []) {
        pendingProviders.add(service);
      }
    }

    for (const { plugin } of pending) {
      for (const service of plugin.requires ?? []) {
        if (!available.has(service)) {
          const plugins = missingRequirements.get(service) ?? [];
          plugins.push(plugin);
          missingRequirements.set(service, plugins);
        }
      }
    }

    const lines = [...missingRequirements].map(([service, plugins]) => {
      const dependents = plugins.map((plugin) => plugin.name).join(', ');
      const reason = pendingProviders.has(service)
        ? 'blocked by a dependency cycle'
        : 'no installed plugin provides it';
      return `${getServiceName(service)} required by ${dependents} (${reason})`;
    });

    return new Error(`Unable to resolve plugin service dependencies: ${lines.join('; ')}.`);
  }

  private createProxyContextForPlugin(plugin: Plugin<ParameterList, Injection | undefined>): Context {
    const proxyLogger = new Logger((message) => this.logHandler?.(message), plugin.name);
    let proxyInjections: undefined | Record<string, object>;
    if (plugin.inject) {
      proxyInjections = {};
      for (const [key, service] of Object.entries(plugin.inject)) {
        proxyInjections[key] = this.resolve(service);
      }
    }
    return new Proxy(this, {
      get(target, prop) {
        // proxy a logger for the plugin that prefixes messages with the plugin name
        if (prop === 'logger') {
          return proxyLogger;
        } else if (proxyInjections && prop in proxyInjections) {
          return proxyInjections[prop as keyof typeof proxyInjections];
        } else {
          return target[prop as keyof Context];
        }
      },
    });
  }

  private async runEventStream(): Promise<void> {
    let reconnectDelay = this.initialReconnectDelayMs;
    let reconnectAttempt = 1;
    while (this.isStarted) {
      try {
        this.logger.debug(`Connecting event stream (attempt=${reconnectAttempt})`);
        const subscription = await this.client.startEvents((event: Event) => {
          try {
            this.eventBus.emit(event.event_type, event);
          } catch (error) {
            this.logger.error('Error handling event stream event', error);
          }
        });
        this.logger.info('Event stream connected');
        reconnectDelay = this.initialReconnectDelayMs;
        reconnectAttempt = 1;
        await subscription.closed;
        this.logger.warn(`Event stream disconnected; reconnecting in ${reconnectDelay}ms`);
      } catch (error) {
        this.logger.error(`Error connecting event stream; reconnecting in ${reconnectDelay}ms`, error);
      }
      await new Promise((resolve) => setTimeout(resolve, reconnectDelay));
      reconnectDelay = Math.min(reconnectDelay * 2, this.maxReconnectDelayMs);
      reconnectAttempt += 1;
    }
  }

  private createSession(message: IncomingMessage): Session {
    return {
      raw: message,
      reply: async (segments) => {
        try {
          switch (message.message_scene) {
            case 'friend':
              await this.client.send_private_message({
                user_id: message.peer_id,
                message: segments,
              });
              break;
            case 'group':
              await this.client.send_group_message({
                group_id: message.peer_id,
                message: segments,
              });
              break;
          }
        } catch (error) {
          this.logger.error(
            `Error sending reply (source msg: scene=${message.message_scene} peer=${message.peer_id} sender=${message.sender_id} seq=${message.message_seq})`,
            error,
          );
        }
      },
    };
  }

  static fromUrl(baseUrl: string | URL, options?: ContextOptions & ContextUrlOptions): Context {
    const client = createMilkyClient(baseUrl, { accessToken: options?.accessToken });
    return new Context(client, options);
  }

  static fromClient(client: MilkyClient, options?: ContextOptions): Context {
    return new Context(client, options);
  }
}
