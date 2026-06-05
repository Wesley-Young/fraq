import type { milky } from '@fraqjs/fraq';

export type InmsgTemplateValue = string | number | boolean | milky.IncomingSegment_ZodInput;

export interface IncomingReplySource {
  message_seq: number;
  sender_id: number;
  sender_name?: string | null | undefined;
  time: number;
  segments: milky.IncomingSegment[] | milky.IncomingSegment_ZodInput[];
}

export function inmsg(
  strings: TemplateStringsArray,
  ...values: InmsgTemplateValue[]
): milky.IncomingSegment_ZodInput[] {
  let buffer = '';
  const segments: milky.IncomingSegment_ZodInput[] = [];

  for (let index = 0; index < strings.length; index += 1) {
    buffer += strings[index];
    if (index >= values.length) {
      continue;
    }

    const value = values[index];
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      buffer += value.toString();
      continue;
    }

    if (buffer) {
      segments.push(inseg.text(buffer));
      buffer = '';
    }
    segments.push(value);
  }

  if (buffer) {
    segments.push(inseg.text(buffer));
  }

  return trimBoundaryTextSegments(segments);
}

function isTextSegment(segment: milky.IncomingSegment_ZodInput): segment is milky.IncomingTextSegment_ZodInput {
  return segment.type === 'text';
}

function withText(segment: milky.IncomingTextSegment_ZodInput, text: string): milky.IncomingTextSegment_ZodInput {
  return {
    ...segment,
    data: {
      ...segment.data,
      text,
    },
  };
}

function trimBoundaryTextSegments(segments: milky.IncomingSegment_ZodInput[]): milky.IncomingSegment_ZodInput[] {
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

function isIncomingMessage(value: milky.IncomingMessage | IncomingReplySource): value is milky.IncomingMessage {
  return 'message_scene' in value;
}

export namespace inseg {
  export function text(text: string): milky.IncomingTextSegment_ZodInput {
    return {
      type: 'text',
      data: {
        text,
      },
    };
  }

  export function mention(userId: number, name = `user_${userId}`): milky.IncomingMentionSegment_ZodInput {
    return {
      type: 'mention',
      data: {
        user_id: userId,
        name,
      },
    };
  }

  export function mentionAll(): milky.IncomingMentionAllSegment_ZodInput {
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
  ): milky.IncomingFaceSegment_ZodInput {
    return {
      type: 'face',
      data: {
        face_id: faceId.toString(),
        is_large: options?.isLarge ?? false,
      },
    };
  }

  export function reply(source: milky.IncomingMessage | IncomingReplySource): milky.IncomingReplySegment_ZodInput {
    const data = isIncomingMessage(source)
      ? {
          message_seq: source.message_seq,
          sender_id: source.sender_id,
          sender_name: undefined,
          time: source.time,
          segments: source.segments,
        }
      : source;

    return {
      type: 'reply',
      data: {
        message_seq: data.message_seq,
        sender_id: data.sender_id,
        sender_name: data.sender_name,
        time: data.time,
        segments: [...data.segments],
      },
    };
  }

  export function image(options?: {
    resourceId?: string;
    tempUrl?: string;
    width?: number;
    height?: number;
    summary?: string;
    subType?: 'normal' | 'sticker';
  }): milky.IncomingImageSegment_ZodInput {
    return {
      type: 'image',
      data: {
        resource_id: options?.resourceId ?? 'mock-image',
        temp_url: options?.tempUrl ?? 'https://example.invalid/mock-image',
        width: options?.width ?? 640,
        height: options?.height ?? 480,
        summary: options?.summary ?? '[image]',
        sub_type: options?.subType ?? 'normal',
      },
    };
  }

  export function record(options?: {
    resourceId?: string;
    tempUrl?: string;
    duration?: number;
  }): milky.IncomingRecordSegment_ZodInput {
    return {
      type: 'record',
      data: {
        resource_id: options?.resourceId ?? 'mock-record',
        temp_url: options?.tempUrl ?? 'https://example.invalid/mock-record',
        duration: options?.duration ?? 3,
      },
    };
  }

  export function video(options?: {
    resourceId?: string;
    tempUrl?: string;
    width?: number;
    height?: number;
    duration?: number;
  }): milky.IncomingVideoSegment_ZodInput {
    return {
      type: 'video',
      data: {
        resource_id: options?.resourceId ?? 'mock-video',
        temp_url: options?.tempUrl ?? 'https://example.invalid/mock-video',
        width: options?.width ?? 1280,
        height: options?.height ?? 720,
        duration: options?.duration ?? 12,
      },
    };
  }

  export function file(options?: {
    fileId?: string;
    fileName?: string;
    fileSize?: number;
    fileHash?: string | null;
  }): milky.IncomingFileSegment_ZodInput {
    return {
      type: 'file',
      data: {
        file_id: options?.fileId ?? 'mock-file',
        file_name: options?.fileName ?? 'mock.txt',
        file_size: options?.fileSize ?? 1024,
        file_hash: options?.fileHash,
      },
    };
  }

  export function forward(options?: {
    forwardId?: string;
    title?: string;
    preview?: string[];
    summary?: string;
  }): milky.IncomingForwardSegment_ZodInput {
    return {
      type: 'forward',
      data: {
        forward_id: options?.forwardId ?? 'mock-forward',
        title: options?.title ?? 'Chat History',
        preview: options?.preview ?? ['Alice: ping', 'Bob: pong'],
        summary: options?.summary ?? 'View forwarded messages',
      },
    };
  }

  export function marketFace(options?: {
    emojiPackageId?: number;
    emojiId?: string;
    key?: string;
    summary?: string;
    url?: string;
  }): milky.IncomingMarketFaceSegment_ZodInput {
    return {
      type: 'market_face',
      data: {
        emoji_package_id: options?.emojiPackageId ?? 1,
        emoji_id: options?.emojiId ?? 'mock-market-face',
        key: options?.key ?? 'mock-key',
        summary: options?.summary ?? '[market face]',
        url: options?.url ?? 'https://example.invalid/mock-market-face',
      },
    };
  }

  export function lightApp(appName: string, jsonPayload: string): milky.IncomingLightAppSegment_ZodInput {
    return {
      type: 'light_app',
      data: {
        app_name: appName,
        json_payload: jsonPayload,
      },
    };
  }

  export function xml(serviceId: number, xmlPayload: string): milky.IncomingXmlSegment_ZodInput {
    return {
      type: 'xml',
      data: {
        service_id: serviceId,
        xml_payload: xmlPayload,
      },
    };
  }

  export function markdown(content: string): milky.IncomingMarkdownSegment_ZodInput {
    return {
      type: 'markdown',
      data: {
        content,
      },
    };
  }
}
