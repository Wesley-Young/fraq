/**
 * useMessage - 消息拦截工具（Promise 版）
 *
 * 调用后返回一个 Promise，resolve 时返回该用户的下一条消息对应的 Session 上下文。
 * 无需修改框架源码，基于现有的 filter + rawPattern 机制实现。
 *
 * 隔离策略：以 sender_id + message_scene + peer_id 作为 key,
 * 同一用户在私聊、不同群聊中的 useMessage 互不干扰。
 *
 * 支持：
 *   - AbortSignal（类似 fetch）提前取消
 *   - 超时控制：可指定超时时间、超时是否抛错、超时后是否回复内容
 *   - FIFO 队列：保证同一会话的并发调用不会互相覆盖
 *
 * 使用前必须调用 setupUseMessage(router) 完成初始化（且必须在所有 router.command 之前）。
 */
import type { IncomingMessage, OutgoingSegment_ZodInput } from '../protocol/types';
import type { Router, Session } from '../routing/router';
import { param } from '../routing/parameter';
import { msg } from '../protocol/segment.js';

// ---------- 内部状态 ----------

/** 等待队列：conversationKey → PendingRequest[]（FIFO） */
const pendingQueues = new Map<string, PendingRequest[]>();

/** 拦截路由是否已注册 */
let interceptorRegistered = false;

interface PendingRequest {
  resolve: (session: Session) => void;
  reject: (error: Error) => void;
  timeoutId?: ReturnType<typeof setTimeout>;
  signalAbortHandler?: () => void;
  signal?: AbortSignal;
}

// ---------- 内部工具 ----------

/**
 * 根据消息上下文生成会话隔离 key。
 * 格式：`{sender_id}:{message_scene}:{peer_id}`
 *
 * - 用户 12345 私聊          → `12345:friend:12345`
 * - 用户 12345 在群 67890    → `12345:group:67890`
 * - 用户 12345 在群 11111    → `12345:group:11111`
 */
function conversationKey(raw: IncomingMessage): string {
  return `${raw.sender_id}:${raw.message_scene}:${raw.peer_id}`;
}

/** 从队列中移除请求，清理定时器、AbortSignal 监听器，队列为空时删除映射条目 */
function cleanupRequest(key: string, queue: PendingRequest[], req: PendingRequest): void {
  if (req.timeoutId != null) {
    clearTimeout(req.timeoutId);
    req.timeoutId = undefined;
  }
  if (req.signalAbortHandler && req.signal) {
    req.signal.removeEventListener('abort', req.signalAbortHandler);
    req.signalAbortHandler = undefined;
    req.signal = undefined;
  }
  const idx = queue.indexOf(req);
  if (idx !== -1) {
    queue.splice(idx, 1);
  }
  if (queue.length === 0) {
    pendingQueues.delete(key);
  }
}

/** 消费队列中的下一个请求，返回是否成功 */
function resolveNext(key: string, session: Session): boolean {
  const queue = pendingQueues.get(key);
  if (!queue || queue.length === 0) return false;

  const req = queue.shift();
  if (!req) return false;

  cleanupRequest(key, queue, req);
  req.resolve(session);
  return true;
}

// ---------- 公开 API ----------

/**
 * 初始化 useMessage，将拦截路由注册到指定 router 上。
 *
 * **必须在任何 useMessage 调用之前执行一次**，通常在应用启动时调用。
 *
 * ⚠️ 必须在所有 `router.command()` / `router.rawPattern()` **之前**调用，
 * 否则先注册的路由会优先匹配，拦截器可能无法捕获正在对话中的用户消息。
 *
 * @param router - 通常传入 ctx.router
 *
 * @example
 * ```ts
 * import { setupUseMessage, useMessage } from '@fraq/core';
 *
 * // ✅ 正确：先 setup，再注册业务路由
 * setupUseMessage(ctx.router);
 * ctx.router.command('chat', ...);
 *
 * // ❌ 错误：业务路由会抢走 useMessage 的消息
 * ctx.router.command('chat', ...);
 * setupUseMessage(ctx.router);
 * ```
 */
export function setupUseMessage(router: Router): void {
  if (interceptorRegistered) {
    return;
  }

  router
    .filter((session) => {
      const key = conversationKey(session.raw);
      const queue = pendingQueues.get(key);
      return !!(queue && queue.length > 0);
    })
    .rawPattern({ _all: param.catchAll() }, async (session) => {
      const key = conversationKey(session.raw);
      resolveNext(key, session);
    });

  interceptorRegistered = true;
}

export interface UseMessageOptions {
  /**
   * AbortSignal，用于提前取消等待（类似 fetch）。
   * abort 后 Promise 以 DOMException('AbortError') reject。
   */
  signal?: AbortSignal;

  /**
   * 超时时间（毫秒）。
   *  - 默认5000毫秒。
   *  - 0或负数表示不启用超时。
   */
  timeout?: number;

  /**
   * 超时时是否抛出错误。
   * - `true`：Promise 以 DOMException('TimeoutError') reject
   * - `false`（默认）：Promise resolve(null)，若设置了 timeoutReply 则自动回复
   */
  timeoutError?: boolean;

  /**
   * 超时后自动回复的消息内容（仅在 timeoutError 为 false 时生效）。
   */
  timeoutReply?: null | OutgoingSegment_ZodInput[];
}

/**
 * 等待指定用户在**同一会话**中的下一条消息。
 *
 * 返回一个 Promise，resolve 时返回该消息对应的 Session 上下文。
 * 同一用户在私聊和不同群聊中的等待互不干扰。
 *
 * @param session - 当前消息上下文（session），用于隔离会话和超时回复
 * @param options - 可选配置
 * @returns Promise<Session | null>，超时且未设置 timeoutError 时 resolve(null)
 *
 * @example
 * ```ts
 * ctx.router.command('chat', { message: param.greedy() }, async (session) => {
 *   const ac = new AbortController();
 *   session.reply([seg.text('对话已开始，输入 exit 退出')]);
 *
 *   while (true) {
 *     const next = await useMessage(session, {
 *       signal: ac.signal,
 *       timeout: 60_000,
 *       timeoutError: false,
 *       timeoutReply: [seg.text('你太久没说话了，对话结束。')],
 *     });
 *
 *     if (!next) break; // 超时
 *
 *     const text = next.raw.segments
 *       .filter((s) => s.type === 'text')
 *       .map((s) => s.data.text)
 *       .join('');
 *
 *     if (text === 'exit') {
 *       next.reply([seg.text('对话结束')]);
 *       break;
 *     }
 *
 *     next.reply([seg.text(`你说的是: ${text}`)]);
 *   }
 * });
 * ```
 */
export function useMessage(session: Session, options: UseMessageOptions = {}): Promise<Session | null> {
  const { signal, timeout = 5000, timeoutError = false, timeoutReply } = options;

  if (!interceptorRegistered) {
    throw new Error('useMessage: 尚未初始化，请先调用 setupUseMessage(ctx.router) 完成配置。');
  }

  // ---- signal 已经 abort → 立即 reject ----
  if (signal?.aborted) {
    return Promise.reject(new DOMException('The operation was aborted.', 'AbortError'));
  }

  const key = conversationKey(session.raw);

  // ---- 构造 Promise ----
  return new Promise<Session | null>((resolve, reject) => {
    const req: PendingRequest = { resolve, reject };

    // ---- 超时处理 ----
    if (timeout > 0) {
      req.timeoutId = setTimeout(async () => {
        const queue = pendingQueues.get(key);
        if (queue) cleanupRequest(key, queue, req);

        // 发送超时回复
        if (timeoutReply !== null) {
          try {
            await session.reply(timeoutReply ?? msg`当前对话已超时`);
          } catch {
            // 回复失败静默忽略
          }
        }

        if (timeoutError) {
          reject(new DOMException(`The operation timed out after ${timeout}ms.`, 'TimeoutError'));
        } else {
          resolve(null);
        }
      }, timeout);
    }

    // ---- AbortSignal 监听 ----
    if (signal) {
      req.signalAbortHandler = () => {
        const queue = pendingQueues.get(key);
        if (queue) cleanupRequest(key, queue, req);

        reject(new DOMException('The operation was aborted.', 'AbortError'));
      };

      req.signal = signal;
      signal.addEventListener('abort', req.signalAbortHandler, {
        once: true,
      });
    }

    // ---- 入队 ----
    let queue = pendingQueues.get(key);
    if (!queue) {
      queue = [];
      pendingQueues.set(key, queue);
    }
    queue.push(req);
  });
}

/**
 * 检查某个会话中是否有正在等待的消息。
 *
 * @param raw - 当前消息上下文（session.raw）
 */
export function isWaitingForMessage(raw: IncomingMessage): boolean {
  const key = conversationKey(raw);
  const queue = pendingQueues.get(key);
  return !!(queue && queue.length > 0);
}
