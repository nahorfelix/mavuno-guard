/**
 * Farm Recommendations Engine
 * Converts weather conditions into actionable farm operations
 */

import type { FarmRecommendation, NormalizedWeatherData } from '@/types/dashboard';

/**
 * Generate farm recommendations based on current and forecast weather
 */
export const generateFarmRecommendations = (
  weatherData: NormalizedWeatherData | null
): FarmRecommendation[] => {
  if (!weatherData) {
    return [];
  }

  const recommendations: FarmRecommendation[] = [];
  const current = weatherData.current;

  // High rain risk
  if ((current.precipitation || 0) > 50 || (weatherData.forecast[0]?.precipitationChance || 0) > 60) {
    recommendations.push({
      category: 'FERTILIZING',
      action: 'Delay fertilizer application - rain will wash it off fields',
      urgency: 'HIGH',
      emoji: '⏸️',
    });
    recommendations.push({
      category: 'DRAINAGE',
      action: 'Inspect and clear drainage systems before heavy rain',
      urgency: 'HIGH',
      emoji: '🔍',
    });
  }

  // High wind
  if ((current.windSpeed || 0) > 15) {
    recommendations.push({
      category: 'SPRAYING',
      action: 'Avoid pesticide and herbicide spraying - wind will drift chemicals',
      urgency: 'HIGH',
      emoji: '🚫',
    });
  } else if ((current.windSpeed || 0) > 10) {
    recommendations.push({
      category: 'SPRAYING',
      action: 'Wind conditions are marginal for spraying - proceed with caution',
      urgency: 'MEDIUM',
      emoji: '⚠️',
    });
  } else if ((current.windSpeed || 0) <= 5) {
    recommendations.push({
      category: 'SPRAYING',
      action: 'Calm conditions - good opportunity for pesticide or herbicide application',
      urgency: 'MEDIUM',
      emoji: '✅',
    });
  }

  // High heat
  if ((current.temperature || 0) > 32) {
    recommendations.push({
      category: 'IRRIGATION',
      action: 'Increase irrigation - high heat increases evapotranspiration',
      urgency: 'HIGH',
      emoji: '💧',
    });
    recommendations.push({
      category: 'LABOUR',
      action: 'Schedule labor-intensive work for early morning or late evening to avoid heat stress',
      urgency: 'HIGH',
      emoji: '🌅',
    });
  } else if ((current.temperature || 0) > 28) {
    recommendations.push({
      category: 'IRRIGATION',
      action: 'Monitor soil moisture closely - consider supplementary irrigation',
      urgency: 'MEDIUM',
      emoji: '💦',
    });
  } else if ((current.temperature || 0) < 10) {
    recommendations.push({
      category: 'LABOUR',
      action: 'Provide appropriate protective equipment for outdoor work in cool conditions',
      urgency: 'MEDIUM',
      emoji: '🧥',
    });
  }

  // High humidity
  if ((current.humidity || 0) > 80) {
    recommendations.push({
      category: 'DISEASE',
      action: 'High humidity increases fungal disease risk - monitor crops closely and consider fungicide application',
      urgency: 'HIGH',
      emoji: '🍄',
    });
  } else if ((current.humidity || 0) > 70) {
    recommendations.push({
      category: 'DISEASE',
      action: 'Elevated humidity - watch for fungal diseases in susceptible crops',
      urgency: 'MEDIUM',
      emoji: '👀',
    });
  }

  // Calm conditions for general work
  if (
    (current.windSpeed || 0) <= 5 &&
    (current.humidity || 0) < 70 &&
    (current.temperature || 0) >= 15 &&
    (current.temperature || 0) <= 28 &&
    (current.precipitation || 0) <= 30
  ) {
    recommendations.push({
      category: 'LABOUR',
      action: 'Favorable conditions for general field work and maintenance tasks',
      urgency: 'MEDIUM',
      emoji: '🚜',
    });
  }

  // Remove duplicates by category and urgency
  const unique = Array.from(
    new Map(
      recommendations.map((r) => [
        `${r.category}-${r.urgency}`,
        r,
      ])
    ).values()
  );

  return unique.slice(0, 5); // Max 5 recommendations
};

/**
 * Get recommendation priority order for display
 */
export const prioritizeRecommendations = (
  recommendations: FarmRecommendation[]
): FarmRecommendation[] => {
  const urgencyOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  return [...recommendations].sort(
    (a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
  );
};

/**
 * Get recommendation badge color
 */
export const getRecommendationColor = (
  category: FarmRecommendation['category']
): string => {
  const colors = {
    IRRIGATION: 'bg-blue-100 text-blue-900 border-blue-300',
    SPRAYING: 'bg-purple-100 text-purple-900 border-purple-300',
    FERTILIZING: 'bg-amber-100 text-amber-900 border-amber-300',
    LABOUR: 'bg-green-100 text-green-900 border-green-300',
    DRAINAGE: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    DISEASE: 'bg-red-100 text-red-900 border-red-300',
  };
  return colors[category];
};

/**
 * Format recommendation for display
 */
export const formatRecommendation = (rec: FarmRecommendation): string => {
  return `${rec.emoji} ${rec.action}`;
};
