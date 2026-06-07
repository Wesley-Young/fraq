import type { LanguageModel } from 'ai';

export interface AiServiceOptions {
  models: Record<string, LanguageModel>;
  defaultModel: string;
}

export class AiService {
  model(): LanguageModel;
  model(name: string): LanguageModel | undefined;
  model(name?: string): LanguageModel | undefined {
    return this.options.models[name ?? this.options.defaultModel];
  }

  constructor(private readonly options: AiServiceOptions) {}
}
