// Normalize live and demo responses into one shape so UI components stay stable.

import type { NormalizedWeatherData } from '@/types/dashboard';

export const normalizeWeatherResponse = (
  response: any
): NormalizedWeatherData | null => {
  if (!response) {
    return null;
  }

  const demoMode = response.demoMode === true;
  const weatherData = demoMode ? response.data : response.payload;

  if (!weatherData) {
    return null;
  }

  const location = weatherData.location || {};
  const normalizedLocation = {
    name: location.name || 'Unknown Location',
    country: location.country || 'Unknown Country',
    timezone: location.timezone || 'Unknown Timezone',
    lat: Number(location.lat) || 0,
    lon: Number(location.lon) || 0,
  };

  const current = weatherData.current || {};
  const normalizedCurrent = {
    temperature: Number(current.temperature) || 0,
    feelsLike: current.feels_like ? Number(current.feels_like) : undefined,
    humidity: Number(current.humidity) || 0,
    windSpeed: Number(current.wind_speed) || 0,
    windDirection: current.wind_direction || undefined,
    condition: current.condition || 'No condition data',
    precipitation: Number(current.precipitation) || 0,
  };

  let forecastArray: Array<any> = [];

  if (Array.isArray(weatherData.forecast)) {
    forecastArray = weatherData.forecast;
  } else if (Array.isArray(weatherData.daily)) {
    forecastArray = weatherData.daily;
  } else if (Array.isArray(weatherData.days)) {
    forecastArray = weatherData.days;
  }

  const normalizedForecast = forecastArray.map((day) => ({
    date: day.date || '',
    high: Number(day.high) || 0,
    low: Number(day.low) || 0,
    condition: day.condition || 'Unknown',
    precipitationChance: Number(day.precipitation_chance) || 0,
  }));

  return {
    demoMode,
    location: normalizedLocation,
    current: normalizedCurrent,
    forecast: normalizedForecast,
    aiSummary: weatherData.ai_summary || weatherData.aI_summary || undefined,
  };
};

/**
 * Check if a weather response is valid and has required fields
 */
export const isValidWeatherData = (data: NormalizedWeatherData | null): boolean => {
  return !!(
    data &&
    data.location &&
    data.current &&
    data.current.temperature !== undefined &&
    data.current.humidity !== undefined
  );
};

/**
 * Get a weather icon emoji based on condition
 */
export const getWeatherEmoji = (condition: string | undefined): string => {
  if (!condition) return '🌥️';

  const lower = condition.toLowerCase();

  if (lower.includes('clear') || lower.includes('sunny')) return '☀️';
  if (lower.includes('cloud')) return '☁️';
  if (lower.includes('rain')) return '🌧️';
  if (lower.includes('thunderstorm') || lower.includes('storm')) return '⛈️';
  if (lower.includes('snow')) return '❄️';
  if (lower.includes('wind')) return '💨';
  if (lower.includes('fog') || lower.includes('mist')) return '🌫️';
  if (lower.includes('haze')) return '🌫️';

  return '🌥️';
};

/**
 * Format temperature with locale
 */
export const formatTemperature = (temp: number, units: 'metric' | 'imperial' = 'metric'): string => {
  const symbol = units === 'metric' ? '°C' : '°F';
  return `${Math.round(temp)}${symbol}`;
};

/**
 * Format wind speed with units
 */
export const formatWindSpeed = (speed: number, units: 'metric' | 'imperial' = 'metric'): string => {
  const unit = units === 'metric' ? 'm/s' : 'mph';
  return `${Math.round(speed)} ${unit}`;
};
