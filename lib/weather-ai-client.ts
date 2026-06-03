export type WeatherAIRequestQuery = Record<string, string | number | boolean>;

export type WeatherAIResponse<T> = {
  status: number;
  data: T;
  rateLimit: {
    limit?: string;
    remaining?: string;
    reset?: string;
  };
};

export class WeatherAIError extends Error {
  public status: number;
  public data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'WeatherAIError';
    this.status = status;
    this.data = data;
  }
}

const BASE_URL = 'https://api.weather-ai.co';
const API_KEY = process.env.WEATHER_AI_API_KEY;

// Validate if the API key is properly configured
const isKeyValid = (): boolean => {
  if (!API_KEY) return false;
  if (API_KEY === 'wai_your_api_key_here') return false;
  if (API_KEY.includes('PASTE_YOUR_REAL_WEATHERAI_KEY_HERE')) return false;
  if (!API_KEY.startsWith('wai_')) return false;
  return true;
};

export const isWeatherAIConfigured = (): boolean => {
  return isKeyValid();
};

const rateLimitHeaderKeys = {
  limit: ['x-ratelimit-limit', 'ratelimit-limit'],
  remaining: ['x-ratelimit-remaining', 'ratelimit-remaining'],
  reset: ['x-ratelimit-reset', 'ratelimit-reset'],
};

const collectRateLimitHeaders = (headers: Headers): WeatherAIResponse<unknown>['rateLimit'] => {
  return {
    limit: rateLimitHeaderKeys.limit
      .map((key) => headers.get(key))
      .find(Boolean) ?? undefined,
    remaining: rateLimitHeaderKeys.remaining
      .map((key) => headers.get(key))
      .find(Boolean) ?? undefined,
    reset:
      rateLimitHeaderKeys.reset
        .map((key) => headers.get(key))
        .find(Boolean) ?? undefined,
  };
};

const serializeQuery = (query: WeatherAIRequestQuery = {}) => {
  return Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(
      ([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');
};

const parseJsonSafely = async (response: Response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export class WeatherAIClient {
  private getAuthHeader(): string {
    if (!isKeyValid()) {
      throw new WeatherAIError(
        'WeatherAI API key is missing or invalid. Please set WEATHER_AI_API_KEY in .env.local',
        401
      );
    }

    return `Bearer ${API_KEY}`;
  }

  private buildUrl(endpoint: string, query?: WeatherAIRequestQuery): string {
    const url = new URL(`${BASE_URL}${endpoint}`);

    if (query && Object.keys(query).length > 0) {
      const serialized = serializeQuery(query);
      if (serialized) {
        url.search = serialized;
      }
    }

    return url.toString();
  }

  private buildHeaders(contentType = 'application/json'): Headers {
    const headers = new Headers();
    headers.set('Authorization', this.getAuthHeader());
    headers.set('Accept', 'application/json');
    if (contentType) {
      headers.set('Content-Type', contentType);
    }
    return headers;
  }

  public async request<T>(
    method: 'GET' | 'POST',
    endpoint: string,
    query?: WeatherAIRequestQuery,
    body?: unknown
  ): Promise<WeatherAIResponse<T>> {
    const url = this.buildUrl(endpoint, query);
    const hasFormData = body instanceof FormData;
    const headers = this.buildHeaders(hasFormData ? '' : 'application/json');

    const response = await fetch(url, {
      method,
      headers,
      body: method === 'GET' ? undefined : hasFormData ? body : JSON.stringify(body),
    });

    const data = await parseJsonSafely(response);
    const rateLimit = collectRateLimitHeaders(response.headers);

    if (!response.ok) {
      const message =
        typeof data === 'object' && data !== null && 'message' in data
          ? (data as any).message
          : response.statusText;

      throw new WeatherAIError(message || 'WeatherAI request failed', response.status, data);
    }

    return {
      status: response.status,
      data: data as T,
      rateLimit,
    };
  }

  public get<T>(endpoint: string, query?: WeatherAIRequestQuery) {
    return this.request<T>('GET', endpoint, query);
  }

  public post<T>(endpoint: string, body: unknown, query?: WeatherAIRequestQuery) {
    return this.request<T>('POST', endpoint, query, body);
  }
}

const weatherAIClient = new WeatherAIClient();
export default weatherAIClient;
