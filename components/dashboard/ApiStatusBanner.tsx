'use client';

import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import type { ApiStatus } from '@/types/dashboard';

interface ApiStatusBannerProps {
  status: ApiStatus;
}

export const ApiStatusBanner: React.FC<ApiStatusBannerProps> = ({ status }) => {
  if (status.isHealthy && !status.demoMode) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-primary p-4 rounded-lg flex items-center space-x-3">
        <CheckCircle className="w-5 h-5 text-green-primary flex-shrink-0" />
        <div>
          <p className="font-semibold text-green-900">Live WeatherAI Data Active</p>
          <p className="text-sm text-green-700">
            Connected to production WeatherAI API with real-time weather intelligence
          </p>
        </div>
      </div>
    );
  }

  if (status.demoMode) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 p-4 rounded-lg flex items-center space-x-3">
        <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-blue-900">Demo Mode Active</p>
          <p className="text-sm text-blue-700">
            Using demo data. Configure WEATHER_AI_API_KEY to use live WeatherAI data.
          </p>
        </div>
      </div>
    );
  }

  const errorMessages = Object.entries(status.errors)
    .map(([key, msg]) => `${key}: ${msg}`)
    .join('; ');

  return (
    <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-alert p-4 rounded-lg flex items-center space-x-3">
      <AlertCircle className="w-5 h-5 text-alert flex-shrink-0" />
      <div>
        <p className="font-semibold text-red-900">API Connection Issues</p>
        {errorMessages && (
          <p className="text-sm text-red-700">
            {errorMessages}
          </p>
        )}
        <p className="text-sm text-red-700 mt-1">
          Some data may be missing or delayed. Please try refreshing the page.
        </p>
      </div>
    </div>
  );
};
