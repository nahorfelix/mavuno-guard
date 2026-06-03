'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { FarmRecommendation } from '@/types/dashboard';
import { getRecommendationColor } from '@/lib/farm-recommendations';

interface FarmRecommendationCardProps {
  recommendations: FarmRecommendation[];
  isLoading?: boolean;
  error?: string;
}

export const FarmRecommendationCard: React.FC<FarmRecommendationCardProps> = ({
  recommendations,
  isLoading = false,
  error,
}) => {
  if (isLoading) {
    return (
      <Card className="col-span-1 md:col-span-2 lg:col-span-2">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-1 md:col-span-2 lg:col-span-2 bg-red-50 border-l-4 border-alert">
        <div className="text-alert font-medium">Unable to load recommendations</div>
      </Card>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="col-span-1 md:col-span-2 lg:col-span-2 bg-green-50">
        <h3 className="text-lg font-bold text-forest mb-2">Farm Actions</h3>
        <p className="text-green-700">✅ No immediate actions required. Weather conditions are favorable.</p>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-2">
      <h3 className="text-lg font-bold text-forest mb-4">Recommended Farm Actions</h3>
      <div className="space-y-3">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border-l-4 ${getRecommendationColor(rec.category)}`}
          >
            <div className="flex items-start justify-between mb-1">
              <span className="text-sm font-bold">{rec.emoji} {rec.category}</span>
              <Badge
                variant={
                  rec.urgency === 'HIGH'
                    ? 'primary'
                    : rec.urgency === 'MEDIUM'
                    ? 'secondary'
                    : 'ghost'
                }
                className="text-xs"
              >
                {rec.urgency}
              </Badge>
            </div>
            <p className="text-sm text-gray-800">{rec.action}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};
