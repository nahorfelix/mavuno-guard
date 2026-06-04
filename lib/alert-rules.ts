// Plan-aware states prevent the UI from pretending locked WeatherAI features are available.

import type {
  AlertPreview,
  AlertRule,
  AlertRuleMeta,
  PlanCapabilities,
  WeatherCurrentData,
  WeatherDailyItem,
} from '@/types/alerts';

const normalizePayload = <T>(response: unknown): T | null => {
  if (!response || typeof response !== 'object') return null;
  const record = response as Record<string, unknown>;
  if ('payload' in record) return record.payload as T;
  if ('data' in record) return record.data as T;
  return response as T;
};

export const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'default-heavy-rain',
    type: 'heavy rain',
    label: 'Heavy rain above 60%',
    location: 'Farm field',
    threshold: 60,
    channel: 'in-app',
    status: 'active',
  },
  {
    id: 'default-strong-wind',
    type: 'strong wind',
    label: 'Wind speed above 20 km/h',
    location: 'Farm field',
    threshold: 20,
    channel: 'in-app',
    status: 'active',
  },
  {
    id: 'default-heat-stress',
    type: 'heat stress',
    label: 'Heat above 30°C',
    location: 'Farm field',
    threshold: 30,
    channel: 'in-app',
    status: 'active',
  },
  {
    id: 'default-fertilizer',
    type: 'fertilizer warning',
    label: 'Humidity above 80%',
    location: 'Farm field',
    threshold: 80,
    channel: 'in-app',
    status: 'active',
  },
  {
    id: 'default-spraying',
    type: 'spraying window',
    label: 'Good spraying window',
    location: 'Farm field',
    threshold: 30,
    channel: 'in-app',
    status: 'active',
  },
];

export const normalizePlanCapabilities = (response: unknown): PlanCapabilities | null => {
  if (!response || typeof response !== 'object') return null;

  const record = response as Record<string, unknown>;
  const demoMode = record.demoMode === true;
  const usageData = (demoMode ? record.data : record.payload) as Record<string, unknown> | undefined;

  if (!usageData) return null;

  const planRaw =
    (usageData.plan as Record<string, unknown> | undefined)?.name ??
    (usageData.plan as Record<string, unknown> | undefined)?.tier ??
    usageData.plan ??
    'free';

  const plan = String(planRaw);
  const planLower = plan.toLowerCase();
  const limits = (usageData.limits ?? usageData.quota ?? {}) as Record<string, unknown>;
  const features = (usageData.features ?? usageData.capabilities ?? {}) as Record<string, unknown>;

  const readFlag = (keys: string[], fallback: boolean) => {
    for (const key of keys) {
      if (key in features) return Boolean(features[key]);
      if (key in usageData) return Boolean(usageData[key]);
      if (key in limits) return Boolean(limits[key]);
    }
    return fallback;
  };

  const isFree = planLower.includes('free');
  const webhooks = readFlag(['webhooks', 'webhook'], !isFree);
  const sms = readFlag(['sms', 'sms_alerts'], !isFree && planLower.includes('scale'));

  const maxForecastDays = Number(
    limits.forecast_days ??
      limits.max_forecast_days ??
      usageData.max_forecast_days ??
      (isFree ? 7 : 14)
  );

  const aiRequestsRemaining = Number(
    limits.ai_requests_remaining ??
      limits.ai_requests ??
      limits.monthly_ai_requests ??
      (isFree ? 200 : 5000)
  );

  return {
    plan,
    webhooks,
    sms,
    maxForecastDays: Number.isFinite(maxForecastDays) ? maxForecastDays : 7,
    aiRequestsRemaining: Number.isFinite(aiRequestsRemaining) ? aiRequestsRemaining : 200,
  };
};

export const getPlanLimitationMessage = (status: number, message?: string) => {
  if (status === 403) {
    return message || 'This feature is not available on your current WeatherAI plan.';
  }
  return message || 'Unable to load plan capabilities right now.';
};

export const isChannelAvailable = (
  channel: AlertRule['channel'],
  capabilities: PlanCapabilities | null
) => {
  if (channel === 'in-app') return true;
  if (channel === 'webhook') return Boolean(capabilities?.webhooks);
  if (channel === 'sms') return Boolean(capabilities?.sms);
  return false;
};

const buildTitle = (rule: AlertRule) => {
  switch (rule.type) {
    case 'heavy rain':
      return `Heavy rain above ${rule.threshold}%`;
    case 'strong wind':
      return `Wind speed above ${rule.threshold} km/h`;
    case 'heat stress':
      return `Heat above ${rule.threshold}°C`;
    case 'frost risk':
      return `Frost risk below ${rule.threshold}°C`;
    case 'irrigation reminder':
      return `Irrigation reminder when temp > ${rule.threshold}°C`;
    case 'fertilizer warning':
      return `Humidity above ${rule.threshold}%`;
    case 'spraying window':
      return `Good spraying window when rain < ${rule.threshold}% and wind < 15 km/h`;
    default:
      return rule.label;
  }
};

const buildCondition = (rule: AlertRule) => {
  switch (rule.type) {
    case 'heavy rain':
      return `Rain chance > ${rule.threshold}%`;
    case 'strong wind':
      return `Wind speed > ${rule.threshold} km/h`;
    case 'heat stress':
      return `Temperature > ${rule.threshold}°C`;
    case 'frost risk':
      return `Temperature <= ${rule.threshold}°C`;
    case 'irrigation reminder':
      return `Temperature > ${rule.threshold}°C and low rain risk`;
    case 'fertilizer warning':
      return `Humidity > ${rule.threshold}%`;
    case 'spraying window':
      return `Rain risk < ${rule.threshold}% and wind < 15 km/h`;
    default:
      return 'Custom condition';
  }
};

const buildRecommendation = (rule: AlertRule) => {
  switch (rule.type) {
    case 'heavy rain':
      return 'Delay fertilizer application and inspect drainage.';
    case 'strong wind':
      return 'Avoid pesticide spraying and secure lightweight equipment.';
    case 'heat stress':
      return 'Schedule irrigation early morning or evening.';
    case 'frost risk':
      return 'Cover tender seedlings and delay planting sensitive crops.';
    case 'irrigation reminder':
      return 'Water crops before the hottest part of the day.';
    case 'fertilizer warning':
      return 'Monitor fungal disease risk and adjust spray timing.';
    case 'spraying window':
      return 'Apply sprays while wind is calm and rain risk is low.';
    default:
      return 'Review field conditions and take action as needed.';
  }
};

const buildRiskLevel = (triggered: boolean, rule: AlertRule): AlertPreview['riskLevel'] => {
  if (!triggered) return 'low';
  switch (rule.type) {
    case 'heavy rain':
    case 'strong wind':
    case 'heat stress':
    case 'frost risk':
      return 'high';
    case 'fertilizer warning':
    case 'spraying window':
    case 'irrigation reminder':
      return 'medium';
    default:
      return 'medium';
  }
};

export const getRuleMeta = (rule: AlertRule, triggered = false): AlertRuleMeta => ({
  name: buildTitle(rule),
  condition: buildCondition(rule),
  recommendation: buildRecommendation(rule),
  riskLevel: buildRiskLevel(triggered, rule),
});

const getRainProbability = (current: Record<string, unknown>) =>
  Number(
    current.precipitation_probability ??
      current.precipitation_chance ??
      current.rain_probability ??
      current.precipitation ??
      current.precip ??
      0
  );

const getCurrentWeather = (response: unknown): WeatherCurrentData | null => {
  const payload = normalizePayload<Record<string, unknown>>(response);
  if (!payload?.current) return null;

  const current = payload.current as Record<string, unknown>;

  return {
    temperature: Number(current.temperature ?? current.temp ?? 0),
    feelsLike: Number(current.feels_like ?? current.feelsLike ?? current.temp ?? 0),
    humidity: Number(current.humidity ?? 0),
    windSpeed: Number(current.wind_speed ?? current.windSpeed ?? 0),
    precipitation: getRainProbability(current),
    condition: String(current.condition ?? current.description ?? 'Unknown'),
  };
};

const getDailyForecast = (response: unknown): WeatherDailyItem[] => {
  const payload = normalizePayload<Record<string, unknown>>(response);
  if (!payload?.daily || !Array.isArray(payload.daily)) return [];

  return payload.daily.map((item: Record<string, unknown>, index: number) => ({
    date: String(item.date ?? `Day ${index + 1}`),
    maxTemp: Number(item.max_temp ?? item.maxTemp ?? 0),
    minTemp: Number(item.min_temp ?? item.minTemp ?? 0),
    humidity: Number(item.humidity ?? 0),
    windSpeed: Number(item.wind_speed ?? item.windSpeed ?? 0),
    description: String(item.description ?? item.summary ?? 'Forecast available'),
    precipitation: Number(
      item.precipitation_probability ??
        item.precipitation_chance ??
        item.precipitation ??
        item.precip ??
        0
    ),
  }));
};

const evaluateRuleTrigger = (rule: AlertRule, weather: WeatherCurrentData) => {
  switch (rule.type) {
    case 'heavy rain':
      return weather.precipitation > rule.threshold;
    case 'strong wind':
      return weather.windSpeed > rule.threshold;
    case 'heat stress':
      return weather.temperature > rule.threshold;
    case 'frost risk':
      return weather.temperature <= rule.threshold;
    case 'irrigation reminder':
      return weather.temperature > rule.threshold && weather.precipitation < 30;
    case 'fertilizer warning':
      return weather.humidity > rule.threshold;
    case 'spraying window':
      return weather.precipitation < rule.threshold && weather.windSpeed < 15;
    default:
      return false;
  }
};

export const buildAlertPreview = (rule: AlertRule, weather: WeatherCurrentData): AlertPreview => {
  const triggered = evaluateRuleTrigger(rule, weather);
  return {
    ruleId: rule.id,
    title: buildTitle(rule),
    condition: buildCondition(rule),
    triggered,
    riskLevel: buildRiskLevel(triggered, rule),
    recommendation: buildRecommendation(rule),
  };
};

export const evaluateAlertRules = (
  rules: AlertRule[],
  currentResponse: unknown,
  dailyResponse: unknown
) => {
  const current = getCurrentWeather(currentResponse);
  const daily = getDailyForecast(dailyResponse);

  if (!current) {
    return { triggered: [], notTriggered: [], current: null, daily };
  }

  const activeRules = rules.filter((rule) => rule.status === 'active');
  const previews = activeRules.map((rule) => buildAlertPreview(rule, current));

  return {
    current,
    daily,
    triggered: previews.filter((item) => item.triggered),
    notTriggered: previews.filter((item) => !item.triggered),
  };
};
