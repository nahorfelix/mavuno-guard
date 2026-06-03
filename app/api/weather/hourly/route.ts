import { NextResponse } from 'next/server';
import weatherAIClient, { WeatherAIError } from '@/lib/weather-ai-client';
import { mapWeatherAIError } from '@/lib/error-mapper';
import type { HourlyForecastResponse } from '@/types/weather';

const DEFAULTS = {
  lat: '-1.2921',
  lon: '36.8219',
  units: 'metric',
  lang: 'en',
  ai: 'true',
};

const createQuery = (url: URL) => ({
  lat: url.searchParams.get('lat') ?? DEFAULTS.lat,
  lon: url.searchParams.get('lon') ?? DEFAULTS.lon,
  units: url.searchParams.get('units') ?? DEFAULTS.units,
  lang: url.searchParams.get('lang') ?? DEFAULTS.lang,
  ai: url.searchParams.get('ai') ?? DEFAULTS.ai,
});

export async function GET(request: Request) {
  if (!process.env.WEATHER_AI_API_KEY) {
    return NextResponse.json(
      {
        demoMode: true,
        message:
          'WEATHER_AI_API_KEY is not configured. This endpoint is serving demo hourly forecast data only.',
        data: {
          location: {
            name: 'Nairobi',
            country: 'Kenya',
            lat: -1.2921,
            lon: 36.8219,
            timezone: 'Africa/Nairobi',
          },
          hourly: Array.from({ length: 12 }, (_, index) => ({
            hour: `${6 + index}:00`,
            temperature: 20 + index % 5,
            humidity: 65 + index,
            wind_speed: 10 + index,
            condition: index % 3 === 0 ? 'Sunny' : 'Partly cloudy',
          })),
        },
      },
      { status: 200 }
    );
  }

  const url = new URL(request.url);
  const query = createQuery(url);

  try {
    const result = await weatherAIClient.get<HourlyForecastResponse>('/v1/hourly', query);
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
