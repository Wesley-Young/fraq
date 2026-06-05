import type { milky } from '@fraqjs/fraq';
import { RandomService } from '@fraqjs/plugin-random';

import vocabulary from './vocabulary.json';

const ROLE_WEIGHTS = [
  { role: 'owner' as const, weight: 1 },
  { role: 'admin' as const, weight: 6 },
  { role: 'member' as const, weight: 93 },
] as const;
const SEX_WEIGHTS = [
  { sex: 'male' as const, weight: 45 },
  { sex: 'female' as const, weight: 45 },
  { sex: 'unknown' as const, weight: 10 },
] as const;
const GROUP_CAPACITY_TIERS = [50, 100, 200, 500, 1000, 2000] as const;

const REFERENCE_TIME = Date.UTC(2025, 0, 1, 0, 0, 0) / 1000;
const GROUP_CREATED_TIME_START = Date.UTC(2018, 0, 1, 0, 0, 0) / 1000;
const GROUP_CREATED_TIME_END = Date.UTC(2024, 11, 31, 23, 59, 59) / 1000;

export interface RandomFriendOverrides extends Partial<Omit<milky.FriendEntity, 'category'>> {
  category?: Partial<milky.FriendCategoryEntity>;
}

export interface RandomGroupOverrides extends Partial<milky.GroupEntity> {}

export interface RandomGroupMemberOverrides extends Partial<milky.GroupMemberEntity> {}

function assertSeedInput(value: number, name: string): number {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`${name} must be a safe integer.`);
  }
  return value;
}

function mixSeed(namespace: string, ...values: number[]): number {
  let hash = 0x811c9dc5;

  for (const char of namespace) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  for (const value of values) {
    let current = assertSeedInput(value, 'seed input') >>> 0;
    for (let index = 0; index < 4; index += 1) {
      hash ^= current & 0xff;
      hash = Math.imul(hash, 0x01000193) >>> 0;
      current >>>= 8;
    }
  }

  return hash;
}

function createRandom(namespace: string, ...values: number[]): RandomService {
  return new RandomService({
    seed: mixSeed(namespace, ...values),
  });
}

function joinParts(...parts: string[]): string {
  return parts.filter(Boolean).join(' ');
}

function toBase36Id(prefix: string, value: number, minLength = 6): string {
  return `${prefix}${Math.abs(value).toString(36).padStart(minLength, '0')}`;
}

function createUserProfile(userId: number): Pick<milky.FriendEntity, 'user_id' | 'nickname' | 'sex' | 'qid'> {
  const random = createRandom('friend-profile', userId);
  const firstName = random.pick(vocabulary.friend.firstNames);
  const lastName = random.pick(vocabulary.friend.lastNames);
  const nicknameSuffix = random.pick(vocabulary.friend.nicknameSuffixes);
  const sex = random.weightedPick(SEX_WEIGHTS, (item) => item.weight).sex;

  return {
    user_id: userId,
    nickname: joinParts(firstName, lastName, nicknameSuffix),
    sex,
    qid: toBase36Id('qid_', userId),
  };
}

function createFriendCategory(
  userId: number,
  overrides?: Partial<milky.FriendCategoryEntity>,
): milky.FriendCategoryEntity {
  const random = createRandom('friend-category', userId);
  const categoryId = random.int(vocabulary.friend.categoryNames.length);
  const category: milky.FriendCategoryEntity = {
    category_id: categoryId + 1,
    category_name: vocabulary.friend.categoryNames[categoryId] as string,
  };

  return {
    ...category,
    ...overrides,
  };
}

function createGroupBase(groupId: number): milky.GroupEntity {
  const random = createRandom('group', groupId);
  const memberCount = random.range(12, 320);
  const minCapacity = memberCount + random.range(0, 120);
  const maxMemberCount =
    GROUP_CAPACITY_TIERS.find((capacity) => capacity >= minCapacity) ??
    GROUP_CAPACITY_TIERS[GROUP_CAPACITY_TIERS.length - 1];
  const createdTime = random.range(GROUP_CREATED_TIME_START, GROUP_CREATED_TIME_END);
  const groupName = joinParts(
    random.pick(vocabulary.group.prefixes),
    random.pick(vocabulary.group.topics),
    random.pick(vocabulary.group.suffixes),
  );

  return {
    group_id: groupId,
    group_name: groupName,
    member_count: memberCount,
    max_member_count: maxMemberCount,
    remark: random.pick(vocabulary.group.remarks),
    created_time: createdTime,
    description: random.pick(vocabulary.group.descriptions),
    question: random.pick(vocabulary.group.questions),
    announcement: random.pick(vocabulary.group.announcements),
  };
}

export function createRandomFriend(userId: number, overrides: RandomFriendOverrides = {}): milky.FriendEntity {
  assertSeedInput(userId, 'userId');

  const random = createRandom('friend', userId);
  const profile = createUserProfile(userId);
  const friend: milky.FriendEntity = {
    ...profile,
    remark: random.pick(vocabulary.friend.remarks),
    category: createFriendCategory(userId, overrides.category),
  };

  return {
    ...friend,
    ...overrides,
    category: {
      ...friend.category,
      ...overrides.category,
    },
  };
}

export function createRandomGroup(groupId: number, overrides: RandomGroupOverrides = {}): milky.GroupEntity {
  assertSeedInput(groupId, 'groupId');

  return {
    ...createGroupBase(groupId),
    ...overrides,
  };
}

export function createRandomGroupMember(
  groupId: number,
  userId: number,
  overrides: RandomGroupMemberOverrides = {},
): milky.GroupMemberEntity {
  assertSeedInput(groupId, 'groupId');
  assertSeedInput(userId, 'userId');

  const random = createRandom('group-member', groupId, userId);
  const profile = createUserProfile(userId);
  const group = createGroupBase(groupId);
  const role = random.weightedPick(ROLE_WEIGHTS, (item) => item.weight).role;
  const joinTimeEnd = Math.max(group.created_time, REFERENCE_TIME - 86400);
  const joinTime = random.range(group.created_time, joinTimeEnd);
  const lastSentTime = random.range(joinTime, REFERENCE_TIME);
  const shutUpEndTime = random.bool(0.1) ? lastSentTime + random.range(300, 7 * 24 * 60 * 60) : null;
  const cardPrefix = random.pick(vocabulary.groupMember.cardPrefixes);
  const cardSuffix = random.pick(vocabulary.groupMember.cardSuffixes);
  const card = joinParts(cardPrefix, profile.nickname, cardSuffix);
  const title = random.pick(vocabulary.groupMember.titles);

  return {
    user_id: userId,
    nickname: profile.nickname,
    sex: profile.sex,
    group_id: groupId,
    card,
    title,
    level: random.range(1, 100),
    role,
    join_time: joinTime,
    last_sent_time: lastSentTime,
    shut_up_end_time: shutUpEndTime,
    ...overrides,
  };
}
