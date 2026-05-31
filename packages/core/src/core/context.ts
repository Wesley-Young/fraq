import mitt from 'mitt';

import { createMilkyClient, type MilkyClient } from '../protocol/client';
import type { EventMap } from '../protocol/endpoint';
import type { Event, IncomingMessage } from '../protocol/types';
import { Router, type Session } from '../routing/router';
import type { Filter } from './filter';
import type { ParameterList, Plugin } from './plugin';
import { getServiceName, type ServiceClass } from './service';

const DEFAULT_INITIAL_RECONNECT_DELAY_MS = 1_000;
const DEFAULT_MAX_RECONNECT_DELAY_MS = 30_000;

type InstalledPlugin = {
  plugin: Plugin<ParameterList>;
  args: ParameterList;
};

export interface ContextOptions {
  connect: {
    baseUrl: string;
    accessToken?: string;
    initialReconnectDelay?: number;
    maxReconnectDelay?: number;
  };
}

export class Context {
  readonly router = new Router();

  private readonly initialReconnectDelayMs: number;
  private readonly maxReconnectDelayMs: number;
  private readonly parent?: Context;
  private readonly eventBus = mitt<EventMap>();
  private readonly plugins: InstalledPlugin[] = [];
  private readonly services = new Map<ServiceClass, object>();
  private readonly subContexts: Context[] = [];

  private isStarted = false;

  private constructor(
    readonly client: MilkyClient,
    options?: ContextOptions,
    parent?: Context,
    filter?: Filter,
  ) {
    this.initialReconnectDelayMs = options?.connect.initialReconnectDelay ?? DEFAULT_INITIAL_RECONNECT_DELAY_MS;
    this.maxReconnectDelayMs = options?.connect.maxReconnectDelay ?? DEFAULT_MAX_RECONNECT_DELAY_MS;
    this.parent = parent;
    parent?.eventBus.on('*', (type, event) => {
      if (filter) {
        const predicate = filter[type];
        // @ts-expect-error
        if (predicate && !predicate(event)) {
          return;
        }
      }
      this.eventBus.emit(type, event);
    });
    this.eventBus.on('message_receive', async ({ data: message }) => {
      try {
        this.router.dispatch(this.createSession(message), message);
      } catch (error) {
        console.error('Error routing command:', error);
      }
    });
  }

  on<K extends keyof EventMap>(type: K, handler: (event: EventMap[K]) => void | Promise<void>): void {
    this.eventBus.on(type, async (event) => {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error handling event ${type}:`, error);
      }
    });
  }

  install<T extends ParameterList>(plugin: Plugin<T>, ...args: T): void {
    this.plugins.push({ plugin: plugin as Plugin<ParameterList>, args });
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

  fork(filter?: Filter): Context {
    const subContext = new Context(this.client, undefined, this, filter);
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
      void this.connectEventWebSocket();
    }
  }

  private async applyPlugins(): Promise<void> {
    for (const { plugin, args } of this.sortPlugins()) {
      const providedBeforeApply = new Set(this.services.keys());
      await plugin.apply(this, ...args);
      for (const service of plugin.provides ?? []) {
        if (!this.services.has(service) || providedBeforeApply.has(service)) {
          throw new Error(
            `${this.describePlugin(plugin)} declares service ${getServiceName(service)} but did not provide it.`,
          );
        }
      }
    }
  }

  private sortPlugins(): InstalledPlugin[] {
    // validate that no service is provided by multiple plugins
    const providers = new Map<ServiceClass, Plugin<ParameterList>>();
    for (const { plugin } of this.plugins) {
      for (const service of plugin.provides ?? []) {
        const existingProvider = providers.get(service);
        if (existingProvider) {
          throw new Error(
            `Service ${getServiceName(service)} is declared by multiple plugins: ${this.describePlugin(existingProvider)} and ${this.describePlugin(plugin)}.`,
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
    const missingRequirements = new Map<ServiceClass, Plugin<ParameterList>[]>();
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
      const dependents = plugins.map((plugin) => this.describePlugin(plugin)).join(', ');
      const reason = pendingProviders.has(service)
        ? 'blocked by a dependency cycle'
        : 'no installed plugin provides it';
      return `${getServiceName(service)} required by ${dependents} (${reason})`;
    });

    return new Error(`Unable to resolve plugin service dependencies: ${lines.join('; ')}.`);
  }

  private describePlugin(plugin: Plugin<ParameterList>): string {
    const pluginIndex = this.plugins.findIndex((installed) => installed.plugin === plugin);
    const name =
      plugin.constructor.name && plugin.constructor.name !== 'Object'
        ? plugin.constructor.name
        : `plugin #${pluginIndex + 1}`;
    return name;
  }

  private async connectEventWebSocket(): Promise<void> {
    let reconnectDelay = this.initialReconnectDelayMs;
    while (this.isStarted) {
      try {
        const ws = await this.client.openEventWebSocket((event) => {
          try {
            if (typeof event.data !== 'string') {
              throw new Error(`Expected text frame, got ${typeof event.data}`);
            }
            const payload = JSON.parse(event.data) as Event;
            this.eventBus.emit(payload.event_type, payload);
          } catch (error) {
            console.error('Error handling WebSocket event:', error);
          }
        });
        reconnectDelay = this.initialReconnectDelayMs;
        await new Promise<void>((resolve) => {
          ws.addEventListener('close', () => resolve(), { once: true });
        });
      } catch (error) {
        console.error('Error connecting event WebSocket:', error);
      }
      await new Promise((resolve) => setTimeout(resolve, reconnectDelay));
      reconnectDelay = Math.min(reconnectDelay * 2, this.maxReconnectDelayMs);
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
          console.error('Error sending reply:', error);
        }
      },
    };
  }

  static create(options: ContextOptions): Context {
    const client = createMilkyClient(options.connect.baseUrl, { accessToken: options.connect.accessToken });
    return new Context(client, options);
  }
}
