// Generated from Milky 1.3 (1.3.0-rc.1)

export const milkyVersion = '1.3';
export const milkyPackageVersion = '1.3.0-rc.1';

// ####################################
// Common Structs
// ####################################

/** 机器人离线事件 */
export interface BotOfflineEvent {
  /** 数据类型区分字段，表示自身为机器人离线事件 */
  event_type: 'bot_offline';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 下线原因 */
    reason: string;
  }
}

/** 机器人离线事件 */
export interface BotOfflineEvent_ZodInput {
  /** 数据类型区分字段，表示自身为机器人离线事件 */
  event_type: 'bot_offline';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 下线原因 */
    reason: string;
  }
}

/** 消息接收事件 */
export interface MessageReceiveEvent {
  /** 数据类型区分字段，表示自身为消息接收事件 */
  event_type: 'message_receive';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: IncomingMessage;
}

/** 消息接收事件 */
export interface MessageReceiveEvent_ZodInput {
  /** 数据类型区分字段，表示自身为消息接收事件 */
  event_type: 'message_receive';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: IncomingMessage_ZodInput;
}

/** 消息撤回事件 */
export interface MessageRecallEvent {
  /** 数据类型区分字段，表示自身为消息撤回事件 */
  event_type: 'message_recall';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 消息场景 */
    message_scene: 'friend' | 'group' | 'temp';
    /** 好友 QQ 号或群号 */
    peer_id: number;
    /** 消息序列号 */
    message_seq: number;
    /** 被撤回的消息的发送者 QQ 号 */
    sender_id: number;
    /** 操作者 QQ 号 */
    operator_id: number;
    /** 撤回提示的后缀文本 */
    display_suffix: string;
  }
}

/** 消息撤回事件 */
export interface MessageRecallEvent_ZodInput {
  /** 数据类型区分字段，表示自身为消息撤回事件 */
  event_type: 'message_recall';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 消息场景 */
    message_scene: 'friend' | 'group' | 'temp';
    /** 好友 QQ 号或群号 */
    peer_id: number;
    /** 消息序列号 */
    message_seq: number;
    /** 被撤回的消息的发送者 QQ 号 */
    sender_id: number;
    /** 操作者 QQ 号 */
    operator_id: number;
    /** 撤回提示的后缀文本 */
    display_suffix: string;
  }
}

/**
 * 会话置顶变更事件
 * @since 1.2
 */
export interface PeerPinChangeEvent {
  /** 数据类型区分字段，表示自身为会话置顶变更事件 */
  event_type: 'peer_pin_change';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 发生改变的会话的消息场景 */
    message_scene: 'friend' | 'group' | 'temp';
    /** 发生改变的好友 QQ 号或群号 */
    peer_id: number;
    /** 是否被置顶, `false` 表示取消置顶 */
    is_pinned: boolean;
  }
}

/**
 * 会话置顶变更事件
 * @since 1.2
 */
export interface PeerPinChangeEvent_ZodInput {
  /** 数据类型区分字段，表示自身为会话置顶变更事件 */
  event_type: 'peer_pin_change';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 发生改变的会话的消息场景 */
    message_scene: 'friend' | 'group' | 'temp';
    /** 发生改变的好友 QQ 号或群号 */
    peer_id: number;
    /** 是否被置顶, `false` 表示取消置顶 */
    is_pinned: boolean;
  }
}

/** 好友请求事件 */
export interface FriendRequestEvent {
  /** 数据类型区分字段，表示自身为好友请求事件 */
  event_type: 'friend_request';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 申请好友的用户 QQ 号 */
    initiator_id: number;
    /** 用户 UID */
    initiator_uid: string;
    /** 申请附加信息 */
    comment: string;
    /** 申请来源 */
    via: string;
  }
}

/** 好友请求事件 */
export interface FriendRequestEvent_ZodInput {
  /** 数据类型区分字段，表示自身为好友请求事件 */
  event_type: 'friend_request';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 申请好友的用户 QQ 号 */
    initiator_id: number;
    /** 用户 UID */
    initiator_uid: string;
    /** 申请附加信息 */
    comment: string;
    /** 申请来源 */
    via: string;
  }
}

/** 入群请求事件 */
export interface GroupJoinRequestEvent {
  /** 数据类型区分字段，表示自身为入群请求事件 */
  event_type: 'group_join_request';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 请求对应的通知序列号 */
    notification_seq: number;
    /** 请求是否被过滤（发起自风险账户） */
    is_filtered: boolean;
    /** 申请入群的用户 QQ 号 */
    initiator_id: number;
    /** 申请附加信息 */
    comment: string;
  }
}

/** 入群请求事件 */
export interface GroupJoinRequestEvent_ZodInput {
  /** 数据类型区分字段，表示自身为入群请求事件 */
  event_type: 'group_join_request';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 请求对应的通知序列号 */
    notification_seq: number;
    /** 请求是否被过滤（发起自风险账户） */
    is_filtered: boolean;
    /** 申请入群的用户 QQ 号 */
    initiator_id: number;
    /** 申请附加信息 */
    comment: string;
  }
}

/** 群成员邀请他人入群请求事件 */
export interface GroupInvitedJoinRequestEvent {
  /** 数据类型区分字段，表示自身为群成员邀请他人入群请求事件 */
  event_type: 'group_invited_join_request';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 请求对应的通知序列号 */
    notification_seq: number;
    /** 邀请者 QQ 号 */
    initiator_id: number;
    /** 被邀请者 QQ 号 */
    target_user_id: number;
  }
}

/** 群成员邀请他人入群请求事件 */
export interface GroupInvitedJoinRequestEvent_ZodInput {
  /** 数据类型区分字段，表示自身为群成员邀请他人入群请求事件 */
  event_type: 'group_invited_join_request';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 请求对应的通知序列号 */
    notification_seq: number;
    /** 邀请者 QQ 号 */
    initiator_id: number;
    /** 被邀请者 QQ 号 */
    target_user_id: number;
  }
}

/** 他人邀请自身入群事件 */
export interface GroupInvitationEvent {
  /** 数据类型区分字段，表示自身为他人邀请自身入群事件 */
  event_type: 'group_invitation';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 邀请序列号 */
    invitation_seq: number;
    /** 邀请者 QQ 号 */
    initiator_id: number;
    /**
     * 来源群号，如果是通过 QQ 群邀请
     * @since 1.2
     */
    source_group_id?: number | null | undefined;
  }
}

/** 他人邀请自身入群事件 */
export interface GroupInvitationEvent_ZodInput {
  /** 数据类型区分字段，表示自身为他人邀请自身入群事件 */
  event_type: 'group_invitation';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 邀请序列号 */
    invitation_seq: number;
    /** 邀请者 QQ 号 */
    initiator_id: number;
    /**
     * 来源群号，如果是通过 QQ 群邀请
     * @since 1.2
     */
    source_group_id?: number | null | undefined;
  }
}

/** 好友戳一戳事件 */
export interface FriendNudgeEvent {
  /** 数据类型区分字段，表示自身为好友戳一戳事件 */
  event_type: 'friend_nudge';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 好友 QQ 号 */
    user_id: number;
    /** 是否是自己发送的戳一戳 */
    is_self_send: boolean;
    /** 是否是自己接收的戳一戳 */
    is_self_receive: boolean;
    /** 戳一戳提示的动作文本 */
    display_action: string;
    /** 戳一戳提示的后缀文本 */
    display_suffix: string;
    /** 戳一戳提示的动作图片 URL，用于取代动作提示文本 */
    display_action_img_url: string;
  }
}

/** 好友戳一戳事件 */
export interface FriendNudgeEvent_ZodInput {
  /** 数据类型区分字段，表示自身为好友戳一戳事件 */
  event_type: 'friend_nudge';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 好友 QQ 号 */
    user_id: number;
    /** 是否是自己发送的戳一戳 */
    is_self_send: boolean;
    /** 是否是自己接收的戳一戳 */
    is_self_receive: boolean;
    /** 戳一戳提示的动作文本 */
    display_action: string;
    /** 戳一戳提示的后缀文本 */
    display_suffix: string;
    /** 戳一戳提示的动作图片 URL，用于取代动作提示文本 */
    display_action_img_url: string;
  }
}

/** 好友文件上传事件 */
export interface FriendFileUploadEvent {
  /** 数据类型区分字段，表示自身为好友文件上传事件 */
  event_type: 'friend_file_upload';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 好友 QQ 号 */
    user_id: number;
    /** 文件 ID */
    file_id: string;
    /** 文件名称 */
    file_name: string;
    /** 文件大小（字节） */
    file_size: number;
    /** 文件的 TriSHA1 哈希值 */
    file_hash: string;
    /** 是否是自己发送的文件 */
    is_self: boolean;
  }
}

/** 好友文件上传事件 */
export interface FriendFileUploadEvent_ZodInput {
  /** 数据类型区分字段，表示自身为好友文件上传事件 */
  event_type: 'friend_file_upload';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 好友 QQ 号 */
    user_id: number;
    /** 文件 ID */
    file_id: string;
    /** 文件名称 */
    file_name: string;
    /** 文件大小（字节） */
    file_size: number;
    /** 文件的 TriSHA1 哈希值 */
    file_hash: string;
    /** 是否是自己发送的文件 */
    is_self: boolean;
  }
}

/** 群管理员变更事件 */
export interface GroupAdminChangeEvent {
  /** 数据类型区分字段，表示自身为群管理员变更事件 */
  event_type: 'group_admin_change';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 发生变更的用户 QQ 号 */
    user_id: number;
    /**
     * 操作者 QQ 号
     * @since 1.1
     */
    operator_id: number;
    /** 是否被设置为管理员，`false` 表示被取消管理员 */
    is_set: boolean;
  }
}

/** 群管理员变更事件 */
export interface GroupAdminChangeEvent_ZodInput {
  /** 数据类型区分字段，表示自身为群管理员变更事件 */
  event_type: 'group_admin_change';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 发生变更的用户 QQ 号 */
    user_id: number;
    /**
     * 操作者 QQ 号
     * @since 1.1
     */
    operator_id: number;
    /** 是否被设置为管理员，`false` 表示被取消管理员 */
    is_set: boolean;
  }
}

/** 群精华消息变更事件 */
export interface GroupEssenceMessageChangeEvent {
  /** 数据类型区分字段，表示自身为群精华消息变更事件 */
  event_type: 'group_essence_message_change';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 发生变更的消息序列号 */
    message_seq: number;
    /**
     * 操作者 QQ 号
     * @since 1.1
     */
    operator_id: number;
    /** 是否被设置为精华，`false` 表示被取消精华 */
    is_set: boolean;
  }
}

/** 群精华消息变更事件 */
export interface GroupEssenceMessageChangeEvent_ZodInput {
  /** 数据类型区分字段，表示自身为群精华消息变更事件 */
  event_type: 'group_essence_message_change';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 发生变更的消息序列号 */
    message_seq: number;
    /**
     * 操作者 QQ 号
     * @since 1.1
     */
    operator_id: number;
    /** 是否被设置为精华，`false` 表示被取消精华 */
    is_set: boolean;
  }
}

/** 群成员增加事件 */
export interface GroupMemberIncreaseEvent {
  /** 数据类型区分字段，表示自身为群成员增加事件 */
  event_type: 'group_member_increase';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 发生变更的用户 QQ 号 */
    user_id: number;
    /** 管理员 QQ 号，如果是管理员同意入群 */
    operator_id?: number | null | undefined;
    /** 邀请者 QQ 号，如果是邀请入群 */
    invitor_id?: number | null | undefined;
  }
}

/** 群成员增加事件 */
export interface GroupMemberIncreaseEvent_ZodInput {
  /** 数据类型区分字段，表示自身为群成员增加事件 */
  event_type: 'group_member_increase';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 发生变更的用户 QQ 号 */
    user_id: number;
    /** 管理员 QQ 号，如果是管理员同意入群 */
    operator_id?: number | null | undefined;
    /** 邀请者 QQ 号，如果是邀请入群 */
    invitor_id?: number | null | undefined;
  }
}

/** 群成员减少事件 */
export interface GroupMemberDecreaseEvent {
  /** 数据类型区分字段，表示自身为群成员减少事件 */
  event_type: 'group_member_decrease';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 发生变更的用户 QQ 号 */
    user_id: number;
    /** 管理员 QQ 号，如果是管理员踢出 */
    operator_id?: number | null | undefined;
  }
}

/** 群成员减少事件 */
export interface GroupMemberDecreaseEvent_ZodInput {
  /** 数据类型区分字段，表示自身为群成员减少事件 */
  event_type: 'group_member_decrease';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 发生变更的用户 QQ 号 */
    user_id: number;
    /** 管理员 QQ 号，如果是管理员踢出 */
    operator_id?: number | null | undefined;
  }
}

/**
 * 群解散事件
 * @since 1.3
 */
export interface GroupDisbandEvent {
  /** 数据类型区分字段，表示自身为群解散事件 */
  event_type: 'group_disband';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 操作者 QQ 号 */
    operator_id: number;
  }
}

/**
 * 群解散事件
 * @since 1.3
 */
export interface GroupDisbandEvent_ZodInput {
  /** 数据类型区分字段，表示自身为群解散事件 */
  event_type: 'group_disband';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 操作者 QQ 号 */
    operator_id: number;
  }
}

/** 群名称变更事件 */
export interface GroupNameChangeEvent {
  /** 数据类型区分字段，表示自身为群名称变更事件 */
  event_type: 'group_name_change';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 新的群名称 */
    new_group_name: string;
    /** 操作者 QQ 号 */
    operator_id: number;
  }
}

/** 群名称变更事件 */
export interface GroupNameChangeEvent_ZodInput {
  /** 数据类型区分字段，表示自身为群名称变更事件 */
  event_type: 'group_name_change';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 新的群名称 */
    new_group_name: string;
    /** 操作者 QQ 号 */
    operator_id: number;
  }
}

/** 群消息表情回应事件 */
export interface GroupMessageReactionEvent {
  /** 数据类型区分字段，表示自身为群消息表情回应事件 */
  event_type: 'group_message_reaction';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 发送回应者 QQ 号 */
    user_id: number;
    /** 消息序列号 */
    message_seq: number;
    /** 表情 ID */
    face_id: string;
    /**
     * 收到的回应类型
     * @since 1.2
     */
    reaction_type: 'face' | 'emoji';
    /** 是否为添加，`false` 表示取消回应 */
    is_add: boolean;
  }
}

/** 群消息表情回应事件 */
export interface GroupMessageReactionEvent_ZodInput {
  /** 数据类型区分字段，表示自身为群消息表情回应事件 */
  event_type: 'group_message_reaction';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 发送回应者 QQ 号 */
    user_id: number;
    /** 消息序列号 */
    message_seq: number;
    /** 表情 ID */
    face_id: string;
    /**
     * 收到的回应类型
     * @since 1.2
     */
    reaction_type: 'face' | 'emoji';
    /** 是否为添加，`false` 表示取消回应 */
    is_add: boolean;
  }
}

/** 群禁言事件 */
export interface GroupMuteEvent {
  /** 数据类型区分字段，表示自身为群禁言事件 */
  event_type: 'group_mute';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 发生变更的用户 QQ 号 */
    user_id: number;
    /** 操作者 QQ 号 */
    operator_id: number;
    /** 禁言时长（秒），为 0 表示取消禁言 */
    duration: number;
  }
}

/** 群禁言事件 */
export interface GroupMuteEvent_ZodInput {
  /** 数据类型区分字段，表示自身为群禁言事件 */
  event_type: 'group_mute';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 发生变更的用户 QQ 号 */
    user_id: number;
    /** 操作者 QQ 号 */
    operator_id: number;
    /** 禁言时长（秒），为 0 表示取消禁言 */
    duration: number;
  }
}

/** 群全体禁言事件 */
export interface GroupWholeMuteEvent {
  /** 数据类型区分字段，表示自身为群全体禁言事件 */
  event_type: 'group_whole_mute';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 操作者 QQ 号 */
    operator_id: number;
    /** 是否全员禁言，`false` 表示取消全员禁言 */
    is_mute: boolean;
  }
}

/** 群全体禁言事件 */
export interface GroupWholeMuteEvent_ZodInput {
  /** 数据类型区分字段，表示自身为群全体禁言事件 */
  event_type: 'group_whole_mute';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 操作者 QQ 号 */
    operator_id: number;
    /** 是否全员禁言，`false` 表示取消全员禁言 */
    is_mute: boolean;
  }
}

/** 群戳一戳事件 */
export interface GroupNudgeEvent {
  /** 数据类型区分字段，表示自身为群戳一戳事件 */
  event_type: 'group_nudge';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 发送者 QQ 号 */
    sender_id: number;
    /** 接收者 QQ 号 */
    receiver_id: number;
    /** 戳一戳提示的动作文本 */
    display_action: string;
    /** 戳一戳提示的后缀文本 */
    display_suffix: string;
    /** 戳一戳提示的动作图片 URL，用于取代动作提示文本 */
    display_action_img_url: string;
  }
}

/** 群戳一戳事件 */
export interface GroupNudgeEvent_ZodInput {
  /** 数据类型区分字段，表示自身为群戳一戳事件 */
  event_type: 'group_nudge';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 发送者 QQ 号 */
    sender_id: number;
    /** 接收者 QQ 号 */
    receiver_id: number;
    /** 戳一戳提示的动作文本 */
    display_action: string;
    /** 戳一戳提示的后缀文本 */
    display_suffix: string;
    /** 戳一戳提示的动作图片 URL，用于取代动作提示文本 */
    display_action_img_url: string;
  }
}

/** 群文件上传事件 */
export interface GroupFileUploadEvent {
  /** 数据类型区分字段，表示自身为群文件上传事件 */
  event_type: 'group_file_upload';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 发送者 QQ 号 */
    user_id: number;
    /** 文件 ID */
    file_id: string;
    /** 文件名称 */
    file_name: string;
    /** 文件大小（字节） */
    file_size: number;
  }
}

/** 群文件上传事件 */
export interface GroupFileUploadEvent_ZodInput {
  /** 数据类型区分字段，表示自身为群文件上传事件 */
  event_type: 'group_file_upload';
  /** 事件 Unix 时间戳（秒） */
  time: number;
  /** 机器人 QQ 号 */
  self_id: number;
  /** 数据内容 */
  data: {
    /** 群号 */
    group_id: number;
    /** 发送者 QQ 号 */
    user_id: number;
    /** 文件 ID */
    file_id: string;
    /** 文件名称 */
    file_name: string;
    /** 文件大小（字节） */
    file_size: number;
  }
}

/** 事件 */
export type Event =
  | BotOfflineEvent
  | MessageReceiveEvent
  | MessageRecallEvent
  | PeerPinChangeEvent
  | FriendRequestEvent
  | GroupJoinRequestEvent
  | GroupInvitedJoinRequestEvent
  | GroupInvitationEvent
  | FriendNudgeEvent
  | FriendFileUploadEvent
  | GroupAdminChangeEvent
  | GroupEssenceMessageChangeEvent
  | GroupMemberIncreaseEvent
  | GroupMemberDecreaseEvent
  | GroupDisbandEvent
  | GroupNameChangeEvent
  | GroupMessageReactionEvent
  | GroupMuteEvent
  | GroupWholeMuteEvent
  | GroupNudgeEvent
  | GroupFileUploadEvent;

/** 事件 */
export type Event_ZodInput =
  | BotOfflineEvent_ZodInput
  | MessageReceiveEvent_ZodInput
  | MessageRecallEvent_ZodInput
  | PeerPinChangeEvent_ZodInput
  | FriendRequestEvent_ZodInput
  | GroupJoinRequestEvent_ZodInput
  | GroupInvitedJoinRequestEvent_ZodInput
  | GroupInvitationEvent_ZodInput
  | FriendNudgeEvent_ZodInput
  | FriendFileUploadEvent_ZodInput
  | GroupAdminChangeEvent_ZodInput
  | GroupEssenceMessageChangeEvent_ZodInput
  | GroupMemberIncreaseEvent_ZodInput
  | GroupMemberDecreaseEvent_ZodInput
  | GroupDisbandEvent_ZodInput
  | GroupNameChangeEvent_ZodInput
  | GroupMessageReactionEvent_ZodInput
  | GroupMuteEvent_ZodInput
  | GroupWholeMuteEvent_ZodInput
  | GroupNudgeEvent_ZodInput
  | GroupFileUploadEvent_ZodInput;

/** 好友实体 */
export interface FriendEntity {
  /** 用户 QQ 号 */
  user_id: number;
  /** 用户昵称 */
  nickname: string;
  /** 用户性别 */
  sex: 'male' | 'female' | 'unknown';
  /** 用户 QID */
  qid: string;
  /** 好友备注 */
  remark: string;
  /** 好友分组 */
  category: FriendCategoryEntity;
}

/** 好友实体 */
export interface FriendEntity_ZodInput {
  /** 用户 QQ 号 */
  user_id: number;
  /** 用户昵称 */
  nickname: string;
  /** 用户性别 */
  sex: 'male' | 'female' | 'unknown';
  /** 用户 QID */
  qid: string;
  /** 好友备注 */
  remark: string;
  /** 好友分组 */
  category: FriendCategoryEntity_ZodInput;
}

/** 好友分组实体 */
export interface FriendCategoryEntity {
  /** 好友分组 ID */
  category_id: number;
  /** 好友分组名称 */
  category_name: string;
}

/** 好友分组实体 */
export interface FriendCategoryEntity_ZodInput {
  /** 好友分组 ID */
  category_id: number;
  /** 好友分组名称 */
  category_name: string;
}

/** 群实体 */
export interface GroupEntity {
  /** 群号 */
  group_id: number;
  /** 群名称 */
  group_name: string;
  /** 群成员数量 */
  member_count: number;
  /** 群容量 */
  max_member_count: number;
  /**
   * 群备注
   * @since 1.2
   */
  remark: string;
  /**
   * 群创建时间，Unix 时间戳（秒）
   * @since 1.2
   */
  created_time: number;
  /**
   * 群简介
   * @since 1.2
   */
  description: string;
  /**
   * 加群验证问题
   * @since 1.2
   */
  question: string;
  /**
   * 群公告预览
   * @since 1.2
   */
  announcement: string;
}

/** 群实体 */
export interface GroupEntity_ZodInput {
  /** 群号 */
  group_id: number;
  /** 群名称 */
  group_name: string;
  /** 群成员数量 */
  member_count: number;
  /** 群容量 */
  max_member_count: number;
  /**
   * 群备注
   * @since 1.2
   */
  remark: string;
  /**
   * 群创建时间，Unix 时间戳（秒）
   * @since 1.2
   */
  created_time: number;
  /**
   * 群简介
   * @since 1.2
   */
  description: string;
  /**
   * 加群验证问题
   * @since 1.2
   */
  question: string;
  /**
   * 群公告预览
   * @since 1.2
   */
  announcement: string;
}

/** 群成员实体 */
export interface GroupMemberEntity {
  /** 用户 QQ 号 */
  user_id: number;
  /** 用户昵称 */
  nickname: string;
  /** 用户性别 */
  sex: 'male' | 'female' | 'unknown';
  /** 群号 */
  group_id: number;
  /** 成员备注 */
  card: string;
  /** 专属头衔 */
  title: string;
  /** 群等级，注意和 QQ 等级区分 */
  level: number;
  /** 权限等级 */
  role: 'owner' | 'admin' | 'member';
  /** 入群时间，Unix 时间戳（秒） */
  join_time: number;
  /** 最后发言时间，Unix 时间戳（秒） */
  last_sent_time: number;
  /** 禁言结束时间，Unix 时间戳（秒） */
  shut_up_end_time?: number | null | undefined;
}

/** 群成员实体 */
export interface GroupMemberEntity_ZodInput {
  /** 用户 QQ 号 */
  user_id: number;
  /** 用户昵称 */
  nickname: string;
  /** 用户性别 */
  sex: 'male' | 'female' | 'unknown';
  /** 群号 */
  group_id: number;
  /** 成员备注 */
  card: string;
  /** 专属头衔 */
  title: string;
  /** 群等级，注意和 QQ 等级区分 */
  level: number;
  /** 权限等级 */
  role: 'owner' | 'admin' | 'member';
  /** 入群时间，Unix 时间戳（秒） */
  join_time: number;
  /** 最后发言时间，Unix 时间戳（秒） */
  last_sent_time: number;
  /** 禁言结束时间，Unix 时间戳（秒） */
  shut_up_end_time?: number | null | undefined;
}

/** 群公告实体 */
export interface GroupAnnouncementEntity {
  /** 群号 */
  group_id: number;
  /** 公告 ID */
  announcement_id: string;
  /** 发送者 QQ 号 */
  user_id: number;
  /** Unix 时间戳（秒） */
  time: number;
  /** 公告内容 */
  content: string;
  /** 公告图片 URL */
  image_url?: string | null | undefined;
}

/** 群公告实体 */
export interface GroupAnnouncementEntity_ZodInput {
  /** 群号 */
  group_id: number;
  /** 公告 ID */
  announcement_id: string;
  /** 发送者 QQ 号 */
  user_id: number;
  /** Unix 时间戳（秒） */
  time: number;
  /** 公告内容 */
  content: string;
  /** 公告图片 URL */
  image_url?: string | null | undefined;
}

/** 群文件实体 */
export interface GroupFileEntity {
  /** 群号 */
  group_id: number;
  /** 文件 ID */
  file_id: string;
  /** 文件名称 */
  file_name: string;
  /** 父文件夹 ID */
  parent_folder_id: string;
  /** 文件大小（字节） */
  file_size: number;
  /** 上传时的 Unix 时间戳（秒） */
  uploaded_time: number;
  /** 过期时的 Unix 时间戳（秒） */
  expire_time?: number | null | undefined;
  /** 上传者 QQ 号 */
  uploader_id: number;
  /** 下载次数 */
  downloaded_times: number;
}

/** 群文件实体 */
export interface GroupFileEntity_ZodInput {
  /** 群号 */
  group_id: number;
  /** 文件 ID */
  file_id: string;
  /** 文件名称 */
  file_name: string;
  /** 父文件夹 ID */
  parent_folder_id: string;
  /** 文件大小（字节） */
  file_size: number;
  /** 上传时的 Unix 时间戳（秒） */
  uploaded_time: number;
  /** 过期时的 Unix 时间戳（秒） */
  expire_time?: number | null | undefined;
  /** 上传者 QQ 号 */
  uploader_id: number;
  /** 下载次数 */
  downloaded_times: number;
}

/** 群文件夹实体 */
export interface GroupFolderEntity {
  /** 群号 */
  group_id: number;
  /** 文件夹 ID */
  folder_id: string;
  /** 父文件夹 ID */
  parent_folder_id: string;
  /** 文件夹名称 */
  folder_name: string;
  /** 创建时的 Unix 时间戳（秒） */
  created_time: number;
  /** 最后修改时的 Unix 时间戳（秒） */
  last_modified_time: number;
  /** 创建者 QQ 号 */
  creator_id: number;
  /** 文件数量 */
  file_count: number;
}

/** 群文件夹实体 */
export interface GroupFolderEntity_ZodInput {
  /** 群号 */
  group_id: number;
  /** 文件夹 ID */
  folder_id: string;
  /** 父文件夹 ID */
  parent_folder_id: string;
  /** 文件夹名称 */
  folder_name: string;
  /** 创建时的 Unix 时间戳（秒） */
  created_time: number;
  /** 最后修改时的 Unix 时间戳（秒） */
  last_modified_time: number;
  /** 创建者 QQ 号 */
  creator_id: number;
  /** 文件数量 */
  file_count: number;
}

/** 好友请求实体 */
export interface FriendRequest {
  /** 请求发起时的 Unix 时间戳（秒） */
  time: number;
  /** 请求发起者 QQ 号 */
  initiator_id: number;
  /** 请求发起者 UID */
  initiator_uid: string;
  /** 目标用户 QQ 号 */
  target_user_id: number;
  /** 目标用户 UID */
  target_user_uid: string;
  /** 请求状态 */
  state: 'pending' | 'accepted' | 'rejected' | 'ignored';
  /** 申请附加信息 */
  comment: string;
  /** 申请来源 */
  via: string;
  /** 请求是否被过滤（发起自风险账户） */
  is_filtered: boolean;
}

/** 好友请求实体 */
export interface FriendRequest_ZodInput {
  /** 请求发起时的 Unix 时间戳（秒） */
  time: number;
  /** 请求发起者 QQ 号 */
  initiator_id: number;
  /** 请求发起者 UID */
  initiator_uid: string;
  /** 目标用户 QQ 号 */
  target_user_id: number;
  /** 目标用户 UID */
  target_user_uid: string;
  /** 请求状态 */
  state: 'pending' | 'accepted' | 'rejected' | 'ignored';
  /** 申请附加信息 */
  comment: string;
  /** 申请来源 */
  via: string;
  /** 请求是否被过滤（发起自风险账户） */
  is_filtered: boolean;
}

/** 用户入群请求 */
export interface GroupJoinRequestNotification {
  /** 数据类型区分字段，表示自身为用户入群请求 */
  type: 'join_request';
  /** 群号 */
  group_id: number;
  /** 通知序列号 */
  notification_seq: number;
  /** 请求是否被过滤（发起自风险账户） */
  is_filtered: boolean;
  /** 发起者 QQ 号 */
  initiator_id: number;
  /** 请求状态 */
  state: 'pending' | 'accepted' | 'rejected' | 'ignored';
  /** 处理请求的管理员 QQ 号 */
  operator_id?: number | null | undefined;
  /** 入群请求附加信息 */
  comment: string;
}

/** 用户入群请求 */
export interface GroupJoinRequestNotification_ZodInput {
  /** 数据类型区分字段，表示自身为用户入群请求 */
  type: 'join_request';
  /** 群号 */
  group_id: number;
  /** 通知序列号 */
  notification_seq: number;
  /** 请求是否被过滤（发起自风险账户） */
  is_filtered: boolean;
  /** 发起者 QQ 号 */
  initiator_id: number;
  /** 请求状态 */
  state: 'pending' | 'accepted' | 'rejected' | 'ignored';
  /** 处理请求的管理员 QQ 号 */
  operator_id?: number | null | undefined;
  /** 入群请求附加信息 */
  comment: string;
}

/** 群管理员变更通知 */
export interface GroupAdminChangeNotification {
  /** 数据类型区分字段，表示自身为群管理员变更通知 */
  type: 'admin_change';
  /** 群号 */
  group_id: number;
  /** 通知序列号 */
  notification_seq: number;
  /** 被设置/取消用户 QQ 号 */
  target_user_id: number;
  /** 是否被设置为管理员，`false` 表示被取消管理员 */
  is_set: boolean;
  /** 操作者（群主）QQ 号 */
  operator_id: number;
}

/** 群管理员变更通知 */
export interface GroupAdminChangeNotification_ZodInput {
  /** 数据类型区分字段，表示自身为群管理员变更通知 */
  type: 'admin_change';
  /** 群号 */
  group_id: number;
  /** 通知序列号 */
  notification_seq: number;
  /** 被设置/取消用户 QQ 号 */
  target_user_id: number;
  /** 是否被设置为管理员，`false` 表示被取消管理员 */
  is_set: boolean;
  /** 操作者（群主）QQ 号 */
  operator_id: number;
}

/** 群成员被移除通知 */
export interface GroupKickNotification {
  /** 数据类型区分字段，表示自身为群成员被移除通知 */
  type: 'kick';
  /** 群号 */
  group_id: number;
  /** 通知序列号 */
  notification_seq: number;
  /** 被移除用户 QQ 号 */
  target_user_id: number;
  /** 移除用户的管理员 QQ 号 */
  operator_id: number;
}

/** 群成员被移除通知 */
export interface GroupKickNotification_ZodInput {
  /** 数据类型区分字段，表示自身为群成员被移除通知 */
  type: 'kick';
  /** 群号 */
  group_id: number;
  /** 通知序列号 */
  notification_seq: number;
  /** 被移除用户 QQ 号 */
  target_user_id: number;
  /** 移除用户的管理员 QQ 号 */
  operator_id: number;
}

/** 群成员退群通知 */
export interface GroupQuitNotification {
  /** 数据类型区分字段，表示自身为群成员退群通知 */
  type: 'quit';
  /** 群号 */
  group_id: number;
  /** 通知序列号 */
  notification_seq: number;
  /** 退群用户 QQ 号 */
  target_user_id: number;
}

/** 群成员退群通知 */
export interface GroupQuitNotification_ZodInput {
  /** 数据类型区分字段，表示自身为群成员退群通知 */
  type: 'quit';
  /** 群号 */
  group_id: number;
  /** 通知序列号 */
  notification_seq: number;
  /** 退群用户 QQ 号 */
  target_user_id: number;
}

/** 群成员邀请他人入群请求 */
export interface GroupInvitedJoinRequestNotification {
  /** 数据类型区分字段，表示自身为群成员邀请他人入群请求 */
  type: 'invited_join_request';
  /** 群号 */
  group_id: number;
  /** 通知序列号 */
  notification_seq: number;
  /** 邀请者 QQ 号 */
  initiator_id: number;
  /** 被邀请用户 QQ 号 */
  target_user_id: number;
  /** 请求状态 */
  state: 'pending' | 'accepted' | 'rejected' | 'ignored';
  /** 处理请求的管理员 QQ 号 */
  operator_id?: number | null | undefined;
}

/** 群成员邀请他人入群请求 */
export interface GroupInvitedJoinRequestNotification_ZodInput {
  /** 数据类型区分字段，表示自身为群成员邀请他人入群请求 */
  type: 'invited_join_request';
  /** 群号 */
  group_id: number;
  /** 通知序列号 */
  notification_seq: number;
  /** 邀请者 QQ 号 */
  initiator_id: number;
  /** 被邀请用户 QQ 号 */
  target_user_id: number;
  /** 请求状态 */
  state: 'pending' | 'accepted' | 'rejected' | 'ignored';
  /** 处理请求的管理员 QQ 号 */
  operator_id?: number | null | undefined;
}

/** 群通知实体 */
export type GroupNotification =
  | GroupJoinRequestNotification
  | GroupAdminChangeNotification
  | GroupKickNotification
  | GroupQuitNotification
  | GroupInvitedJoinRequestNotification;

/** 群通知实体 */
export type GroupNotification_ZodInput =
  | GroupJoinRequestNotification_ZodInput
  | GroupAdminChangeNotification_ZodInput
  | GroupKickNotification_ZodInput
  | GroupQuitNotification_ZodInput
  | GroupInvitedJoinRequestNotification_ZodInput;

/** 好友消息 */
export interface IncomingFriendMessage {
  /** 数据类型区分字段，表示自身为好友消息 */
  message_scene: 'friend';
  /** 好友 QQ 号或群号 */
  peer_id: number;
  /** 消息序列号 */
  message_seq: number;
  /** 发送者 QQ 号 */
  sender_id: number;
  /** 消息 Unix 时间戳（秒） */
  time: number;
  /** 消息段列表 */
  segments: IncomingSegment[];
  /** 好友信息 */
  friend: FriendEntity;
}

/** 好友消息 */
export interface IncomingFriendMessage_ZodInput {
  /** 数据类型区分字段，表示自身为好友消息 */
  message_scene: 'friend';
  /** 好友 QQ 号或群号 */
  peer_id: number;
  /** 消息序列号 */
  message_seq: number;
  /** 发送者 QQ 号 */
  sender_id: number;
  /** 消息 Unix 时间戳（秒） */
  time: number;
  /** 消息段列表 */
  segments: IncomingSegment_ZodInput[];
  /** 好友信息 */
  friend: FriendEntity_ZodInput;
}

/** 群消息 */
export interface IncomingGroupMessage {
  /** 数据类型区分字段，表示自身为群消息 */
  message_scene: 'group';
  /** 好友 QQ 号或群号 */
  peer_id: number;
  /** 消息序列号 */
  message_seq: number;
  /** 发送者 QQ 号 */
  sender_id: number;
  /** 消息 Unix 时间戳（秒） */
  time: number;
  /** 消息段列表 */
  segments: IncomingSegment[];
  /** 群信息 */
  group: GroupEntity;
  /** 群成员信息 */
  group_member: GroupMemberEntity;
}

/** 群消息 */
export interface IncomingGroupMessage_ZodInput {
  /** 数据类型区分字段，表示自身为群消息 */
  message_scene: 'group';
  /** 好友 QQ 号或群号 */
  peer_id: number;
  /** 消息序列号 */
  message_seq: number;
  /** 发送者 QQ 号 */
  sender_id: number;
  /** 消息 Unix 时间戳（秒） */
  time: number;
  /** 消息段列表 */
  segments: IncomingSegment_ZodInput[];
  /** 群信息 */
  group: GroupEntity_ZodInput;
  /** 群成员信息 */
  group_member: GroupMemberEntity_ZodInput;
}

/** 临时会话消息 */
export interface IncomingTempMessage {
  /** 数据类型区分字段，表示自身为临时会话消息 */
  message_scene: 'temp';
  /** 好友 QQ 号或群号 */
  peer_id: number;
  /** 消息序列号 */
  message_seq: number;
  /** 发送者 QQ 号 */
  sender_id: number;
  /** 消息 Unix 时间戳（秒） */
  time: number;
  /** 消息段列表 */
  segments: IncomingSegment[];
  /** 临时会话发送者的所在的群信息 */
  group?: GroupEntity | null | undefined;
}

/** 临时会话消息 */
export interface IncomingTempMessage_ZodInput {
  /** 数据类型区分字段，表示自身为临时会话消息 */
  message_scene: 'temp';
  /** 好友 QQ 号或群号 */
  peer_id: number;
  /** 消息序列号 */
  message_seq: number;
  /** 发送者 QQ 号 */
  sender_id: number;
  /** 消息 Unix 时间戳（秒） */
  time: number;
  /** 消息段列表 */
  segments: IncomingSegment_ZodInput[];
  /** 临时会话发送者的所在的群信息 */
  group?: GroupEntity_ZodInput | null | undefined;
}

/** 接收消息 */
export type IncomingMessage =
  | IncomingFriendMessage
  | IncomingGroupMessage
  | IncomingTempMessage;

/** 接收消息 */
export type IncomingMessage_ZodInput =
  | IncomingFriendMessage_ZodInput
  | IncomingGroupMessage_ZodInput
  | IncomingTempMessage_ZodInput;

/** 接收转发消息 */
export interface IncomingForwardedMessage {
  /**
   * 消息序列号
   * @since 1.2
   */
  message_seq: number;
  /** 发送者名称 */
  sender_name: string;
  /** 发送者头像 URL */
  avatar_url: string;
  /** 消息 Unix 时间戳（秒） */
  time: number;
  /** 消息段列表 */
  segments: IncomingSegment[];
}

/** 接收转发消息 */
export interface IncomingForwardedMessage_ZodInput {
  /**
   * 消息序列号
   * @since 1.2
   */
  message_seq: number;
  /** 发送者名称 */
  sender_name: string;
  /** 发送者头像 URL */
  avatar_url: string;
  /** 消息 Unix 时间戳（秒） */
  time: number;
  /** 消息段列表 */
  segments: IncomingSegment_ZodInput[];
}

/** 群精华消息 */
export interface GroupEssenceMessage {
  /** 群号 */
  group_id: number;
  /** 消息序列号 */
  message_seq: number;
  /** 消息发送时的 Unix 时间戳（秒） */
  message_time: number;
  /** 发送者 QQ 号 */
  sender_id: number;
  /** 发送者名称 */
  sender_name: string;
  /** 设置精华的操作者 QQ 号 */
  operator_id: number;
  /** 设置精华的操作者名称 */
  operator_name: string;
  /** 消息被设置精华时的 Unix 时间戳（秒） */
  operation_time: number;
  /** 消息段列表 */
  segments: IncomingSegment[];
}

/** 群精华消息 */
export interface GroupEssenceMessage_ZodInput {
  /** 群号 */
  group_id: number;
  /** 消息序列号 */
  message_seq: number;
  /** 消息发送时的 Unix 时间戳（秒） */
  message_time: number;
  /** 发送者 QQ 号 */
  sender_id: number;
  /** 发送者名称 */
  sender_name: string;
  /** 设置精华的操作者 QQ 号 */
  operator_id: number;
  /** 设置精华的操作者名称 */
  operator_name: string;
  /** 消息被设置精华时的 Unix 时间戳（秒） */
  operation_time: number;
  /** 消息段列表 */
  segments: IncomingSegment_ZodInput[];
}

/** 文本消息段 */
export interface IncomingTextSegment {
  /** 数据类型区分字段，表示自身为文本消息段 */
  type: 'text';
  /** 数据内容 */
  data: {
    /** 文本内容 */
    text: string;
  }
}

/** 文本消息段 */
export interface IncomingTextSegment_ZodInput {
  /** 数据类型区分字段，表示自身为文本消息段 */
  type: 'text';
  /** 数据内容 */
  data: {
    /** 文本内容 */
    text: string;
  }
}

/** 提及消息段 */
export interface IncomingMentionSegment {
  /** 数据类型区分字段，表示自身为提及消息段 */
  type: 'mention';
  /** 数据内容 */
  data: {
    /** 提及的 QQ 号 */
    user_id: number;
    /**
     * 去掉 `@` 前缀的提及的名称
     * @since 1.2
     */
    name: string;
  }
}

/** 提及消息段 */
export interface IncomingMentionSegment_ZodInput {
  /** 数据类型区分字段，表示自身为提及消息段 */
  type: 'mention';
  /** 数据内容 */
  data: {
    /** 提及的 QQ 号 */
    user_id: number;
    /**
     * 去掉 `@` 前缀的提及的名称
     * @since 1.2
     */
    name: string;
  }
}

/** 提及全体消息段 */
export interface IncomingMentionAllSegment {
  /** 数据类型区分字段，表示自身为提及全体消息段 */
  type: 'mention_all';
  /** 数据内容 */
  data: {
  }
}

/** 提及全体消息段 */
export interface IncomingMentionAllSegment_ZodInput {
  /** 数据类型区分字段，表示自身为提及全体消息段 */
  type: 'mention_all';
  /** 数据内容 */
  data: {
  }
}

/** 表情消息段 */
export interface IncomingFaceSegment {
  /** 数据类型区分字段，表示自身为表情消息段 */
  type: 'face';
  /** 数据内容 */
  data: {
    /** 表情 ID */
    face_id: string;
    /**
     * 是否为超级表情
     * @since 1.1
     */
    is_large: boolean;
  }
}

/** 表情消息段 */
export interface IncomingFaceSegment_ZodInput {
  /** 数据类型区分字段，表示自身为表情消息段 */
  type: 'face';
  /** 数据内容 */
  data: {
    /** 表情 ID */
    face_id: string;
    /**
     * 是否为超级表情
     * @since 1.1
     */
    is_large: boolean;
  }
}

/** 回复消息段 */
export interface IncomingReplySegment {
  /** 数据类型区分字段，表示自身为回复消息段 */
  type: 'reply';
  /** 数据内容 */
  data: {
    /** 被引用的消息序列号 */
    message_seq: number;
    /**
     * 被引用的消息发送者 QQ 号
     * @since 1.2
     */
    sender_id: number;
    /**
     * 被引用的消息发送者名称，仅在合并转发中能够获取
     * @since 1.2
     */
    sender_name?: string | null | undefined;
    /**
     * 被引用的消息的 Unix 时间戳（秒）
     * @since 1.2
     */
    time: number;
    /**
     * 被引用的消息内容
     * @since 1.2
     */
    segments: IncomingSegment[];
  }
}

/** 回复消息段 */
export interface IncomingReplySegment_ZodInput {
  /** 数据类型区分字段，表示自身为回复消息段 */
  type: 'reply';
  /** 数据内容 */
  data: {
    /** 被引用的消息序列号 */
    message_seq: number;
    /**
     * 被引用的消息发送者 QQ 号
     * @since 1.2
     */
    sender_id: number;
    /**
     * 被引用的消息发送者名称，仅在合并转发中能够获取
     * @since 1.2
     */
    sender_name?: string | null | undefined;
    /**
     * 被引用的消息的 Unix 时间戳（秒）
     * @since 1.2
     */
    time: number;
    /**
     * 被引用的消息内容
     * @since 1.2
     */
    segments: IncomingSegment_ZodInput[];
  }
}

/** 图片消息段 */
export interface IncomingImageSegment {
  /** 数据类型区分字段，表示自身为图片消息段 */
  type: 'image';
  /** 数据内容 */
  data: {
    /** 资源 ID */
    resource_id: string;
    /** 临时 URL */
    temp_url: string;
    /** 图片宽度 */
    width: number;
    /** 图片高度 */
    height: number;
    /** 图片预览文本 */
    summary: string;
    /** 图片类型 */
    sub_type: 'normal' | 'sticker';
  }
}

/** 图片消息段 */
export interface IncomingImageSegment_ZodInput {
  /** 数据类型区分字段，表示自身为图片消息段 */
  type: 'image';
  /** 数据内容 */
  data: {
    /** 资源 ID */
    resource_id: string;
    /** 临时 URL */
    temp_url: string;
    /** 图片宽度 */
    width: number;
    /** 图片高度 */
    height: number;
    /** 图片预览文本 */
    summary: string;
    /** 图片类型 */
    sub_type: 'normal' | 'sticker';
  }
}

/** 语音消息段 */
export interface IncomingRecordSegment {
  /** 数据类型区分字段，表示自身为语音消息段 */
  type: 'record';
  /** 数据内容 */
  data: {
    /** 资源 ID */
    resource_id: string;
    /** 临时 URL */
    temp_url: string;
    /** 语音时长（秒） */
    duration: number;
  }
}

/** 语音消息段 */
export interface IncomingRecordSegment_ZodInput {
  /** 数据类型区分字段，表示自身为语音消息段 */
  type: 'record';
  /** 数据内容 */
  data: {
    /** 资源 ID */
    resource_id: string;
    /** 临时 URL */
    temp_url: string;
    /** 语音时长（秒） */
    duration: number;
  }
}

/** 视频消息段 */
export interface IncomingVideoSegment {
  /** 数据类型区分字段，表示自身为视频消息段 */
  type: 'video';
  /** 数据内容 */
  data: {
    /** 资源 ID */
    resource_id: string;
    /** 临时 URL */
    temp_url: string;
    /** 视频宽度 */
    width: number;
    /** 视频高度 */
    height: number;
    /** 视频时长（秒） */
    duration: number;
  }
}

/** 视频消息段 */
export interface IncomingVideoSegment_ZodInput {
  /** 数据类型区分字段，表示自身为视频消息段 */
  type: 'video';
  /** 数据内容 */
  data: {
    /** 资源 ID */
    resource_id: string;
    /** 临时 URL */
    temp_url: string;
    /** 视频宽度 */
    width: number;
    /** 视频高度 */
    height: number;
    /** 视频时长（秒） */
    duration: number;
  }
}

/** 文件消息段 */
export interface IncomingFileSegment {
  /** 数据类型区分字段，表示自身为文件消息段 */
  type: 'file';
  /** 数据内容 */
  data: {
    /** 文件 ID */
    file_id: string;
    /** 文件名称 */
    file_name: string;
    /** 文件大小（字节） */
    file_size: number;
    /** 文件的 TriSHA1 哈希值，仅在私聊文件中存在 */
    file_hash?: string | null | undefined;
  }
}

/** 文件消息段 */
export interface IncomingFileSegment_ZodInput {
  /** 数据类型区分字段，表示自身为文件消息段 */
  type: 'file';
  /** 数据内容 */
  data: {
    /** 文件 ID */
    file_id: string;
    /** 文件名称 */
    file_name: string;
    /** 文件大小（字节） */
    file_size: number;
    /** 文件的 TriSHA1 哈希值，仅在私聊文件中存在 */
    file_hash?: string | null | undefined;
  }
}

/** 合并转发消息段 */
export interface IncomingForwardSegment {
  /** 数据类型区分字段，表示自身为合并转发消息段 */
  type: 'forward';
  /** 数据内容 */
  data: {
    /** 合并转发 ID */
    forward_id: string;
    /**
     * 合并转发标题
     * @since 1.1
     */
    title: string;
    /**
     * 合并转发预览文本
     * @since 1.1
     */
    preview: string[];
    /**
     * 合并转发摘要
     * @since 1.1
     */
    summary: string;
  }
}

/** 合并转发消息段 */
export interface IncomingForwardSegment_ZodInput {
  /** 数据类型区分字段，表示自身为合并转发消息段 */
  type: 'forward';
  /** 数据内容 */
  data: {
    /** 合并转发 ID */
    forward_id: string;
    /**
     * 合并转发标题
     * @since 1.1
     */
    title: string;
    /**
     * 合并转发预览文本
     * @since 1.1
     */
    preview: string[];
    /**
     * 合并转发摘要
     * @since 1.1
     */
    summary: string;
  }
}

/** 市场表情消息段 */
export interface IncomingMarketFaceSegment {
  /** 数据类型区分字段，表示自身为市场表情消息段 */
  type: 'market_face';
  /** 数据内容 */
  data: {
    /**
     * 市场表情包 ID
     * @since 1.1
     */
    emoji_package_id: number;
    /**
     * 市场表情 ID
     * @since 1.1
     */
    emoji_id: string;
    /**
     * 市场表情 Key
     * @since 1.1
     */
    key: string;
    /**
     * 市场表情预览文本
     * @since 1.1
     */
    summary: string;
    /** 市场表情 URL */
    url: string;
  }
}

/** 市场表情消息段 */
export interface IncomingMarketFaceSegment_ZodInput {
  /** 数据类型区分字段，表示自身为市场表情消息段 */
  type: 'market_face';
  /** 数据内容 */
  data: {
    /**
     * 市场表情包 ID
     * @since 1.1
     */
    emoji_package_id: number;
    /**
     * 市场表情 ID
     * @since 1.1
     */
    emoji_id: string;
    /**
     * 市场表情 Key
     * @since 1.1
     */
    key: string;
    /**
     * 市场表情预览文本
     * @since 1.1
     */
    summary: string;
    /** 市场表情 URL */
    url: string;
  }
}

/** 小程序消息段 */
export interface IncomingLightAppSegment {
  /** 数据类型区分字段，表示自身为小程序消息段 */
  type: 'light_app';
  /** 数据内容 */
  data: {
    /** 小程序名称 */
    app_name: string;
    /** 小程序 JSON 数据 */
    json_payload: string;
  }
}

/** 小程序消息段 */
export interface IncomingLightAppSegment_ZodInput {
  /** 数据类型区分字段，表示自身为小程序消息段 */
  type: 'light_app';
  /** 数据内容 */
  data: {
    /** 小程序名称 */
    app_name: string;
    /** 小程序 JSON 数据 */
    json_payload: string;
  }
}

/** XML 消息段 */
export interface IncomingXmlSegment {
  /** 数据类型区分字段，表示自身为XML 消息段 */
  type: 'xml';
  /** 数据内容 */
  data: {
    /** 服务 ID */
    service_id: number;
    /** XML 数据 */
    xml_payload: string;
  }
}

/** XML 消息段 */
export interface IncomingXmlSegment_ZodInput {
  /** 数据类型区分字段，表示自身为XML 消息段 */
  type: 'xml';
  /** 数据内容 */
  data: {
    /** 服务 ID */
    service_id: number;
    /** XML 数据 */
    xml_payload: string;
  }
}

/** Markdown 消息段 */
export interface IncomingMarkdownSegment {
  /** 数据类型区分字段，表示自身为Markdown 消息段 */
  type: 'markdown';
  /** 数据内容 */
  data: {
    /** Markdown 内容 */
    content: string;
  }
}

/** Markdown 消息段 */
export interface IncomingMarkdownSegment_ZodInput {
  /** 数据类型区分字段，表示自身为Markdown 消息段 */
  type: 'markdown';
  /** 数据内容 */
  data: {
    /** Markdown 内容 */
    content: string;
  }
}

/** 接收消息段 */
export type IncomingSegment =
  | IncomingTextSegment
  | IncomingMentionSegment
  | IncomingMentionAllSegment
  | IncomingFaceSegment
  | IncomingReplySegment
  | IncomingImageSegment
  | IncomingRecordSegment
  | IncomingVideoSegment
  | IncomingFileSegment
  | IncomingForwardSegment
  | IncomingMarketFaceSegment
  | IncomingLightAppSegment
  | IncomingXmlSegment
  | IncomingMarkdownSegment;

/** 接收消息段 */
export type IncomingSegment_ZodInput =
  | IncomingTextSegment_ZodInput
  | IncomingMentionSegment_ZodInput
  | IncomingMentionAllSegment_ZodInput
  | IncomingFaceSegment_ZodInput
  | IncomingReplySegment_ZodInput
  | IncomingImageSegment_ZodInput
  | IncomingRecordSegment_ZodInput
  | IncomingVideoSegment_ZodInput
  | IncomingFileSegment_ZodInput
  | IncomingForwardSegment_ZodInput
  | IncomingMarketFaceSegment_ZodInput
  | IncomingLightAppSegment_ZodInput
  | IncomingXmlSegment_ZodInput
  | IncomingMarkdownSegment_ZodInput;

/** 发送转发消息 */
export interface OutgoingForwardedMessage {
  /** 发送者 QQ 号 */
  user_id: number;
  /** 发送者名称 */
  sender_name: string;
  /**
   * 消息 Unix 时间戳（秒）
   * @since 1.3
   */
  time?: number | null | undefined;
  /** 消息段列表 */
  segments: OutgoingSegment[];
}

/** 发送转发消息 */
export interface OutgoingForwardedMessage_ZodInput {
  /** 发送者 QQ 号 */
  user_id: number;
  /** 发送者名称 */
  sender_name: string;
  /**
   * 消息 Unix 时间戳（秒）
   * @since 1.3
   */
  time?: number | null | undefined;
  /** 消息段列表 */
  segments: OutgoingSegment_ZodInput[];
}

/** 文本消息段 */
export interface OutgoingTextSegment {
  /** 数据类型区分字段，表示自身为文本消息段 */
  type: 'text';
  /** 数据内容 */
  data: {
    /** 文本内容 */
    text: string;
  }
}

/** 文本消息段 */
export interface OutgoingTextSegment_ZodInput {
  /** 数据类型区分字段，表示自身为文本消息段 */
  type: 'text';
  /** 数据内容 */
  data: {
    /** 文本内容 */
    text: string;
  }
}

/** 提及消息段 */
export interface OutgoingMentionSegment {
  /** 数据类型区分字段，表示自身为提及消息段 */
  type: 'mention';
  /** 数据内容 */
  data: {
    /** 提及的 QQ 号 */
    user_id: number;
  }
}

/** 提及消息段 */
export interface OutgoingMentionSegment_ZodInput {
  /** 数据类型区分字段，表示自身为提及消息段 */
  type: 'mention';
  /** 数据内容 */
  data: {
    /** 提及的 QQ 号 */
    user_id: number;
  }
}

/** 提及全体消息段 */
export interface OutgoingMentionAllSegment {
  /** 数据类型区分字段，表示自身为提及全体消息段 */
  type: 'mention_all';
  /** 数据内容 */
  data: {
  }
}

/** 提及全体消息段 */
export interface OutgoingMentionAllSegment_ZodInput {
  /** 数据类型区分字段，表示自身为提及全体消息段 */
  type: 'mention_all';
  /** 数据内容 */
  data: {
  }
}

/** 表情消息段 */
export interface OutgoingFaceSegment {
  /** 数据类型区分字段，表示自身为表情消息段 */
  type: 'face';
  /** 数据内容 */
  data: {
    /** 表情 ID */
    face_id: string;
    /**
     * 是否为超级表情
     * @since 1.1
     */
    is_large: boolean;
  }
}

/** 表情消息段 */
export interface OutgoingFaceSegment_ZodInput {
  /** 数据类型区分字段，表示自身为表情消息段 */
  type: 'face';
  /** 数据内容 */
  data: {
    /** 表情 ID */
    face_id: string;
    /**
     * 是否为超级表情
     * @since 1.1
     */
    is_large?: boolean | null | undefined;
  }
}

/** 回复消息段 */
export interface OutgoingReplySegment {
  /** 数据类型区分字段，表示自身为回复消息段 */
  type: 'reply';
  /** 数据内容 */
  data: {
    /** 被引用的消息序列号 */
    message_seq: number;
  }
}

/** 回复消息段 */
export interface OutgoingReplySegment_ZodInput {
  /** 数据类型区分字段，表示自身为回复消息段 */
  type: 'reply';
  /** 数据内容 */
  data: {
    /** 被引用的消息序列号 */
    message_seq: number;
  }
}

/** 图片消息段 */
export interface OutgoingImageSegment {
  /** 数据类型区分字段，表示自身为图片消息段 */
  type: 'image';
  /** 数据内容 */
  data: {
    /** 文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式 */
    uri: string;
    /** 图片类型 */
    sub_type: 'normal' | 'sticker';
    /** 图片预览文本 */
    summary?: string | null | undefined;
  }
}

/** 图片消息段 */
export interface OutgoingImageSegment_ZodInput {
  /** 数据类型区分字段，表示自身为图片消息段 */
  type: 'image';
  /** 数据内容 */
  data: {
    /** 文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式 */
    uri: string;
    /** 图片类型 */
    sub_type?: 'normal' | 'sticker' | null | undefined;
    /** 图片预览文本 */
    summary?: string | null | undefined;
  }
}

/** 语音消息段 */
export interface OutgoingRecordSegment {
  /** 数据类型区分字段，表示自身为语音消息段 */
  type: 'record';
  /** 数据内容 */
  data: {
    /** 文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式 */
    uri: string;
  }
}

/** 语音消息段 */
export interface OutgoingRecordSegment_ZodInput {
  /** 数据类型区分字段，表示自身为语音消息段 */
  type: 'record';
  /** 数据内容 */
  data: {
    /** 文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式 */
    uri: string;
  }
}

/** 视频消息段 */
export interface OutgoingVideoSegment {
  /** 数据类型区分字段，表示自身为视频消息段 */
  type: 'video';
  /** 数据内容 */
  data: {
    /** 文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式 */
    uri: string;
    /** 封面图片 URI */
    thumb_uri?: string | null | undefined;
  }
}

/** 视频消息段 */
export interface OutgoingVideoSegment_ZodInput {
  /** 数据类型区分字段，表示自身为视频消息段 */
  type: 'video';
  /** 数据内容 */
  data: {
    /** 文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式 */
    uri: string;
    /** 封面图片 URI */
    thumb_uri?: string | null | undefined;
  }
}

/** 合并转发消息段 */
export interface OutgoingForwardSegment {
  /** 数据类型区分字段，表示自身为合并转发消息段 */
  type: 'forward';
  /** 数据内容 */
  data: {
    /** 合并转发消息内容 */
    messages: OutgoingForwardedMessage[];
    /**
     * 合并转发标题
     * @since 1.2
     */
    title?: string | null | undefined;
    /**
     * 合并转发预览文本，若提供，至少 1 条，至多 4 条
     * @since 1.2
     */
    preview?: string[] | null | undefined;
    /**
     * 合并转发摘要
     * @since 1.2
     */
    summary?: string | null | undefined;
    /**
     * 合并转发的预览外显文本，仅对移动端 QQ 有效
     * @since 1.2
     */
    prompt?: string | null | undefined;
  }
}

/** 合并转发消息段 */
export interface OutgoingForwardSegment_ZodInput {
  /** 数据类型区分字段，表示自身为合并转发消息段 */
  type: 'forward';
  /** 数据内容 */
  data: {
    /** 合并转发消息内容 */
    messages: OutgoingForwardedMessage_ZodInput[];
    /**
     * 合并转发标题
     * @since 1.2
     */
    title?: string | null | undefined;
    /**
     * 合并转发预览文本，若提供，至少 1 条，至多 4 条
     * @since 1.2
     */
    preview?: string[] | null | undefined;
    /**
     * 合并转发摘要
     * @since 1.2
     */
    summary?: string | null | undefined;
    /**
     * 合并转发的预览外显文本，仅对移动端 QQ 有效
     * @since 1.2
     */
    prompt?: string | null | undefined;
  }
}

/**
 * 小程序消息段
 * @since 1.2
 */
export interface OutgoingLightAppSegment {
  /** 数据类型区分字段，表示自身为小程序消息段 */
  type: 'light_app';
  /** 数据内容 */
  data: {
    /** 小程序 JSON 数据 */
    json_payload: string;
  }
}

/**
 * 小程序消息段
 * @since 1.2
 */
export interface OutgoingLightAppSegment_ZodInput {
  /** 数据类型区分字段，表示自身为小程序消息段 */
  type: 'light_app';
  /** 数据内容 */
  data: {
    /** 小程序 JSON 数据 */
    json_payload: string;
  }
}

/** 发送消息段 */
export type OutgoingSegment =
  | OutgoingTextSegment
  | OutgoingMentionSegment
  | OutgoingMentionAllSegment
  | OutgoingFaceSegment
  | OutgoingReplySegment
  | OutgoingImageSegment
  | OutgoingRecordSegment
  | OutgoingVideoSegment
  | OutgoingForwardSegment
  | OutgoingLightAppSegment;

/** 发送消息段 */
export type OutgoingSegment_ZodInput =
  | OutgoingTextSegment_ZodInput
  | OutgoingMentionSegment_ZodInput
  | OutgoingMentionAllSegment_ZodInput
  | OutgoingFaceSegment_ZodInput
  | OutgoingReplySegment_ZodInput
  | OutgoingImageSegment_ZodInput
  | OutgoingRecordSegment_ZodInput
  | OutgoingVideoSegment_ZodInput
  | OutgoingForwardSegment_ZodInput
  | OutgoingLightAppSegment_ZodInput;

// ####################################
// API Structs
// ####################################

/** 获取登录信息 API 请求参数 */
export type GetLoginInfoInput = {};

/** 获取登录信息 API 请求参数 */
export type GetLoginInfoInput_ZodInput = {};

/** 获取登录信息 API 响应数据 */
export interface GetLoginInfoOutput {
  /** 登录 QQ 号 */
  uin: number;
  /** 登录昵称 */
  nickname: string;
}

/** 获取登录信息 API 响应数据 */
export interface GetLoginInfoOutput_ZodInput {
  /** 登录 QQ 号 */
  uin: number;
  /** 登录昵称 */
  nickname: string;
}

/** 获取协议端信息 API 请求参数 */
export type GetImplInfoInput = {};

/** 获取协议端信息 API 请求参数 */
export type GetImplInfoInput_ZodInput = {};

/** 获取协议端信息 API 响应数据 */
export interface GetImplInfoOutput {
  /** 协议端名称 */
  impl_name: string;
  /** 协议端版本 */
  impl_version: string;
  /** 协议端使用的 QQ 协议版本 */
  qq_protocol_version: string;
  /** 协议端使用的 QQ 协议平台 */
  qq_protocol_type: 'windows' | 'linux' | 'macos' | 'android_pad' | 'android_phone' | 'ipad' | 'iphone' | 'harmony' | 'watch';
  /** 协议端实现的 Milky 协议版本，目前为 "1.2" */
  milky_version: string;
}

/** 获取协议端信息 API 响应数据 */
export interface GetImplInfoOutput_ZodInput {
  /** 协议端名称 */
  impl_name: string;
  /** 协议端版本 */
  impl_version: string;
  /** 协议端使用的 QQ 协议版本 */
  qq_protocol_version: string;
  /** 协议端使用的 QQ 协议平台 */
  qq_protocol_type: 'windows' | 'linux' | 'macos' | 'android_pad' | 'android_phone' | 'ipad' | 'iphone' | 'harmony' | 'watch';
  /** 协议端实现的 Milky 协议版本，目前为 "1.2" */
  milky_version: string;
}

/** 获取用户个人信息 API 请求参数 */
export interface GetUserProfileInput {
  /** 用户 QQ 号 */
  user_id: number;
}

/** 获取用户个人信息 API 请求参数 */
export interface GetUserProfileInput_ZodInput {
  /** 用户 QQ 号 */
  user_id: number;
}

/** 获取用户个人信息 API 响应数据 */
export interface GetUserProfileOutput {
  /** 昵称 */
  nickname: string;
  /** QID */
  qid: string;
  /** 年龄 */
  age: number;
  /** 性别 */
  sex: 'male' | 'female' | 'unknown';
  /** 备注 */
  remark: string;
  /** 个性签名 */
  bio: string;
  /** QQ 等级 */
  level: number;
  /** 国家或地区 */
  country: string;
  /** 城市 */
  city: string;
  /** 学校 */
  school: string;
}

/** 获取用户个人信息 API 响应数据 */
export interface GetUserProfileOutput_ZodInput {
  /** 昵称 */
  nickname: string;
  /** QID */
  qid: string;
  /** 年龄 */
  age: number;
  /** 性别 */
  sex: 'male' | 'female' | 'unknown';
  /** 备注 */
  remark: string;
  /** 个性签名 */
  bio: string;
  /** QQ 等级 */
  level: number;
  /** 国家或地区 */
  country: string;
  /** 城市 */
  city: string;
  /** 学校 */
  school: string;
}

/** 获取好友列表 API 请求参数 */
export interface GetFriendListInput {
  /** 是否强制不使用缓存 */
  no_cache: boolean;
}

/** 获取好友列表 API 请求参数 */
export interface GetFriendListInput_ZodInput {
  /** 是否强制不使用缓存 */
  no_cache?: boolean | null | undefined;
}

/** 获取好友列表 API 响应数据 */
export interface GetFriendListOutput {
  /** 好友列表 */
  friends: FriendEntity[];
}

/** 获取好友列表 API 响应数据 */
export interface GetFriendListOutput_ZodInput {
  /** 好友列表 */
  friends: FriendEntity_ZodInput[];
}

/** 获取好友信息 API 请求参数 */
export interface GetFriendInfoInput {
  /** 好友 QQ 号 */
  user_id: number;
  /** 是否强制不使用缓存 */
  no_cache: boolean;
}

/** 获取好友信息 API 请求参数 */
export interface GetFriendInfoInput_ZodInput {
  /** 好友 QQ 号 */
  user_id: number;
  /** 是否强制不使用缓存 */
  no_cache?: boolean | null | undefined;
}

/** 获取好友信息 API 响应数据 */
export interface GetFriendInfoOutput {
  /** 好友信息 */
  friend: FriendEntity;
}

/** 获取好友信息 API 响应数据 */
export interface GetFriendInfoOutput_ZodInput {
  /** 好友信息 */
  friend: FriendEntity_ZodInput;
}

/** 获取群列表 API 请求参数 */
export interface GetGroupListInput {
  /** 是否强制不使用缓存 */
  no_cache: boolean;
}

/** 获取群列表 API 请求参数 */
export interface GetGroupListInput_ZodInput {
  /** 是否强制不使用缓存 */
  no_cache?: boolean | null | undefined;
}

/** 获取群列表 API 响应数据 */
export interface GetGroupListOutput {
  /** 群列表 */
  groups: GroupEntity[];
}

/** 获取群列表 API 响应数据 */
export interface GetGroupListOutput_ZodInput {
  /** 群列表 */
  groups: GroupEntity_ZodInput[];
}

/** 获取群信息 API 请求参数 */
export interface GetGroupInfoInput {
  /** 群号 */
  group_id: number;
  /** 是否强制不使用缓存 */
  no_cache: boolean;
}

/** 获取群信息 API 请求参数 */
export interface GetGroupInfoInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 是否强制不使用缓存 */
  no_cache?: boolean | null | undefined;
}

/** 获取群信息 API 响应数据 */
export interface GetGroupInfoOutput {
  /** 群信息 */
  group: GroupEntity;
}

/** 获取群信息 API 响应数据 */
export interface GetGroupInfoOutput_ZodInput {
  /** 群信息 */
  group: GroupEntity_ZodInput;
}

/** 获取群成员列表 API 请求参数 */
export interface GetGroupMemberListInput {
  /** 群号 */
  group_id: number;
  /** 是否强制不使用缓存 */
  no_cache: boolean;
}

/** 获取群成员列表 API 请求参数 */
export interface GetGroupMemberListInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 是否强制不使用缓存 */
  no_cache?: boolean | null | undefined;
}

/** 获取群成员列表 API 响应数据 */
export interface GetGroupMemberListOutput {
  /** 群成员列表 */
  members: GroupMemberEntity[];
}

/** 获取群成员列表 API 响应数据 */
export interface GetGroupMemberListOutput_ZodInput {
  /** 群成员列表 */
  members: GroupMemberEntity_ZodInput[];
}

/** 获取群成员信息 API 请求参数 */
export interface GetGroupMemberInfoInput {
  /** 群号 */
  group_id: number;
  /** 群成员 QQ 号 */
  user_id: number;
  /** 是否强制不使用缓存 */
  no_cache: boolean;
}

/** 获取群成员信息 API 请求参数 */
export interface GetGroupMemberInfoInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 群成员 QQ 号 */
  user_id: number;
  /** 是否强制不使用缓存 */
  no_cache?: boolean | null | undefined;
}

/** 获取群成员信息 API 响应数据 */
export interface GetGroupMemberInfoOutput {
  /** 群成员信息 */
  member: GroupMemberEntity;
}

/** 获取群成员信息 API 响应数据 */
export interface GetGroupMemberInfoOutput_ZodInput {
  /** 群成员信息 */
  member: GroupMemberEntity_ZodInput;
}

/**
 * 获取置顶的好友和群列表 API 请求参数
 * @since 1.2
 */
export type GetPeerPinsInput = {};

/**
 * 获取置顶的好友和群列表 API 请求参数
 * @since 1.2
 */
export type GetPeerPinsInput_ZodInput = {};

/**
 * 获取置顶的好友和群列表 API 响应数据
 * @since 1.2
 */
export interface GetPeerPinsOutput {
  /** 置顶的好友列表 */
  friends: FriendEntity[];
  /** 置顶的群列表 */
  groups: GroupEntity[];
}

/**
 * 获取置顶的好友和群列表 API 响应数据
 * @since 1.2
 */
export interface GetPeerPinsOutput_ZodInput {
  /** 置顶的好友列表 */
  friends: FriendEntity_ZodInput[];
  /** 置顶的群列表 */
  groups: GroupEntity_ZodInput[];
}

/**
 * 设置好友或群的置顶状态 API 请求参数
 * @since 1.2
 */
export interface SetPeerPinInput {
  /** 要设置的会话的消息场景 */
  message_scene: 'friend' | 'group' | 'temp';
  /** 要设置的好友 QQ 号或群号 */
  peer_id: number;
  /** 是否置顶, `false` 表示取消置顶 */
  is_pinned: boolean;
}

/**
 * 设置好友或群的置顶状态 API 请求参数
 * @since 1.2
 */
export interface SetPeerPinInput_ZodInput {
  /** 要设置的会话的消息场景 */
  message_scene: 'friend' | 'group' | 'temp';
  /** 要设置的好友 QQ 号或群号 */
  peer_id: number;
  /** 是否置顶, `false` 表示取消置顶 */
  is_pinned?: boolean | null | undefined;
}

/**
 * 设置好友或群的置顶状态 API 响应数据
 * @since 1.2
 */
export type SetPeerPinOutput = {};

/**
 * 设置好友或群的置顶状态 API 响应数据
 * @since 1.2
 */
export type SetPeerPinOutput_ZodInput = {};

/**
 * 设置 QQ 账号头像 API 请求参数
 * @since 1.1
 */
export interface SetAvatarInput {
  /** 头像文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式 */
  uri: string;
}

/**
 * 设置 QQ 账号头像 API 请求参数
 * @since 1.1
 */
export interface SetAvatarInput_ZodInput {
  /** 头像文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式 */
  uri: string;
}

/**
 * 设置 QQ 账号头像 API 响应数据
 * @since 1.1
 */
export type SetAvatarOutput = {};

/**
 * 设置 QQ 账号头像 API 响应数据
 * @since 1.1
 */
export type SetAvatarOutput_ZodInput = {};

/**
 * 设置 QQ 账号昵称 API 请求参数
 * @since 1.1
 */
export interface SetNicknameInput {
  /** 新昵称 */
  new_nickname: string;
}

/**
 * 设置 QQ 账号昵称 API 请求参数
 * @since 1.1
 */
export interface SetNicknameInput_ZodInput {
  /** 新昵称 */
  new_nickname: string;
}

/**
 * 设置 QQ 账号昵称 API 响应数据
 * @since 1.1
 */
export type SetNicknameOutput = {};

/**
 * 设置 QQ 账号昵称 API 响应数据
 * @since 1.1
 */
export type SetNicknameOutput_ZodInput = {};

/**
 * 设置 QQ 账号个性签名 API 请求参数
 * @since 1.1
 */
export interface SetBioInput {
  /** 新个性签名 */
  new_bio: string;
}

/**
 * 设置 QQ 账号个性签名 API 请求参数
 * @since 1.1
 */
export interface SetBioInput_ZodInput {
  /** 新个性签名 */
  new_bio: string;
}

/**
 * 设置 QQ 账号个性签名 API 响应数据
 * @since 1.1
 */
export type SetBioOutput = {};

/**
 * 设置 QQ 账号个性签名 API 响应数据
 * @since 1.1
 */
export type SetBioOutput_ZodInput = {};

/**
 * 获取自定义表情 URL 列表 API 请求参数
 * @since 1.1
 */
export type GetCustomFaceUrlListInput = {};

/**
 * 获取自定义表情 URL 列表 API 请求参数
 * @since 1.1
 */
export type GetCustomFaceUrlListInput_ZodInput = {};

/**
 * 获取自定义表情 URL 列表 API 响应数据
 * @since 1.1
 */
export interface GetCustomFaceUrlListOutput {
  /** 自定义表情 URL 列表 */
  urls: string[];
}

/**
 * 获取自定义表情 URL 列表 API 响应数据
 * @since 1.1
 */
export interface GetCustomFaceUrlListOutput_ZodInput {
  /** 自定义表情 URL 列表 */
  urls: string[];
}

/** 获取 Cookies API 请求参数 */
export interface GetCookiesInput {
  /** 需要获取 Cookies 的域名 */
  domain: string;
}

/** 获取 Cookies API 请求参数 */
export interface GetCookiesInput_ZodInput {
  /** 需要获取 Cookies 的域名 */
  domain: string;
}

/** 获取 Cookies API 响应数据 */
export interface GetCookiesOutput {
  /** 域名对应的 Cookies 字符串 */
  cookies: string;
}

/** 获取 Cookies API 响应数据 */
export interface GetCookiesOutput_ZodInput {
  /** 域名对应的 Cookies 字符串 */
  cookies: string;
}

/** 获取 CSRF Token API 请求参数 */
export type GetCSRFTokenInput = {};

/** 获取 CSRF Token API 请求参数 */
export type GetCSRFTokenInput_ZodInput = {};

/** 获取 CSRF Token API 响应数据 */
export interface GetCSRFTokenOutput {
  /** CSRF Token */
  csrf_token: string;
}

/** 获取 CSRF Token API 响应数据 */
export interface GetCSRFTokenOutput_ZodInput {
  /** CSRF Token */
  csrf_token: string;
}

/** 发送私聊消息 API 请求参数 */
export interface SendPrivateMessageInput {
  /** 好友 QQ 号 */
  user_id: number;
  /** 消息内容 */
  message: OutgoingSegment[];
}

/** 发送私聊消息 API 请求参数 */
export interface SendPrivateMessageInput_ZodInput {
  /** 好友 QQ 号 */
  user_id: number;
  /** 消息内容 */
  message: OutgoingSegment_ZodInput[];
}

/** 发送私聊消息 API 响应数据 */
export interface SendPrivateMessageOutput {
  /** 消息序列号 */
  message_seq: number;
  /** 消息发送时间 */
  time: number;
}

/** 发送私聊消息 API 响应数据 */
export interface SendPrivateMessageOutput_ZodInput {
  /** 消息序列号 */
  message_seq: number;
  /** 消息发送时间 */
  time: number;
}

/** 发送群聊消息 API 请求参数 */
export interface SendGroupMessageInput {
  /** 群号 */
  group_id: number;
  /** 消息内容 */
  message: OutgoingSegment[];
}

/** 发送群聊消息 API 请求参数 */
export interface SendGroupMessageInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 消息内容 */
  message: OutgoingSegment_ZodInput[];
}

/** 发送群聊消息 API 响应数据 */
export interface SendGroupMessageOutput {
  /** 消息序列号 */
  message_seq: number;
  /** 消息发送时间 */
  time: number;
}

/** 发送群聊消息 API 响应数据 */
export interface SendGroupMessageOutput_ZodInput {
  /** 消息序列号 */
  message_seq: number;
  /** 消息发送时间 */
  time: number;
}

/** 撤回私聊消息 API 请求参数 */
export interface RecallPrivateMessageInput {
  /** 好友 QQ 号 */
  user_id: number;
  /** 消息序列号 */
  message_seq: number;
}

/** 撤回私聊消息 API 请求参数 */
export interface RecallPrivateMessageInput_ZodInput {
  /** 好友 QQ 号 */
  user_id: number;
  /** 消息序列号 */
  message_seq: number;
}

/** 撤回私聊消息 API 响应数据 */
export type RecallPrivateMessageOutput = {};

/** 撤回私聊消息 API 响应数据 */
export type RecallPrivateMessageOutput_ZodInput = {};

/** 撤回群聊消息 API 请求参数 */
export interface RecallGroupMessageInput {
  /** 群号 */
  group_id: number;
  /** 消息序列号 */
  message_seq: number;
}

/** 撤回群聊消息 API 请求参数 */
export interface RecallGroupMessageInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 消息序列号 */
  message_seq: number;
}

/** 撤回群聊消息 API 响应数据 */
export type RecallGroupMessageOutput = {};

/** 撤回群聊消息 API 响应数据 */
export type RecallGroupMessageOutput_ZodInput = {};

/** 获取消息 API 请求参数 */
export interface GetMessageInput {
  /** 消息场景 */
  message_scene: 'friend' | 'group' | 'temp';
  /** 好友 QQ 号或群号 */
  peer_id: number;
  /** 消息序列号 */
  message_seq: number;
}

/** 获取消息 API 请求参数 */
export interface GetMessageInput_ZodInput {
  /** 消息场景 */
  message_scene: 'friend' | 'group' | 'temp';
  /** 好友 QQ 号或群号 */
  peer_id: number;
  /** 消息序列号 */
  message_seq: number;
}

/** 获取消息 API 响应数据 */
export interface GetMessageOutput {
  /** 消息内容 */
  message: IncomingMessage;
}

/** 获取消息 API 响应数据 */
export interface GetMessageOutput_ZodInput {
  /** 消息内容 */
  message: IncomingMessage_ZodInput;
}

/** 获取历史消息列表 API 请求参数 */
export interface GetHistoryMessagesInput {
  /** 消息场景 */
  message_scene: 'friend' | 'group' | 'temp';
  /** 好友 QQ 号或群号 */
  peer_id: number;
  /** 起始消息序列号，由此开始从新到旧查询，不提供则从最新消息开始 */
  start_message_seq?: number | null | undefined;
  /** 期望获取到的消息数量，最多 30 条 */
  limit: number;
}

/** 获取历史消息列表 API 请求参数 */
export interface GetHistoryMessagesInput_ZodInput {
  /** 消息场景 */
  message_scene: 'friend' | 'group' | 'temp';
  /** 好友 QQ 号或群号 */
  peer_id: number;
  /** 起始消息序列号，由此开始从新到旧查询，不提供则从最新消息开始 */
  start_message_seq?: number | null | undefined;
  /** 期望获取到的消息数量，最多 30 条 */
  limit?: number | null | undefined;
}

/** 获取历史消息列表 API 响应数据 */
export interface GetHistoryMessagesOutput {
  /** 获取到的消息（message_seq 升序排列），部分消息可能不存在，如撤回的消息 */
  messages: IncomingMessage[];
  /** 下一页起始消息序列号 */
  next_message_seq?: number | null | undefined;
}

/** 获取历史消息列表 API 响应数据 */
export interface GetHistoryMessagesOutput_ZodInput {
  /** 获取到的消息（message_seq 升序排列），部分消息可能不存在，如撤回的消息 */
  messages: IncomingMessage_ZodInput[];
  /** 下一页起始消息序列号 */
  next_message_seq?: number | null | undefined;
}

/** 获取临时资源链接 API 请求参数 */
export interface GetResourceTempUrlInput {
  /** 资源 ID */
  resource_id: string;
}

/** 获取临时资源链接 API 请求参数 */
export interface GetResourceTempUrlInput_ZodInput {
  /** 资源 ID */
  resource_id: string;
}

/** 获取临时资源链接 API 响应数据 */
export interface GetResourceTempUrlOutput {
  /** 临时资源链接 */
  url: string;
}

/** 获取临时资源链接 API 响应数据 */
export interface GetResourceTempUrlOutput_ZodInput {
  /** 临时资源链接 */
  url: string;
}

/** 获取合并转发消息内容 API 请求参数 */
export interface GetForwardedMessagesInput {
  /** 转发消息 ID */
  forward_id: string;
}

/** 获取合并转发消息内容 API 请求参数 */
export interface GetForwardedMessagesInput_ZodInput {
  /** 转发消息 ID */
  forward_id: string;
}

/** 获取合并转发消息内容 API 响应数据 */
export interface GetForwardedMessagesOutput {
  /** 转发消息内容 */
  messages: IncomingForwardedMessage[];
}

/** 获取合并转发消息内容 API 响应数据 */
export interface GetForwardedMessagesOutput_ZodInput {
  /** 转发消息内容 */
  messages: IncomingForwardedMessage_ZodInput[];
}

/** 标记消息为已读 API 请求参数 */
export interface MarkMessageAsReadInput {
  /** 消息场景 */
  message_scene: 'friend' | 'group' | 'temp';
  /** 好友 QQ 号或群号 */
  peer_id: number;
  /** 标为已读的消息序列号，该消息及更早的消息将被标记为已读 */
  message_seq: number;
}

/** 标记消息为已读 API 请求参数 */
export interface MarkMessageAsReadInput_ZodInput {
  /** 消息场景 */
  message_scene: 'friend' | 'group' | 'temp';
  /** 好友 QQ 号或群号 */
  peer_id: number;
  /** 标为已读的消息序列号，该消息及更早的消息将被标记为已读 */
  message_seq: number;
}

/** 标记消息为已读 API 响应数据 */
export type MarkMessageAsReadOutput = {};

/** 标记消息为已读 API 响应数据 */
export type MarkMessageAsReadOutput_ZodInput = {};

/** 发送好友戳一戳 API 请求参数 */
export interface SendFriendNudgeInput {
  /** 好友 QQ 号 */
  user_id: number;
  /** 是否戳自己 */
  is_self: boolean;
}

/** 发送好友戳一戳 API 请求参数 */
export interface SendFriendNudgeInput_ZodInput {
  /** 好友 QQ 号 */
  user_id: number;
  /** 是否戳自己 */
  is_self?: boolean | null | undefined;
}

/** 发送好友戳一戳 API 响应数据 */
export type SendFriendNudgeOutput = {};

/** 发送好友戳一戳 API 响应数据 */
export type SendFriendNudgeOutput_ZodInput = {};

/** 发送名片点赞 API 请求参数 */
export interface SendProfileLikeInput {
  /** 好友 QQ 号 */
  user_id: number;
  /** 点赞数量 */
  count: number;
}

/** 发送名片点赞 API 请求参数 */
export interface SendProfileLikeInput_ZodInput {
  /** 好友 QQ 号 */
  user_id: number;
  /** 点赞数量 */
  count?: number | null | undefined;
}

/** 发送名片点赞 API 响应数据 */
export type SendProfileLikeOutput = {};

/** 发送名片点赞 API 响应数据 */
export type SendProfileLikeOutput_ZodInput = {};

/**
 * 删除好友 API 请求参数
 * @since 1.1
 */
export interface DeleteFriendInput {
  /** 好友 QQ 号 */
  user_id: number;
}

/**
 * 删除好友 API 请求参数
 * @since 1.1
 */
export interface DeleteFriendInput_ZodInput {
  /** 好友 QQ 号 */
  user_id: number;
}

/**
 * 删除好友 API 响应数据
 * @since 1.1
 */
export type DeleteFriendOutput = {};

/**
 * 删除好友 API 响应数据
 * @since 1.1
 */
export type DeleteFriendOutput_ZodInput = {};

/** 获取好友请求列表 API 请求参数 */
export interface GetFriendRequestsInput {
  /** 获取的最大请求数量 */
  limit: number;
  /** `true` 表示只获取被过滤（由风险账号发起）的通知，`false` 表示只获取未被过滤的通知 */
  is_filtered: boolean;
}

/** 获取好友请求列表 API 请求参数 */
export interface GetFriendRequestsInput_ZodInput {
  /** 获取的最大请求数量 */
  limit?: number | null | undefined;
  /** `true` 表示只获取被过滤（由风险账号发起）的通知，`false` 表示只获取未被过滤的通知 */
  is_filtered?: boolean | null | undefined;
}

/** 获取好友请求列表 API 响应数据 */
export interface GetFriendRequestsOutput {
  /** 好友请求列表 */
  requests: FriendRequest[];
}

/** 获取好友请求列表 API 响应数据 */
export interface GetFriendRequestsOutput_ZodInput {
  /** 好友请求列表 */
  requests: FriendRequest_ZodInput[];
}

/** 同意好友请求 API 请求参数 */
export interface AcceptFriendRequestInput {
  /** 请求发起者 UID */
  initiator_uid: string;
  /** 是否是被过滤的请求 */
  is_filtered: boolean;
}

/** 同意好友请求 API 请求参数 */
export interface AcceptFriendRequestInput_ZodInput {
  /** 请求发起者 UID */
  initiator_uid: string;
  /** 是否是被过滤的请求 */
  is_filtered?: boolean | null | undefined;
}

/** 同意好友请求 API 响应数据 */
export type AcceptFriendRequestOutput = {};

/** 同意好友请求 API 响应数据 */
export type AcceptFriendRequestOutput_ZodInput = {};

/** 拒绝好友请求 API 请求参数 */
export interface RejectFriendRequestInput {
  /** 请求发起者 UID */
  initiator_uid: string;
  /** 是否是被过滤的请求 */
  is_filtered: boolean;
  /** 拒绝理由 */
  reason?: string | null | undefined;
}

/** 拒绝好友请求 API 请求参数 */
export interface RejectFriendRequestInput_ZodInput {
  /** 请求发起者 UID */
  initiator_uid: string;
  /** 是否是被过滤的请求 */
  is_filtered?: boolean | null | undefined;
  /** 拒绝理由 */
  reason?: string | null | undefined;
}

/** 拒绝好友请求 API 响应数据 */
export type RejectFriendRequestOutput = {};

/** 拒绝好友请求 API 响应数据 */
export type RejectFriendRequestOutput_ZodInput = {};

/** 设置群名称 API 请求参数 */
export interface SetGroupNameInput {
  /** 群号 */
  group_id: number;
  /** 新群名称 */
  new_group_name: string;
}

/** 设置群名称 API 请求参数 */
export interface SetGroupNameInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 新群名称 */
  new_group_name: string;
}

/** 设置群名称 API 响应数据 */
export type SetGroupNameOutput = {};

/** 设置群名称 API 响应数据 */
export type SetGroupNameOutput_ZodInput = {};

/** 设置群头像 API 请求参数 */
export interface SetGroupAvatarInput {
  /** 群号 */
  group_id: number;
  /** 头像文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式 */
  image_uri: string;
}

/** 设置群头像 API 请求参数 */
export interface SetGroupAvatarInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 头像文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式 */
  image_uri: string;
}

/** 设置群头像 API 响应数据 */
export type SetGroupAvatarOutput = {};

/** 设置群头像 API 响应数据 */
export type SetGroupAvatarOutput_ZodInput = {};

/** 设置群名片 API 请求参数 */
export interface SetGroupMemberCardInput {
  /** 群号 */
  group_id: number;
  /** 被设置的群成员 QQ 号 */
  user_id: number;
  /** 新群名片 */
  card: string;
}

/** 设置群名片 API 请求参数 */
export interface SetGroupMemberCardInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 被设置的群成员 QQ 号 */
  user_id: number;
  /** 新群名片 */
  card: string;
}

/** 设置群名片 API 响应数据 */
export type SetGroupMemberCardOutput = {};

/** 设置群名片 API 响应数据 */
export type SetGroupMemberCardOutput_ZodInput = {};

/** 设置群成员专属头衔 API 请求参数 */
export interface SetGroupMemberSpecialTitleInput {
  /** 群号 */
  group_id: number;
  /** 被设置的群成员 QQ 号 */
  user_id: number;
  /** 新专属头衔 */
  special_title: string;
}

/** 设置群成员专属头衔 API 请求参数 */
export interface SetGroupMemberSpecialTitleInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 被设置的群成员 QQ 号 */
  user_id: number;
  /** 新专属头衔 */
  special_title: string;
}

/** 设置群成员专属头衔 API 响应数据 */
export type SetGroupMemberSpecialTitleOutput = {};

/** 设置群成员专属头衔 API 响应数据 */
export type SetGroupMemberSpecialTitleOutput_ZodInput = {};

/** 设置群管理员 API 请求参数 */
export interface SetGroupMemberAdminInput {
  /** 群号 */
  group_id: number;
  /** 被设置的 QQ 号 */
  user_id: number;
  /** 是否设置为管理员，`false` 表示取消管理员 */
  is_set: boolean;
}

/** 设置群管理员 API 请求参数 */
export interface SetGroupMemberAdminInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 被设置的 QQ 号 */
  user_id: number;
  /** 是否设置为管理员，`false` 表示取消管理员 */
  is_set?: boolean | null | undefined;
}

/** 设置群管理员 API 响应数据 */
export type SetGroupMemberAdminOutput = {};

/** 设置群管理员 API 响应数据 */
export type SetGroupMemberAdminOutput_ZodInput = {};

/** 设置群成员禁言 API 请求参数 */
export interface SetGroupMemberMuteInput {
  /** 群号 */
  group_id: number;
  /** 被设置的 QQ 号 */
  user_id: number;
  /** 禁言持续时间（秒），设为 `0` 为取消禁言 */
  duration: number;
}

/** 设置群成员禁言 API 请求参数 */
export interface SetGroupMemberMuteInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 被设置的 QQ 号 */
  user_id: number;
  /** 禁言持续时间（秒），设为 `0` 为取消禁言 */
  duration?: number | null | undefined;
}

/** 设置群成员禁言 API 响应数据 */
export type SetGroupMemberMuteOutput = {};

/** 设置群成员禁言 API 响应数据 */
export type SetGroupMemberMuteOutput_ZodInput = {};

/** 设置群全员禁言 API 请求参数 */
export interface SetGroupWholeMuteInput {
  /** 群号 */
  group_id: number;
  /** 是否开启全员禁言，`false` 表示取消全员禁言 */
  is_mute: boolean;
}

/** 设置群全员禁言 API 请求参数 */
export interface SetGroupWholeMuteInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 是否开启全员禁言，`false` 表示取消全员禁言 */
  is_mute?: boolean | null | undefined;
}

/** 设置群全员禁言 API 响应数据 */
export type SetGroupWholeMuteOutput = {};

/** 设置群全员禁言 API 响应数据 */
export type SetGroupWholeMuteOutput_ZodInput = {};

/** 踢出群成员 API 请求参数 */
export interface KickGroupMemberInput {
  /** 群号 */
  group_id: number;
  /** 被踢的 QQ 号 */
  user_id: number;
  /** 是否拒绝加群申请，`false` 表示不拒绝 */
  reject_add_request: boolean;
}

/** 踢出群成员 API 请求参数 */
export interface KickGroupMemberInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 被踢的 QQ 号 */
  user_id: number;
  /** 是否拒绝加群申请，`false` 表示不拒绝 */
  reject_add_request?: boolean | null | undefined;
}

/** 踢出群成员 API 响应数据 */
export type KickGroupMemberOutput = {};

/** 踢出群成员 API 响应数据 */
export type KickGroupMemberOutput_ZodInput = {};

/** 获取群公告列表 API 请求参数 */
export interface GetGroupAnnouncementsInput {
  /** 群号 */
  group_id: number;
}

/** 获取群公告列表 API 请求参数 */
export interface GetGroupAnnouncementsInput_ZodInput {
  /** 群号 */
  group_id: number;
}

/** 获取群公告列表 API 响应数据 */
export interface GetGroupAnnouncementsOutput {
  /** 群公告列表 */
  announcements: GroupAnnouncementEntity[];
}

/** 获取群公告列表 API 响应数据 */
export interface GetGroupAnnouncementsOutput_ZodInput {
  /** 群公告列表 */
  announcements: GroupAnnouncementEntity_ZodInput[];
}

/** 发送群公告 API 请求参数 */
export interface SendGroupAnnouncementInput {
  /** 群号 */
  group_id: number;
  /** 公告内容 */
  content: string;
  /** 公告附带图像文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式 */
  image_uri?: string | null | undefined;
}

/** 发送群公告 API 请求参数 */
export interface SendGroupAnnouncementInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 公告内容 */
  content: string;
  /** 公告附带图像文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式 */
  image_uri?: string | null | undefined;
}

/** 发送群公告 API 响应数据 */
export type SendGroupAnnouncementOutput = {};

/** 发送群公告 API 响应数据 */
export type SendGroupAnnouncementOutput_ZodInput = {};

/** 删除群公告 API 请求参数 */
export interface DeleteGroupAnnouncementInput {
  /** 群号 */
  group_id: number;
  /** 公告 ID */
  announcement_id: string;
}

/** 删除群公告 API 请求参数 */
export interface DeleteGroupAnnouncementInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 公告 ID */
  announcement_id: string;
}

/** 删除群公告 API 响应数据 */
export type DeleteGroupAnnouncementOutput = {};

/** 删除群公告 API 响应数据 */
export type DeleteGroupAnnouncementOutput_ZodInput = {};

/** 获取群精华消息列表 API 请求参数 */
export interface GetGroupEssenceMessagesInput {
  /** 群号 */
  group_id: number;
  /** 页码索引，从 0 开始 */
  page_index: number;
  /** 每页包含的精华消息数量 */
  page_size: number;
}

/** 获取群精华消息列表 API 请求参数 */
export interface GetGroupEssenceMessagesInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 页码索引，从 0 开始 */
  page_index: number;
  /** 每页包含的精华消息数量 */
  page_size: number;
}

/** 获取群精华消息列表 API 响应数据 */
export interface GetGroupEssenceMessagesOutput {
  /** 精华消息列表 */
  messages: GroupEssenceMessage[];
  /** 是否已到最后一页 */
  is_end: boolean;
}

/** 获取群精华消息列表 API 响应数据 */
export interface GetGroupEssenceMessagesOutput_ZodInput {
  /** 精华消息列表 */
  messages: GroupEssenceMessage_ZodInput[];
  /** 是否已到最后一页 */
  is_end: boolean;
}

/** 设置群精华消息 API 请求参数 */
export interface SetGroupEssenceMessageInput {
  /** 群号 */
  group_id: number;
  /** 消息序列号 */
  message_seq: number;
  /** 是否设置为精华消息，`false` 表示取消精华 */
  is_set: boolean;
}

/** 设置群精华消息 API 请求参数 */
export interface SetGroupEssenceMessageInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 消息序列号 */
  message_seq: number;
  /** 是否设置为精华消息，`false` 表示取消精华 */
  is_set?: boolean | null | undefined;
}

/** 设置群精华消息 API 响应数据 */
export type SetGroupEssenceMessageOutput = {};

/** 设置群精华消息 API 响应数据 */
export type SetGroupEssenceMessageOutput_ZodInput = {};

/** 退出群 API 请求参数 */
export interface QuitGroupInput {
  /** 群号 */
  group_id: number;
}

/** 退出群 API 请求参数 */
export interface QuitGroupInput_ZodInput {
  /** 群号 */
  group_id: number;
}

/** 退出群 API 响应数据 */
export type QuitGroupOutput = {};

/** 退出群 API 响应数据 */
export type QuitGroupOutput_ZodInput = {};

/** 发送群消息表情回应 API 请求参数 */
export interface SendGroupMessageReactionInput {
  /** 群号 */
  group_id: number;
  /** 要回应的消息序列号 */
  message_seq: number;
  /** 发送的回应的表情 ID */
  reaction: string;
  /**
   * 发送的回应类型
   * @since 1.2
   */
  reaction_type: 'face' | 'emoji';
  /** 是否添加表情，`false` 表示取消 */
  is_add: boolean;
}

/** 发送群消息表情回应 API 请求参数 */
export interface SendGroupMessageReactionInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 要回应的消息序列号 */
  message_seq: number;
  /** 发送的回应的表情 ID */
  reaction: string;
  /**
   * 发送的回应类型
   * @since 1.2
   */
  reaction_type?: 'face' | 'emoji' | null | undefined;
  /** 是否添加表情，`false` 表示取消 */
  is_add?: boolean | null | undefined;
}

/** 发送群消息表情回应 API 响应数据 */
export type SendGroupMessageReactionOutput = {};

/** 发送群消息表情回应 API 响应数据 */
export type SendGroupMessageReactionOutput_ZodInput = {};

/** 发送群戳一戳 API 请求参数 */
export interface SendGroupNudgeInput {
  /** 群号 */
  group_id: number;
  /** 被戳的群成员 QQ 号 */
  user_id: number;
}

/** 发送群戳一戳 API 请求参数 */
export interface SendGroupNudgeInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 被戳的群成员 QQ 号 */
  user_id: number;
}

/** 发送群戳一戳 API 响应数据 */
export type SendGroupNudgeOutput = {};

/** 发送群戳一戳 API 响应数据 */
export type SendGroupNudgeOutput_ZodInput = {};

/** 获取群通知列表 API 请求参数 */
export interface GetGroupNotificationsInput {
  /** 起始通知序列号 */
  start_notification_seq?: number | null | undefined;
  /** `true` 表示只获取被过滤（由风险账号发起）的通知，`false` 表示只获取未被过滤的通知 */
  is_filtered: boolean;
  /** 获取的最大通知数量 */
  limit: number;
}

/** 获取群通知列表 API 请求参数 */
export interface GetGroupNotificationsInput_ZodInput {
  /** 起始通知序列号 */
  start_notification_seq?: number | null | undefined;
  /** `true` 表示只获取被过滤（由风险账号发起）的通知，`false` 表示只获取未被过滤的通知 */
  is_filtered?: boolean | null | undefined;
  /** 获取的最大通知数量 */
  limit?: number | null | undefined;
}

/** 获取群通知列表 API 响应数据 */
export interface GetGroupNotificationsOutput {
  /** 获取到的群通知（notification_seq 降序排列），序列号不一定连续 */
  notifications: GroupNotification[];
  /** 下一页起始通知序列号 */
  next_notification_seq?: number | null | undefined;
}

/** 获取群通知列表 API 响应数据 */
export interface GetGroupNotificationsOutput_ZodInput {
  /** 获取到的群通知（notification_seq 降序排列），序列号不一定连续 */
  notifications: GroupNotification_ZodInput[];
  /** 下一页起始通知序列号 */
  next_notification_seq?: number | null | undefined;
}

/** 同意入群/邀请他人入群请求 API 请求参数 */
export interface AcceptGroupRequestInput {
  /** 请求对应的通知序列号 */
  notification_seq: number;
  /** 请求对应的通知类型 */
  notification_type: 'join_request' | 'invited_join_request';
  /** 请求所在的群号 */
  group_id: number;
  /** 是否是被过滤的请求 */
  is_filtered: boolean;
}

/** 同意入群/邀请他人入群请求 API 请求参数 */
export interface AcceptGroupRequestInput_ZodInput {
  /** 请求对应的通知序列号 */
  notification_seq: number;
  /** 请求对应的通知类型 */
  notification_type: 'join_request' | 'invited_join_request';
  /** 请求所在的群号 */
  group_id: number;
  /** 是否是被过滤的请求 */
  is_filtered?: boolean | null | undefined;
}

/** 同意入群/邀请他人入群请求 API 响应数据 */
export type AcceptGroupRequestOutput = {};

/** 同意入群/邀请他人入群请求 API 响应数据 */
export type AcceptGroupRequestOutput_ZodInput = {};

/** 拒绝入群/邀请他人入群请求 API 请求参数 */
export interface RejectGroupRequestInput {
  /** 请求对应的通知序列号 */
  notification_seq: number;
  /** 请求对应的通知类型 */
  notification_type: 'join_request' | 'invited_join_request';
  /** 请求所在的群号 */
  group_id: number;
  /** 是否是被过滤的请求 */
  is_filtered: boolean;
  /** 拒绝理由 */
  reason?: string | null | undefined;
}

/** 拒绝入群/邀请他人入群请求 API 请求参数 */
export interface RejectGroupRequestInput_ZodInput {
  /** 请求对应的通知序列号 */
  notification_seq: number;
  /** 请求对应的通知类型 */
  notification_type: 'join_request' | 'invited_join_request';
  /** 请求所在的群号 */
  group_id: number;
  /** 是否是被过滤的请求 */
  is_filtered?: boolean | null | undefined;
  /** 拒绝理由 */
  reason?: string | null | undefined;
}

/** 拒绝入群/邀请他人入群请求 API 响应数据 */
export type RejectGroupRequestOutput = {};

/** 拒绝入群/邀请他人入群请求 API 响应数据 */
export type RejectGroupRequestOutput_ZodInput = {};

/** 同意他人邀请自身入群 API 请求参数 */
export interface AcceptGroupInvitationInput {
  /** 群号 */
  group_id: number;
  /** 邀请序列号 */
  invitation_seq: number;
}

/** 同意他人邀请自身入群 API 请求参数 */
export interface AcceptGroupInvitationInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 邀请序列号 */
  invitation_seq: number;
}

/** 同意他人邀请自身入群 API 响应数据 */
export type AcceptGroupInvitationOutput = {};

/** 同意他人邀请自身入群 API 响应数据 */
export type AcceptGroupInvitationOutput_ZodInput = {};

/** 拒绝他人邀请自身入群 API 请求参数 */
export interface RejectGroupInvitationInput {
  /** 群号 */
  group_id: number;
  /** 邀请序列号 */
  invitation_seq: number;
}

/** 拒绝他人邀请自身入群 API 请求参数 */
export interface RejectGroupInvitationInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 邀请序列号 */
  invitation_seq: number;
}

/** 拒绝他人邀请自身入群 API 响应数据 */
export type RejectGroupInvitationOutput = {};

/** 拒绝他人邀请自身入群 API 响应数据 */
export type RejectGroupInvitationOutput_ZodInput = {};

/** 上传私聊文件 API 请求参数 */
export interface UploadPrivateFileInput {
  /** 好友 QQ 号 */
  user_id: number;
  /** 文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式 */
  file_uri: string;
  /** 文件名称 */
  file_name: string;
}

/** 上传私聊文件 API 请求参数 */
export interface UploadPrivateFileInput_ZodInput {
  /** 好友 QQ 号 */
  user_id: number;
  /** 文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式 */
  file_uri: string;
  /** 文件名称 */
  file_name: string;
}

/** 上传私聊文件 API 响应数据 */
export interface UploadPrivateFileOutput {
  /** 文件 ID */
  file_id: string;
}

/** 上传私聊文件 API 响应数据 */
export interface UploadPrivateFileOutput_ZodInput {
  /** 文件 ID */
  file_id: string;
}

/** 上传群文件 API 请求参数 */
export interface UploadGroupFileInput {
  /** 群号 */
  group_id: number;
  /** 目标文件夹 ID */
  parent_folder_id: string;
  /** 文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式 */
  file_uri: string;
  /** 文件名称 */
  file_name: string;
}

/** 上传群文件 API 请求参数 */
export interface UploadGroupFileInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 目标文件夹 ID */
  parent_folder_id?: string | null | undefined;
  /** 文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式 */
  file_uri: string;
  /** 文件名称 */
  file_name: string;
}

/** 上传群文件 API 响应数据 */
export interface UploadGroupFileOutput {
  /** 文件 ID */
  file_id: string;
}

/** 上传群文件 API 响应数据 */
export interface UploadGroupFileOutput_ZodInput {
  /** 文件 ID */
  file_id: string;
}

/** 获取私聊文件下载链接 API 请求参数 */
export interface GetPrivateFileDownloadUrlInput {
  /** 好友 QQ 号 */
  user_id: number;
  /** 文件 ID */
  file_id: string;
  /** 文件的 TriSHA1 哈希值 */
  file_hash: string;
}

/** 获取私聊文件下载链接 API 请求参数 */
export interface GetPrivateFileDownloadUrlInput_ZodInput {
  /** 好友 QQ 号 */
  user_id: number;
  /** 文件 ID */
  file_id: string;
  /** 文件的 TriSHA1 哈希值 */
  file_hash: string;
}

/** 获取私聊文件下载链接 API 响应数据 */
export interface GetPrivateFileDownloadUrlOutput {
  /** 文件下载链接 */
  download_url: string;
}

/** 获取私聊文件下载链接 API 响应数据 */
export interface GetPrivateFileDownloadUrlOutput_ZodInput {
  /** 文件下载链接 */
  download_url: string;
}

/** 获取群文件下载链接 API 请求参数 */
export interface GetGroupFileDownloadUrlInput {
  /** 群号 */
  group_id: number;
  /** 文件 ID */
  file_id: string;
}

/** 获取群文件下载链接 API 请求参数 */
export interface GetGroupFileDownloadUrlInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 文件 ID */
  file_id: string;
}

/** 获取群文件下载链接 API 响应数据 */
export interface GetGroupFileDownloadUrlOutput {
  /** 文件下载链接 */
  download_url: string;
}

/** 获取群文件下载链接 API 响应数据 */
export interface GetGroupFileDownloadUrlOutput_ZodInput {
  /** 文件下载链接 */
  download_url: string;
}

/** 获取群文件列表 API 请求参数 */
export interface GetGroupFilesInput {
  /** 群号 */
  group_id: number;
  /** 父文件夹 ID */
  parent_folder_id: string;
}

/** 获取群文件列表 API 请求参数 */
export interface GetGroupFilesInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 父文件夹 ID */
  parent_folder_id?: string | null | undefined;
}

/** 获取群文件列表 API 响应数据 */
export interface GetGroupFilesOutput {
  /** 文件列表 */
  files: GroupFileEntity[];
  /** 文件夹列表 */
  folders: GroupFolderEntity[];
}

/** 获取群文件列表 API 响应数据 */
export interface GetGroupFilesOutput_ZodInput {
  /** 文件列表 */
  files: GroupFileEntity_ZodInput[];
  /** 文件夹列表 */
  folders: GroupFolderEntity_ZodInput[];
}

/** 移动群文件 API 请求参数 */
export interface MoveGroupFileInput {
  /** 群号 */
  group_id: number;
  /** 文件 ID */
  file_id: string;
  /** 文件所在的文件夹 ID */
  parent_folder_id: string;
  /** 目标文件夹 ID */
  target_folder_id: string;
}

/** 移动群文件 API 请求参数 */
export interface MoveGroupFileInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 文件 ID */
  file_id: string;
  /** 文件所在的文件夹 ID */
  parent_folder_id?: string | null | undefined;
  /** 目标文件夹 ID */
  target_folder_id?: string | null | undefined;
}

/** 移动群文件 API 响应数据 */
export type MoveGroupFileOutput = {};

/** 移动群文件 API 响应数据 */
export type MoveGroupFileOutput_ZodInput = {};

/** 重命名群文件 API 请求参数 */
export interface RenameGroupFileInput {
  /** 群号 */
  group_id: number;
  /** 文件 ID */
  file_id: string;
  /** 文件所在的文件夹 ID */
  parent_folder_id: string;
  /** 新文件名称 */
  new_file_name: string;
}

/** 重命名群文件 API 请求参数 */
export interface RenameGroupFileInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 文件 ID */
  file_id: string;
  /** 文件所在的文件夹 ID */
  parent_folder_id?: string | null | undefined;
  /** 新文件名称 */
  new_file_name: string;
}

/** 重命名群文件 API 响应数据 */
export type RenameGroupFileOutput = {};

/** 重命名群文件 API 响应数据 */
export type RenameGroupFileOutput_ZodInput = {};

/** 删除群文件 API 请求参数 */
export interface DeleteGroupFileInput {
  /** 群号 */
  group_id: number;
  /** 文件 ID */
  file_id: string;
}

/** 删除群文件 API 请求参数 */
export interface DeleteGroupFileInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 文件 ID */
  file_id: string;
}

/** 删除群文件 API 响应数据 */
export type DeleteGroupFileOutput = {};

/** 删除群文件 API 响应数据 */
export type DeleteGroupFileOutput_ZodInput = {};

/**
 * 转存群文件为永久文件 API 请求参数
 * @since 1.3
 */
export interface PersistGroupFileInput {
  /** 群号 */
  group_id: number;
  /** 文件 ID */
  file_id: string;
}

/**
 * 转存群文件为永久文件 API 请求参数
 * @since 1.3
 */
export interface PersistGroupFileInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 文件 ID */
  file_id: string;
}

/**
 * 转存群文件为永久文件 API 响应数据
 * @since 1.3
 */
export type PersistGroupFileOutput = {};

/**
 * 转存群文件为永久文件 API 响应数据
 * @since 1.3
 */
export type PersistGroupFileOutput_ZodInput = {};

/** 创建群文件夹 API 请求参数 */
export interface CreateGroupFolderInput {
  /** 群号 */
  group_id: number;
  /** 文件夹名称 */
  folder_name: string;
}

/** 创建群文件夹 API 请求参数 */
export interface CreateGroupFolderInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 文件夹名称 */
  folder_name: string;
}

/** 创建群文件夹 API 响应数据 */
export interface CreateGroupFolderOutput {
  /** 文件夹 ID */
  folder_id: string;
}

/** 创建群文件夹 API 响应数据 */
export interface CreateGroupFolderOutput_ZodInput {
  /** 文件夹 ID */
  folder_id: string;
}

/** 重命名群文件夹 API 请求参数 */
export interface RenameGroupFolderInput {
  /** 群号 */
  group_id: number;
  /** 文件夹 ID */
  folder_id: string;
  /** 新文件夹名 */
  new_folder_name: string;
}

/** 重命名群文件夹 API 请求参数 */
export interface RenameGroupFolderInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 文件夹 ID */
  folder_id: string;
  /** 新文件夹名 */
  new_folder_name: string;
}

/** 重命名群文件夹 API 响应数据 */
export type RenameGroupFolderOutput = {};

/** 重命名群文件夹 API 响应数据 */
export type RenameGroupFolderOutput_ZodInput = {};

/** 删除群文件夹 API 请求参数 */
export interface DeleteGroupFolderInput {
  /** 群号 */
  group_id: number;
  /** 文件夹 ID */
  folder_id: string;
}

/** 删除群文件夹 API 请求参数 */
export interface DeleteGroupFolderInput_ZodInput {
  /** 群号 */
  group_id: number;
  /** 文件夹 ID */
  folder_id: string;
}

/** 删除群文件夹 API 响应数据 */
export type DeleteGroupFolderOutput = {};

/** 删除群文件夹 API 响应数据 */
export type DeleteGroupFolderOutput_ZodInput = {};

export interface ApiCategories {
  /** 系统 API */
  system: {
    /** 获取登录信息 */
    get_login_info: {
      request: GetLoginInfoInput;
      request_ZodInput: GetLoginInfoInput_ZodInput;
      response: GetLoginInfoOutput;
      response_ZodInput: GetLoginInfoOutput_ZodInput;
    };
    /** 获取协议端信息 */
    get_impl_info: {
      request: GetImplInfoInput;
      request_ZodInput: GetImplInfoInput_ZodInput;
      response: GetImplInfoOutput;
      response_ZodInput: GetImplInfoOutput_ZodInput;
    };
    /** 获取用户个人信息 */
    get_user_profile: {
      request: GetUserProfileInput;
      request_ZodInput: GetUserProfileInput_ZodInput;
      response: GetUserProfileOutput;
      response_ZodInput: GetUserProfileOutput_ZodInput;
    };
    /** 获取好友列表 */
    get_friend_list: {
      request: GetFriendListInput;
      request_ZodInput: GetFriendListInput_ZodInput;
      response: GetFriendListOutput;
      response_ZodInput: GetFriendListOutput_ZodInput;
    };
    /** 获取好友信息 */
    get_friend_info: {
      request: GetFriendInfoInput;
      request_ZodInput: GetFriendInfoInput_ZodInput;
      response: GetFriendInfoOutput;
      response_ZodInput: GetFriendInfoOutput_ZodInput;
    };
    /** 获取群列表 */
    get_group_list: {
      request: GetGroupListInput;
      request_ZodInput: GetGroupListInput_ZodInput;
      response: GetGroupListOutput;
      response_ZodInput: GetGroupListOutput_ZodInput;
    };
    /** 获取群信息 */
    get_group_info: {
      request: GetGroupInfoInput;
      request_ZodInput: GetGroupInfoInput_ZodInput;
      response: GetGroupInfoOutput;
      response_ZodInput: GetGroupInfoOutput_ZodInput;
    };
    /** 获取群成员列表 */
    get_group_member_list: {
      request: GetGroupMemberListInput;
      request_ZodInput: GetGroupMemberListInput_ZodInput;
      response: GetGroupMemberListOutput;
      response_ZodInput: GetGroupMemberListOutput_ZodInput;
    };
    /** 获取群成员信息 */
    get_group_member_info: {
      request: GetGroupMemberInfoInput;
      request_ZodInput: GetGroupMemberInfoInput_ZodInput;
      response: GetGroupMemberInfoOutput;
      response_ZodInput: GetGroupMemberInfoOutput_ZodInput;
    };
    /**
     * 获取置顶的好友和群列表
     * @since 1.2
     */
    get_peer_pins: {
      request: GetPeerPinsInput;
      request_ZodInput: GetPeerPinsInput_ZodInput;
      response: GetPeerPinsOutput;
      response_ZodInput: GetPeerPinsOutput_ZodInput;
    };
    /**
     * 设置好友或群的置顶状态
     * @since 1.2
     */
    set_peer_pin: {
      request: SetPeerPinInput;
      request_ZodInput: SetPeerPinInput_ZodInput;
      response: SetPeerPinOutput;
      response_ZodInput: SetPeerPinOutput_ZodInput;
    };
    /**
     * 设置 QQ 账号头像
     * @since 1.1
     */
    set_avatar: {
      request: SetAvatarInput;
      request_ZodInput: SetAvatarInput_ZodInput;
      response: SetAvatarOutput;
      response_ZodInput: SetAvatarOutput_ZodInput;
    };
    /**
     * 设置 QQ 账号昵称
     * @since 1.1
     */
    set_nickname: {
      request: SetNicknameInput;
      request_ZodInput: SetNicknameInput_ZodInput;
      response: SetNicknameOutput;
      response_ZodInput: SetNicknameOutput_ZodInput;
    };
    /**
     * 设置 QQ 账号个性签名
     * @since 1.1
     */
    set_bio: {
      request: SetBioInput;
      request_ZodInput: SetBioInput_ZodInput;
      response: SetBioOutput;
      response_ZodInput: SetBioOutput_ZodInput;
    };
    /**
     * 获取自定义表情 URL 列表
     * @since 1.1
     */
    get_custom_face_url_list: {
      request: GetCustomFaceUrlListInput;
      request_ZodInput: GetCustomFaceUrlListInput_ZodInput;
      response: GetCustomFaceUrlListOutput;
      response_ZodInput: GetCustomFaceUrlListOutput_ZodInput;
    };
    /** 获取 Cookies */
    get_cookies: {
      request: GetCookiesInput;
      request_ZodInput: GetCookiesInput_ZodInput;
      response: GetCookiesOutput;
      response_ZodInput: GetCookiesOutput_ZodInput;
    };
    /** 获取 CSRF Token */
    get_csrf_token: {
      request: GetCSRFTokenInput;
      request_ZodInput: GetCSRFTokenInput_ZodInput;
      response: GetCSRFTokenOutput;
      response_ZodInput: GetCSRFTokenOutput_ZodInput;
    };
  };
  /** 消息 API */
  message: {
    /** 发送私聊消息 */
    send_private_message: {
      request: SendPrivateMessageInput;
      request_ZodInput: SendPrivateMessageInput_ZodInput;
      response: SendPrivateMessageOutput;
      response_ZodInput: SendPrivateMessageOutput_ZodInput;
    };
    /** 发送群聊消息 */
    send_group_message: {
      request: SendGroupMessageInput;
      request_ZodInput: SendGroupMessageInput_ZodInput;
      response: SendGroupMessageOutput;
      response_ZodInput: SendGroupMessageOutput_ZodInput;
    };
    /** 撤回私聊消息 */
    recall_private_message: {
      request: RecallPrivateMessageInput;
      request_ZodInput: RecallPrivateMessageInput_ZodInput;
      response: RecallPrivateMessageOutput;
      response_ZodInput: RecallPrivateMessageOutput_ZodInput;
    };
    /** 撤回群聊消息 */
    recall_group_message: {
      request: RecallGroupMessageInput;
      request_ZodInput: RecallGroupMessageInput_ZodInput;
      response: RecallGroupMessageOutput;
      response_ZodInput: RecallGroupMessageOutput_ZodInput;
    };
    /** 获取消息 */
    get_message: {
      request: GetMessageInput;
      request_ZodInput: GetMessageInput_ZodInput;
      response: GetMessageOutput;
      response_ZodInput: GetMessageOutput_ZodInput;
    };
    /** 获取历史消息列表 */
    get_history_messages: {
      request: GetHistoryMessagesInput;
      request_ZodInput: GetHistoryMessagesInput_ZodInput;
      response: GetHistoryMessagesOutput;
      response_ZodInput: GetHistoryMessagesOutput_ZodInput;
    };
    /** 获取临时资源链接 */
    get_resource_temp_url: {
      request: GetResourceTempUrlInput;
      request_ZodInput: GetResourceTempUrlInput_ZodInput;
      response: GetResourceTempUrlOutput;
      response_ZodInput: GetResourceTempUrlOutput_ZodInput;
    };
    /** 获取合并转发消息内容 */
    get_forwarded_messages: {
      request: GetForwardedMessagesInput;
      request_ZodInput: GetForwardedMessagesInput_ZodInput;
      response: GetForwardedMessagesOutput;
      response_ZodInput: GetForwardedMessagesOutput_ZodInput;
    };
    /** 标记消息为已读 */
    mark_message_as_read: {
      request: MarkMessageAsReadInput;
      request_ZodInput: MarkMessageAsReadInput_ZodInput;
      response: MarkMessageAsReadOutput;
      response_ZodInput: MarkMessageAsReadOutput_ZodInput;
    };
  };
  /** 好友 API */
  friend: {
    /** 发送好友戳一戳 */
    send_friend_nudge: {
      request: SendFriendNudgeInput;
      request_ZodInput: SendFriendNudgeInput_ZodInput;
      response: SendFriendNudgeOutput;
      response_ZodInput: SendFriendNudgeOutput_ZodInput;
    };
    /** 发送名片点赞 */
    send_profile_like: {
      request: SendProfileLikeInput;
      request_ZodInput: SendProfileLikeInput_ZodInput;
      response: SendProfileLikeOutput;
      response_ZodInput: SendProfileLikeOutput_ZodInput;
    };
    /**
     * 删除好友
     * @since 1.1
     */
    delete_friend: {
      request: DeleteFriendInput;
      request_ZodInput: DeleteFriendInput_ZodInput;
      response: DeleteFriendOutput;
      response_ZodInput: DeleteFriendOutput_ZodInput;
    };
    /** 获取好友请求列表 */
    get_friend_requests: {
      request: GetFriendRequestsInput;
      request_ZodInput: GetFriendRequestsInput_ZodInput;
      response: GetFriendRequestsOutput;
      response_ZodInput: GetFriendRequestsOutput_ZodInput;
    };
    /** 同意好友请求 */
    accept_friend_request: {
      request: AcceptFriendRequestInput;
      request_ZodInput: AcceptFriendRequestInput_ZodInput;
      response: AcceptFriendRequestOutput;
      response_ZodInput: AcceptFriendRequestOutput_ZodInput;
    };
    /** 拒绝好友请求 */
    reject_friend_request: {
      request: RejectFriendRequestInput;
      request_ZodInput: RejectFriendRequestInput_ZodInput;
      response: RejectFriendRequestOutput;
      response_ZodInput: RejectFriendRequestOutput_ZodInput;
    };
  };
  /** 群聊 API */
  group: {
    /** 设置群名称 */
    set_group_name: {
      request: SetGroupNameInput;
      request_ZodInput: SetGroupNameInput_ZodInput;
      response: SetGroupNameOutput;
      response_ZodInput: SetGroupNameOutput_ZodInput;
    };
    /** 设置群头像 */
    set_group_avatar: {
      request: SetGroupAvatarInput;
      request_ZodInput: SetGroupAvatarInput_ZodInput;
      response: SetGroupAvatarOutput;
      response_ZodInput: SetGroupAvatarOutput_ZodInput;
    };
    /** 设置群名片 */
    set_group_member_card: {
      request: SetGroupMemberCardInput;
      request_ZodInput: SetGroupMemberCardInput_ZodInput;
      response: SetGroupMemberCardOutput;
      response_ZodInput: SetGroupMemberCardOutput_ZodInput;
    };
    /** 设置群成员专属头衔 */
    set_group_member_special_title: {
      request: SetGroupMemberSpecialTitleInput;
      request_ZodInput: SetGroupMemberSpecialTitleInput_ZodInput;
      response: SetGroupMemberSpecialTitleOutput;
      response_ZodInput: SetGroupMemberSpecialTitleOutput_ZodInput;
    };
    /** 设置群管理员 */
    set_group_member_admin: {
      request: SetGroupMemberAdminInput;
      request_ZodInput: SetGroupMemberAdminInput_ZodInput;
      response: SetGroupMemberAdminOutput;
      response_ZodInput: SetGroupMemberAdminOutput_ZodInput;
    };
    /** 设置群成员禁言 */
    set_group_member_mute: {
      request: SetGroupMemberMuteInput;
      request_ZodInput: SetGroupMemberMuteInput_ZodInput;
      response: SetGroupMemberMuteOutput;
      response_ZodInput: SetGroupMemberMuteOutput_ZodInput;
    };
    /** 设置群全员禁言 */
    set_group_whole_mute: {
      request: SetGroupWholeMuteInput;
      request_ZodInput: SetGroupWholeMuteInput_ZodInput;
      response: SetGroupWholeMuteOutput;
      response_ZodInput: SetGroupWholeMuteOutput_ZodInput;
    };
    /** 踢出群成员 */
    kick_group_member: {
      request: KickGroupMemberInput;
      request_ZodInput: KickGroupMemberInput_ZodInput;
      response: KickGroupMemberOutput;
      response_ZodInput: KickGroupMemberOutput_ZodInput;
    };
    /** 获取群公告列表 */
    get_group_announcements: {
      request: GetGroupAnnouncementsInput;
      request_ZodInput: GetGroupAnnouncementsInput_ZodInput;
      response: GetGroupAnnouncementsOutput;
      response_ZodInput: GetGroupAnnouncementsOutput_ZodInput;
    };
    /** 发送群公告 */
    send_group_announcement: {
      request: SendGroupAnnouncementInput;
      request_ZodInput: SendGroupAnnouncementInput_ZodInput;
      response: SendGroupAnnouncementOutput;
      response_ZodInput: SendGroupAnnouncementOutput_ZodInput;
    };
    /** 删除群公告 */
    delete_group_announcement: {
      request: DeleteGroupAnnouncementInput;
      request_ZodInput: DeleteGroupAnnouncementInput_ZodInput;
      response: DeleteGroupAnnouncementOutput;
      response_ZodInput: DeleteGroupAnnouncementOutput_ZodInput;
    };
    /** 获取群精华消息列表 */
    get_group_essence_messages: {
      request: GetGroupEssenceMessagesInput;
      request_ZodInput: GetGroupEssenceMessagesInput_ZodInput;
      response: GetGroupEssenceMessagesOutput;
      response_ZodInput: GetGroupEssenceMessagesOutput_ZodInput;
    };
    /** 设置群精华消息 */
    set_group_essence_message: {
      request: SetGroupEssenceMessageInput;
      request_ZodInput: SetGroupEssenceMessageInput_ZodInput;
      response: SetGroupEssenceMessageOutput;
      response_ZodInput: SetGroupEssenceMessageOutput_ZodInput;
    };
    /** 退出群 */
    quit_group: {
      request: QuitGroupInput;
      request_ZodInput: QuitGroupInput_ZodInput;
      response: QuitGroupOutput;
      response_ZodInput: QuitGroupOutput_ZodInput;
    };
    /** 发送群消息表情回应 */
    send_group_message_reaction: {
      request: SendGroupMessageReactionInput;
      request_ZodInput: SendGroupMessageReactionInput_ZodInput;
      response: SendGroupMessageReactionOutput;
      response_ZodInput: SendGroupMessageReactionOutput_ZodInput;
    };
    /** 发送群戳一戳 */
    send_group_nudge: {
      request: SendGroupNudgeInput;
      request_ZodInput: SendGroupNudgeInput_ZodInput;
      response: SendGroupNudgeOutput;
      response_ZodInput: SendGroupNudgeOutput_ZodInput;
    };
    /** 获取群通知列表 */
    get_group_notifications: {
      request: GetGroupNotificationsInput;
      request_ZodInput: GetGroupNotificationsInput_ZodInput;
      response: GetGroupNotificationsOutput;
      response_ZodInput: GetGroupNotificationsOutput_ZodInput;
    };
    /** 同意入群/邀请他人入群请求 */
    accept_group_request: {
      request: AcceptGroupRequestInput;
      request_ZodInput: AcceptGroupRequestInput_ZodInput;
      response: AcceptGroupRequestOutput;
      response_ZodInput: AcceptGroupRequestOutput_ZodInput;
    };
    /** 拒绝入群/邀请他人入群请求 */
    reject_group_request: {
      request: RejectGroupRequestInput;
      request_ZodInput: RejectGroupRequestInput_ZodInput;
      response: RejectGroupRequestOutput;
      response_ZodInput: RejectGroupRequestOutput_ZodInput;
    };
    /** 同意他人邀请自身入群 */
    accept_group_invitation: {
      request: AcceptGroupInvitationInput;
      request_ZodInput: AcceptGroupInvitationInput_ZodInput;
      response: AcceptGroupInvitationOutput;
      response_ZodInput: AcceptGroupInvitationOutput_ZodInput;
    };
    /** 拒绝他人邀请自身入群 */
    reject_group_invitation: {
      request: RejectGroupInvitationInput;
      request_ZodInput: RejectGroupInvitationInput_ZodInput;
      response: RejectGroupInvitationOutput;
      response_ZodInput: RejectGroupInvitationOutput_ZodInput;
    };
  };
  /** 文件 API */
  file: {
    /** 上传私聊文件 */
    upload_private_file: {
      request: UploadPrivateFileInput;
      request_ZodInput: UploadPrivateFileInput_ZodInput;
      response: UploadPrivateFileOutput;
      response_ZodInput: UploadPrivateFileOutput_ZodInput;
    };
    /** 上传群文件 */
    upload_group_file: {
      request: UploadGroupFileInput;
      request_ZodInput: UploadGroupFileInput_ZodInput;
      response: UploadGroupFileOutput;
      response_ZodInput: UploadGroupFileOutput_ZodInput;
    };
    /** 获取私聊文件下载链接 */
    get_private_file_download_url: {
      request: GetPrivateFileDownloadUrlInput;
      request_ZodInput: GetPrivateFileDownloadUrlInput_ZodInput;
      response: GetPrivateFileDownloadUrlOutput;
      response_ZodInput: GetPrivateFileDownloadUrlOutput_ZodInput;
    };
    /** 获取群文件下载链接 */
    get_group_file_download_url: {
      request: GetGroupFileDownloadUrlInput;
      request_ZodInput: GetGroupFileDownloadUrlInput_ZodInput;
      response: GetGroupFileDownloadUrlOutput;
      response_ZodInput: GetGroupFileDownloadUrlOutput_ZodInput;
    };
    /** 获取群文件列表 */
    get_group_files: {
      request: GetGroupFilesInput;
      request_ZodInput: GetGroupFilesInput_ZodInput;
      response: GetGroupFilesOutput;
      response_ZodInput: GetGroupFilesOutput_ZodInput;
    };
    /** 移动群文件 */
    move_group_file: {
      request: MoveGroupFileInput;
      request_ZodInput: MoveGroupFileInput_ZodInput;
      response: MoveGroupFileOutput;
      response_ZodInput: MoveGroupFileOutput_ZodInput;
    };
    /** 重命名群文件 */
    rename_group_file: {
      request: RenameGroupFileInput;
      request_ZodInput: RenameGroupFileInput_ZodInput;
      response: RenameGroupFileOutput;
      response_ZodInput: RenameGroupFileOutput_ZodInput;
    };
    /** 删除群文件 */
    delete_group_file: {
      request: DeleteGroupFileInput;
      request_ZodInput: DeleteGroupFileInput_ZodInput;
      response: DeleteGroupFileOutput;
      response_ZodInput: DeleteGroupFileOutput_ZodInput;
    };
    /**
     * 转存群文件为永久文件
     * @since 1.3
     */
    persist_group_file: {
      request: PersistGroupFileInput;
      request_ZodInput: PersistGroupFileInput_ZodInput;
      response: PersistGroupFileOutput;
      response_ZodInput: PersistGroupFileOutput_ZodInput;
    };
    /** 创建群文件夹 */
    create_group_folder: {
      request: CreateGroupFolderInput;
      request_ZodInput: CreateGroupFolderInput_ZodInput;
      response: CreateGroupFolderOutput;
      response_ZodInput: CreateGroupFolderOutput_ZodInput;
    };
    /** 重命名群文件夹 */
    rename_group_folder: {
      request: RenameGroupFolderInput;
      request_ZodInput: RenameGroupFolderInput_ZodInput;
      response: RenameGroupFolderOutput;
      response_ZodInput: RenameGroupFolderOutput_ZodInput;
    };
    /** 删除群文件夹 */
    delete_group_folder: {
      request: DeleteGroupFolderInput;
      request_ZodInput: DeleteGroupFolderInput_ZodInput;
      response: DeleteGroupFolderOutput;
      response_ZodInput: DeleteGroupFolderOutput_ZodInput;
    };
  };
}

export interface ApiEndpoints {
  /** 获取登录信息 */
  /** 获取登录信息 */
  'get_login_info': {
    request: GetLoginInfoInput;
    request_ZodInput: GetLoginInfoInput_ZodInput;
    response: GetLoginInfoOutput;
    response_ZodInput: GetLoginInfoOutput_ZodInput;
  };
  /** 获取协议端信息 */
  /** 获取协议端信息 */
  'get_impl_info': {
    request: GetImplInfoInput;
    request_ZodInput: GetImplInfoInput_ZodInput;
    response: GetImplInfoOutput;
    response_ZodInput: GetImplInfoOutput_ZodInput;
  };
  /** 获取用户个人信息 */
  /** 获取用户个人信息 */
  'get_user_profile': {
    request: GetUserProfileInput;
    request_ZodInput: GetUserProfileInput_ZodInput;
    response: GetUserProfileOutput;
    response_ZodInput: GetUserProfileOutput_ZodInput;
  };
  /** 获取好友列表 */
  /** 获取好友列表 */
  'get_friend_list': {
    request: GetFriendListInput;
    request_ZodInput: GetFriendListInput_ZodInput;
    response: GetFriendListOutput;
    response_ZodInput: GetFriendListOutput_ZodInput;
  };
  /** 获取好友信息 */
  /** 获取好友信息 */
  'get_friend_info': {
    request: GetFriendInfoInput;
    request_ZodInput: GetFriendInfoInput_ZodInput;
    response: GetFriendInfoOutput;
    response_ZodInput: GetFriendInfoOutput_ZodInput;
  };
  /** 获取群列表 */
  /** 获取群列表 */
  'get_group_list': {
    request: GetGroupListInput;
    request_ZodInput: GetGroupListInput_ZodInput;
    response: GetGroupListOutput;
    response_ZodInput: GetGroupListOutput_ZodInput;
  };
  /** 获取群信息 */
  /** 获取群信息 */
  'get_group_info': {
    request: GetGroupInfoInput;
    request_ZodInput: GetGroupInfoInput_ZodInput;
    response: GetGroupInfoOutput;
    response_ZodInput: GetGroupInfoOutput_ZodInput;
  };
  /** 获取群成员列表 */
  /** 获取群成员列表 */
  'get_group_member_list': {
    request: GetGroupMemberListInput;
    request_ZodInput: GetGroupMemberListInput_ZodInput;
    response: GetGroupMemberListOutput;
    response_ZodInput: GetGroupMemberListOutput_ZodInput;
  };
  /** 获取群成员信息 */
  /** 获取群成员信息 */
  'get_group_member_info': {
    request: GetGroupMemberInfoInput;
    request_ZodInput: GetGroupMemberInfoInput_ZodInput;
    response: GetGroupMemberInfoOutput;
    response_ZodInput: GetGroupMemberInfoOutput_ZodInput;
  };
  /**
   * 获取置顶的好友和群列表
   * @since 1.2
   */
  /** 获取置顶的好友和群列表 */
  'get_peer_pins': {
    request: GetPeerPinsInput;
    request_ZodInput: GetPeerPinsInput_ZodInput;
    response: GetPeerPinsOutput;
    response_ZodInput: GetPeerPinsOutput_ZodInput;
  };
  /**
   * 设置好友或群的置顶状态
   * @since 1.2
   */
  /** 设置好友或群的置顶状态 */
  'set_peer_pin': {
    request: SetPeerPinInput;
    request_ZodInput: SetPeerPinInput_ZodInput;
    response: SetPeerPinOutput;
    response_ZodInput: SetPeerPinOutput_ZodInput;
  };
  /**
   * 设置 QQ 账号头像
   * @since 1.1
   */
  /** 设置 QQ 账号头像 */
  'set_avatar': {
    request: SetAvatarInput;
    request_ZodInput: SetAvatarInput_ZodInput;
    response: SetAvatarOutput;
    response_ZodInput: SetAvatarOutput_ZodInput;
  };
  /**
   * 设置 QQ 账号昵称
   * @since 1.1
   */
  /** 设置 QQ 账号昵称 */
  'set_nickname': {
    request: SetNicknameInput;
    request_ZodInput: SetNicknameInput_ZodInput;
    response: SetNicknameOutput;
    response_ZodInput: SetNicknameOutput_ZodInput;
  };
  /**
   * 设置 QQ 账号个性签名
   * @since 1.1
   */
  /** 设置 QQ 账号个性签名 */
  'set_bio': {
    request: SetBioInput;
    request_ZodInput: SetBioInput_ZodInput;
    response: SetBioOutput;
    response_ZodInput: SetBioOutput_ZodInput;
  };
  /**
   * 获取自定义表情 URL 列表
   * @since 1.1
   */
  /** 获取自定义表情 URL 列表 */
  'get_custom_face_url_list': {
    request: GetCustomFaceUrlListInput;
    request_ZodInput: GetCustomFaceUrlListInput_ZodInput;
    response: GetCustomFaceUrlListOutput;
    response_ZodInput: GetCustomFaceUrlListOutput_ZodInput;
  };
  /** 获取 Cookies */
  /** 获取 Cookies */
  'get_cookies': {
    request: GetCookiesInput;
    request_ZodInput: GetCookiesInput_ZodInput;
    response: GetCookiesOutput;
    response_ZodInput: GetCookiesOutput_ZodInput;
  };
  /** 获取 CSRF Token */
  /** 获取 CSRF Token */
  'get_csrf_token': {
    request: GetCSRFTokenInput;
    request_ZodInput: GetCSRFTokenInput_ZodInput;
    response: GetCSRFTokenOutput;
    response_ZodInput: GetCSRFTokenOutput_ZodInput;
  };
  /** 发送私聊消息 */
  /** 发送私聊消息 */
  'send_private_message': {
    request: SendPrivateMessageInput;
    request_ZodInput: SendPrivateMessageInput_ZodInput;
    response: SendPrivateMessageOutput;
    response_ZodInput: SendPrivateMessageOutput_ZodInput;
  };
  /** 发送群聊消息 */
  /** 发送群聊消息 */
  'send_group_message': {
    request: SendGroupMessageInput;
    request_ZodInput: SendGroupMessageInput_ZodInput;
    response: SendGroupMessageOutput;
    response_ZodInput: SendGroupMessageOutput_ZodInput;
  };
  /** 撤回私聊消息 */
  /** 撤回私聊消息 */
  'recall_private_message': {
    request: RecallPrivateMessageInput;
    request_ZodInput: RecallPrivateMessageInput_ZodInput;
    response: RecallPrivateMessageOutput;
    response_ZodInput: RecallPrivateMessageOutput_ZodInput;
  };
  /** 撤回群聊消息 */
  /** 撤回群聊消息 */
  'recall_group_message': {
    request: RecallGroupMessageInput;
    request_ZodInput: RecallGroupMessageInput_ZodInput;
    response: RecallGroupMessageOutput;
    response_ZodInput: RecallGroupMessageOutput_ZodInput;
  };
  /** 获取消息 */
  /** 获取消息 */
  'get_message': {
    request: GetMessageInput;
    request_ZodInput: GetMessageInput_ZodInput;
    response: GetMessageOutput;
    response_ZodInput: GetMessageOutput_ZodInput;
  };
  /** 获取历史消息列表 */
  /** 获取历史消息列表 */
  'get_history_messages': {
    request: GetHistoryMessagesInput;
    request_ZodInput: GetHistoryMessagesInput_ZodInput;
    response: GetHistoryMessagesOutput;
    response_ZodInput: GetHistoryMessagesOutput_ZodInput;
  };
  /** 获取临时资源链接 */
  /** 获取临时资源链接 */
  'get_resource_temp_url': {
    request: GetResourceTempUrlInput;
    request_ZodInput: GetResourceTempUrlInput_ZodInput;
    response: GetResourceTempUrlOutput;
    response_ZodInput: GetResourceTempUrlOutput_ZodInput;
  };
  /** 获取合并转发消息内容 */
  /** 获取合并转发消息内容 */
  'get_forwarded_messages': {
    request: GetForwardedMessagesInput;
    request_ZodInput: GetForwardedMessagesInput_ZodInput;
    response: GetForwardedMessagesOutput;
    response_ZodInput: GetForwardedMessagesOutput_ZodInput;
  };
  /** 标记消息为已读 */
  /** 标记消息为已读 */
  'mark_message_as_read': {
    request: MarkMessageAsReadInput;
    request_ZodInput: MarkMessageAsReadInput_ZodInput;
    response: MarkMessageAsReadOutput;
    response_ZodInput: MarkMessageAsReadOutput_ZodInput;
  };
  /** 发送好友戳一戳 */
  /** 发送好友戳一戳 */
  'send_friend_nudge': {
    request: SendFriendNudgeInput;
    request_ZodInput: SendFriendNudgeInput_ZodInput;
    response: SendFriendNudgeOutput;
    response_ZodInput: SendFriendNudgeOutput_ZodInput;
  };
  /** 发送名片点赞 */
  /** 发送名片点赞 */
  'send_profile_like': {
    request: SendProfileLikeInput;
    request_ZodInput: SendProfileLikeInput_ZodInput;
    response: SendProfileLikeOutput;
    response_ZodInput: SendProfileLikeOutput_ZodInput;
  };
  /**
   * 删除好友
   * @since 1.1
   */
  /** 删除好友 */
  'delete_friend': {
    request: DeleteFriendInput;
    request_ZodInput: DeleteFriendInput_ZodInput;
    response: DeleteFriendOutput;
    response_ZodInput: DeleteFriendOutput_ZodInput;
  };
  /** 获取好友请求列表 */
  /** 获取好友请求列表 */
  'get_friend_requests': {
    request: GetFriendRequestsInput;
    request_ZodInput: GetFriendRequestsInput_ZodInput;
    response: GetFriendRequestsOutput;
    response_ZodInput: GetFriendRequestsOutput_ZodInput;
  };
  /** 同意好友请求 */
  /** 同意好友请求 */
  'accept_friend_request': {
    request: AcceptFriendRequestInput;
    request_ZodInput: AcceptFriendRequestInput_ZodInput;
    response: AcceptFriendRequestOutput;
    response_ZodInput: AcceptFriendRequestOutput_ZodInput;
  };
  /** 拒绝好友请求 */
  /** 拒绝好友请求 */
  'reject_friend_request': {
    request: RejectFriendRequestInput;
    request_ZodInput: RejectFriendRequestInput_ZodInput;
    response: RejectFriendRequestOutput;
    response_ZodInput: RejectFriendRequestOutput_ZodInput;
  };
  /** 设置群名称 */
  /** 设置群名称 */
  'set_group_name': {
    request: SetGroupNameInput;
    request_ZodInput: SetGroupNameInput_ZodInput;
    response: SetGroupNameOutput;
    response_ZodInput: SetGroupNameOutput_ZodInput;
  };
  /** 设置群头像 */
  /** 设置群头像 */
  'set_group_avatar': {
    request: SetGroupAvatarInput;
    request_ZodInput: SetGroupAvatarInput_ZodInput;
    response: SetGroupAvatarOutput;
    response_ZodInput: SetGroupAvatarOutput_ZodInput;
  };
  /** 设置群名片 */
  /** 设置群名片 */
  'set_group_member_card': {
    request: SetGroupMemberCardInput;
    request_ZodInput: SetGroupMemberCardInput_ZodInput;
    response: SetGroupMemberCardOutput;
    response_ZodInput: SetGroupMemberCardOutput_ZodInput;
  };
  /** 设置群成员专属头衔 */
  /** 设置群成员专属头衔 */
  'set_group_member_special_title': {
    request: SetGroupMemberSpecialTitleInput;
    request_ZodInput: SetGroupMemberSpecialTitleInput_ZodInput;
    response: SetGroupMemberSpecialTitleOutput;
    response_ZodInput: SetGroupMemberSpecialTitleOutput_ZodInput;
  };
  /** 设置群管理员 */
  /** 设置群管理员 */
  'set_group_member_admin': {
    request: SetGroupMemberAdminInput;
    request_ZodInput: SetGroupMemberAdminInput_ZodInput;
    response: SetGroupMemberAdminOutput;
    response_ZodInput: SetGroupMemberAdminOutput_ZodInput;
  };
  /** 设置群成员禁言 */
  /** 设置群成员禁言 */
  'set_group_member_mute': {
    request: SetGroupMemberMuteInput;
    request_ZodInput: SetGroupMemberMuteInput_ZodInput;
    response: SetGroupMemberMuteOutput;
    response_ZodInput: SetGroupMemberMuteOutput_ZodInput;
  };
  /** 设置群全员禁言 */
  /** 设置群全员禁言 */
  'set_group_whole_mute': {
    request: SetGroupWholeMuteInput;
    request_ZodInput: SetGroupWholeMuteInput_ZodInput;
    response: SetGroupWholeMuteOutput;
    response_ZodInput: SetGroupWholeMuteOutput_ZodInput;
  };
  /** 踢出群成员 */
  /** 踢出群成员 */
  'kick_group_member': {
    request: KickGroupMemberInput;
    request_ZodInput: KickGroupMemberInput_ZodInput;
    response: KickGroupMemberOutput;
    response_ZodInput: KickGroupMemberOutput_ZodInput;
  };
  /** 获取群公告列表 */
  /** 获取群公告列表 */
  'get_group_announcements': {
    request: GetGroupAnnouncementsInput;
    request_ZodInput: GetGroupAnnouncementsInput_ZodInput;
    response: GetGroupAnnouncementsOutput;
    response_ZodInput: GetGroupAnnouncementsOutput_ZodInput;
  };
  /** 发送群公告 */
  /** 发送群公告 */
  'send_group_announcement': {
    request: SendGroupAnnouncementInput;
    request_ZodInput: SendGroupAnnouncementInput_ZodInput;
    response: SendGroupAnnouncementOutput;
    response_ZodInput: SendGroupAnnouncementOutput_ZodInput;
  };
  /** 删除群公告 */
  /** 删除群公告 */
  'delete_group_announcement': {
    request: DeleteGroupAnnouncementInput;
    request_ZodInput: DeleteGroupAnnouncementInput_ZodInput;
    response: DeleteGroupAnnouncementOutput;
    response_ZodInput: DeleteGroupAnnouncementOutput_ZodInput;
  };
  /** 获取群精华消息列表 */
  /** 获取群精华消息列表 */
  'get_group_essence_messages': {
    request: GetGroupEssenceMessagesInput;
    request_ZodInput: GetGroupEssenceMessagesInput_ZodInput;
    response: GetGroupEssenceMessagesOutput;
    response_ZodInput: GetGroupEssenceMessagesOutput_ZodInput;
  };
  /** 设置群精华消息 */
  /** 设置群精华消息 */
  'set_group_essence_message': {
    request: SetGroupEssenceMessageInput;
    request_ZodInput: SetGroupEssenceMessageInput_ZodInput;
    response: SetGroupEssenceMessageOutput;
    response_ZodInput: SetGroupEssenceMessageOutput_ZodInput;
  };
  /** 退出群 */
  /** 退出群 */
  'quit_group': {
    request: QuitGroupInput;
    request_ZodInput: QuitGroupInput_ZodInput;
    response: QuitGroupOutput;
    response_ZodInput: QuitGroupOutput_ZodInput;
  };
  /** 发送群消息表情回应 */
  /** 发送群消息表情回应 */
  'send_group_message_reaction': {
    request: SendGroupMessageReactionInput;
    request_ZodInput: SendGroupMessageReactionInput_ZodInput;
    response: SendGroupMessageReactionOutput;
    response_ZodInput: SendGroupMessageReactionOutput_ZodInput;
  };
  /** 发送群戳一戳 */
  /** 发送群戳一戳 */
  'send_group_nudge': {
    request: SendGroupNudgeInput;
    request_ZodInput: SendGroupNudgeInput_ZodInput;
    response: SendGroupNudgeOutput;
    response_ZodInput: SendGroupNudgeOutput_ZodInput;
  };
  /** 获取群通知列表 */
  /** 获取群通知列表 */
  'get_group_notifications': {
    request: GetGroupNotificationsInput;
    request_ZodInput: GetGroupNotificationsInput_ZodInput;
    response: GetGroupNotificationsOutput;
    response_ZodInput: GetGroupNotificationsOutput_ZodInput;
  };
  /** 同意入群/邀请他人入群请求 */
  /** 同意入群/邀请他人入群请求 */
  'accept_group_request': {
    request: AcceptGroupRequestInput;
    request_ZodInput: AcceptGroupRequestInput_ZodInput;
    response: AcceptGroupRequestOutput;
    response_ZodInput: AcceptGroupRequestOutput_ZodInput;
  };
  /** 拒绝入群/邀请他人入群请求 */
  /** 拒绝入群/邀请他人入群请求 */
  'reject_group_request': {
    request: RejectGroupRequestInput;
    request_ZodInput: RejectGroupRequestInput_ZodInput;
    response: RejectGroupRequestOutput;
    response_ZodInput: RejectGroupRequestOutput_ZodInput;
  };
  /** 同意他人邀请自身入群 */
  /** 同意他人邀请自身入群 */
  'accept_group_invitation': {
    request: AcceptGroupInvitationInput;
    request_ZodInput: AcceptGroupInvitationInput_ZodInput;
    response: AcceptGroupInvitationOutput;
    response_ZodInput: AcceptGroupInvitationOutput_ZodInput;
  };
  /** 拒绝他人邀请自身入群 */
  /** 拒绝他人邀请自身入群 */
  'reject_group_invitation': {
    request: RejectGroupInvitationInput;
    request_ZodInput: RejectGroupInvitationInput_ZodInput;
    response: RejectGroupInvitationOutput;
    response_ZodInput: RejectGroupInvitationOutput_ZodInput;
  };
  /** 上传私聊文件 */
  /** 上传私聊文件 */
  'upload_private_file': {
    request: UploadPrivateFileInput;
    request_ZodInput: UploadPrivateFileInput_ZodInput;
    response: UploadPrivateFileOutput;
    response_ZodInput: UploadPrivateFileOutput_ZodInput;
  };
  /** 上传群文件 */
  /** 上传群文件 */
  'upload_group_file': {
    request: UploadGroupFileInput;
    request_ZodInput: UploadGroupFileInput_ZodInput;
    response: UploadGroupFileOutput;
    response_ZodInput: UploadGroupFileOutput_ZodInput;
  };
  /** 获取私聊文件下载链接 */
  /** 获取私聊文件下载链接 */
  'get_private_file_download_url': {
    request: GetPrivateFileDownloadUrlInput;
    request_ZodInput: GetPrivateFileDownloadUrlInput_ZodInput;
    response: GetPrivateFileDownloadUrlOutput;
    response_ZodInput: GetPrivateFileDownloadUrlOutput_ZodInput;
  };
  /** 获取群文件下载链接 */
  /** 获取群文件下载链接 */
  'get_group_file_download_url': {
    request: GetGroupFileDownloadUrlInput;
    request_ZodInput: GetGroupFileDownloadUrlInput_ZodInput;
    response: GetGroupFileDownloadUrlOutput;
    response_ZodInput: GetGroupFileDownloadUrlOutput_ZodInput;
  };
  /** 获取群文件列表 */
  /** 获取群文件列表 */
  'get_group_files': {
    request: GetGroupFilesInput;
    request_ZodInput: GetGroupFilesInput_ZodInput;
    response: GetGroupFilesOutput;
    response_ZodInput: GetGroupFilesOutput_ZodInput;
  };
  /** 移动群文件 */
  /** 移动群文件 */
  'move_group_file': {
    request: MoveGroupFileInput;
    request_ZodInput: MoveGroupFileInput_ZodInput;
    response: MoveGroupFileOutput;
    response_ZodInput: MoveGroupFileOutput_ZodInput;
  };
  /** 重命名群文件 */
  /** 重命名群文件 */
  'rename_group_file': {
    request: RenameGroupFileInput;
    request_ZodInput: RenameGroupFileInput_ZodInput;
    response: RenameGroupFileOutput;
    response_ZodInput: RenameGroupFileOutput_ZodInput;
  };
  /** 删除群文件 */
  /** 删除群文件 */
  'delete_group_file': {
    request: DeleteGroupFileInput;
    request_ZodInput: DeleteGroupFileInput_ZodInput;
    response: DeleteGroupFileOutput;
    response_ZodInput: DeleteGroupFileOutput_ZodInput;
  };
  /**
   * 转存群文件为永久文件
   * @since 1.3
   */
  /** 转存群文件为永久文件 */
  'persist_group_file': {
    request: PersistGroupFileInput;
    request_ZodInput: PersistGroupFileInput_ZodInput;
    response: PersistGroupFileOutput;
    response_ZodInput: PersistGroupFileOutput_ZodInput;
  };
  /** 创建群文件夹 */
  /** 创建群文件夹 */
  'create_group_folder': {
    request: CreateGroupFolderInput;
    request_ZodInput: CreateGroupFolderInput_ZodInput;
    response: CreateGroupFolderOutput;
    response_ZodInput: CreateGroupFolderOutput_ZodInput;
  };
  /** 重命名群文件夹 */
  /** 重命名群文件夹 */
  'rename_group_folder': {
    request: RenameGroupFolderInput;
    request_ZodInput: RenameGroupFolderInput_ZodInput;
    response: RenameGroupFolderOutput;
    response_ZodInput: RenameGroupFolderOutput_ZodInput;
  };
  /** 删除群文件夹 */
  /** 删除群文件夹 */
  'delete_group_folder': {
    request: DeleteGroupFolderInput;
    request_ZodInput: DeleteGroupFolderInput_ZodInput;
    response: DeleteGroupFolderOutput;
    response_ZodInput: DeleteGroupFolderOutput_ZodInput;
  };
}
