'use client';

import { Activity } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import type { ApiHealthModel, ApiHealthState } from '@/types/operations';

type ApiHealthCardProps = {
  item: ApiHealthModel;
};

const stateVariant: Record<ApiHealthState, 'success' | 'warning' | 'danger'> = {
  healthy: 'success',
  limited: 'warning',
  locked: 'warning',
  error: 'danger',
};

const stateLabel: Record<ApiHealthState, string> = {
  healthy: 'Healthy',
  limited: 'Limited',
  locked: 'Locked',
  error: 'Error',
};

export function ApiHealthCard({ item }: ApiHealthCardProps) {
  return (
    <Card className="shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-primary" />
          <h3 className="text-lg font-semibold text-forest">{item.title}</h3>
        </div>
        <Badge variant={stateVariant[item.state]}>{stateLabel[item.state]}</Badge>
      </div>
      <p className="mt-3 text-sm text-slate-600">{item.explanation}</p>
      {item.lastChecked ? (
        <p className="mt-3 text-xs text-text-muted">
          Last checked: {new Date(item.lastChecked).toLocaleString()}
        </p>
      ) : null}
    </Card>
  );
}
