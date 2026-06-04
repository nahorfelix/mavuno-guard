'use client';

type TreeStatusBannerProps = {
  demoMode: boolean;
  error?: string;
};

export function TreeStatusBanner({ demoMode, error }: TreeStatusBannerProps) {
  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        <p className="font-semibold">Tree Lab status</p>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-900">Tree Lab is ready.</p>
          <p className="mt-1">Upload crop canopy imagery to analyze tree count, canopy cover, and health.</p>
        </div>
        {demoMode ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            Demo mode active
          </span>
        ) : (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Live lab enabled
          </span>
        )}
      </div>
    </div>
  );
}
