import { NextResponse } from 'next/server';
import weatherAIClient, { WeatherAIError } from '@/lib/weather-ai-client';
import { mapWeatherAIError } from '@/lib/error-mapper';
import type { ForecastResponse } from '@/types/weather';

const DEFAULTS = {
  lat: '-1.2921',
  lon: '36.8219',
  units: 'metric',
  lang: 'en',
  days: '7',
  ai: 'true',
};

const createQuery = (url: URL) => ({
  lat: url.searchParams.get('lat') ?? DEFAULTS.lat,
  lon: url.searchParams.get('lon') ?? DEFAULTS.lon,
  units: url.searchParams.get('units') ?? DEFAULTS.units,
  lang: url.searchParams.get('lang') ?? DEFAULTS.lang,
  days: url.searchParams.get('days') ?? DEFAULTS.days,
  ai: url.searchParams.get('ai') ?? DEFAULTS.ai,
});

export async function GET(request: Request) {
  if (!process.env.WEATHER_AI_API_KEY) {
    return NextResponse.json(
      {
        demoMode: true,
        message:
          'WEATHER_AI_API_KEY is not configured. This endpoint is serving demo forecast data only.',
        data: {
          location: {
            name: 'Nairobi',
            country: 'Kenya',
            lat: -1.2921,
            lon: 36.8219,
            timezone: 'Africa/Nairobi',
          },
          forecast: Array.from({ length: 7 }, (_, index) => ({
            date: `2026-06-${(5 + index).toString().padStart(2, '0')}`,
            high: 26 + index % 3,
            low: 16 + index % 2,
            condition: 'Partly cloudy',
            precipitation_chance: 12 + index * 2,
          })),
        },
      },
      { status: 200 }
    );
  }

  const url = new URL(request.url);
  const query = createQuery(url);

  try {
    const result = await weatherAIClient.get<ForecastResponse>('/v1/weather', query);
    return NextResponse.json(
      {
        payload: result.data,
        meta: {
          status: result.status,
          rateLimit: result.rateLimit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const mapped = mapWeatherAIError(
      error instanceof WeatherAIError ? error.status : 500,
      error instanceof Error ? error.message : undefined
    );
    return NextResponse.json({ error: mapped }, { status: mapped.status });
  }
}
