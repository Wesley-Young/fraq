import type { milky } from '@fraqjs/fraq';

import {
  createRandomFriend,
  createRandomGroup,
  createRandomGroupMember,
  type RandomFriendOverrides,
  type RandomGroupMemberOverrides,
  type RandomGroupOverrides,
} from '../entity';

const DEFAULT_BASE_TIME = Date.UTC(2025, 0, 1, 0, 0, 0) / 1000;

export type MockMessageScene = 'friend' | 'group' | 'temp';

export interface MockMessageContext {
  scene: MockMessageScene;
  peerId: number;
  senderId: number;
  groupId?: number | undefined;
}

export interface MockInboxOptions {
  selfId?: number;
  baseTime?: number;
  sequenceStart?: number;
  timeStepSeconds?: number;
  conversationKey?(context: MockMessageContext): string;
}

export interface MockMessageMetaOverrides {
  messageSeq?: number;
  time?: number;
}

export interface MockFriendMessageOptions extends MockMessageMetaOverrides {
  userId: number;
  peerId?: number;
  senderId?: number;
  friend?: RandomFriendOverrides;
}

export interface MockGroupMessageOptions extends MockMessageMetaOverrides {
  groupId: number;
  userId: number;
  senderId?: number;
  group?: RandomGroupOverrides;
  groupMember?: RandomGroupMemberOverrides;
}

export interface MockTempMessageOptions extends MockMessageMetaOverrides {
  userId: number;
  peerId?: number;
  senderId?: number;
  groupId?: number;
  group?: RandomGroupOverrides | null;
}

interface MockConversationState {
  nextSeq: number;
  nextTime: number;
  messages: milky.IncomingMessage[];
  bySeq: Map<number, milky.IncomingMessage>;
  lastReadMessageSeq?: number | undefined;
}

function assertSafeInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`${name} must be a safe integer.`);
  }
}

function assertPositiveInteger(value: number, name: string): void {
  assertSafeInteger(value, name);
  if (value <= 0) {
    throw new RangeError(`${name} must be a positive integer.`);
  }
}

function cloneSegments(
  segments: readonly milky.IncomingSegment_ZodInput[] | readonly milky.IncomingSegment[],
): milky.IncomingSegment[] {
  // biome-ignore lint/suspicious/useIterableCallbackReturn: Already covered by exhaustiveness check
  return segments.map((segment) => {
    switch (segment.type) {
      case 'reply':
        return {
          ...segment,
          data: {
            ...segment.data,
            segments: cloneSegments(segment.data.segments),
          },
        } as milky.IncomingReplySegment;
      case 'forward':
      case 'image':
      case 'record':
      case 'video':
      case 'file':
      case 'market_face':
      case 'light_app':
      case 'xml':
      case 'markdown':
      case 'mention':
      case 'mention_all':
      case 'face':
      case 'text':
        return {
          ...segment,
          data: { ...segment.data },
        } as milky.IncomingSegment;
    }
  });
}

export class MockInbox {
  readonly selfId: number;

  private readonly baseTime: number;
  private readonly sequenceStart: number;
  private readonly timeStepSeconds: number;
  private readonly conversationKeyOf: (context: MockMessageContext) => string;
  private readonly conversations = new Map<string, MockConversationState>();
  private readonly allMessages: milky.IncomingMessage[] = [];
  private readonly friends = new Map<number, milky.FriendEntity>();
  private readonly groups = new Map<number, milky.GroupEntity>();
  private readonly groupMembers = new Map<string, milky.GroupMemberEntity>();

  constructor(options: MockInboxOptions = {}) {
    this.selfId = options.selfId ?? 10000;
    this.baseTime = options.baseTime ?? DEFAULT_BASE_TIME;
    this.sequenceStart = options.sequenceStart ?? 1;
    this.timeStepSeconds = options.timeStepSeconds ?? 1;
    this.conversationKeyOf = options.conversationKey ?? defaultConversationKey;

    assertPositiveInteger(this.selfId, 'selfId');
    assertSafeInteger(this.baseTime, 'baseTime');
    assertPositiveInteger(this.sequenceStart, 'sequenceStart');
    assertPositiveInteger(this.timeStepSeconds, 'timeStepSeconds');
  }

  conversationKey(context: MockMessageContext): string {
    if (context.groupId !== undefined) {
      assertPositiveInteger(context.groupId, 'groupId');
    }
    assertPositiveInteger(context.peerId, 'peerId');
    assertPositiveInteger(context.senderId, 'senderId');
    return this.conversationKeyOf(context);
  }

  friendConversationKey(peerId: number, senderId = peerId): string {
    assertPositiveInteger(peerId, 'peerId');
    assertPositiveInteger(senderId, 'senderId');
    return this.conversationKey({
      scene: 'friend',
      peerId,
      senderId,
    });
  }

  groupConversationKey(groupId: number, senderId = groupId): string {
    assertPositiveInteger(groupId, 'groupId');
    assertPositiveInteger(senderId, 'senderId');
    return this.conversationKey({
      scene: 'group',
      peerId: groupId,
      senderId,
      groupId,
    });
  }

  tempConversationKey(options: { peerId?: number; senderId: number; groupId?: number }): string {
    const peerId = options.peerId ?? options.senderId;

    assertPositiveInteger(peerId, 'peerId');
    assertPositiveInteger(options.senderId, 'senderId');
    if (options.groupId !== undefined) {
      assertPositiveInteger(options.groupId, 'groupId');
    }

    return this.conversationKey({
      scene: 'temp',
      peerId,
      senderId: options.senderId,
      groupId: options.groupId,
    });
  }

  friend(
    options: MockFriendMessageOptions,
    segments: readonly milky.IncomingSegment_ZodInput[] | readonly milky.IncomingSegment[],
  ): milky.IncomingFriendMessage {
    assertPositiveInteger(options.userId, 'userId');

    const peerId = options.peerId ?? options.userId;
    const senderId = options.senderId ?? options.userId;

    assertPositiveInteger(peerId, 'peerId');
    assertPositiveInteger(senderId, 'senderId');

    const conversationKey = this.conversationKey({
      scene: 'friend',
      peerId,
      senderId,
    });
    const { messageSeq, time } = this.allocateMessageMeta(conversationKey, options);

    const message: milky.IncomingFriendMessage = {
      message_scene: 'friend',
      peer_id: peerId,
      message_seq: messageSeq,
      sender_id: senderId,
      time,
      segments: cloneSegments(segments),
      friend: createRandomFriend(options.userId, options.friend),
    };

    this.storeMessage(conversationKey, message);

    return message;
  }

  group(
    options: MockGroupMessageOptions,
    segments: readonly milky.IncomingSegment_ZodInput[] | readonly milky.IncomingSegment[],
  ): milky.IncomingGroupMessage {
    assertPositiveInteger(options.groupId, 'groupId');
    assertPositiveInteger(options.userId, 'userId');

    const senderId = options.senderId ?? options.userId;

    assertPositiveInteger(senderId, 'senderId');

    const conversationKey = this.conversationKey({
      scene: 'group',
      peerId: options.groupId,
      senderId,
      groupId: options.groupId,
    });
    const { messageSeq, time } = this.allocateMessageMeta(conversationKey, options);

    const message: milky.IncomingGroupMessage = {
      message_scene: 'group',
      peer_id: options.groupId,
      message_seq: messageSeq,
      sender_id: senderId,
      time,
      segments: cloneSegments(segments),
      group: createRandomGroup(options.groupId, options.group),
      group_member: createRandomGroupMember(options.groupId, options.userId, options.groupMember),
    };

    this.storeMessage(conversationKey, message);
    return message;
  }

  temp(
    options: MockTempMessageOptions,
    segments: readonly milky.IncomingSegment_ZodInput[] | readonly milky.IncomingSegment[],
  ): milky.IncomingTempMessage {
    assertPositiveInteger(options.userId, 'userId');

    const peerId = options.peerId ?? options.userId;
    const senderId = options.senderId ?? options.userId;

    assertPositiveInteger(peerId, 'peerId');
    assertPositiveInteger(senderId, 'senderId');
    if (options.groupId !== undefined) {
      assertPositiveInteger(options.groupId, 'groupId');
    }

    const conversationKey = this.conversationKey({
      scene: 'temp',
      peerId,
      senderId,
      groupId: options.groupId,
    });
    const { messageSeq, time } = this.allocateMessageMeta(conversationKey, options);

    const group =
      options.group === null
        ? null
        : options.groupId === undefined
          ? undefined
          : createRandomGroup(options.groupId, options.group);

    const message: milky.IncomingTempMessage = {
      message_scene: 'temp',
      peer_id: peerId,
      message_seq: messageSeq,
      sender_id: senderId,
      time,
      segments: cloneSegments(segments),
      group,
    };

    this.storeMessage(conversationKey, message);
    return message;
  }

  event(
    message: milky.IncomingMessage,
    overrides?: {
      time?: number;
      selfId?: number;
    },
  ): milky.MessageReceiveEvent {
    const eventTime = overrides?.time ?? message.time;
    const selfId = overrides?.selfId ?? this.selfId;

    assertSafeInteger(eventTime, 'event time');
    assertPositiveInteger(selfId, 'event selfId');

    return {
      event_type: 'message_receive',
      time: eventTime,
      self_id: selfId,
      data: message,
    };
  }

  friendEvent(
    options: MockFriendMessageOptions,
    segments: readonly milky.IncomingSegment_ZodInput[] | readonly milky.IncomingSegment[],
    overrides?: {
      time?: number;
      selfId?: number;
    },
  ): milky.MessageReceiveEvent {
    return this.event(this.friend(options, segments), overrides);
  }

  groupEvent(
    options: MockGroupMessageOptions,
    segments: readonly milky.IncomingSegment_ZodInput[] | readonly milky.IncomingSegment[],
    overrides?: {
      time?: number;
      selfId?: number;
    },
  ): milky.MessageReceiveEvent {
    return this.event(this.group(options, segments), overrides);
  }

  tempEvent(
    options: MockTempMessageOptions,
    segments: readonly milky.IncomingSegment_ZodInput[] | readonly milky.IncomingSegment[],
    overrides?: {
      time?: number;
      selfId?: number;
    },
  ): milky.MessageReceiveEvent {
    return this.event(this.temp(options, segments), overrides);
  }

  message(conversationKey: string, messageSeq: number): milky.IncomingMessage | undefined {
    const state = this.conversations.get(conversationKey);
    return state?.bySeq.get(messageSeq);
  }

  getMessage(input: milky.GetMessageInput_ZodInput): milky.GetMessageOutput {
    const conversationKey = this.queryConversationKey(input.message_scene, input.peer_id);
    const message = this.message(conversationKey, input.message_seq);
    if (!message) {
      throw new Error(
        `Message not found (scene=${input.message_scene} peer=${input.peer_id} seq=${input.message_seq})`,
      );
    }
    return { message };
  }

  getHistoryMessages(input: milky.GetHistoryMessagesInput_ZodInput): milky.GetHistoryMessagesOutput {
    const conversationKey = this.queryConversationKey(input.message_scene, input.peer_id);
    const limit = input.limit ?? 30;
    const startMessageSeq = input.start_message_seq;
    assertPositiveInteger(limit, 'limit');
    if (limit > 30) {
      throw new RangeError('limit must be less than or equal to 30.');
    }

    const messages = this.history(conversationKey);
    const endIndex =
      startMessageSeq == null
        ? messages.length
        : messages.findIndex((message) => message.message_seq > startMessageSeq);
    const boundedMessages = endIndex === -1 ? messages : messages.slice(0, endIndex);
    const startIndex = Math.max(0, boundedMessages.length - limit);
    const selectedMessages = boundedMessages.slice(startIndex);
    const nextMessage = boundedMessages[startIndex - 1];

    return {
      messages: selectedMessages,
      next_message_seq: nextMessage?.message_seq,
    };
  }

  markMessageAsRead(input: milky.MarkMessageAsReadInput_ZodInput): milky.MarkMessageAsReadOutput {
    if (input.message_scene === 'temp') {
      return {};
    }

    const conversationKey = this.queryConversationKey(input.message_scene, input.peer_id);
    const state = this.getOrCreateConversationState(conversationKey);
    state.lastReadMessageSeq = input.message_seq;
    return {};
  }

  getFriendInfo(input: milky.GetFriendInfoInput_ZodInput): milky.GetFriendInfoOutput {
    assertPositiveInteger(input.user_id, 'user_id');
    const friend = this.friends.get(input.user_id) ?? createRandomFriend(input.user_id);
    return { friend };
  }

  getGroupInfo(input: milky.GetGroupInfoInput_ZodInput): milky.GetGroupInfoOutput {
    assertPositiveInteger(input.group_id, 'group_id');
    const group = this.groups.get(input.group_id) ?? createRandomGroup(input.group_id);
    return { group };
  }

  getGroupMemberInfo(input: milky.GetGroupMemberInfoInput_ZodInput): milky.GetGroupMemberInfoOutput {
    assertPositiveInteger(input.group_id, 'group_id');
    assertPositiveInteger(input.user_id, 'user_id');
    const key = groupMemberKey(input.group_id, input.user_id);
    const member = this.groupMembers.get(key) ?? createRandomGroupMember(input.group_id, input.user_id);
    return { member };
  }

  history(conversationKey?: string): milky.IncomingMessage[] {
    if (conversationKey === undefined) {
      return [...this.allMessages];
    }
    return [...(this.conversations.get(conversationKey)?.messages ?? [])];
  }

  lastMessage(conversationKey?: string): milky.IncomingMessage | undefined {
    const messages = this.history(conversationKey);
    return messages.at(-1);
  }

  reset(): void {
    this.conversations.clear();
    this.allMessages.length = 0;
  }

  private allocateMessageMeta(
    conversationKey: string,
    overrides: MockMessageMetaOverrides,
  ): { messageSeq: number; time: number } {
    const state = this.getOrCreateConversationState(conversationKey);

    const messageSeq = overrides.messageSeq ?? state.nextSeq;
    const time = overrides.time ?? state.nextTime;

    assertPositiveInteger(messageSeq, 'messageSeq');
    assertSafeInteger(time, 'time');

    state.nextSeq = Math.max(state.nextSeq, messageSeq + 1);
    state.nextTime = Math.max(state.nextTime, time + this.timeStepSeconds);

    return { messageSeq, time };
  }

  private getOrCreateConversationState(conversationKey: string): MockConversationState {
    let state = this.conversations.get(conversationKey);
    if (!state) {
      state = {
        nextSeq: this.sequenceStart,
        nextTime: this.baseTime,
        messages: [],
        bySeq: new Map<number, milky.IncomingMessage>(),
        lastReadMessageSeq: undefined,
      };
      this.conversations.set(conversationKey, state);
    }
    return state;
  }

  private storeMessage(conversationKey: string, message: milky.IncomingMessage): void {
    const state = this.getOrCreateConversationState(conversationKey);
    state.messages.push(message);
    state.bySeq.set(message.message_seq, message);
    this.allMessages.push(message);
    switch (message.message_scene) {
      case 'friend':
        this.friends.set(message.friend.user_id, message.friend);
        break;
      case 'group':
        this.groups.set(message.group.group_id, message.group);
        this.groupMembers.set(
          groupMemberKey(message.group_member.group_id, message.group_member.user_id),
          message.group_member,
        );
        break;
      case 'temp':
        if (message.group) {
          this.groups.set(message.group.group_id, message.group);
        }
        break;
    }
  }

  private queryConversationKey(scene: 'friend' | 'group' | 'temp', peerId: number): string {
    assertPositiveInteger(peerId, 'peer_id');
    switch (scene) {
      case 'friend':
        return this.friendConversationKey(peerId);
      case 'group':
        return this.groupConversationKey(peerId);
      case 'temp':
        throw new Error('Temporary message queries are not supported.');
    }
  }
}

function defaultConversationKey(context: MockMessageContext): string {
  switch (context.scene) {
    case 'friend':
      return `friend:${context.peerId}`;
    case 'group':
      return `group:${context.groupId ?? context.peerId}`;
    case 'temp':
      return `temp:${context.groupId ?? context.peerId}:${context.senderId}`;
  }
}

export function createMockInbox(options?: MockInboxOptions): MockInbox {
  return new MockInbox(options);
}

function groupMemberKey(groupId: number, userId: number): string {
  return `${groupId}:${userId}`;
}
