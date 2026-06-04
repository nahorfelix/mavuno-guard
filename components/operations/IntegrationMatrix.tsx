'use client';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import type { IntegrationRow, IntegrationStatusValue } from '@/types/operations';

type IntegrationMatrixProps = {
  rows: IntegrationRow[];
  loading: boolean;
};

const statusVariant: Record<IntegrationStatusValue, 'success' | 'primary' | 'warning' | 'danger' | 'secondary' | 'default'> = {
  active: 'success',
  available: 'primary',
  locked: 'warning',
  demo: 'secondary',
  error: 'danger',
  'not-tested': 'default',
};

const statusLabel: Record<IntegrationStatusValue, string> = {
  active: 'Active',
  available: 'Available',
  locked: 'Locked',
  demo: 'Demo',
  error: 'Error',
  'not-tested': 'Not tested',
};

export function IntegrationMatrix({ rows, loading }: IntegrationMatrixProps) {
  if (loading) {
    return (
      <Card className="animate-pulse shadow-soft">
        <div className="h-6 w-48 rounded bg-slate-200" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-12 rounded-xl bg-slate-100" />
          ))}
        </div>
      </Card>
    );
  }

  if (!rows.length) {
    return (
      <Card className="shadow-soft">
        <p className="text-sm text-slate-600">No integration rows are available.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-card">
      <h3 className="text-lg font-semibold text-forest">Integration matrix</h3>
      <p className="mt-1 text-sm text-text-muted">
        Internal routes and feature readiness inferred from health, usage, and plan capabilities.
      </p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-text-muted">
              <th className="px-3 py-3 font-semibold">Integration</th>
              <th className="px-3 py-3 font-semibold">Route</th>
              <th className="px-3 py-3 font-semibold">Plan</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold">Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-3 font-medium text-forest">{row.name}</td>
                <td className="px-3 py-3 font-mono text-xs text-slate-600">{row.route}</td>
                <td className="px-3 py-3 text-slate-700">{row.requiredPlan}</td>
                <td className="px-3 py-3">
                  <Badge variant={statusVariant[row.status]}>{statusLabel[row.status]}</Badge>
                </td>
                <td className="px-3 py-3 text-slate-600">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
