import { NormalizedTreeQuota } from '@/types/trees';

type TreeQuotaCardProps = {
  quota: NormalizedTreeQuota | null;
};

export function TreeQuotaCard({ quota }: TreeQuotaCardProps) {
  const percentage = quota?.monthlyLimit ? Math.min(100, Math.round(((quota.scansUsed || 0) / quota.monthlyLimit) * 100)) : 0;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Quota</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">Tree analysis limit</h2>
        </div>
        {quota?.demoMode ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            Demo
          </span>
        ) : null}
      </div>

      <div className="mt-5 space-y-4">
        <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
          <p>Plan: <span className="font-semibold text-slate-900">{quota?.plan ?? 'Loading...'}</span></p>
          <p className="mt-2">Scans used: <span className="font-semibold text-slate-900">{quota?.scansUsed ?? '—'}</span></p>
          <p>Remaining: <span className="font-semibold text-slate-900">{quota?.scansRemaining ?? '—'}</span></p>
          {quota?.monthlyLimit ? <p>Monthly limit: <span className="font-semibold text-slate-900">{quota.monthlyLimit}</span></p> : null}
        </div>

        {quota ? (
          <div className="rounded-3xl bg-slate-100 p-3">
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-slate-900" style={{ width: `${percentage}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">{percentage}% of monthly quota used.</p>
          </div>
        ) : null}

        {quota && !quota.supported ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Forestry tree analysis is not enabled for your plan.
          </div>
        ) : null}

        {quota?.message ? (
          <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">{quota.message}</div>
        ) : null}
      </div>
    </section>
  );
}
