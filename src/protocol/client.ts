import type { ApiEndpoints } from './endpoint';

interface MilkyApiResponseRoot {
  status: 'ok' | 'failed';
  retcode: number;
  message?: string;
  data?: unknown;
}

class MilkyClientBase {
  readonly baseUrl: string;
  readonly wsBaseUrl: string;
  private readonly accessToken?: string;
  private readonly baseHeaders: Record<string, string>;

  constructor(
    baseUrl: string,
    options?: {
      accessToken?: string;
    },
  ) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
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
      throw new Error(`API call failed with status ${response.status}`);
    }
    const json = (await response.json()) as MilkyApiResponseRoot;
    if (json.status === 'failed') {
      throw new Error(`API call failed with retcode ${json.retcode}: ${json.message}`);
    }
    return json.data;
  }

  async openEventWebSocket(onEvent: (event: MessageEvent) => void): Promise<WebSocket> {
    const ws = new WebSocket(`${this.wsBaseUrl}/event${this.accessToken ? `?access_token=${this.accessToken}` : ''}`);
    ws.addEventListener('message', onEvent);
    return new Promise((resolve, reject) => {
      ws.addEventListener('open', () => resolve(ws));
      ws.addEventListener('error', (event) => reject(new Error(`WebSocket error: ${event}`)));
    });
  }
}

export type MilkyClient = MilkyClientBase & ApiEndpoints;

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
  }) as MilkyClientBase & ApiEndpoints;
}
