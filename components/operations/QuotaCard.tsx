'use client';

import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import type { QuotaCardModel } from '@/types/operations';

type QuotaCardProps = {
  quota: QuotaCardModel;
};

export function QuotaCard({ quota }: QuotaCardProps) {
  const hasNumbers =
    quota.used !== undefined || quota.remaining !== undefined || quota.limit !== undefined;
  const percent =
    quota.limit && quota.used !== undefined && quota.limit > 0
      ? Math.round((quota.used / quota.limit) * 100)
      : null;

  return (
    <Card
      className={`shadow-soft ${quota.locked ? 'border-yellow-200 bg-yellow-50/50' : 'border-slate-100'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-forest">{quota.title}</h3>
          <p className="mt-2 text-sm text-slate-600">{quota.note}</p>
        </div>
        {quota.locked ? (
          <Badge variant="warning">
            <span className="inline-flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Locked
            </span>
          </Badge>
        ) : (
          <Badge variant="success">Available</Badge>
        )}
      </div>

      {hasNumbers && !quota.locked ? (
        <div className="mt-4 space-y-2 text-sm">
          {quota.used !== undefined ? (
            <Row label="Used" value={`${quota.used.toLocaleString()}${quota.unit ? ` ${quota.unit}` : ''}`} />
          ) : null}
          {quota.remaining !== undefined ? (
            <Row label="Remaining" value={quota.remaining.toLocaleString()} />
          ) : null}
          {quota.limit !== undefined ? (
            <Row label="Limit" value={`${quota.limit.toLocaleString()}${quota.unit ? ` ${quota.unit}` : ''}`} />
          ) : null}
          {percent !== null ? (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-green-primary"
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {quota.locked && quota.requiredPlan ? (
        <p className="mt-4 text-sm font-medium text-gold">Required plan: {quota.requiredPlan}</p>
      ) : null}

      {quota.locked && !hasNumbers ? (
        <p className="mt-4 text-sm text-slate-600">Locked on current plan</p>
      ) : null}
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-forest">{value}</span>
    </div>
  );
}
