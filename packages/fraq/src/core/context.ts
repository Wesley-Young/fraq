import mitt, { type WildcardHandler } from 'mitt';

import { createMilkyClient, type MilkyClient, type MilkyEventSubscription } from '../protocol/client';
import type { EventMap } from '../protocol/endpoint';
import type { Event, IncomingMessage } from '../protocol/types';
import type { Session } from '../routing/command';
import { Router } from '../routing/router';
import type { Filter } from './filter';
import { Logger, type LogHandler } from './logging';
import type { Injection, ParameterList, Plugin } from './plugin';
import { implementsESNextDisposable, isDisposable, type ServiceClass } from './service';

const DEFAULT_INITIAL_RECONNECT_DELAY_MS = 1_000;
const DEFAULT_MAX_RECONNECT_DELAY_MS = 30_000;

type ContextState = 'idle' | 'starting' | 'started' | 'stopping' | 'stopped';

type InstalledPlugin = {
  plugin: Plugin<ParameterList, Injection | undefined, Injection | undefined>;
  args: ParameterList;
  proxy?: Context;
};

type AppliedContextPlugins = {
  context: Context;
  sortedPlugins: InstalledPlugin[];
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
  private readonly parentEventForwarder?: WildcardHandler<EventMap>;
  private readonly timers = new Set<NodeJS.Timeout>();

  private readonly initialReconnectDelayMs: number;
  private readonly maxReconnectDelayMs: number;
  private readonly logHandler?: LogHandler;

  private state: ContextState = 'idle';
  private startPromise?: Promise<void>;
  private stopPromise?: Promise<void>;
  private eventSubscription?: MilkyEventSubscription;
  private eventStreamTask?: Promise<void>;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private resolveReconnectTimer?: () => void;

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
    if (parent) {
      this.parentEventForwarder = (type, event) => {
        if (!this.acceptsParentEvent(type, event)) {
          return;
        }
        this.eventBus.emit(type, event);
      };
      parent.eventBus.on('*', this.parentEventForwarder);
    }
    this.eventBus.on('message_receive', async ({ data: message }) => {
      try {
        if (this.state === 'stopping' || this.state === 'stopped') {
          return;
        }
        await this.router.dispatch(this.createSession(message), message);
      } catch (error) {
        this.logger.error(
          `Error routing command (scene=${message.message_scene} peer=${message.peer_id} sender=${message.sender_id} seq=${message.message_seq})`,
          error,
        );
      }
    });
  }

  on<K extends keyof EventMap>(type: K, handler: (event: EventMap[K]) => void | Promise<void>): () => void {
    const wrappedHandler = async (event: EventMap[K]) => {
      try {
        if (this.state === 'stopping' || this.state === 'stopped') {
          return;
        }
        await handler(event);
      } catch (error) {
        this.logger.error(`Error handling event ${type}`, error);
      }
    };
    this.eventBus.on(type, wrappedHandler);
    return () => {
      this.eventBus.off(type, wrappedHandler);
    };
  }

  install<T extends ParameterList, I extends Injection | undefined, OI extends Injection | undefined>(
    plugin: Plugin<T, I, OI>,
    ...args: T
  ): void {
    this.plugins.push({ plugin: plugin as Plugin<ParameterList, Injection | undefined, Injection | undefined>, args });
  }

  provide<T extends object>(service: ServiceClass<T>, instance: T): void {
    if (this.services.has(service)) {
      throw new Error(`Service ${service.name} has already been provided in this context.`);
    }
    if (implementsESNextDisposable(instance) && !isDisposable(instance)) {
      throw new Error(
        `
Service ${service.name} implements ESNext Disposable but not Fraq Disposable.
Please explicitly import the interface like this:

import type { Disposable } from '@fraqjs/fraq';

and implement the dispose method to clean up resources when the context stops.
    `.trim(),
      );
    }
    this.services.set(service, instance);
  }

  resolve<T extends object>(service: ServiceClass<T>): T {
    const instance = this.tryResolve(service);
    if (instance === undefined) {
      throw new Error(`Service ${service.name} has not been provided.`);
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

  timeout(delayMs: number, callback: () => void | Promise<void>): NodeJS.Timeout {
    this.assertCanScheduleTimer();
    const timeout = setTimeout(() => {
      this.timers.delete(timeout);
      void this.runTimerCallback(callback);
    }, delayMs);
    this.timers.add(timeout);
    return timeout;
  }

  interval(intervalMs: number, callback: () => void | Promise<void>): NodeJS.Timeout {
    this.assertCanScheduleTimer();
    const interval = setInterval(() => {
      void this.runTimerCallback(callback);
    }, intervalMs);
    this.timers.add(interval);
    return interval;
  }

  createSession(message: IncomingMessage): Session {
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

  async start(): Promise<void> {
    if (this.state === 'started') {
      return;
    }
    if (this.state === 'starting') {
      await this.startPromise;
      return;
    }
    if (this.state === 'stopping') {
      throw new Error(`Context "${this.name}" cannot be started while it is stopping.`);
    }
    if (this.state === 'stopped') {
      throw new Error(`Context "${this.name}" cannot be restarted after it has been stopped.`);
    }

    this.state = 'starting';
    this.startPromise = this.startInternal();
    try {
      await this.startPromise;
    } finally {
      this.startPromise = undefined;
    }
  }

  async stop(): Promise<void> {
    if ((this.state === 'idle' && this.timers.size === 0) || this.state === 'stopped') {
      return;
    }
    if (this.state === 'starting') {
      await this.startPromise;
    }
    const stateAfterStart = this.getState();
    if ((stateAfterStart === 'idle' && this.timers.size === 0) || stateAfterStart === 'stopped') {
      return;
    }
    if (stateAfterStart === 'stopping') {
      await this.stopPromise;
      return;
    }

    this.state = 'stopping';
    this.stopPromise = this.stopInternal();
    try {
      await this.stopPromise;
    } finally {
      this.state = 'stopped';
      this.stopPromise = undefined;
    }
  }

  private async startInternal(): Promise<void> {
    const appliedContextPlugins: AppliedContextPlugins[] = [];
    const startingContexts: Context[] = [];
    try {
      await this.recursiveApplyPlugins(appliedContextPlugins, startingContexts);
      await this.recursiveStartPlugins(appliedContextPlugins);
    } catch (error) {
      for (const context of startingContexts) {
        if (context.state === 'starting') {
          context.state = 'idle';
        }
      }
      throw error;
    }
    for (const { context } of appliedContextPlugins) {
      context.state = 'started';
    }
    if (!this.parent) {
      this.eventStreamTask = this.runEventStream();
    }
  }

  private getState(): ContextState {
    return this.state;
  }

  private async stopInternal(): Promise<void> {
    const errors: unknown[] = [];

    this.clearTimers();

    for (const subContext of [...this.subContexts].reverse()) {
      try {
        await subContext.stop();
      } catch (error) {
        errors.push(error);
      }
    }

    await this.stopEventStream(errors);

    if (this.parent && this.parentEventForwarder) {
      this.parent.eventBus.off('*', this.parentEventForwarder);
    }

    for (const service of [...this.services.values()].reverse()) {
      if (!isDisposable(service)) {
        continue;
      }
      try {
        await service.dispose();
      } catch (error) {
        errors.push(error);
      }
    }

    if (errors.length === 1) {
      throw errors[0];
    }
    if (errors.length > 1) {
      throw new AggregateError(errors, `Context "${this.name}" failed to stop cleanly.`);
    }
  }

  private assertCanScheduleTimer(): void {
    if (this.state === 'stopping') {
      throw new Error(`Context "${this.name}" cannot schedule timers while it is stopping.`);
    }
    if (this.state === 'stopped') {
      throw new Error(`Context "${this.name}" cannot schedule timers after it has stopped.`);
    }
  }

  private async runTimerCallback(callback: () => void | Promise<void>): Promise<void> {
    if (this.state === 'stopping' || this.state === 'stopped') {
      return;
    }
    try {
      await callback();
    } catch (error) {
      this.logger.error('Error handling timer callback', error);
    }
  }

  private clearTimers(): void {
    for (const timer of this.timers) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }

  private async stopEventStream(errors: unknown[]): Promise<void> {
    this.resolveReconnectDelay();

    const subscription = this.eventSubscription;
    if (subscription) {
      try {
        await subscription.stop();
      } catch (error) {
        errors.push(error);
      }
    }

    if (this.eventStreamTask) {
      try {
        await this.eventStreamTask;
      } catch (error) {
        errors.push(error);
      } finally {
        this.eventStreamTask = undefined;
      }
    }
  }

  private acceptsParentEvent<K extends keyof EventMap>(type: K, event: EventMap[K]): boolean {
    if (!this.filter) {
      return true;
    }
    const predicate = this.filter[type];
    return predicate?.(event) === true;
  }

  private async applyPlugins(sortedPlugins: InstalledPlugin[]): Promise<void> {
    for (const installedPlugin of sortedPlugins) {
      const { plugin, args } = installedPlugin;
      const providedBeforeApply = new Set(this.services.keys());
      let debugMessage = `Applying plugin ${plugin.name}`;
      const requiredServices: string[] = [];
      const providedServices: string[] = [];
      if (plugin.requires) {
        for (const service of plugin.requires) {
          requiredServices.push(service.name);
        }
      }
      if (plugin.optionalRequires) {
        for (const service of plugin.optionalRequires) {
          requiredServices.push(`${service.name}?`);
        }
      }
      if (plugin.provides) {
        for (const service of plugin.provides) {
          providedServices.push(service.name);
        }
      }
      if (requiredServices.length > 0) {
        debugMessage += `, requires: [${requiredServices.join(', ')}]`;
      }
      if (providedServices.length > 0) {
        debugMessage += `, provides: [${providedServices.join(', ')}]`;
      }
      this.logger.debug(debugMessage);
      await plugin.apply(this.getPluginContext(installedPlugin), ...args);
      for (const service of plugin.provides ?? []) {
        if (!this.services.has(service) || providedBeforeApply.has(service)) {
          throw new Error(`${plugin.name} declares service ${service.name} but did not provide it.`);
        }
      }
    }
  }

  private async recursiveApplyPlugins(
    appliedContextPlugins: AppliedContextPlugins[],
    startingContexts: Context[],
  ): Promise<void> {
    if (this.state === 'started') {
      return;
    }
    if (this.state === 'starting' && this.startPromise) {
      await this.startPromise;
      return;
    }
    if (this.state === 'stopping') {
      throw new Error(`Context "${this.name}" cannot be started while it is stopping.`);
    }
    if (this.state === 'stopped') {
      throw new Error(`Context "${this.name}" cannot be restarted after it has been stopped.`);
    }
    if (this.state === 'idle') {
      this.state = 'starting';
    }
    startingContexts.push(this);

    const sortedPlugins = this.sortPlugins();
    await this.applyPlugins(sortedPlugins);
    appliedContextPlugins.push({ context: this, sortedPlugins });

    for (const subContext of this.subContexts) {
      await subContext.recursiveApplyPlugins(appliedContextPlugins, startingContexts);
    }
  }

  private async startPlugins(sortedPlugins: InstalledPlugin[]): Promise<void> {
    for (const installedPlugin of sortedPlugins) {
      const { plugin } = installedPlugin;
      if (!plugin.start) {
        continue;
      }
      this.logger.debug(`Plugin ${plugin.name} is starting...`);
      await plugin.start(this.getPluginContext(installedPlugin));
    }
  }

  private async recursiveStartPlugins(appliedContextPlugins: AppliedContextPlugins[]): Promise<void> {
    for (const { context, sortedPlugins } of appliedContextPlugins) {
      await context.startPlugins(sortedPlugins);
    }
  }

  private sortPlugins(): InstalledPlugin[] {
    // validate that no service is provided by multiple plugins
    const providers = new Map<ServiceClass, Plugin<ParameterList, Injection | undefined, Injection | undefined>>();
    for (const { plugin } of this.plugins) {
      for (const service of plugin.provides ?? []) {
        const existingProvider = providers.get(service);
        if (existingProvider) {
          throw new Error(
            `Service ${service.name} is declared by multiple plugins: ${existingProvider.name} and ${plugin.name}.`,
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
      const availableByPendingPlugins = this.collectPendingProvidedServices(pending);
      const requiredReadyIndex = pending.findIndex(({ plugin }) =>
        this.areRequiredServicesAvailable(plugin, available),
      );
      const optionalReadyIndex = pending.findIndex(
        ({ plugin }) =>
          this.areRequiredServicesAvailable(plugin, available) &&
          this.areOptionalServicesReady(plugin, available, availableByPendingPlugins),
      );
      const nextIndex = optionalReadyIndex === -1 ? requiredReadyIndex : optionalReadyIndex;
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

  private collectPendingProvidedServices(pending: InstalledPlugin[]): Map<ServiceClass, InstalledPlugin> {
    const providedServices = new Map<ServiceClass, InstalledPlugin>();
    for (const installedPlugin of pending) {
      for (const service of installedPlugin.plugin.provides ?? []) {
        providedServices.set(service, installedPlugin);
      }
    }
    return providedServices;
  }

  private areRequiredServicesAvailable(
    plugin: Plugin<ParameterList, Injection | undefined, Injection | undefined>,
    available: Set<ServiceClass>,
  ): boolean {
    return (plugin.requires ?? []).every((service) => available.has(service));
  }

  private areOptionalServicesReady(
    plugin: Plugin<ParameterList, Injection | undefined, Injection | undefined>,
    available: Set<ServiceClass>,
    pendingProviders: Map<ServiceClass, InstalledPlugin>,
  ): boolean {
    return (plugin.optionalRequires ?? []).every((service) => {
      if (available.has(service)) {
        return true;
      }
      const pendingProvider = pendingProviders.get(service);
      return pendingProvider === undefined || pendingProvider.plugin === plugin;
    });
  }

  private collectAvailableServices(): ServiceClass[] {
    const services = [...this.services.keys()];
    if (this.parent) {
      services.push(...this.parent.collectAvailableServices());
    }
    return services;
  }

  private createUnresolvablePluginError(pending: InstalledPlugin[], available: Set<ServiceClass>): Error {
    const missingRequirements = new Map<
      ServiceClass,
      Plugin<ParameterList, Injection | undefined, Injection | undefined>[]
    >();
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
      return `${service.name} required by ${dependents} (${reason})`;
    });

    return new Error(`Unable to resolve plugin service dependencies: ${lines.join('; ')}.`);
  }

  private getPluginContext(installedPlugin: InstalledPlugin): Context {
    installedPlugin.proxy ??= this.createProxyContextForPlugin(installedPlugin.plugin);
    return installedPlugin.proxy;
  }

  private createProxyContextForPlugin(
    plugin: Plugin<ParameterList, Injection | undefined, Injection | undefined>,
  ): Context {
    // Proxied logger with plugin name as prefix
    const proxyLogger = new Logger((message) => this.logHandler?.(message), plugin.name);

    let proxyInjections: undefined | Record<string, object | undefined>;
    if (plugin.inject) {
      proxyInjections = {};
      for (const [key, service] of Object.entries(plugin.inject)) {
        proxyInjections[key] = this.resolve(service);
      }
    }
    if (plugin.optionalInject) {
      proxyInjections ??= {};
      for (const [key, service] of Object.entries(plugin.optionalInject)) {
        proxyInjections[key] = this.tryResolve(service);
      }
    }

    return new Proxy(this, {
      get(target, prop, receiver) {
        if (prop === 'logger') {
          return proxyLogger;
        } else if (proxyInjections && prop in proxyInjections) {
          return proxyInjections[prop as keyof typeof proxyInjections];
        } else {
          return Reflect.get(target, prop, receiver);
        }
      },
    });
  }

  private async runEventStream(): Promise<void> {
    let reconnectDelay = this.initialReconnectDelayMs;
    let reconnectAttempt = 1;
    while (this.state === 'started') {
      try {
        this.logger.debug(`Connecting event stream (attempt=${reconnectAttempt})`);
        const subscription = await this.client.startEvents((event: Event) => {
          try {
            if (this.state !== 'started') {
              return;
            }
            this.eventBus.emit(event.event_type, event);
          } catch (error) {
            this.logger.error('Error handling event stream event', error);
          }
        });
        if (this.state !== 'started') {
          await subscription.stop();
          break;
        }
        this.eventSubscription = subscription;
        this.logger.info('Event stream connected');
        reconnectDelay = this.initialReconnectDelayMs;
        reconnectAttempt = 1;
        await subscription.closed;
        this.eventSubscription = undefined;
        if (this.state !== 'started') {
          break;
        }
        this.logger.warn(`Event stream disconnected; reconnecting in ${reconnectDelay}ms`);
      } catch (error) {
        this.eventSubscription = undefined;
        if (this.state !== 'started') {
          break;
        }
        this.logger.error(`Error connecting event stream; reconnecting in ${reconnectDelay}ms`, error);
      }
      await this.waitForReconnectDelay(reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 2, this.maxReconnectDelayMs);
      reconnectAttempt += 1;
    }
  }

  private waitForReconnectDelay(delay: number): Promise<void> {
    return new Promise((resolve) => {
      this.resolveReconnectTimer = resolve;
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = undefined;
        this.resolveReconnectTimer = undefined;
        resolve();
      }, delay);
    });
  }

  private resolveReconnectDelay(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
    const resolve = this.resolveReconnectTimer;
    this.resolveReconnectTimer = undefined;
    resolve?.();
  }

  static fromUrl(baseUrl: string | URL, options?: ContextOptions & ContextUrlOptions): Context {
    const client = createMilkyClient(baseUrl, { accessToken: options?.accessToken });
    return new Context(client, options);
  }

  static fromClient(client: MilkyClient, options?: ContextOptions): Context {
    return new Context(client, options);
  }
}
