// Weighted risk scoring from current weather readings for the command center.

import type { RiskScore } from '@/types/dashboard';

type WeatherFactors = {
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  precipitationChance?: number;
  uvIndex?: number;
};

/**
 * Calculate farm risk score (0-100)
 * Risk levels: LOW (0-29), MEDIUM (30-59), HIGH (60-79), CRITICAL (80-100)
 */
export const calculateRiskScore = (factors: WeatherFactors): RiskScore => {
  const scores = {
    rain: calculateRainRisk(factors.precipitationChance),
    wind: calculateWindRisk(factors.windSpeed),
    temperature: calculateTemperatureRisk(factors.temperature),
    humidity: calculateHumidityRisk(factors.humidity),
    uv: factors.uvIndex ? calculateUVRisk(factors.uvIndex) : 0,
  };

  // Weighted average
  const weights = {
    rain: 0.25,
    wind: 0.20,
    temperature: 0.20,
    humidity: 0.20,
    uv: 0.15,
  };

  const overall = Math.round(
    scores.rain * weights.rain +
      scores.wind * weights.wind +
      scores.temperature * weights.temperature +
      scores.humidity * weights.humidity +
      scores.uv * weights.uv
  );

  const level =
    overall < 30 ? 'LOW' : overall < 60 ? 'MEDIUM' : overall < 80 ? 'HIGH' : 'CRITICAL';

  const explanations = generateRiskExplanations(factors);

  return {
    overall: Math.min(100, Math.max(0, overall)),
    level,
    factors: scores,
    explanations,
  };
};

/**
 * Rain risk: High precipitation increases disease risk and affects field work
 * 0% = 0 risk, 100% = 100 risk
 */
const calculateRainRisk = (precipitation?: number): number => {
  if (precipitation === undefined || precipitation === null) return 0;
  return precipitation; // Direct mapping
};

/**
 * Wind risk: High wind affects spraying and causes crop damage
 * Low wind (0-5): 0 risk
 * Medium (5-15): 30-50 risk (difficult operations)
 * High (15-25): 60-80 risk (dangerous operations)
 * Very high (25+): 90-100 risk (halt operations)
 */
const calculateWindRisk = (windSpeed?: number): number => {
  if (windSpeed === undefined || windSpeed === null) return 0;

  if (windSpeed < 5) return 0;
  if (windSpeed < 10) return 30;
  if (windSpeed < 15) return 50;
  if (windSpeed < 20) return 70;
  if (windSpeed < 25) return 85;
  return 100;
};

/**
 * Temperature risk: Both extreme heat and cold affect crops
 * Optimal: 15-25°C (0 risk)
 * Warm: 25-35°C (moderate risk, heat stress)
 * Hot: 35°C+ (high risk, severe heat stress)
 * Cold: Below 5°C (frost damage risk)
 */
const calculateTemperatureRisk = (temp?: number): number => {
  if (temp === undefined || temp === null) return 0;

  if (temp >= 15 && temp <= 25) return 0;
  if (temp < 5) return 60; // Frost risk
  if (temp >= 5 && temp < 15) return 20; // Too cool
  if (temp > 25 && temp <= 30) return 25; // Warm
  if (temp > 30 && temp <= 35) return 50; // Hot
  if (temp > 35) return 80; // Very hot
  return 0;
};

/**
 * Humidity risk: High humidity increases fungal diseases
 * Low (< 40%): 0 risk
 * Medium (40-60%): 10 risk (acceptable)
 * High (60-80%): 50 risk (fungal disease risk)
 * Very high (80%+): 100 risk (severe fungal disease risk)
 */
const calculateHumidityRisk = (humidity?: number): number => {
  if (humidity === undefined || humidity === null) return 0;

  if (humidity < 40) return 0;
  if (humidity <= 60) return 10;
  if (humidity <= 80) return 60;
  return 100;
};

/**
 * UV Index risk: High UV affects worker safety
 * 0-2: 0 risk (low)
 * 3-5: 20 risk (moderate)
 * 6-7: 40 risk (high)
 * 8-10: 70 risk (very high)
 * 11+: 100 risk (extreme)
 */
const calculateUVRisk = (uvIndex?: number): number => {
  if (uvIndex === undefined || uvIndex === null) return 0;

  if (uvIndex <= 2) return 0;
  if (uvIndex <= 5) return 20;
  if (uvIndex <= 7) return 40;
  if (uvIndex <= 10) return 70;
  return 100;
};

/**
 * Generate human-readable risk explanations
 */
const generateRiskExplanations = (
  factors: WeatherFactors
): string[] => {
  const explanations: string[] = [];

  if ((factors.precipitationChance || 0) > 50) {
    explanations.push('High rain probability increases disease risk');
  }

  if ((factors.windSpeed || 0) > 15) {
    explanations.push('Strong winds may damage crops and affect operations');
  }

  if ((factors.temperature || 0) > 35) {
    explanations.push('High temperature increases heat stress on crops');
  } else if ((factors.temperature || 0) < 5) {
    explanations.push('Low temperature risk of frost damage');
  }

  if ((factors.humidity || 0) > 75) {
    explanations.push('High humidity increases fungal disease risk');
  }

  if ((factors.uvIndex || 0) > 8) {
    explanations.push('Extreme UV: limit outdoor labor time');
  }

  if (explanations.length === 0) {
    explanations.push('Favorable conditions for most farm operations');
  }

  return explanations;
};

/**
 * Get risk level color for UI
 */
export const getRiskLevelColor = (
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
): string => {
  const colors = {
    LOW: 'bg-green-500 text-white',
    MEDIUM: 'bg-yellow-500 text-white',
    HIGH: 'bg-orange-500 text-white',
    CRITICAL: 'bg-red-500 text-white',
  };
  return colors[level];
};

/**
 * Get risk level background for full card
 */
export const getRiskLevelBg = (
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
): string => {
  const bg = {
    LOW: 'bg-green-50 border-l-4 border-green-500',
    MEDIUM: 'bg-yellow-50 border-l-4 border-yellow-500',
    HIGH: 'bg-orange-50 border-l-4 border-orange-500',
    CRITICAL: 'bg-red-50 border-l-4 border-red-500',
  };
  return bg[level];
};
