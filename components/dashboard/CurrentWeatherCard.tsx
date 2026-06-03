'use client';

import React from 'react';
import { CloudRain, Wind, Droplets } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { NormalizedWeatherData } from '@/types/dashboard';
import { getWeatherEmoji, formatTemperature, formatWindSpeed } from '@/lib/weather-normalizer';

interface CurrentWeatherCardProps {
  weatherData: NormalizedWeatherData | null;
  isLoading?: boolean;
  error?: string;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  weatherData,
  isLoading = false,
  error,
}) => {
  if (isLoading) {
    return (
      <Card className="col-span-1 md:col-span-2">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error || !weatherData) {
    return (
      <Card className="col-span-1 md:col-span-2 bg-red-50 border-l-4 border-alert">
        <div className="text-alert font-medium">Unable to load current weather</div>
        {error && <p className="text-sm text-gray-600 mt-2">{error}</p>}
      </Card>
    );
  }

  const { location, current } = weatherData;
  const weatherEmoji = getWeatherEmoji(current.condition);

  return (
    <Card className="col-span-1 md:col-span-2">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-forest mb-1">{location.name}</h3>
          <p className="text-sm text-text-muted">
            {location.country} • {location.timezone}
          </p>
        </div>
        {weatherData.demoMode && (
          <Badge variant="secondary" className="text-xs">
            Demo Mode
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {/* Temperature */}
        <div className="flex items-center space-x-3">
          <div className="text-4xl">{weatherEmoji}</div>
          <div>
            <div className="text-3xl font-bold text-green-primary">
              {formatTemperature(current.temperature)}
            </div>
            {current.feelsLike !== undefined && (
              <p className="text-xs text-text-muted">
                Feels like {formatTemperature(current.feelsLike)}
              </p>
            )}
          </div>
        </div>

        {/* Condition */}
        <div>
          <p className="text-sm text-text-muted mb-1">Condition</p>
          <p className="font-semibold text-forest">{current.condition}</p>
        </div>

        {/* Humidity */}
        <div className="flex items-center space-x-2">
          <Droplets className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-sm text-text-muted">Humidity</p>
            <p className="font-semibold text-forest">{current.humidity}%</p>
          </div>
        </div>

        {/* Wind */}
        <div className="flex items-center space-x-2">
          <Wind className="w-5 h-5 text-sky-500" />
          <div>
            <p className="text-sm text-text-muted">Wind</p>
            <p className="font-semibold text-forest">
              {formatWindSpeed(current.windSpeed)}
            </p>
            {current.windDirection && (
              <p className="text-xs text-text-muted">{current.windDirection}</p>
            )}
          </div>
        </div>

        {/* Precipitation */}
        {current.precipitation !== undefined && (
          <div className="flex items-center space-x-2">
            <CloudRain className="w-5 h-5 text-cyan-500" />
            <div>
              <p className="text-sm text-text-muted">Precipitation</p>
              <p className="font-semibold text-forest">{current.precipitation}mm</p>
            </div>
          </div>
        )}
      </div>

      {/* Coordinates */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-text-muted">
        📍 {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
      </div>
    </Card>
  );
};
