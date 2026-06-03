'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { RiskScore } from '@/types/dashboard';
import { getRiskLevelColor, getRiskLevelBg } from '@/lib/risk-engine';

interface FarmRiskCardProps {
  riskScore: RiskScore | null;
  isLoading?: boolean;
  error?: string;
}

export const FarmRiskCard: React.FC<FarmRiskCardProps> = ({
  riskScore,
  isLoading = false,
  error,
}) => {
  if (isLoading) {
    return (
      <Card className="col-span-1 md:col-span-1 lg:col-span-1">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </Card>
    );
  }

  if (error || !riskScore) {
    return (
      <Card className="col-span-1 md:col-span-1 lg:col-span-1 bg-red-50 border-l-4 border-alert">
        <div className="text-alert font-medium text-sm">Risk data unavailable</div>
      </Card>
    );
  }

  const { overall, level, factors, explanations } = riskScore;

  return (
    <Card className={`col-span-1 md:col-span-1 lg:col-span-1 ${getRiskLevelBg(level)}`}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-forest">Farm Risk Score</h3>
        {level === 'CRITICAL' && (
          <AlertTriangle className="w-5 h-5 text-red-600" />
        )}
      </div>

      {/* Risk Score Circle */}
      <div className="flex items-center justify-center mb-4">
        <div className={`relative w-24 h-24 rounded-full flex items-center justify-center ${getRiskScoreBackground(level)}`}>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{overall}</div>
            <div className="text-xs text-white/80 font-semibold">/100</div>
          </div>
        </div>
      </div>

      {/* Risk Level Badge */}
      <div className="flex justify-center mb-4">
        <Badge className={`${getRiskLevelColor(level)} font-semibold`}>
          {level} RISK
        </Badge>
      </div>

      {/* Factor Breakdown */}
      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-gray-700">Rain Risk</span>
          <span className="font-semibold">{Math.round(factors.rain)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Wind Risk</span>
          <span className="font-semibold">{Math.round(factors.wind)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Temperature Risk</span>
          <span className="font-semibold">{Math.round(factors.temperature)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Humidity Risk</span>
          <span className="font-semibold">{Math.round(factors.humidity)}</span>
        </div>
        {factors.uv !== undefined && (
          <div className="flex justify-between">
            <span className="text-gray-700">UV Risk</span>
            <span className="font-semibold">{Math.round(factors.uv)}</span>
          </div>
        )}
      </div>

      {/* Explanations */}
      <div className="border-t border-gray-300 pt-3 text-xs space-y-1">
        {explanations.map((explanation, idx) => (
          <p key={idx} className="text-gray-700 flex items-start">
            <span className="mr-2">•</span>
            <span>{explanation}</span>
          </p>
        ))}
      </div>
    </Card>
  );
};

const getRiskScoreBackground = (level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): string => {
  const bgMap = {
    LOW: 'bg-green-500',
    MEDIUM: 'bg-yellow-500',
    HIGH: 'bg-orange-500',
    CRITICAL: 'bg-red-600',
  };
  return bgMap[level];
};
