import {
  NormalizedTreeAnalysis,
  NormalizedTreeHistoryItem,
  NormalizedTreeQuota,
  NormalizedForestryCount,
} from '@/types/trees';

const resolveField = <T>(source: Record<string, unknown>, keys: string[], fallback: T | undefined): T | undefined => {
  for (const key of keys) {
    if (key in source && source[key] !== undefined && source[key] !== null) {
      return source[key] as T;
    }
  }
  return fallback;
};

const stringOrNumber = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
};

const parseNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace('%', '').trim());
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

const getPayload = <T>(response: any): T | null => {
  if (!response || typeof response !== 'object') return null;
  if ('payload' in response) {
    return response.payload as T;
  }
  if ('data' in response) {
    return response.data as T;
  }
  return response as T;
};

export const normalizeTreeAnalyzeResponse = (response: unknown): NormalizedTreeAnalysis | null => {
  const payload = getPayload<any>(response);
  if (!payload) return null;

  const treeCount = parseNumber(resolveField(payload, ['tree_count', 'count', 'trees'], 0));
  const densityPerAcre = parseNumber(resolveField(payload, ['density_per_acre', 'density', 'trees_per_acre'], 0));
  const canopyCoverage = parseNumber(resolveField(payload, ['canopy_coverage', 'coverage'], 0));
  const confidenceScore = parseNumber(resolveField(payload, ['confidence_score', 'confidence'], 0));

  const healthBreakdown = {
    healthyTrees: parseNumber(resolveField(payload, ['healthy_trees', 'healthy'], 0)),
    needingCare: parseNumber(resolveField(payload, ['needing_care', 'needs_care', 'care_needed'], 0)),
    needingReplacement: parseNumber(resolveField(payload, ['needing_replacement', 'replacement_needed'], 0)),
  };

  const observations = Array.isArray(payload.observations)
    ? payload.observations.map((item: unknown) => String(item))
    : stringOrNumber(payload.observations)
        .split('\n')
        .filter(Boolean);

  const recommendations = Array.isArray(payload.recommendations)
    ? payload.recommendations.map((item: unknown) => String(item))
    : stringOrNumber(payload.recommendations)
        .split('\n')
        .filter(Boolean);

  return {
    demoMode: Boolean(payload.demoMode || payload.demo_mode || false),
    treeCount,
    densityPerAcre,
    canopyCoverage,
    confidenceScore,
    healthBreakdown,
    observations,
    recommendations,
    overlayImageUrl: resolveField<string>(payload, ['overlay_image_url', 'overlayUrl', 'overlay'], undefined),
  };
};

export const normalizeTreeHistoryResponse = (response: unknown): NormalizedTreeHistoryItem[] => {
  const payload = getPayload<any>(response);
  if (!payload) return [];

  const history = Array.isArray(payload.history) ? payload.history : Array.isArray(payload.items) ? payload.items : [];

  return history.map((item: any) => ({
    date: stringOrNumber(resolveField(item, ['date', 'timestamp', 'created_at'], 'Unknown date')),
    location: stringOrNumber(resolveField(item, ['location', 'site', 'area'], 'Unknown location')), 
    county: stringOrNumber(resolveField(item, ['county', 'region', 'district'], '')),
    treeCount: parseNumber(resolveField(item, ['tree_count', 'count', 'trees'], 0)),
    canopyCoverage: parseNumber(resolveField(item, ['canopy_coverage', 'coverage'], 0)),
    status: stringOrNumber(resolveField(item, ['status', 'result', 'health_status'], 'Completed')),
  }));
};

export const normalizeTreeQuotaResponse = (response: unknown): NormalizedTreeQuota => {
  const payload = getPayload<any>(response);

  const plan = stringOrNumber(resolveField(payload || {}, ['plan', 'tier', 'subscription'], 'Unknown'));
  const scansUsed = parseNumber(resolveField(payload || {}, ['scans_used', 'used', 'scans'], 0));
  const scansRemaining = parseNumber(resolveField(payload || {}, ['scans_remaining', 'remaining', 'available'], 0));
  const monthlyLimit = parseNumber(resolveField(payload || {}, ['monthly_limit', 'limit', 'quota'], undefined), undefined);
  const supported = resolveField(payload || {}, ['supported', 'enabled', 'available'], true) as boolean;
  const message = stringOrNumber(resolveField(payload || {}, ['message', 'note', 'status'], ''));

  return {
    demoMode: Boolean(payload?.demoMode || payload?.demo_mode || false),
    plan,
    scansUsed,
    scansRemaining,
    monthlyLimit: monthlyLimit || undefined,
    supported,
    message: message || undefined,
  };
};

export const normalizeForestryCountResponse = (response: unknown): NormalizedForestryCount | null => {
  const payload = getPayload<any>(response);
  if (!payload) return null;

  const treeCount = parseNumber(resolveField(payload, ['tree_count', 'count', 'trees'], 0));
  const densityPerAcre = parseNumber(resolveField(payload, ['density_per_acre', 'density', 'trees_per_acre'], 0));
  const canopyCoverage = parseNumber(resolveField(payload, ['canopy_coverage', 'coverage'], 0));
  const confidenceScore = parseNumber(resolveField(payload, ['confidence_score', 'confidence'], 0));
  const supported = resolveField(payload, ['supported', 'enabled', 'available'], true) as boolean;
  const message = stringOrNumber(resolveField(payload, ['message', 'note', 'status'], ''));

  return {
    demoMode: Boolean(payload.demoMode || payload.demo_mode || false),
    treeCount,
    densityPerAcre,
    canopyCoverage,
    confidenceScore,
    supported,
    message: message || undefined,
  };
};
