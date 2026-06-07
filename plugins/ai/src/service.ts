import type { LanguageModel } from 'ai';

export interface AiServiceOptions {
  models: Record<string, LanguageModel>;
  aliases: Record<string, string>;
  defaultModel: string;
}

export class AiService {
  hasModel(name: string): boolean {
    return !!this.options.models[name] || !!this.options.aliases[name];
  }

  model(name?: string): LanguageModel {
    const modelByName = this.options.models[name ?? this.options.defaultModel];
    if (modelByName) {
      return modelByName;
    }
    const aliasTarget = this.options.aliases[name ?? ''];
    if (aliasTarget) {
      return this.options.models[aliasTarget];
    }
    throw new Error(`Model not found: ${name}`);
  }

  models(): Record<string, LanguageModel> {
    return { ...this.options.models };
  }

  constructor(private readonly options: AiServiceOptions) {
    if (!options.models[options.defaultModel]) {
      throw new Error(`Invalid default model "${options.defaultModel}": model does not exist.`);
    }

    // Check aliases point to valid models
    for (const [alias, target] of Object.entries(options.aliases)) {
      if (!options.models[target]) {
        throw new Error(`Invalid alias "${alias}": target model "${target}" does not exist.`);
      }
    }
  }
}
