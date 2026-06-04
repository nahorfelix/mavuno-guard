'use client';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import type { NormalizedOperationsUsage } from '@/types/operations';

type UsageOverviewProps = {
  usage: NormalizedOperationsUsage | null;
  loading: boolean;
  error?: string;
};

export function UsageOverview({ usage, loading, error }: UsageOverviewProps) {
  if (loading) {
    return (
      <Card className="animate-pulse shadow-soft">
        <div className="h-6 w-40 rounded bg-slate-200" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-16 rounded-2xl bg-slate-100" />
          ))}
        </div>
      </Card>
    );
  }

  if (error || !usage) {
    return (
      <Card className="border-red-100 bg-red-50 shadow-soft">
        <h3 className="text-lg font-semibold text-forest">Usage overview</h3>
        <p className="mt-2 text-sm text-alert">{error || 'Usage data is unavailable.'}</p>
      </Card>
    );
  }

  const requestPct = usage.requestsLimit
    ? Math.round((usage.requestsUsed / usage.requestsLimit) * 100)
    : 0;
  const aiPct = usage.aiRequestsLimit
    ? Math.round((usage.aiRequestsUsed / usage.aiRequestsLimit) * 100)
    : 0;

  return (
    <Card className="shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-text-muted">Usage overview</p>
          <h3 className="mt-2 text-xl font-semibold text-forest">WeatherAI consumption</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="primary">{usage.plan} plan</Badge>
          {usage.demoMode ? <Badge variant="warning">Demo data</Badge> : <Badge variant="success">Live data</Badge>}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Metric label="Requests used" value={usage.requestsUsed.toLocaleString()} />
        <Metric label="Requests remaining" value={usage.requestsRemaining.toLocaleString()} />
        <Metric label="Monthly request limit" value={usage.requestsLimit.toLocaleString()} />
        <Metric label="AI requests used" value={usage.aiRequestsUsed.toLocaleString()} />
        <Metric label="AI requests remaining" value={usage.aiRequestsRemaining.toLocaleString()} />
        <Metric label="Monthly AI limit" value={usage.aiRequestsLimit.toLocaleString()} />
        <Metric label="Max forecast days" value={String(usage.maxForecastDays)} />
        <Metric label="Webhooks" value={usage.webhooksEnabled ? 'Enabled' : 'Disabled'} highlight={usage.webhooksEnabled} />
        <Metric label="SMS" value={usage.smsEnabled ? 'Enabled' : 'Disabled'} highlight={usage.smsEnabled} />
      </div>

      <div className="mt-6 space-y-4">
        <ProgressBar label="Weather requests" percent={requestPct} used={usage.requestsUsed} limit={usage.requestsLimit} />
        <ProgressBar label="AI requests" percent={aiPct} used={usage.aiRequestsUsed} limit={usage.aiRequestsLimit} />
      </div>

      {(usage.resetDate || usage.billingPeriod || usage.todayUsage !== undefined) && (
        <div className="mt-5 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
          {usage.resetDate ? <span>Reset: {formatDate(usage.resetDate)}</span> : null}
          {usage.billingPeriod ? <span>Billing period: {usage.billingPeriod}</span> : null}
          {usage.todayUsage !== undefined ? <span>Today: {usage.todayUsage.toLocaleString()} requests</span> : null}
        </div>
      )}
    </Card>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl bg-cloud-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
      <p className={`mt-2 text-lg font-semibold ${highlight ? 'text-green-primary' : 'text-forest'}`}>{value}</p>
    </div>
  );
}

function ProgressBar({
  label,
  percent,
  used,
  limit,
}: {
  label: string;
  percent: number;
  used: number;
  limit: number;
}) {
  const color = percent > 85 ? 'bg-alert' : percent > 65 ? 'bg-gold' : 'bg-green-primary';

  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-medium text-forest">{label}</span>
        <span className="text-slate-600">
          {used.toLocaleString()} / {limit.toLocaleString()} ({percent}%)
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}
