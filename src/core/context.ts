import mitt from 'mitt';

import { createMilkyClient, type MilkyClient } from '../protocol/client';
import type { EventMap } from '../protocol/endpoint';
import type { Event, IncomingMessage } from '../protocol/types';
import { Router, type Session } from '../routing/router';
import type { Filter } from './filter';
import type { ParameterList, Plugin } from './plugin';

const INITIAL_RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 30_000;

export class Context {
  readonly router = new Router();

  private readonly eventBus = mitt<EventMap>();
  private readonly plugins: [Plugin<ParameterList>, ParameterList][] = [];
  private readonly subContexts: Context[] = [];

  private isStarted = false;

  private constructor(
    readonly client: MilkyClient,
    private readonly parent?: Context,
    filter?: Filter,
  ) {
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
    this.plugins.push([plugin, args]);
  }

  fork(filter?: Filter): Context {
    const subContext = new Context(this.client, this, filter);
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
    for (const [plugin, args] of this.plugins) {
      try {
        await plugin.apply(this, ...args);
      } catch (error) {
        console.error('Error applying plugin:', error);
      }
    }
  }

  private async connectEventWebSocket(): Promise<void> {
    let reconnectDelay = INITIAL_RECONNECT_DELAY_MS;
    while (this.isStarted) {
      try {
        const ws = await this.client.openEventWebSocket((event) => this.handleWebSocketMessage(event));
        reconnectDelay = INITIAL_RECONNECT_DELAY_MS;
        await new Promise<void>((resolve) => {
          ws.addEventListener('close', () => resolve(), { once: true });
        });
      } catch (error) {
        console.error('Error connecting event WebSocket:', error);
      }
      await this.delay(reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY_MS);
    }
  }

  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      if (typeof event.data !== 'string') {
        throw new Error(`Expected text frame, got ${typeof event.data}`);
      }
      const payload = JSON.parse(event.data) as Event;
      this.eventBus.emit(payload.event_type, payload);
    } catch (error) {
      console.error('Error handling WebSocket event:', error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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

  static create(options: {
    connect: {
      baseUrl: string;
      accessToken?: string;
    };
  }): Context {
    const client = createMilkyClient(options.connect.baseUrl, { accessToken: options.connect.accessToken });
    return new Context(client);
  }
}
