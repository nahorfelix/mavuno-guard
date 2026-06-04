export type AlertChannel = 'in-app' | 'webhook' | 'sms';
export type AlertType =
  | 'heavy rain'
  | 'strong wind'
  | 'heat stress'
  | 'frost risk'
  | 'irrigation reminder'
  | 'fertilizer warning'
  | 'spraying window';

export type AlertStatus = 'active' | 'paused';
export type AlertRiskLevel = 'low' | 'medium' | 'high';

export type AlertRule = {
  id: string;
  type: AlertType;
  label: string;
  location: string;
  threshold: number;
  channel: AlertChannel;
  status: AlertStatus;
};

export type AlertRuleMeta = {
  name: string;
  condition: string;
  recommendation: string;
  riskLevel: AlertRiskLevel;
};

export type AlertPreview = {
  ruleId: string;
  title: string;
  condition: string;
  triggered: boolean;
  riskLevel: AlertRiskLevel;
  recommendation: string;
  planNote?: string;
};

export type PlanCapabilities = {
  plan: string;
  webhooks: boolean;
  sms: boolean;
  maxForecastDays: number;
  aiRequestsRemaining: number;
};

export type WeatherUsageResponse = {
  plan: string;
  webhooks: boolean;
  sms: boolean;
  maxForecastDays: number;
  requestsRemaining: number;
};

export type WeatherCurrentData = {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  condition: string;
};

export type WeatherDailyItem = {
  date: string;
  maxTemp: number;
  minTemp: number;
  humidity: number;
  windSpeed: number;
  description: string;
  precipitation?: number;
};
