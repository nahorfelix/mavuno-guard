'use client';

import { NormalizedForestryCount } from '@/types/trees';

type ForestryCountCardProps = {
  countResult: NormalizedForestryCount | null;
  canRun: boolean;
  loading: boolean;
  supported: boolean;
  onRunCount: () => Promise<void>;
  message?: string;
};

export function ForestryCountCard({ countResult, canRun, loading, supported, onRunCount, message }: ForestryCountCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Forestry count</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">Count trees and canopy</h2>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-600">
        Use the forestry count endpoint to turn canopy imagery into an accurate tree inventory summary.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <button
          type="button"
          disabled={!canRun || loading || !supported}
          onClick={onRunCount}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? 'Counting trees…' : 'Run forestry count'}
        </button>

        {!supported ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Forestry count is not available on this plan.
          </div>
        ) : !canRun ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Upload a canopy image to enable forestry counting.
          </div>
        ) : null}

        {message ? (
          <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">{message}</div>
        ) : null}
      </div>

      {countResult ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Estimated tree count</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{countResult.treeCount}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Canopy coverage</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{countResult.canopyCoverage}%</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Density per acre</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{countResult.densityPerAcre}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Confidence</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{Math.round(countResult.confidenceScore * 100)}%</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
