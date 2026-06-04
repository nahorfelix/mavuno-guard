import { NextResponse } from 'next/server';
import weatherAIClient, { isWeatherAIConfigured } from '@/lib/weather-ai-client';
import { mapWeatherAIError } from '@/lib/error-mapper';

const demoHistory = {
  demoMode: true,
  history: [
    {
      date: '2026-05-18',
      location: 'North Orchard',
      county: 'Kilifi',
      tree_count: 187,
      canopy_coverage: 51,
      status: 'Healthy',
    },
    {
      date: '2026-04-02',
      location: 'West Field',
      county: 'Makueni',
      tree_count: 129,
      canopy_coverage: 39,
      status: 'Monitor',
    },
    {
      date: '2026-01-21',
      location: 'River Edge',
      county: 'Tana River',
      tree_count: 202,
      canopy_coverage: 58,
      status: 'Healthy',
    },
  ],
};

const buildErrorResponse = (status: number, message: string) => {
  return NextResponse.json({ error: { message, status } }, { status });
};

export async function GET() {
  if (!isWeatherAIConfigured()) {
    return NextResponse.json({ payload: demoHistory, demoMode: true });
  }

  try {
    const response = await weatherAIClient.get('/v1/trees/history');
    return NextResponse.json({ payload: response.data, meta: { rateLimit: response.rateLimit } }, { status: response.status });
  } catch (error: unknown) {
    if (error instanceof Error && 'status' in error && 'data' in error) {
      const status = (error as any).status;
      const message = (error as any).data?.message || error.message;
      const mapped = mapWeatherAIError(status, message);
      return NextResponse.json({ error: mapped }, { status: mapped.status });
    }
    return buildErrorResponse(500, 'Unable to load tree history at this time.');
  }
}
