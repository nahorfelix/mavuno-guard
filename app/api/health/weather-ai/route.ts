import { NextResponse } from 'next/server';
import { isWeatherAIConfigured } from '@/lib/weather-ai-client';
import weatherAIClient, { WeatherAIError } from '@/lib/weather-ai-client';
import type { UsageResponse } from '@/types/weather';

export async function GET() {
  const hasConfiguredKey = isWeatherAIConfigured();
  const apiKeyValue = process.env.WEATHER_AI_API_KEY || '';

  // Determine configuration status
  const keyExists = !!apiKeyValue;
  const keyIsValid = hasConfiguredKey;
  const keyIsExample = apiKeyValue === 'wai_your_api_key_here';
  const keyIsPlaceholder = apiKeyValue === 'PASTE_YOUR_REAL_WEATHERAI_KEY_HERE' ||
    apiKeyValue.includes('PASTE_YOUR_REAL_WEATHERAI_KEY_HERE');
  const keyHasCorrectFormat = apiKeyValue.startsWith('wai_');

  // Try to reach WeatherAI if configured
  let weatherAIReachable = false;
  let weatherAIStatus: number | null = null;
  let weatherAIError: string | null = null;

  if (keyIsValid) {
    try {
      const result = await weatherAIClient.get<UsageResponse>('/v1/usage');
      weatherAIReachable = true;
      weatherAIStatus = result.status;
    } catch (error) {
      weatherAIReachable = false;
      if (error instanceof WeatherAIError) {
        weatherAIStatus = error.status;
        weatherAIError = error.message;
      } else if (error instanceof Error) {
        weatherAIError = error.message;
      }
    }
  }

  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      configuration: {
        envKeyExists: keyExists,
        envKeyValid: keyIsValid,
        envKeyIsExample: keyIsExample,
        envKeyIsPlaceholder: keyIsPlaceholder,
        envKeyHasCorrectFormat: keyHasCorrectFormat,
      },
      weatherAI: {
        configValid: keyIsValid,
        reachable: weatherAIReachable,
        status: weatherAIStatus,
        error: weatherAIError,
      },
      nextSteps: !keyIsValid
        ? 'Replace WEATHER_AI_API_KEY placeholder in .env.local with your real WeatherAI API key, then restart the dev server.'
        : weatherAIReachable
          ? 'Configuration is working correctly. WeatherAI API is reachable.'
          : 'Configuration exists but WeatherAI is not reachable. Check your API key and network connectivity.',
    },
    { status: 200 }
  );
}
