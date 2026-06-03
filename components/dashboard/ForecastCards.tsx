'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import type { NormalizedWeatherData } from '@/types/dashboard';
import { getWeatherEmoji, formatTemperature } from '@/lib/weather-normalizer';

interface ForecastCardsProps {
  weatherData: NormalizedWeatherData | null;
  isLoading?: boolean;
  error?: string;
}

export const ForecastCards: React.FC<ForecastCardsProps> = ({
  weatherData,
  isLoading = false,
  error,
}) => {
  if (isLoading) {
    return (
      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse"></div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-1 md:col-span-2 lg:col-span-3 bg-red-50 border-l-4 border-alert">
        <div className="text-alert font-medium">Unable to load forecast</div>
        {error && <p className="text-sm text-gray-600 mt-2">{error}</p>}
      </Card>
    );
  }

  if (!weatherData || !weatherData.forecast || weatherData.forecast.length === 0) {
    return (
      <Card className="col-span-1 md:col-span-2 lg:col-span-3 bg-cloud-white">
        <p className="text-text-muted">No forecast data available</p>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
      <h3 className="text-lg font-bold text-forest mb-4">7-Day Forecast</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
        {weatherData.forecast.map((day, idx) => (
          <div key={idx} className="bg-gradient-to-br from-cloud-white to-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
            <p className="text-xs font-semibold text-text-muted mb-2">
              {formatDate(day.date)}
            </p>
            <div className="text-2xl mb-2 text-center">{getWeatherEmoji(day.condition)}</div>
            <p className="text-sm font-bold text-green-primary">{formatTemperature(day.high)}</p>
            <p className="text-xs text-text-muted">{formatTemperature(day.low)}</p>
            <p className="text-xs text-blue-600 mt-2 flex items-center">
              💧 {day.precipitationChance}%
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return dateString.split('T')[0];
  }
};
