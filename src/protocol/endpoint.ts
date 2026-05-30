import type * as types from './types';

type RequiredKeys<T> = {
  // biome-ignore lint/complexity/noBannedTypes: used for checking if a type is optional
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

type AllOptional<T> = RequiredKeys<T> extends never ? true : false;

type RawApiEndpoint<E extends keyof types.ApiEndpoints> = {
  request: types.ApiEndpoints[E]['request_ZodInput'] extends null ? null : types.ApiEndpoints[E]['request_ZodInput'];
  response: types.ApiEndpoints[E]['response'] extends null ? null : types.ApiEndpoints[E]['response'];
};

type ApiEndpointFunction<E extends keyof types.ApiEndpoints> = RawApiEndpoint<E>['request'] extends null
  ? () => Promise<RawApiEndpoint<E>['response']>
  : AllOptional<RawApiEndpoint<E>['request']> extends true
    ? (params?: RawApiEndpoint<E>['request']) => Promise<RawApiEndpoint<E>['response']>
    : (params: RawApiEndpoint<E>['request']) => Promise<RawApiEndpoint<E>['response']>;

export type ApiEndpoints = {
  [E in keyof types.ApiEndpoints]: ApiEndpointFunction<E>;
};

export type EventMap = { [K in types.Event['event_type']]: Extract<types.Event, { event_type: K }> };
