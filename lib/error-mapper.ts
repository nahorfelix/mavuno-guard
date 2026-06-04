// Map upstream WeatherAI status codes to stable messages for UI and API routes.

export type WeatherAIErrorMapping = {
  status: number;
  code: string;
  message: string;
};

export const mapWeatherAIError = (
  status: number,
  message?: string
): WeatherAIErrorMapping => {
  const fallbackMessage = message || 'Unexpected WeatherAI error. Please try again later.';

  switch (status) {
    case 400:
      return {
        status: 400,
        code: 'invalid_request',
        message: message || 'Missing or invalid request parameters.',
      };
    case 401:
      return {
        status: 401,
        code: 'authentication_failed',
        message:
          message || 'Missing, invalid, or revoked WeatherAI API key. Please check your configuration.',
      };
    case 403:
      return {
        status: 403,
        code: 'plan_restricted',
        message: message || 'This feature is not available on your current WeatherAI plan.',
      };
    case 429:
      return {
        status: 429,
        code: 'quota_exceeded',
        message: message || 'Monthly WeatherAI quota exceeded. Upgrade or wait for reset.',
      };
    case 500:
      return {
        status: 500,
        code: 'server_error',
        message: message || 'WeatherAI server encountered an error. Please try again later.',
      };
    case 503:
      return {
        status: 503,
        code: 'service_unavailable',
        message: message || 'WeatherAI is temporarily unavailable. Please try again shortly.',
      };
    default:
      return {
        status: status || 500,
        code: 'unexpected_error',
        message: fallbackMessage,
      };
  }
};
