import type { ApiEndpoints } from './endpoint';
import type { Event } from './types';

interface MilkyApiResponseRoot {
  status: 'ok' | 'failed';
  retcode: number;
  message?: string;
  data?: unknown;
}

export interface MilkyEventSubscription {
  closed: Promise<void>;
  stop(): void | Promise<void>;
}

export interface MilkyClient extends ApiEndpoints {
  startEvents(onEvent: (event: Event) => void | Promise<void>): Promise<MilkyEventSubscription>;
}

class MilkyClientBase {
  readonly baseUrl: string;
  readonly wsBaseUrl: string;
  private readonly accessToken?: string;
  private readonly baseHeaders: Record<string, string>;

  constructor(
    baseUrl: string | URL,
    options?: {
      accessToken?: string;
    },
  ) {
    const normalizedBaseUrl = baseUrl.toString();
    this.baseUrl = normalizedBaseUrl.endsWith('/') ? normalizedBaseUrl.slice(0, -1) : normalizedBaseUrl;
    this.wsBaseUrl = this.baseUrl.replace(/^http/, 'ws');
    this.accessToken = options?.accessToken;
    this.baseHeaders = {
      'Content-Type': 'application/json',
    };
    if (options?.accessToken) {
      this.baseHeaders.Authorization = `Bearer ${options.accessToken}`;
    }
  }

  async callApi(endpoint: string, params?: unknown): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/api/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(params ?? {}),
      headers: this.baseHeaders,
    });
    if (!response.ok) {
      throw new Error(`API call ${endpoint} failed with HTTP status ${response.status}`);
    }
    const json = (await response.json()) as MilkyApiResponseRoot;
    if (json.status === 'failed') {
      throw new Error(`API call ${endpoint} failed with retcode ${json.retcode}: ${json.message}`);
    }
    return json.data;
  }

  async startEvents(onEvent: (event: Event) => void | Promise<void>): Promise<MilkyEventSubscription> {
    const ws = new WebSocket(`${this.wsBaseUrl}/event${this.accessToken ? `?access_token=${this.accessToken}` : ''}`);
    let closeSubscription: (error?: unknown) => void = () => {};
    const closed = new Promise<void>((resolve, reject) => {
      closeSubscription = (error?: unknown) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      };
    });

    ws.addEventListener('message', async (event) => {
      try {
        if (typeof event.data !== 'string') {
          throw new Error(`Expected text frame, got ${typeof event.data}`);
        }
        await onEvent(JSON.parse(event.data) as Event);
      } catch (error) {
        closeSubscription(error);
        ws.close();
      }
    });

    await new Promise<void>((resolve, reject) => {
      ws.addEventListener('open', () => resolve(), { once: true });
      ws.addEventListener('error', (event) => reject(new Error(`WebSocket error: ${event}`)));
    });

    ws.addEventListener('error', (event) => closeSubscription(new Error(`WebSocket error: ${event}`)));
    ws.addEventListener('close', () => closeSubscription(), { once: true });

    return {
      closed,
      stop() {
        ws.close();
      },
    };
  }
}

export function createMilkyClient(...params: ConstructorParameters<typeof MilkyClientBase>): MilkyClient {
  const base = new MilkyClientBase(...params);
  return new Proxy(base, {
    get(target, endpoint) {
      // simple heuristic to determine if this is an API method call or a direct property access
      if (typeof endpoint === 'string' && endpoint.includes('_')) {
        return (params?: unknown) => target.callApi(endpoint as string, params);
      } else {
        // @ts-expect-error
        return target[endpoint];
      }
    },
  }) as unknown as MilkyClient;
}
