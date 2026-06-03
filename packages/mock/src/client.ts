import type { MilkyClient, MilkyEventSubscription, milky } from '@fraqjs/fraq';

import {
  type MockFriendMessageOptions,
  type MockGroupMessageOptions,
  MockInbox,
  type MockTempMessageOptions,
} from './message/inbox';

export interface MockApiCall {
  endpoint: string;
  params?: unknown;
}

export type MockApiEndpoint = keyof milky.ApiEndpoints;
export type MockApiRequest<E extends MockApiEndpoint> = milky.ApiEndpoints[E]['request_ZodInput'] extends null
  ? undefined
  : milky.ApiEndpoints[E]['request_ZodInput'];
export type MockApiResponse<E extends MockApiEndpoint> = milky.ApiEndpoints[E]['response'];
export type MockApiHandler<E extends MockApiEndpoint = MockApiEndpoint> = (
  params: MockApiRequest<E>,
) => MockApiResponse<E> | Promise<MockApiResponse<E>>;

export interface MockMilkyClientOptions {
  inbox?: MockInbox;
}

export class MockMilkyClientBase {
  readonly inbox: MockInbox;

  readonly apiCalls: MockApiCall[] = [];
  readonly apiHandlers = new Map<string, MockApiHandler>();

  onEvent: ((event: milky.Event) => void | Promise<void>) | undefined;
  private closeEventsResolver: (() => void) | undefined;
  startEventCalls = 0;
  nextStartError: unknown;

  constructor(options: MockMilkyClientOptions = {}) {
    this.inbox = options.inbox ?? new MockInbox();

    this.stubApi('get_message', (params) => this.inbox.getMessage(params));
    this.stubApi('get_history_messages', (params) => this.inbox.getHistoryMessages(params));
    this.stubApi('mark_message_as_read', (params) => this.inbox.markMessageAsRead(params));
    this.stubApi('get_friend_info', (params) => this.inbox.getFriendInfo(params));
    this.stubApi('get_group_info', (params) => this.inbox.getGroupInfo(params));
    this.stubApi('get_group_member_info', (params) => this.inbox.getGroupMemberInfo(params));
  }

  async startEvents(handler: (event: milky.Event) => void | Promise<void>): Promise<MilkyEventSubscription> {
    this.startEventCalls += 1;
    if (this.nextStartError) {
      const error = this.nextStartError;
      this.nextStartError = undefined;
      throw error;
    }

    this.onEvent = handler;
    const closed = new Promise<void>((resolve) => {
      this.closeEventsResolver = resolve;
    });

    return {
      closed,
      stop: () => {
        this.closeEvents();
      },
    };
  }

  closeEvents(): void {
    this.closeEventsResolver?.();
  }

  async emitEvent(event: milky.Event): Promise<void> {
    await this.onEvent?.(event);
  }

  async receiveFriend(
    options: MockFriendMessageOptions,
    segments: readonly milky.IncomingSegment_ZodInput[] | readonly milky.IncomingSegment[],
  ): Promise<milky.IncomingFriendMessage> {
    const event = this.inbox.friendEvent(options, segments);
    await this.emitEvent(event);
    return event.data as milky.IncomingFriendMessage;
  }

  async receiveGroup(
    options: MockGroupMessageOptions,
    segments: readonly milky.IncomingSegment_ZodInput[] | readonly milky.IncomingSegment[],
  ): Promise<milky.IncomingGroupMessage> {
    const event = this.inbox.groupEvent(options, segments);
    await this.emitEvent(event);
    return event.data as milky.IncomingGroupMessage;
  }

  async receiveTemp(
    options: MockTempMessageOptions,
    segments: readonly milky.IncomingSegment_ZodInput[] | readonly milky.IncomingSegment[],
  ): Promise<milky.IncomingTempMessage> {
    const event = this.inbox.tempEvent(options, segments);
    await this.emitEvent(event);
    return event.data as milky.IncomingTempMessage;
  }

  failNextStart(error: unknown): void {
    this.nextStartError = error;
  }

  stubApi<E extends MockApiEndpoint>(endpoint: E, handler: MockApiHandler<E>): this {
    // @ts-expect-error
    this.apiHandlers.set(endpoint, handler);
    return this;
  }

  clearApiStub(endpoint: MockApiEndpoint): boolean {
    return this.apiHandlers.delete(endpoint);
  }

  clearApiStubs(): void {
    this.apiHandlers.clear();
  }

  async invokeApi(endpoint: MockApiEndpoint, params: unknown): Promise<unknown> {
    this.apiCalls.push({ endpoint, params });
    const handler = this.apiHandlers.get(endpoint);
    return await handler?.(params as never);
  }
}

export type MockMilkyClient = MockMilkyClientBase & MilkyClient;

export function createMockMilkyClient(options?: MockMilkyClientOptions): MockMilkyClient {
  const base = new MockMilkyClientBase(options);
  return new Proxy(base, {
    get(target, prop, receiver) {
      if (typeof prop === 'string' && prop.includes('_') && !(prop in target)) {
        return async (params?: unknown) => target.invokeApi(prop as MockApiEndpoint, params);
      }
      return Reflect.get(target, prop, receiver);
    },
  }) as MockMilkyClient;
}
