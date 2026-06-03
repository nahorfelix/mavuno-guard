import { NextResponse } from 'next/server';
import weatherAIClient, { WeatherAIError } from '@/lib/weather-ai-client';
import { mapWeatherAIError } from '@/lib/error-mapper';
import type { UsageResponse } from '@/types/weather';

export async function GET(request: Request) {
  if (!process.env.WEATHER_AI_API_KEY) {
    return NextResponse.json(
      {
        demoMode: true,
        message:
          'WEATHER_AI_API_KEY is not configured. This endpoint is serving demo usage data only.',
        data: {
          quota: {
            monthly_limit: 10000,
            monthly_used: 1245,
            monthly_remaining: 8755,
          },
          usage: {
            today: 72,
            month_to_date: 1245,
            reset_date: '2026-07-01',
          },
        },
      },
      { status: 200 }
    );
  }

  const url = new URL(request.url);
  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  try {
    const result = await weatherAIClient.get<UsageResponse>('/v1/usage', query);
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
