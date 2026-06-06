import type * as types from './types';

export function msg(
  strings: TemplateStringsArray,
  ...values: (string | number | boolean | types.OutgoingSegment_ZodInput)[]
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
  return trimBoundaryTextSegments(segments);
}

function isTextSegment(segment: types.OutgoingSegment_ZodInput): segment is types.OutgoingTextSegment_ZodInput {
  return segment.type === 'text';
}

function withText(segment: types.OutgoingTextSegment_ZodInput, text: string): types.OutgoingTextSegment_ZodInput {
  return {
    ...segment,
    data: {
      ...segment.data,
      text,
    },
  };
}

function trimBoundaryTextSegments(segments: types.OutgoingSegment_ZodInput[]): types.OutgoingSegment_ZodInput[] {
  const result = [...segments];
  const first = result[0];
  if (first && isTextSegment(first)) {
    const text = first.data.text.trimStart();
    if (text) {
      result[0] = withText(first, text);
    } else {
      result.shift();
    }
  }

  const lastIndex = result.length - 1;
  const last = result[lastIndex];
  if (last && isTextSegment(last)) {
    const text = last.data.text.trimEnd();
    if (text) {
      result[lastIndex] = withText(last, text);
    } else {
      result.pop();
    }
  }

  return result;
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
