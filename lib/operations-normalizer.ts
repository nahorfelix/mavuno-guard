// Normalize usage, health, and quota payloads for the operations dashboard.

import { normalizeTreeQuotaResponse } from '@/lib/tree-normalizer';
import type {
  ApiHealthModel,
  ApiHealthState,
  IntegrationRow,
  IntegrationStatusValue,
  NormalizedOperationsHealth,
  NormalizedOperationsUsage,
  NormalizedRateLimit,
  OperationsHealthState,
  OperationsSnapshot,
  QuotaCardModel,
} from '@/types/operations';

const safeNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const safeString = (value: unknown, fallback = ''): string => {
  if (value === undefined || value === null) return fallback;
  return String(value);
};

export const extractPayload = (response: unknown): Record<string, unknown> | null => {
  if (!response || typeof response !== 'object') return null;
  const record = response as Record<string, unknown>;

  if (record.error) {
    return null;
  }

  if (record.demoMode === true && record.data) {
    return record.data as Record<string, unknown>;
  }
  if (record.payload) {
    return record.payload as Record<string, unknown>;
  }
  if (record.data) {
    return record.data as Record<string, unknown>;
  }
  return null;
};

export const extractMeta = (response: unknown): Record<string, unknown> => {
  if (!response || typeof response !== 'object') return {};
  const record = response as Record<string, unknown>;
  const payload = extractPayload(response);
  const payloadMeta = (payload?.meta ?? {}) as Record<string, unknown>;
  const topMeta = (record.meta ?? {}) as Record<string, unknown>;
  return { ...payloadMeta, ...topMeta };
};

const readPlanName = (usageData: Record<string, unknown>): string => {
  const plan = usageData.plan;
  if (plan && typeof plan === 'object') {
    const planRecord = plan as Record<string, unknown>;
    return safeString(planRecord.name ?? planRecord.tier ?? planRecord.id, 'free');
  }
  const direct = safeString(plan, '');
  if (direct) return direct;
  const tier = safeString(usageData.tier ?? usageData.plan_name, '');
  return tier || 'free';
};

const readFlag = (
  sources: Array<Record<string, unknown>>,
  keys: string[],
  fallback: boolean
): boolean => {
  for (const source of sources) {
    for (const key of keys) {
      if (key in source) return Boolean(source[key]);
    }
  }
  return fallback;
};

export const inferPlanLabel = (
  usage: NormalizedOperationsUsage | null,
  health: NormalizedOperationsHealth | null
): string => {
  if (usage?.plan && usage.plan !== 'Unknown') {
    return usage.plan;
  }
  if (health?.overallState === 'demo') {
    return 'free';
  }
  if (health?.envKeyValid) {
    return 'free';
  }
  return 'free';
};

export const normalizeOperationsHealth = (response: unknown): NormalizedOperationsHealth | null => {
  if (!response || typeof response !== 'object') return null;

  const record = response as Record<string, unknown>;

  // Ignore Next.js error page payloads (e.g. corrupted .next / 500 responses)
  if ('props' in record && record.props && typeof record.props === 'object') {
    return null;
  }
  if (!('configuration' in record) && !('weatherAI' in record)) {
    return null;
  }

  const configuration = (record.configuration ?? {}) as Record<string, unknown>;
  const weatherAI = (record.weatherAI ?? {}) as Record<string, unknown>;

  const envKeyExists = Boolean(configuration.envKeyExists);
  const envKeyValid = Boolean(configuration.envKeyValid);
  const envKeyHasCorrectFormat = Boolean(configuration.envKeyHasCorrectFormat);
  const envKeyIsPlaceholder = Boolean(
    configuration.envKeyIsPlaceholder ?? configuration.envKeyIsExample
  );
  const weatherAIReachable = Boolean(weatherAI.reachable);
  const weatherAIStatus =
    weatherAI.status === null || weatherAI.status === undefined
      ? null
      : safeNumber(weatherAI.status, 0);

  let overallState: OperationsHealthState = 'healthy';
  let message = safeString(record.nextSteps, 'WeatherAI health check completed.');

  if (!envKeyValid || envKeyIsPlaceholder) {
    overallState = 'demo';
    message =
      'Demo mode: API key is missing, placeholder, or invalid format. Internal routes serve demo payloads.';
  } else if (!weatherAIReachable) {
    overallState = 'error';
    message = safeString(
      weatherAI.error,
      'WeatherAI is not reachable. Verify API key and network connectivity.'
    );
  } else if (weatherAIStatus !== null && weatherAIStatus !== 200) {
    overallState = 'degraded';
    message = `WeatherAI responded with status ${weatherAIStatus}. Some operations may be limited.`;
  } else {
    message = 'WeatherAI reachable with status 200. Production integration is active.';
  }

  const timestamp = safeString(record.timestamp, new Date().toISOString());

  return {
    envKeyExists,
    envKeyValid,
    envKeyHasCorrectFormat,
    envKeyIsPlaceholder,
    weatherAIReachable,
    weatherAIStatus,
    message,
    overallState,
    timestamp,
    lastChecked: timestamp,
  };
};

export const normalizeOperationsUsage = (response: unknown): NormalizedOperationsUsage | null => {
  if (!response || typeof response !== 'object') return null;

  const record = response as Record<string, unknown>;
  const demoMode = record.demoMode === true;
  const usageData = extractPayload(response);
  if (!usageData) return null;

  const plan = readPlanName(usageData);
  const planLower = plan.toLowerCase();
  const isFree = planLower.includes('free');

  const limits = (usageData.limits ?? usageData.quota ?? {}) as Record<string, unknown>;
  const remaining = (usageData.remaining ?? {}) as Record<string, unknown>;
  const usage = (usageData.usage ?? {}) as Record<string, unknown>;

  const requestsLimit = safeNumber(
    limits.monthly_limit ??
      limits.requests_limit ??
      limits.request_limit ??
      usageData.monthly_limit,
    10000
  );

  const requestsUsed = safeNumber(
    usage.monthly_used ??
      usage.month_to_date ??
      usage.requests_used ??
      limits.monthly_used ??
      usageData.monthly_used,
    0
  );

  const requestsRemaining = safeNumber(
    remaining.requests ??
      remaining.monthly ??
      limits.monthly_remaining ??
      usageData.monthly_remaining,
    Math.max(requestsLimit - requestsUsed, 0)
  );

  const aiRequestsLimit = safeNumber(
    limits.ai_requests_limit ??
      limits.monthly_ai_requests ??
      limits.ai_requests ??
      (isFree ? 200 : 5000),
    isFree ? 200 : 5000
  );

  const aiRequestsUsed = safeNumber(
    usage.ai_requests_used ?? usage.ai_used ?? remaining.ai_used ?? 0,
    0
  );

  const aiRequestsRemaining = safeNumber(
    remaining.ai_requests ?? limits.ai_requests_remaining ?? aiRequestsLimit - aiRequestsUsed,
    Math.max(aiRequestsLimit - aiRequestsUsed, 0)
  );

  const maxForecastDays = safeNumber(
    limits.forecast_days ?? limits.max_forecast_days ?? (isFree ? 7 : 14),
    isFree ? 7 : 14
  );

  const featureSources = [
    (usageData.features ?? {}) as Record<string, unknown>,
    (usageData.capabilities ?? {}) as Record<string, unknown>,
    limits,
    usageData,
  ];

  const webhooksEnabled = readFlag(featureSources, ['webhooks', 'webhook'], !isFree);
  const smsEnabled = readFlag(featureSources, ['sms', 'sms_alerts'], !isFree && planLower.includes('scale'));

  return {
    demoMode,
    plan,
    requestsUsed,
    requestsRemaining,
    requestsLimit,
    aiRequestsUsed,
    aiRequestsRemaining,
    aiRequestsLimit,
    resetDate: safeString(usage.reset_date ?? usage.billing_reset ?? limits.reset_date, ''),
    billingPeriod: safeString(usage.billing_period ?? usage.period ?? limits.billing_period, ''),
    maxForecastDays,
    webhooksEnabled,
    smsEnabled,
    todayUsage: safeNumber(usage.today, 0),
  };
};

export const normalizeRateLimit = (response: unknown): NormalizedRateLimit => {
  const meta = extractMeta(response);
  const payload = extractPayload(response);
  const payloadMeta = (payload?.meta ?? {}) as Record<string, unknown>;

  const rateLimit =
    (meta.rateLimit as Record<string, unknown> | undefined) ??
    (meta.ratelimit as Record<string, unknown> | undefined) ??
    (payloadMeta.ratelimit as Record<string, unknown> | undefined) ??
    (payloadMeta.rateLimit as Record<string, unknown> | undefined);

  if (!rateLimit) {
    return {
      available: false,
      source: 'Rate limit headers were not included in this response.',
    };
  }

  const limit = safeString(rateLimit.limit, '');
  const remaining = safeString(rateLimit.remaining, '');
  const reset = safeString(rateLimit.reset, '');

  if (!limit && !remaining && !reset) {
    return {
      available: false,
      source: 'Rate limit headers were not included in this response.',
    };
  }

  return {
    available: true,
    limit: limit || undefined,
    remaining: remaining || undefined,
    reset: reset || undefined,
    source: 'Response metadata (WeatherAI rate limit headers)',
  };
};

export const buildQuotaCards = (
  usage: NormalizedOperationsUsage | null,
  treeQuotaResponse: unknown
): QuotaCardModel[] => {
  const treeQuota = normalizeTreeQuotaResponse(treeQuotaResponse);
  if (
    treeQuotaResponse &&
    typeof treeQuotaResponse === 'object' &&
    (treeQuotaResponse as Record<string, unknown>).demoMode === true
  ) {
    treeQuota.demoMode = true;
  }
  const isFree = usage?.plan.toLowerCase().includes('free') ?? true;

  const weatherCard: QuotaCardModel = {
    id: 'weather-requests',
    title: 'Weather requests',
    used: usage?.requestsUsed,
    remaining: usage?.requestsRemaining,
    limit: usage?.requestsLimit,
    locked: false,
    note: usage?.demoMode
      ? 'Demo usage counters for presentation.'
      : 'Monthly WeatherAI request quota.',
  };

  const aiCard: QuotaCardModel = {
    id: 'ai-requests',
    title: 'AI requests',
    used: usage?.aiRequestsUsed,
    remaining: usage?.aiRequestsRemaining,
    limit: usage?.aiRequestsLimit,
    locked: false,
    note: usage?.demoMode
      ? 'Demo AI quota preview.'
      : `${usage?.aiRequestsLimit ?? 0} WeatherAI-assisted requests per billing period.`,
  };

  const treeLocked = !treeQuota.supported;
  const treeCard: QuotaCardModel = {
    id: 'tree-scans',
    title: 'Tree analysis scans',
    used: treeQuota.scansUsed,
    remaining: treeQuota.scansRemaining,
    limit: treeQuota.monthlyLimit,
    locked: treeLocked,
    requiredPlan: treeLocked ? 'Pro' : undefined,
    note: treeQuota.demoMode
      ? 'Demo tree quota active for Tree & Canopy Lab.'
      : treeQuota.message || 'Canopy analysis scan allowance.',
  };

  const forecastCard: QuotaCardModel = {
    id: 'forecast-days',
    title: 'Forecast days',
    limit: usage?.maxForecastDays ?? 7,
    locked: (usage?.maxForecastDays ?? 7) < 14,
    requiredPlan: (usage?.maxForecastDays ?? 7) < 14 ? 'Pro' : undefined,
    note:
      (usage?.maxForecastDays ?? 7) < 14
        ? 'Locked on current plan — extended 14-day forecast requires Pro.'
        : 'Extended forecast window enabled on current plan.',
  };

  const webhookCard: QuotaCardModel = {
    id: 'webhooks',
    title: 'Webhooks',
    locked: !usage?.webhooksEnabled,
    requiredPlan: 'Pro',
    note: usage?.webhooksEnabled
      ? 'Webhook delivery enabled for alert integrations.'
      : 'Locked on current plan — webhook alerts require Pro.',
  };

  const smsCard: QuotaCardModel = {
    id: 'sms',
    title: 'SMS',
    locked: !usage?.smsEnabled,
    requiredPlan: 'Scale',
    note: usage?.smsEnabled
      ? 'SMS alert delivery enabled.'
      : 'Locked on current plan — SMS alerts require Scale.',
  };

  if (isFree && !usage?.webhooksEnabled) {
    webhookCard.locked = true;
  }
  if (isFree && !usage?.smsEnabled) {
    smsCard.locked = true;
  }

  return [weatherCard, aiCard, treeCard, forecastCard, webhookCard, smsCard];
};

const statusFromContext = (
  opts: {
    demoMode: boolean;
    keyValid: boolean;
    reachable: boolean;
    locked?: boolean;
    routeExists?: boolean;
  }
): IntegrationStatusValue => {
  if (opts.locked) return 'locked';
  if (!opts.keyValid) return 'demo';
  if (!opts.reachable) return 'error';
  if (opts.demoMode) return 'demo';
  if (opts.routeExists === false) return 'not-tested';
  return 'active';
};

export const buildIntegrationMatrix = (
  health: NormalizedOperationsHealth | null,
  usage: NormalizedOperationsUsage | null
): IntegrationRow[] => {
  const demoMode = usage?.demoMode || health?.overallState === 'demo';
  const keyValid = health?.envKeyValid ?? false;
  const reachable = health?.weatherAIReachable ?? false;
  const isFree = usage?.plan.toLowerCase().includes('free') ?? true;

  const weatherStatus = statusFromContext({ demoMode, keyValid, reachable, routeExists: true });
  const usageStatus = statusFromContext({ demoMode, keyValid, reachable, routeExists: true });

  return [
    {
      id: 'current-weather',
      name: 'Current weather',
      route: '/api/weather/current',
      requiredPlan: 'Free',
      status: weatherStatus,
      note: 'Powers dashboard, alerts, and risk scoring.',
    },
    {
      id: 'forecast',
      name: 'Forecast',
      route: '/api/weather/forecast',
      requiredPlan: 'Free',
      status: weatherStatus,
      note: 'Multi-day forecast for command center cards.',
    },
    {
      id: 'daily',
      name: 'Daily forecast',
      route: '/api/weather/daily',
      requiredPlan: 'Free',
      status: weatherStatus,
      note: 'Used by planner and alert previews.',
    },
    {
      id: 'hourly',
      name: 'Hourly forecast',
      route: '/api/weather/hourly',
      requiredPlan: 'Free',
      status: weatherStatus,
      note: 'Field Planner hourly operation windows.',
    },
    {
      id: 'geo',
      name: 'Geo weather',
      route: '/api/weather/geo',
      requiredPlan: 'Free',
      status: statusFromContext({ demoMode, keyValid, reachable, routeExists: true }),
      note: 'Location lookup for farm coordinates.',
    },
    {
      id: 'usage',
      name: 'Usage analytics',
      route: '/api/usage',
      requiredPlan: 'Free',
      status: usageStatus,
      note: 'Plan, quota, and rate limit telemetry.',
    },
    {
      id: 'tree-analyze',
      name: 'Tree analysis',
      route: '/api/trees/analyze',
      requiredPlan: 'Starter+',
      status: statusFromContext({ demoMode, keyValid, reachable }),
      note: 'Canopy analysis uploads in Tree & Canopy Lab.',
    },
    {
      id: 'tree-history',
      name: 'Tree history',
      route: '/api/trees/history',
      requiredPlan: 'Starter+',
      status: statusFromContext({ demoMode, keyValid, reachable }),
      note: 'Historical canopy scan records.',
    },
    {
      id: 'tree-quota',
      name: 'Tree quota',
      route: '/api/trees/quota',
      requiredPlan: 'Starter+',
      status: usageStatus,
      note: 'Scan limits for tree analysis.',
    },
    {
      id: 'forestry-count',
      name: 'Forestry count',
      route: '/api/forestry/count',
      requiredPlan: 'Pro',
      status: isFree
        ? 'locked'
        : statusFromContext({ demoMode, keyValid, reachable, locked: isFree }),
      note: isFree ? 'Forestry batch counting requires Pro.' : 'Batch tree counting endpoint.',
    },
    {
      id: 'alert-previews',
      name: 'Alert rule previews',
      route: '/alerts',
      requiredPlan: 'Free',
      status: weatherStatus,
      note: 'Local in-app alert evaluation (no webhook/SMS delivery on Free).',
    },
    {
      id: 'webhooks',
      name: 'Webhooks',
      route: 'WeatherAI webhooks',
      requiredPlan: 'Pro',
      status: usage?.webhooksEnabled
        ? 'available'
        : 'locked',
      note: usage?.webhooksEnabled
        ? 'Webhook channel available on current plan.'
        : 'Locked on current plan.',
    },
    {
      id: 'sms',
      name: 'SMS alerts',
      route: 'WeatherAI SMS',
      requiredPlan: 'Scale',
      status: usage?.smsEnabled ? 'available' : 'locked',
      note: usage?.smsEnabled ? 'SMS delivery available on current plan.' : 'Locked on current plan.',
    },
  ];
};

export const buildApiHealthCards = (
  health: NormalizedOperationsHealth | null,
  usage: NormalizedOperationsUsage | null
): ApiHealthModel[] => {
  const lastChecked = health?.lastChecked;
  const demoMode = usage?.demoMode || health?.overallState === 'demo';

  const weatherState: ApiHealthState = !health?.envKeyValid
    ? 'limited'
    : !health.weatherAIReachable
      ? 'error'
      : demoMode
        ? 'limited'
        : 'healthy';

  const usageState: ApiHealthState = !usage
    ? 'error'
    : demoMode
      ? 'limited'
      : 'healthy';

  const treeState: ApiHealthState = demoMode ? 'limited' : health?.weatherAIReachable ? 'healthy' : 'error';

  const alertState: ApiHealthState =
    !usage?.webhooksEnabled || !usage?.smsEnabled ? 'limited' : 'healthy';

  const planState: ApiHealthState =
    !usage?.webhooksEnabled && !usage?.smsEnabled && (usage?.maxForecastDays ?? 7) < 14
      ? 'locked'
      : usage
        ? 'healthy'
        : 'error';

  return [
    {
      id: 'weather-api',
      title: 'Weather API',
      state: weatherState,
      explanation:
        weatherState === 'healthy'
          ? 'Current, forecast, daily, and hourly routes are ready via secure server proxy.'
          : weatherState === 'limited'
            ? 'Serving demo or partially limited weather payloads.'
            : 'Weather proxy unreachable — check API key and connectivity.',
      lastChecked,
    },
    {
      id: 'usage-api',
      title: 'Usage API',
      state: usageState,
      explanation:
        usageState === 'healthy'
          ? 'Usage and quota metadata available for operations monitoring.'
          : usageState === 'limited'
            ? 'Demo usage data — configure WEATHER_AI_API_KEY for live quotas.'
            : 'Unable to load usage analytics.',
      lastChecked,
    },
    {
      id: 'tree-api',
      title: 'Tree API',
      state: treeState,
      explanation:
        treeState === 'healthy'
          ? 'Tree analyze, history, and quota routes are integrated.'
          : 'Tree endpoints may be in demo mode or unavailable.',
      lastChecked,
    },
    {
      id: 'alert-features',
      title: 'Alert features',
      state: alertState,
      explanation:
        alertState === 'limited'
          ? 'In-app alert previews active; webhook/SMS delivery locked on current plan.'
          : 'Full alert delivery channels available.',
      lastChecked,
    },
    {
      id: 'plan-features',
      title: 'Plan features',
      state: planState,
      explanation:
        planState === 'locked'
          ? 'Some plan features (webhooks, SMS, 14-day forecast) require upgrade.'
          : 'Current plan supports configured feature set.',
      lastChecked,
    },
  ];
};

export const buildOperationsSnapshot = (
  healthResponse: unknown,
  usageResponse: unknown,
  treeQuotaResponse: unknown,
  errors: Record<string, string> = {}
): OperationsSnapshot => {
  const health = normalizeOperationsHealth(healthResponse);
  const usage = normalizeOperationsUsage(usageResponse);
  const rateLimit = normalizeRateLimit(usageResponse);
  const demoMode = Boolean(usage?.demoMode || health?.overallState === 'demo');

  return {
    health,
    usage,
    rateLimit,
    quotas: buildQuotaCards(usage, treeQuotaResponse),
    integrations: buildIntegrationMatrix(health, usage),
    apiHealth: buildApiHealthCards(health, usage),
    demoMode,
    lastRefreshed: new Date().toISOString(),
    errors,
  };
};
