import { NextResponse } from 'next/server';
import weatherAIClient, { isWeatherAIConfigured } from '@/lib/weather-ai-client';
import { mapWeatherAIError } from '@/lib/error-mapper';

const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const demoCount = {
  demoMode: true,
  supported: true,
  tree_count: 147,
  density_per_acre: 13.4,
  canopy_coverage: 44,
  confidence_score: 0.91,
  message: 'Demo forestry count output. Upload a real canopy image to run the production model.',
};

const buildErrorResponse = (status: number, message: string) => {
  return NextResponse.json({ error: { message, status } }, { status });
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get('image');

  if (!image || !(image instanceof File)) {
    return buildErrorResponse(400, 'Please upload a canopy image to run the forestry count.');
  }

  if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
    return buildErrorResponse(400, 'Supported image formats are JPEG, PNG, and WebP.');
  }

  if (image.size > MAX_IMAGE_SIZE_BYTES) {
    return buildErrorResponse(413, 'Image size must be 20MB or smaller.');
  }

  if (!isWeatherAIConfigured()) {
    return NextResponse.json({ payload: demoCount, demoMode: true });
  }

  const forwardForm = new FormData();
  forwardForm.append('image', image, image.name);
  for (const [key, value] of formData.entries()) {
    if (key === 'image') continue;
    if (typeof value === 'string' && value.trim()) {
      forwardForm.append(key, value);
    }
  }

  try {
    const response = await weatherAIClient.post('/v1/forestry/count-trees', forwardForm);
    return NextResponse.json({ payload: response.data, meta: { rateLimit: response.rateLimit } }, { status: response.status });
  } catch (error: unknown) {
    if (error instanceof Error && 'status' in error && 'data' in error) {
      const status = (error as any).status;
      const message = (error as any).data?.message || error.message;
      const mapped = mapWeatherAIError(status, message);
      return NextResponse.json({ error: mapped }, { status: mapped.status });
    }
    return buildErrorResponse(500, 'Unable to perform forestry count at this time.');
  }
}
