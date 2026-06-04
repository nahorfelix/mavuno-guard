'use client';

import { useCallback, useEffect, useState } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ApiHealthCard } from '@/components/operations/ApiHealthCard';
import { IntegrationStatus } from '@/components/operations/IntegrationStatus';
import { OperationsStatusBanner } from '@/components/operations/OperationsStatusBanner';
import { QuotaCard } from '@/components/operations/QuotaCard';
import { RateLimitCard } from '@/components/operations/RateLimitCard';
import { UsageOverview } from '@/components/operations/UsageOverview';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  buildOperationsSnapshot,
  buildQuotaCards,
  inferPlanLabel,
} from '@/lib/operations-normalizer';
import type { OperationsSnapshot } from '@/types/operations';

const fetchApi = async (endpoint: string) => {
  const response = await fetch(endpoint, { cache: 'no-store' });
  const json = await response.json().catch(() => ({}));
  return { response, json };
};

const emptySnapshot = (): OperationsSnapshot => ({
  health: null,
  usage: null,
  rateLimit: { available: false, source: 'Rate limit headers were not included in this response.' },
  quotas: buildQuotaCards(null, {}),
  integrations: [],
  apiHealth: [],
  demoMode: true,
  lastRefreshed: new Date().toISOString(),
  errors: {},
});

export default function OperationsPage() {
  const [snapshot, setSnapshot] = useState<OperationsSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const loadOperations = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const errors: Record<string, string> = {};
    let healthJson: unknown = {};
    let usageJson: unknown = {};
    let treeQuotaJson: unknown = {};

    try {
      const healthResult = await fetchApi('/api/health/weather-ai');
      healthJson = healthResult.json;
      if (!healthResult.response.ok) {
        const errBody = healthResult.json as Record<string, unknown> | undefined;
        const nestedErr =
          errBody?.error && typeof errBody.error === 'object'
            ? (errBody.error as Record<string, unknown>).message
            : undefined;
        const errMessage =
          (typeof nestedErr === 'string' && nestedErr) ||
          (typeof errBody?.message === 'string' && errBody.message) ||
          '';
        errors.health =
          errMessage ||
          `Health check failed (HTTP ${healthResult.response.status}). Try restarting the dev server (delete .next, then npm run dev).`;
      }
    } catch {
      errors.health = 'Unable to reach /api/health/weather-ai.';
    }

    try {
      const usageResult = await fetchApi('/api/usage');
      usageJson = usageResult.json;
      if (!usageResult.response.ok) {
        const message = usageResult.json?.error?.message || 'Usage API returned an error.';
        errors.usage =
          usageResult.response.status === 403
            ? message || 'This feature is not available on your current WeatherAI plan.'
            : message;
      }
    } catch {
      errors.usage = 'Unable to reach /api/usage.';
    }

    try {
      const treeResult = await fetchApi('/api/trees/quota');
      treeQuotaJson = treeResult.json;
      if (!treeResult.response.ok) {
        errors.treeQuota = treeResult.json?.error?.message || 'Tree quota unavailable.';
      }
    } catch {
      errors.treeQuota = 'Unable to reach /api/trees/quota.';
    }

    try {
      const nextSnapshot = buildOperationsSnapshot(healthJson, usageJson, treeQuotaJson, errors);
      if (!nextSnapshot.health && !errors.health) {
        errors.health =
          'Health check did not return valid data. Restart the dev server: remove .next, then run npm run dev.';
      }
      setSnapshot({ ...nextSnapshot, errors });
    } catch {
      errors.snapshot = 'Failed to process operations data.';
      setSnapshot({ ...emptySnapshot(), errors });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadOperations();
  }, [loadOperations]);

  const planLabel = inferPlanLabel(snapshot.usage, snapshot.health);
  const modeLabel = snapshot.demoMode ? 'Demo mode' : 'Live API';
  const showLoading = !mounted || loading;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-green-100 p-3">
              <Activity className="h-6 w-6 text-green-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-forest">Operations</h1>
              <p className="mt-2 max-w-2xl text-text-muted">
                Monitor WeatherAI usage, quotas, service health, and integration readiness.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="primary">
              <span className="whitespace-nowrap">{planLabel} plan</span>
            </Badge>
            <Badge variant={snapshot.demoMode ? 'warning' : 'success'}>
              <span className="whitespace-nowrap">{modeLabel}</span>
            </Badge>
            <Button
              type="button"
              variant="secondary"
              className="inline-flex items-center gap-2"
              onClick={() => loadOperations(true)}
              disabled={showLoading || refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {!mounted ? (
          <Card className="border-slate-200 bg-white shadow-soft">
            <p className="text-sm text-slate-600">Loading operations dashboard…</p>
          </Card>
        ) : null}

        <OperationsStatusBanner
          health={snapshot.health}
          loading={showLoading}
          error={snapshot.errors.health}
        />

        {Object.keys(snapshot.errors).length > 0 && !showLoading ? (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-forest">Partial data loaded</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {Object.entries(snapshot.errors).map(([key, message]) => (
                <li key={key}>
                  <span className="font-medium capitalize">{key}</span>: {message}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <UsageOverview usage={snapshot.usage} loading={showLoading} error={snapshot.errors.usage} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-forest">Quota cards</h2>
                <p className="mt-1 text-sm text-text-muted">
                  Request, AI, tree scan, and plan-gated feature allowances.
                </p>
              </div>
              {showLoading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-40 animate-pulse rounded-lg bg-slate-100" />
                  ))}
                </div>
              ) : snapshot.quotas.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {snapshot.quotas.map((quota) => (
                    <QuotaCard key={quota.id} quota={quota} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600">Quota details are not available yet.</p>
              )}
            </section>
          </div>
          <RateLimitCard rateLimit={snapshot.rateLimit} loading={showLoading} />
        </div>

        <IntegrationStatus rows={snapshot.integrations} loading={showLoading} />

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-forest">API health</h2>
            <p className="mt-1 text-sm text-text-muted">
              Production readiness signals for DevOps and SRE review.
            </p>
          </div>
          {showLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-36 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : snapshot.apiHealth.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {snapshot.apiHealth.map((item) => (
                <ApiHealthCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <Card className="shadow-soft">
              <p className="text-sm text-slate-600">API health cards will appear after data loads.</p>
            </Card>
          )}
        </section>

        {mounted && !showLoading ? (
          <p className="text-center text-xs text-text-muted">
            Last refreshed: {new Date(snapshot.lastRefreshed).toLocaleString()}
          </p>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
