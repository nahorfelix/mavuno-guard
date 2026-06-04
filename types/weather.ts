export type CurrentWeatherResponse = {
  location?: Record<string, unknown>;
  current?: Record<string, unknown>;
  forecast?: Record<string, unknown>;
  [key: string]: unknown;
};

export type ForecastResponse = {
  location?: Record<string, unknown>;
  forecast?: Record<string, unknown>;
  [key: string]: unknown;
};

export type DailyForecastResponse = {
  location?: Record<string, unknown>;
  daily?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

export type HourlyForecastResponse = {
  location?: Record<string, unknown>;
  hourly?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

export type UsageResponse = {
  quota?: Record<string, unknown>;
  usage?: Record<string, unknown>;
  [key: string]: unknown;
};

export type ApiErrorResponse = {
  error?: {
    code?: string;
    message: string;
  };
  status?: number;
  [key: string]: unknown;
};

/** Live routes use `payload`; demo fallbacks use `data` when no API key is configured. */
export type WeatherAPIResponse<T> = 
  | { demoMode: true; message: string; data: T }
  | { payload: T; meta: { status: number; rateLimit: Record<string, unknown> } };

