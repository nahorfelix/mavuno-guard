'use client';

import { AlertTriangle, CheckCircle, Server, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import type { NormalizedOperationsHealth } from '@/types/operations';

type OperationsStatusBannerProps = {
  health: NormalizedOperationsHealth | null;
  loading: boolean;
  error?: string;
};

const stateStyles = {
  healthy: {
    card: 'border-green-200 bg-green-50',
    icon: CheckCircle,
    iconClass: 'text-green-primary',
    badge: 'success' as const,
    label: 'Healthy',
  },
  demo: {
    card: 'border-yellow-200 bg-yellow-50',
    icon: AlertTriangle,
    iconClass: 'text-gold',
    badge: 'warning' as const,
    label: 'Demo mode',
  },
  degraded: {
    card: 'border-orange-200 bg-orange-50',
    icon: AlertTriangle,
    iconClass: 'text-soil',
    badge: 'warning' as const,
    label: 'Degraded',
  },
  error: {
    card: 'border-red-200 bg-red-50',
    icon: XCircle,
    iconClass: 'text-alert',
    badge: 'danger' as const,
    label: 'Error',
  },
};

export function OperationsStatusBanner({ health, loading, error }: OperationsStatusBannerProps) {
  if (loading) {
    return (
      <Card className="animate-pulse space-y-3 shadow-soft">
        <div className="h-6 w-48 rounded bg-slate-200" />
        <div className="h-4 w-full max-w-xl rounded bg-slate-200" />
        <div className="h-4 w-2/3 rounded bg-slate-200" />
      </Card>
    );
  }

  const state = health?.overallState ?? 'error';
  const styles = stateStyles[state];
  const Icon = styles.icon;

  return (
    <Card className={`border-l-4 border-l-green-primary shadow-card ${styles.card}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <Icon className={`mt-1 h-6 w-6 shrink-0 ${styles.iconClass}`} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Server className="h-4 w-4 text-forest" />
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-text-muted">
                Service health
              </p>
              <Badge variant={styles.badge}>{styles.label}</Badge>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-forest">WeatherAI integration status</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-700">
              {error || health?.message || 'Health check did not return a status message.'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatusItem label="Environment key exists" value={health?.envKeyExists ? 'Yes' : 'No'} ok={health?.envKeyExists} />
        <StatusItem label="Key format valid" value={health?.envKeyHasCorrectFormat ? 'Yes' : 'No'} ok={health?.envKeyHasCorrectFormat} />
        <StatusItem label="WeatherAI reachable" value={health?.weatherAIReachable ? 'Yes' : 'No'} ok={health?.weatherAIReachable} />
        <StatusItem
          label="Status code"
          value={health?.weatherAIStatus != null ? String(health.weatherAIStatus) : '—'}
          ok={health?.weatherAIStatus === 200}
        />
      </div>

      <p className="mt-4 text-xs text-text-muted">
        API keys are never displayed. Configuration is validated server-side only.
      </p>
    </Card>
  );
}

function StatusItem({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="rounded-2xl bg-white/70 p-3 text-sm">
      <p className="text-text-muted">{label}</p>
      <p className={`mt-1 font-semibold ${ok ? 'text-green-primary' : 'text-forest'}`}>{value}</p>
    </div>
  );
}
