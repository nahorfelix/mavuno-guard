'use client';

import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { PlannerStatus } from '@/types/planner';
import { Card } from '@/components/ui/Card';

interface PlannerStatusBannerProps {
  status: PlannerStatus;
}

export const PlannerStatusBanner = ({ status }: PlannerStatusBannerProps) => {
  const hasError = Object.keys(status.errors).length > 0;

  if (status.isLoading) {
    return (
      <Card className="bg-cloud-white border border-gray-200 p-5 rounded-3xl">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/5" />
          <div className="h-4 bg-gray-200 rounded w-2/5" />
        </div>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card className="bg-red-50 border-l-4 border-alert p-5 rounded-3xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-alert mt-1" />
          <div>
            <h3 className="font-semibold text-red-900">Planner data issue</h3>
            <p className="text-sm text-red-700">Some weather data could not be loaded. Review network and API status.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-green-50 border-l-4 border-green-primary p-5 rounded-3xl">
      <div className="flex items-start gap-3">
        <CheckCircle className="w-6 h-6 text-green-primary mt-1" />
        <div>
          <h3 className="font-semibold text-forest">Field Planner is ready</h3>
          <p className="text-sm text-text-muted">Hourly and daily weather are loaded for operation planning.</p>
        </div>
      </div>
    </Card>
  );
};
