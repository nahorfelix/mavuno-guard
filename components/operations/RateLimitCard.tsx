'use client';

import { Gauge } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { NormalizedRateLimit } from '@/types/operations';

type RateLimitCardProps = {
  rateLimit: NormalizedRateLimit;
  loading: boolean;
};

export function RateLimitCard({ rateLimit, loading }: RateLimitCardProps) {
  if (loading) {
    return (
      <Card className="animate-pulse shadow-soft">
        <div className="h-6 w-32 rounded bg-slate-200" />
        <div className="mt-4 h-4 w-full rounded bg-slate-200" />
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <div className="flex items-center gap-3">
        <Gauge className="h-5 w-5 text-green-primary" />
        <h3 className="text-lg font-semibold text-forest">Rate limits</h3>
      </div>

      {rateLimit.available ? (
        <dl className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-cloud-white p-4">
            <dt className="text-xs uppercase text-text-muted">Limit</dt>
            <dd className="mt-1 text-lg font-semibold text-forest">{rateLimit.limit ?? '—'}</dd>
          </div>
          <div className="rounded-2xl bg-cloud-white p-4">
            <dt className="text-xs uppercase text-text-muted">Remaining</dt>
            <dd className="mt-1 text-lg font-semibold text-green-primary">{rateLimit.remaining ?? '—'}</dd>
          </div>
          <div className="rounded-2xl bg-cloud-white p-4">
            <dt className="text-xs uppercase text-text-muted">Reset</dt>
            <dd className="mt-1 text-lg font-semibold text-forest">{formatReset(rateLimit.reset)}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-4 text-sm text-slate-600">{rateLimit.source}</p>
      )}

      {rateLimit.available ? (
        <p className="mt-4 text-xs text-text-muted">Source: {rateLimit.source}</p>
      ) : null}
    </Card>
  );
}

function formatReset(value?: string) {
  if (!value) return '—';
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 1_000_000_000) {
    return new Date(numeric * 1000).toLocaleString();
  }
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return date.toLocaleString();
  return value;
}
