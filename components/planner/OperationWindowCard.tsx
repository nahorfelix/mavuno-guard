'use client';

import { Card } from '@/components/ui/Card';
import type { OperationWindowSummary } from '@/types/planner';
import { getBadgeColor } from '@/lib/field-planner';

interface OperationWindowCardProps {
  summary: OperationWindowSummary;
}

export const OperationWindowCard = ({ summary }: OperationWindowCardProps) => {
  return (
    <Card className="rounded-3xl p-5 border border-gray-200 shadow-soft">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-base font-semibold text-forest">{summary.title}</h4>
          <p className="text-sm text-text-muted">{summary.factor}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${getBadgeColor(summary.status)}`}>
          {summary.status}
        </span>
      </div>

      <p className="text-sm text-gray-700 mb-3">{summary.explanation}</p>
      {summary.timeWindow ? (
        <div className="rounded-2xl bg-cloud-white p-3 text-sm text-forest border border-gray-200">
          <span className="font-semibold">Time window:</span> {summary.timeWindow}
        </div>
      ) : (
        <div className="rounded-2xl bg-gray-50 p-3 text-sm text-text-muted border border-gray-100">
          No defined time window available
        </div>
      )}
    </Card>
  );
};
