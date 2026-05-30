/** biome-ignore-all lint/suspicious/noExplicitAny: Service constructors may accept any arguments. */
export type ServiceClass<T extends object = object> = abstract new (...args: any[]) => T;

export function getServiceName(service: ServiceClass): string {
  return service.name || '<anonymous service>';
}
