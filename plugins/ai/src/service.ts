import type { LanguageModel } from 'ai';

export interface AiServiceOptions {
  models: Record<string, LanguageModel>;
  aliases: Record<string, string>;
  defaultModel: string;
}

export class AiService {
  private defaultModel: LanguageModel;

  constructor(private readonly options: AiServiceOptions) {
    // find default model by name or alias
    const defaultModel = options.models[options.defaultModel] ?? options.models[options.aliases[options.defaultModel]];
    if (!defaultModel) {
      throw new Error(`Invalid default model "${options.defaultModel}": model does not exist.`);
    }
    this.defaultModel = defaultModel;

    // Check aliases point to valid models
    for (const [alias, target] of Object.entries(options.aliases)) {
      if (!options.models[target]) {
        throw new Error(`Invalid alias "${alias}": target model "${target}" does not exist.`);
      }
    }
  }

  hasModel(name: string): boolean {
    return !!this.options.models[name] || !!this.options.aliases[name];
  }

  model(name?: string): LanguageModel {
    if (!name) {
      return this.defaultModel;
    }
    const modelByName = this.options.models[name];
    if (modelByName) {
      return modelByName;
    }
    const modelByAlias = this.options.aliases[name];
    if (modelByAlias) {
      return this.options.models[modelByAlias];
    }
    throw new Error(`Model not found: ${name}`);
  }

  models(): string[] {
    return Object.keys(this.options.models);
  }
}
