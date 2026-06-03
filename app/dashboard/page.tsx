'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CurrentWeatherCard } from '@/components/dashboard/CurrentWeatherCard';
import { ForecastCards } from '@/components/dashboard/ForecastCards';
import { FarmRiskCard } from '@/components/dashboard/FarmRiskCard';
import { FarmRecommendationCard } from '@/components/dashboard/FarmRecommendationCard';
import { UsageMiniCard } from '@/components/dashboard/UsageMiniCard';
import { ApiStatusBanner } from '@/components/dashboard/ApiStatusBanner';
import {
  normalizeWeatherResponse,
  isValidWeatherData,
} from '@/lib/weather-normalizer';
import { normalizeUsageResponse, isValidUsageData } from '@/lib/usage-normalizer';
import { calculateRiskScore } from '@/lib/risk-engine';
import {
  generateFarmRecommendations,
  prioritizeRecommendations,
} from '@/lib/farm-recommendations';
import type {
  NormalizedWeatherData,
  NormalizedUsageData,
  RiskScore,
  FarmRecommendation,
  ApiStatus,
} from '@/types/dashboard';

export default function DashboardPage() {
  const [weatherData, setWeatherData] = useState<NormalizedWeatherData | null>(
    null
  );
  const [usageData, setUsageData] = useState<NormalizedUsageData | null>(null);
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);
  const [recommendations, setRecommendations] = useState<FarmRecommendation[]>(
    []
  );
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    isHealthy: true,
    demoMode: false,
    currentWeatherReady: false,
    forecastReady: false,
    usageReady: false,
    errors: {},
  });

  const [isLoading, setIsLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string>();
  const [usageError, setUsageError] = useState<string>();

  // Fetch data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      const errors: Record<string, string> = {};
      let demoModeDetected = false;
      let newWeatherData: NormalizedWeatherData | null = null;
      let newUsageData: NormalizedUsageData | null = null;

      try {
        // Fetch current weather and forecast
        const weatherRes = await fetch('/api/weather/current?ai=true');
        const weatherJson = await weatherRes.json();

        if (weatherRes.ok) {
          const normalized = normalizeWeatherResponse(weatherJson);
          if (isValidWeatherData(normalized) && normalized) {
            newWeatherData = normalized;
            setWeatherData(normalized);
            if (normalized.demoMode) {
              demoModeDetected = true;
            }
          } else {
            setWeatherError('Weather data format is invalid');
            errors.weather = 'Invalid data format';
          }
        } else {
          setWeatherError(
            weatherJson?.error?.message || 'Failed to fetch weather'
          );
          errors.weather = 'Failed to fetch';
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setWeatherError(message);
        errors.weather = message;
      }

      try {
        // Fetch usage
        const usageRes = await fetch('/api/usage');
        const usageJson = await usageRes.json();

        if (usageRes.ok) {
          const normalized = normalizeUsageResponse(usageJson);
          if (isValidUsageData(normalized) && normalized) {
            newUsageData = normalized;
            setUsageData(normalized);
            if (normalized.demoMode) {
              demoModeDetected = true;
            }
          } else {
            setUsageError('Usage data format is invalid');
            errors.usage = 'Invalid data format';
          }
        } else {
          setUsageError(usageJson?.error?.message || 'Failed to fetch usage');
          errors.usage = 'Failed to fetch';
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setUsageError(message);
        errors.usage = message;
      }

      setApiStatus({
        isHealthy: Object.keys(errors).length === 0,
        demoMode: demoModeDetected,
        currentWeatherReady: newWeatherData !== null,
        forecastReady: newWeatherData?.forecast.length ? true : false,
        usageReady: newUsageData !== null,
        errors,
      });

      // Calculate risk and recommendations if weather data is available
      if (newWeatherData?.current) {
        const risk = calculateRiskScore({
          temperature: newWeatherData.current.temperature,
          humidity: newWeatherData.current.humidity,
          windSpeed: newWeatherData.current.windSpeed,
          precipitationChance: newWeatherData.forecast[0]?.precipitationChance || 0,
        });
        setRiskScore(risk);

        const recs = generateFarmRecommendations(newWeatherData);
        setRecommendations(prioritizeRecommendations(recs));
      }

      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* API Status Banner */}
        <ApiStatusBanner status={apiStatus} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Current Weather - spans 2 cols on md, 2 on lg */}
          <CurrentWeatherCard
            weatherData={weatherData}
            isLoading={isLoading}
            error={weatherError}
          />

          {/* Farm Risk Card */}
          <FarmRiskCard
            riskScore={riskScore}
            isLoading={isLoading}
            error={weatherError}
          />

          {/* Usage Mini Card */}
          <UsageMiniCard
            usageData={usageData}
            isLoading={isLoading}
            error={usageError}
          />

          {/* Forecast - spans full width on all */}
          <ForecastCards
            weatherData={weatherData}
            isLoading={isLoading}
            error={weatherError}
          />

          {/* Recommendations */}
          <FarmRecommendationCard
            recommendations={recommendations}
            isLoading={isLoading}
            error={weatherError}
          />
        </div>

        {/* AI Summary Section */}
        {weatherData?.aiSummary && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-primary p-6 rounded-lg">
            <h3 className="text-lg font-bold text-forest mb-3">AI Weather Summary</h3>
            <p className="text-gray-700 leading-relaxed">{weatherData.aiSummary}</p>
          </div>
        )}

        {!weatherData?.aiSummary && weatherData && (
          <div className="bg-cloud-white border border-gray-200 p-6 rounded-lg text-center">
            <p className="text-text-muted">
              ℹ️ AI summary is not available for this response, but live weather data is active.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
