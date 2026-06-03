/**
 * Usage Data Normalizer
 * Converts different usage response shapes to a consistent format
 */

import type { NormalizedUsageData } from '@/types/dashboard';

export const normalizeUsageResponse = (response: any): NormalizedUsageData | null => {
  if (!response) {
    return null;
  }

  // Determine if demo mode
  const demoMode = response.demoMode === true;
  const usageData = demoMode ? response.data : response.payload;

  if (!usageData) {
    return null;
  }

  // Extract quota information
  const quota = usageData.quota || usageData.limits || {};
  const monthlyLimit = quota.monthly_limit || 10000;
  const monthlyUsed = quota.monthly_used || 0;
  const monthlyRemaining = quota.monthly_remaining || monthlyLimit - monthlyUsed;

  // Extract usage information
  const usage = usageData.usage || {};
  const todayUsage = usage.today || 0;
  const resetDate = usage.reset_date || getNextMonthDate();

  // Extract plan information
  const plan = usageData.plan?.name || usageData.plan?.tier || 'Unknown';

  // Determine plan limitations
  const isFree = plan.toLowerCase().includes('free') || plan.toLowerCase() === 'free tier';
  const forecastDays = usageData.limits?.forecast_days || (isFree ? 7 : 14);
  const aiRequests = usageData.limits?.ai_requests || (isFree ? 200 : 5000);
  const webhooksAvailable = isFree ? false : true;
  const smsAvailable = isFree ? false : true;

  return {
    demoMode,
    plan,
    monthlyLimit,
    monthlyUsed,
    monthlyRemaining,
    todayUsage,
    resetDate,
    forecastDays,
    aiRequests,
    webhooksAvailable,
    smsAvailable,
  };
};

/**
 * Get next month's first day as reset date
 */
const getNextMonthDate = (): string => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString().split('T')[0];
};

/**
 * Check if usage data is valid
 */
export const isValidUsageData = (data: NormalizedUsageData | null): boolean => {
  return !!(data && data.monthlyLimit > 0);
};
