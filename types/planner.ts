export type SuitabilityLevel = 'Good' | 'Caution' | 'Unsafe' | 'Monitor';

export type NormalizedHourlyEntry = {
  time: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  condition?: string;
  uvIndex?: number;
};

export type NormalizedDailyEntry = {
  date: string;
  maxTemp: number;
  minTemp: number;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  condition?: string;
  uvIndex?: number;
};

export type HourlyPlanRow = NormalizedHourlyEntry & {
  action: string;
  suitability: SuitabilityLevel;
  reason: string;
};

export type OperationWindowSummary = {
  title: string;
  status: SuitabilityLevel;
  explanation: string;
  timeWindow?: string;
  factor: string;
};

export type DailyPlanCard = NormalizedDailyEntry & {
  recommendation: string;
  suitability: SuitabilityLevel;
};

export type PlannerStatus = {
  isLoading: boolean;
  hasHourly: boolean;
  hasDaily: boolean;
  errors: Record<string, string>;
};
