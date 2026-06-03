'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { NormalizedUsageData } from '@/types/dashboard';
import { AlertTriangle } from 'lucide-react';

interface UsageMiniCardProps {
  usageData: NormalizedUsageData | null;
  isLoading?: boolean;
  error?: string;
}

export const UsageMiniCard: React.FC<UsageMiniCardProps> = ({
  usageData,
  isLoading = false,
  error,
}) => {
  if (isLoading) {
    return (
      <Card className="col-span-1 md:col-span-1">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-6 bg-gray-200 rounded w-full"></div>
        </div>
      </Card>
    );
  }

  if (error || !usageData) {
    return (
      <Card className="col-span-1 md:col-span-1 bg-red-50 border-l-4 border-alert">
        <div className="text-alert font-medium text-sm">Usage data unavailable</div>
      </Card>
    );
  }

  const percentage = Math.round((usageData.monthlyUsed / usageData.monthlyLimit) * 100);
  const isNearLimit = percentage > 80;

  return (
    <Card className={`col-span-1 md:col-span-1 ${isNearLimit ? 'bg-orange-50 border-l-4 border-orange-500' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-forest">API Usage</h3>
        {usageData.demoMode && (
          <Badge variant="secondary" className="text-xs">
            Demo
          </Badge>
        )}
      </div>

      {/* Usage Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">
            {usageData.monthlyUsed} / {usageData.monthlyLimit}
          </span>
          <span className="text-sm font-bold text-green-primary">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              percentage > 80 ? 'bg-orange-500' : percentage > 60 ? 'bg-yellow-500' : 'bg-green-primary'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Plan Limitations */}
      {usageData.plan.toLowerCase().includes('free') && (
        <div className="border-t border-gray-200 pt-3 text-xs space-y-1">
          <p className="font-semibold text-gray-700 flex items-center mb-2">
            <AlertTriangle className="w-3 h-3 mr-1" /> Free Plan Limitations
          </p>
          <p className="text-gray-600">📊 {usageData.forecastDays} day forecast</p>
          <p className="text-gray-600">🤖 {usageData.aiRequests} AI requests/month</p>
          <p className="text-gray-600">🔗 {usageData.webhooksAvailable ? '✓' : '✗'} Webhooks</p>
          <p className="text-gray-600">💬 {usageData.smsAvailable ? '✓' : '✗'} SMS alerts</p>
        </div>
      )}

      {/* Reset Date */}
      <div className="border-t border-gray-200 pt-3 mt-3 text-xs text-text-muted">
        Resets: {new Date(usageData.resetDate).toLocaleDateString()}
      </div>
    </Card>
  );
};
