import type { EventMap } from '../protocol/endpoint';
import type { Event } from '../protocol/types';

export type Filter = {
  [K in keyof EventMap]?: (event: EventMap[K]) => boolean; // undefined 表示 () => false
};

const eventKeys: Event['event_type'][] = [
  'bot_offline',
  'message_receive',
  'message_recall',
  'peer_pin_change',
  'friend_request',
  'group_join_request',
  'group_invited_join_request',
  'group_invitation',
  'friend_nudge',
  'friend_file_upload',
  'group_admin_change',
  'group_essence_message_change',
  'group_member_increase',
  'group_member_decrease',
  'group_disband',
  'group_name_change',
  'group_message_reaction',
  'group_mute',
  'group_whole_mute',
  'group_nudge',
  'group_file_upload',
];

export namespace filter {
  export function define(filter: Filter): Filter {
    return filter;
  }

  export function allPass(): Filter {
    const result: Filter = {};
    for (const key of eventKeys) {
      result[key] = () => true;
    }
    return result;
  }

  export function friend(...uinList: number[]): Filter {
    const uinSet = new Set(uinList);
    return {
      message_receive: ({ data }) => data.message_scene === 'friend' && uinSet.has(data.peer_id),
      message_recall: ({ data }) => data.message_scene === 'friend' && uinSet.has(data.peer_id),
      peer_pin_change: ({ data }) => data.message_scene === 'friend' && uinSet.has(data.peer_id),
      group_invitation: ({ data }) => uinSet.has(data.initiator_id),
      friend_nudge: ({ data }) => uinSet.has(data.user_id),
      friend_file_upload: ({ data }) => uinSet.has(data.user_id),
    };
  }

  export function group(...uinList: number[]): Filter {
    const uinSet = new Set(uinList);
    return {
      message_receive: ({ data }) => data.message_scene === 'group' && uinSet.has(data.peer_id),
      message_recall: ({ data }) => data.message_scene === 'group' && uinSet.has(data.peer_id),
      peer_pin_change: ({ data }) => data.message_scene === 'group' && uinSet.has(data.peer_id),
      group_join_request: ({ data }) => uinSet.has(data.group_id),
      group_invited_join_request: ({ data }) => uinSet.has(data.group_id),
      group_admin_change: ({ data }) => uinSet.has(data.group_id),
      group_essence_message_change: ({ data }) => uinSet.has(data.group_id),
      group_member_increase: ({ data }) => uinSet.has(data.group_id),
      group_member_decrease: ({ data }) => uinSet.has(data.group_id),
      group_name_change: ({ data }) => uinSet.has(data.group_id),
      group_message_reaction: ({ data }) => uinSet.has(data.group_id),
      group_mute: ({ data }) => uinSet.has(data.group_id),
      group_whole_mute: ({ data }) => uinSet.has(data.group_id),
      group_nudge: ({ data }) => uinSet.has(data.group_id),
      group_file_upload: ({ data }) => uinSet.has(data.group_id),
    };
  }

  export function admin(): Filter {
    return {
      message_receive: ({ data }) => data.message_scene === 'group' && data.group_member.role !== 'member',
    };
  }

  export function or(...filters: Filter[]): Filter {
    const result: Filter = {};
    for (const key of eventKeys) {
      result[key] = (event) => {
        for (const filter of filters) {
          const predicate = filter[key];
          // @ts-expect-error
          if (predicate?.(event)) {
            return true;
          }
        }
        return false;
      };
    }
    return result;
  }

  export function and(...filters: Filter[]): Filter {
    const result: Filter = {};
    for (const key of eventKeys) {
      result[key] = (event) => {
        for (const filter of filters) {
          const predicate = filter[key];
          // @ts-expect-error
          if (!predicate?.(event)) {
            return false;
          }
        }
        return true;
      };
    }
    return result;
  }
}
