import { NextResponse } from 'next/server';
import weatherAIClient, { isWeatherAIConfigured } from '@/lib/weather-ai-client';
import { mapWeatherAIError } from '@/lib/error-mapper';

const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const demoAnalysis = {
  demoMode: true,
  tree_count: 164,
  density_per_acre: 12.8,
  canopy_coverage: 47,
  confidence_score: 0.95,
  healthy_trees: 118,
  needing_care: 31,
  needing_replacement: 15,
  observations: [
    'Major canopy clusters identified in the northeast section.',
    'Several young trees are densely grouped and appear healthy.',
    'A few stressed trees near the access road should be monitored.'
  ],
  recommendations: [
    'Inspect the stressed trees for soil moisture and pests.',
    'Plan pruning for dense canopy regions to improve air flow.',
    'Schedule a follow-up scan in 6 weeks during dry season.'
  ],
  overlay_image_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
};

const buildErrorResponse = (status: number, message: string) => {
  return NextResponse.json({ error: { message, status } }, { status });
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get('image');

  if (!image || !(image instanceof File)) {
    return buildErrorResponse(400, 'Please upload a valid tree canopy image file.');
  }

  if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
    return buildErrorResponse(400, 'Supported image formats are JPEG, PNG, and WebP.');
  }

  if (image.size > MAX_IMAGE_SIZE_BYTES) {
    return buildErrorResponse(413, 'Image size must be 20MB or smaller.');
  }

  if (!isWeatherAIConfigured()) {
    return NextResponse.json({ payload: demoAnalysis, demoMode: true });
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
    const response = await weatherAIClient.post('/v1/trees/analyze', forwardForm);
    return NextResponse.json({ payload: response.data, meta: { rateLimit: response.rateLimit } }, { status: response.status });
  } catch (error: unknown) {
    if (error instanceof Error && 'status' in error && 'data' in error) {
      const status = (error as any).status;
      const message = (error as any).data?.message || error.message;
      const mapped = mapWeatherAIError(status, message);
      return NextResponse.json({ error: mapped }, { status: mapped.status });
    }
    return buildErrorResponse(500, 'Unable to analyze tree canopy at this time.');
  }
}
