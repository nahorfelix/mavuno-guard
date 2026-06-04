export type OperationsHealthState = 'healthy' | 'demo' | 'degraded' | 'error';

export type IntegrationStatusValue =
  | 'active'
  | 'available'
  | 'locked'
  | 'demo'
  | 'error'
  | 'not-tested';

export type ApiHealthState = 'healthy' | 'limited' | 'locked' | 'error';

export type NormalizedOperationsHealth = {
  envKeyExists: boolean;
  envKeyValid: boolean;
  envKeyHasCorrectFormat: boolean;
  envKeyIsPlaceholder: boolean;
  weatherAIReachable: boolean;
  weatherAIStatus: number | null;
  message: string;
  overallState: OperationsHealthState;
  timestamp: string;
  lastChecked: string;
};

export type NormalizedOperationsUsage = {
  demoMode: boolean;
  plan: string;
  requestsUsed: number;
  requestsRemaining: number;
  requestsLimit: number;
  aiRequestsUsed: number;
  aiRequestsRemaining: number;
  aiRequestsLimit: number;
  resetDate?: string;
  billingPeriod?: string;
  maxForecastDays: number;
  webhooksEnabled: boolean;
  smsEnabled: boolean;
  todayUsage?: number;
};

export type NormalizedRateLimit = {
  available: boolean;
  limit?: string;
  remaining?: string;
  reset?: string;
  source: string;
};

export type QuotaCardModel = {
  id: string;
  title: string;
  used?: number;
  remaining?: number;
  limit?: number;
  unit?: string;
  locked: boolean;
  requiredPlan?: string;
  note: string;
};

export type IntegrationRow = {
  id: string;
  name: string;
  route: string;
  requiredPlan: string;
  status: IntegrationStatusValue;
  note: string;
};

export type ApiHealthModel = {
  id: string;
  title: string;
  state: ApiHealthState;
  explanation: string;
  lastChecked?: string;
};

export type OperationsSnapshot = {
  health: NormalizedOperationsHealth | null;
  usage: NormalizedOperationsUsage | null;
  rateLimit: NormalizedRateLimit;
  quotas: QuotaCardModel[];
  integrations: IntegrationRow[];
  apiHealth: ApiHealthModel[];
  demoMode: boolean;
  lastRefreshed: string;
  errors: Record<string, string>;
};
