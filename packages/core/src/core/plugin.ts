/** biome-ignore-all lint/suspicious/noExplicitAny: This file is meant to be used by users of the library, so we want to allow any types for flexibility. */
import type { Context } from './context';
import type { ServiceClass } from './service';

export type ParameterList = Array<any>;
export type Injection = Record<string, ServiceClass>;
type InjectedServices<I extends Injection | undefined> = I extends Injection
  ? { [K in keyof I]: InstanceType<I[K]> }
  : // biome-ignore lint/complexity/noBannedTypes: Necessary to handle the case where I is undefined, which means there are no injected services.
    {};
type OptionalInjectedServices<I extends Injection | undefined> = I extends Injection
  ? { [K in keyof I]: InstanceType<I[K]> | undefined }
  : // biome-ignore lint/complexity/noBannedTypes: Necessary to handle the case where I is undefined, which means there are no injected services.
    {};

export interface Plugin<
  T extends ParameterList,
  I extends Injection | undefined,
  OI extends Injection | undefined = undefined,
> {
  name: string;
  requires?: readonly ServiceClass[];
  inject?: I;
  optionalRequires?: readonly ServiceClass[];
  optionalInject?: OI;
  provides?: readonly ServiceClass[];
  apply(ctx: Context & InjectedServices<I> & OptionalInjectedServices<OI>, ...args: T): void | Promise<void>;
}

export function definePlugin<
  T extends ParameterList,
  I extends Injection | undefined,
  OI extends Injection | undefined,
>(plugin: Plugin<T, I, OI>): Plugin<T, I, OI> {
  if (plugin.inject) {
    if (plugin.requires) {
      throw new Error(`Plugin "${plugin.name}" cannot have both "requires" and "inject" properties.`);
    }
    // Generate "requires" from the values of "inject"
    plugin.requires = Object.values(plugin.inject);
  }
  if (plugin.optionalInject) {
    if (plugin.optionalRequires) {
      throw new Error(`Plugin "${plugin.name}" cannot have both "optionalRequires" and "optionalInject" properties.`);
    }
    plugin.optionalRequires = Object.values(plugin.optionalInject);
  }
  return plugin;
}
