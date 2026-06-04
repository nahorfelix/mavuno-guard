'use client';

import { Badge } from '@/components/ui/Badge';
import type { PlanCapabilities } from '@/types/alerts';

type AlertStatusBannerProps = {
  capabilities: PlanCapabilities | null;
  loading: boolean;
  error?: string;
  planLimitation?: boolean;
};

export function AlertStatusBanner({
  capabilities,
  loading,
  error,
  planLimitation,
}: AlertStatusBannerProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-cloud-white p-6 shadow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-text-muted">Alert status</p>
          <h2 className="mt-2 text-xl font-semibold text-forest">Plan-aware alert delivery</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Your current WeatherAI plan supports local rule previews. Webhooks and SMS are shown as
            plan-aware previews.
          </p>
          {error ? (
            <p className={`mt-3 text-sm ${planLimitation ? 'text-gold' : 'text-alert'}`}>{error}</p>
          ) : null}
        </div>

        {loading ? (
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Loading plan details…</Badge>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">In-app: Available</Badge>
            <Badge variant={capabilities?.webhooks ? 'success' : 'warning'}>
              Webhooks: {capabilities?.webhooks ? 'Available' : 'Locked on current plan'}
            </Badge>
            <Badge variant={capabilities?.sms ? 'success' : 'warning'}>
              SMS: {capabilities?.sms ? 'Available' : 'Locked on current plan'}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
