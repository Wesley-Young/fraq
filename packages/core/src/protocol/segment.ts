import type * as types from './types';

export function msg(
  strings: TemplateStringsArray,
  ...values: (string | number | boolean | types.OutgoingFaceSegment_ZodInput)[]
): types.OutgoingSegment_ZodInput[] {
  let buffer = '';
  const segments: types.OutgoingSegment_ZodInput[] = [];
  for (let i = 0; i < strings.length; i++) {
    buffer += strings[i];
    if (i < values.length) {
      const value = values[i];
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        buffer += value.toString();
      } else {
        if (buffer) {
          segments.push({ type: 'text', data: { text: buffer } });
          buffer = '';
        }
        segments.push(value);
      }
    }
  }
  if (buffer) {
    segments.push({ type: 'text', data: { text: buffer } });
  }
  return segments;
}

export namespace seg {
  export function mention(userId: number): types.OutgoingMentionSegment_ZodInput {
    return {
      type: 'mention',
      data: {
        user_id: userId,
      },
    };
  }

  export function mentionAll(): types.OutgoingMentionAllSegment_ZodInput {
    return {
      type: 'mention_all',
      data: {},
    };
  }

  export function face(
    faceId: number | string,
    options?: {
      isLarge?: boolean;
    },
  ): types.OutgoingFaceSegment_ZodInput {
    return {
      type: 'face',
      data: {
        face_id: faceId.toString(),
        is_large: options?.isLarge ?? false,
      },
    };
  }

  export function reply(messageSeq: number): types.OutgoingReplySegment_ZodInput {
    return {
      type: 'reply',
      data: {
        message_seq: messageSeq,
      },
    };
  }

  export function image(
    uri: string,
    options?: {
      subType?: 'normal' | 'sticker';
      summary?: string;
    },
  ): types.OutgoingImageSegment_ZodInput {
    return {
      type: 'image',
      data: {
        uri: uri,
        sub_type: options?.subType,
        summary: options?.summary,
      },
    };
  }

  export function record(uri: string): types.OutgoingRecordSegment_ZodInput {
    return {
      type: 'record',
      data: {
        uri: uri,
      },
    };
  }

  export function video(
    uri: string,
    options?: {
      thumbUri?: string;
    },
  ): types.OutgoingVideoSegment_ZodInput {
    return {
      type: 'video',
      data: {
        uri: uri,
        thumb_uri: options?.thumbUri,
      },
    };
  }

  export function forward(
    messages: types.OutgoingForwardedMessage_ZodInput[],
    options?: {
      title?: string;
      preview?: string[];
      summary?: string;
      prompt?: string;
    },
  ): types.OutgoingForwardSegment_ZodInput {
    return {
      type: 'forward',
      data: {
        messages: messages,
        title: options?.title,
        preview: options?.preview,
        summary: options?.summary,
        prompt: options?.prompt,
      },
    };
  }
}
