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

/**
 * PHASE 3 NOTE: API Response Shape Handler
 *
 * WeatherAI routes return responses with two possible shapes:
 *
 * 1. Real WeatherAI (when WEATHER_AI_API_KEY is configured and valid):
 *    { payload: T, meta: { status: number, rateLimit: {...} } }
 *
 * 2. Demo fallback (when key is missing or placeholder):
 *    { demoMode: true, message: string, data: T }
 *
 * Dashboard components should check for demoMode first, then safely
 * access response.payload?.location or response.data?.location.
 *
 * Example safe access pattern for Phase 3:
 *    const isDemoMode = response.demoMode === true;
 *    const weatherData = isDemoMode ? response.data : response.payload;
 */
export type WeatherAPIResponse<T> = 
  | { demoMode: true; message: string; data: T }
  | { payload: T; meta: { status: number; rateLimit: Record<string, unknown> } };

