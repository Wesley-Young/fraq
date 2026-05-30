/** biome-ignore-all lint/suspicious/noExplicitAny: This file is meant to be used by users of the library, so we want to allow any types for flexibility. */
import type { Context } from './context';

export type ParameterList = Array<any>;

export interface Plugin<T extends ParameterList> {
  apply(context: Context, ...args: T): void | Promise<void>;
}

export function definePlugin<T extends ParameterList>(plugin: Plugin<T>): Plugin<T> {
  return plugin;
}
