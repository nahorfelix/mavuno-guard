/**
 * Dashboard Type Definitions
 * Handles flexible response shapes from WeatherAI API
 */

export type DashboardWeatherData = {
  location?: {
    name?: string;
    country?: string;
    timezone?: string;
    lat?: number;
    lon?: number;
  };
  current?: {
    temperature?: number;
    feels_like?: number;
    humidity?: number;
    wind_speed?: number;
    wind_direction?: string;
    condition?: string;
    precipitation?: number;
  };
  forecast?: Array<{
    date?: string;
    high?: number;
    low?: number;
    condition?: string;
    precipitation_chance?: number;
  }>;
  daily?: Array<{
    date?: string;
    high?: number;
    low?: number;
    condition?: string;
    precipitation_chance?: number;
  }>;
  days?: Array<{
    date?: string;
    high?: number;
    low?: number;
    condition?: string;
    precipitation_chance?: number;
  }>;
  ai_summary?: string;
};

export type NormalizedWeatherData = {
  demoMode: boolean;
  location: {
    name: string;
    country: string;
    timezone: string;
    lat: number;
    lon: number;
  };
  current: {
    temperature: number;
    feelsLike?: number;
    humidity: number;
    windSpeed: number;
    windDirection?: string;
    condition: string;
    precipitation: number;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    precipitationChance: number;
  }>;
  aiSummary?: string;
};

export type DashboardUsageData = {
  quota?: {
    monthly_limit?: number;
    monthly_used?: number;
    monthly_remaining?: number;
  };
  plan?: {
    name?: string;
    tier?: string;
  };
  usage?: {
    today?: number;
    month_to_date?: number;
    reset_date?: string;
  };
  limits?: {
    forecast_days?: number;
    ai_requests?: number;
  };
};

export type NormalizedUsageData = {
  demoMode: boolean;
  plan: string;
  monthlyLimit: number;
  monthlyUsed: number;
  monthlyRemaining: number;
  todayUsage: number;
  resetDate: string;
  forecastDays: number;
  aiRequests: number;
  webhooksAvailable: boolean;
  smsAvailable: boolean;
};

export type RiskScore = {
  overall: number; // 0-100
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: {
    rain: number;
    wind: number;
    temperature: number;
    humidity: number;
    uv?: number;
  };
  explanations: string[];
};

export type FarmRecommendation = {
  category: 'IRRIGATION' | 'SPRAYING' | 'FERTILIZING' | 'LABOUR' | 'DRAINAGE' | 'DISEASE';
  action: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  emoji: string;
};

export type ApiStatus = {
  isHealthy: boolean;
  demoMode: boolean;
  currentWeatherReady: boolean;
  forecastReady: boolean;
  usageReady: boolean;
  errors: Record<string, string>;
};
