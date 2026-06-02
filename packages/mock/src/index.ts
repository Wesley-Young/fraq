import type { MilkyClient, MilkyEventSubscription, milky } from '@fraqjs/fraq';

export interface MockApiCall {
  endpoint: string;
  params?: unknown;
}

export interface MockMilkyClient extends MilkyClient {
  readonly apiCalls: MockApiCall[];
  readonly startEventCalls: number;
  emitEvent(event: milky.Event): Promise<void>;
  closeEvents(): void;
  failNextStart(error: unknown): void;
}

export function createMockMilkyClient(): MockMilkyClient {
  let onEvent: ((event: milky.Event) => void | Promise<void>) | undefined;
  let closeEvents: (() => void) | undefined;
  let startEventCalls = 0;
  let nextStartError: unknown;

  const target = {
    apiCalls: [] as MockApiCall[],
    get startEventCalls() {
      return startEventCalls;
    },
    async startEvents(handler: (event: milky.Event) => void | Promise<void>): Promise<MilkyEventSubscription> {
      startEventCalls += 1;
      if (nextStartError) {
        const error = nextStartError;
        nextStartError = undefined;
        throw error;
      }
      onEvent = handler;
      const closed = new Promise<void>((resolve) => {
        closeEvents = resolve;
      });
      return {
        closed,
        stop() {
          closeEvents?.();
        },
      };
    },
    async emitEvent(event: milky.Event): Promise<void> {
      await onEvent?.(event);
    },
    closeEvents() {
      closeEvents?.();
    },
    failNextStart(error: unknown) {
      nextStartError = error;
    },
  };

  return new Proxy(target, {
    get(target, prop, receiver) {
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }
      if (typeof prop === 'string' && prop.includes('_')) {
        return async (params?: unknown) => {
          target.apiCalls.push({ endpoint: prop, params });
          return undefined;
        };
      }
      return undefined;
    },
  }) as MockMilkyClient;
}
