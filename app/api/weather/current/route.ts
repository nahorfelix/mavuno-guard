import { NextResponse } from 'next/server';
import weatherAIClient, { WeatherAIError } from '@/lib/weather-ai-client';
import { mapWeatherAIError } from '@/lib/error-mapper';
import type { CurrentWeatherResponse } from '@/types/weather';

const DEFAULTS = {
  lat: '-1.2921',
  lon: '36.8219',
  units: 'metric',
  lang: 'en',
};

const createQuery = (url: URL) => ({
  lat: url.searchParams.get('lat') ?? DEFAULTS.lat,
  lon: url.searchParams.get('lon') ?? DEFAULTS.lon,
  units: url.searchParams.get('units') ?? DEFAULTS.units,
  lang: url.searchParams.get('lang') ?? DEFAULTS.lang,
});

export async function GET(request: Request) {
  if (!process.env.WEATHER_AI_API_KEY) {
    return NextResponse.json(
      {
        demoMode: true,
        message:
          'WEATHER_AI_API_KEY is not configured. This endpoint is serving demo weather data only.',
        data: {
          location: {
            name: 'Nairobi',
            country: 'Kenya',
            lat: -1.2921,
            lon: 36.8219,
            timezone: 'Africa/Nairobi',
          },
          current: {
            temperature: 24,
            feels_like: 24,
            humidity: 68,
            wind_speed: 11,
            wind_direction: 'ESE',
            condition: 'Partly cloudy',
            precipitation: 0,
          },
        },
      },
      { status: 200 }
    );
  }

  const url = new URL(request.url);
  const query = createQuery(url);

  try {
    const result = await weatherAIClient.get<CurrentWeatherResponse>('/v1/current', query);
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
