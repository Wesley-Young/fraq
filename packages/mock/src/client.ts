import type { MilkyClient, MilkyEventSubscription, milky } from '@fraqjs/fraq';

export interface MockApiCall {
  endpoint: string;
  params?: unknown;
}

class MockMilkyClientBase {
  onEvent: ((event: milky.Event) => void | Promise<void>) | undefined;
  closeEvents: (() => void) | undefined;
  startEventCalls: number = 0;
  nextStartError: unknown;
  apiCalls = [] as MockApiCall[];

  async startEvents(handler: (event: milky.Event) => void | Promise<void>): Promise<MilkyEventSubscription> {
    this.startEventCalls += 1;
    if (this.nextStartError) {
      const error = this.nextStartError;
      this.nextStartError = undefined;
      throw error;
    }
    this.onEvent = handler;
    const closed = new Promise<void>((resolve) => {
      this.closeEvents = resolve;
    });
    return {
      closed,
      stop: () => {
        this.closeEvents?.();
      },
    };
  }

  async emitEvent(event: milky.Event): Promise<void> {
    await this.onEvent?.(event);
  }

  failNextStart(error: unknown) {
    this.nextStartError = error;
  }
}

export type { MockMilkyClientBase };
export type MockMilkyClient = MockMilkyClientBase & MilkyClient;

export function createMockMilkyClient(): MockMilkyClient {
  const target = new MockMilkyClientBase();
  return new Proxy(target, {
    get(target, prop, receiver) {
      if (typeof prop === 'string' && prop.includes('_')) {
        return async (params?: unknown) => {
          target.apiCalls.push({ endpoint: prop, params });
          return undefined;
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  }) as MockMilkyClient;
}
