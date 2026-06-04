import { NextResponse } from 'next/server';
import weatherAIClient, { isWeatherAIConfigured } from '@/lib/weather-ai-client';
import { mapWeatherAIError } from '@/lib/error-mapper';

const demoQuota = {
  demoMode: true,
  plan: 'Starter',
  scans_used: 6,
  scans_remaining: 14,
  monthly_limit: 20,
  supported: true,
  message: 'Demo mode quota is active for the tree lab.',
};

const buildErrorResponse = (status: number, message: string) => {
  return NextResponse.json({ error: { message, status } }, { status });
};

export async function GET() {
  if (!isWeatherAIConfigured()) {
    return NextResponse.json({ payload: demoQuota, demoMode: true });
  }

  try {
    const response = await weatherAIClient.get('/v1/trees/quota');
    return NextResponse.json({ payload: response.data, meta: { rateLimit: response.rateLimit } }, { status: response.status });
  } catch (error: unknown) {
    if (error instanceof Error && 'status' in error && 'data' in error) {
      const status = (error as any).status;
      const message = (error as any).data?.message || error.message;
      const mapped = mapWeatherAIError(status, message);
      return NextResponse.json({ error: mapped }, { status: mapped.status });
    }
    return buildErrorResponse(500, 'Unable to load tree quota at this time.');
  }
}
