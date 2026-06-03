/** biome-ignore-all lint/suspicious/noExplicitAny: Service constructors may accept any arguments. */
export type ServiceClass<T extends object = object> = abstract new (...args: any[]) => T;

export interface Disposable {
  dispose(): void | Promise<void>;
}

export function isDisposable(service: object): service is Disposable {
  return 'dispose' in service && typeof service.dispose === 'function';
}
