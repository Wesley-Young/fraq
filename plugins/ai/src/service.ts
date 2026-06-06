import type { LanguageModel } from 'ai';

/**
 * Options accepted by {@link AiService}.
 */
export interface AiServiceOptions {
  /**
   * The language model exposed through {@link AiService.model}.
   *
   * It can be a plain model id string (resolved through the AI SDK global
   * provider / Vercel AI Gateway) or any provider model instance.
   */
  model: LanguageModel;
}

/**
 * A thin Fraq service that exposes a configured Vercel AI SDK language model.
 *
 * This service does not wrap any SDK function. It only
 * holds the configured {@link AiService.model}, which you pass directly to the
 * AI SDK Core functions imported from `ai`:
 *
 * ```typescript
 * import { generateText } from 'ai';
 *
 * const { text } = await generateText({
 *   model: ctx.ai.model,
 *   prompt: 'Hello!',
 * });
 * ```
 *
 * Keeping the SDK functions un-wrapped means every bit of the AI SDK's generic
 * inference (tool typing, structured output, etc.) flows through natively,
 * exactly as if you called the SDK without Fraq.
 */
export class AiService {
  /** The configured language model. */
  readonly model: LanguageModel;

  constructor(options: AiServiceOptions) {
    this.model = options.model;
  }
}
