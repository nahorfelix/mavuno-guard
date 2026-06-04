import Image from 'next/image';
import { NormalizedTreeAnalysis } from '@/types/trees';

type TreeAnalysisResultProps = {
  analysis: NormalizedTreeAnalysis | null;
};

export function TreeAnalysisResult({ analysis }: TreeAnalysisResultProps) {
  if (!analysis) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Analysis results</h2>
        <p className="mt-3 text-sm text-slate-600">Upload an image to see tree count, canopy coverage, and health recommendations.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Tree analysis</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">Canopy insights</h2>
        </div>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
          Confidence {Math.round(analysis.confidenceScore * 100)}%
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Tree count</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{analysis.treeCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Density / acre</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{analysis.densityPerAcre}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Canopy coverage</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{analysis.canopyCoverage}%</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Healthy trees</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{analysis.healthBreakdown.healthyTrees}</p>
        </div>
      </div>

      {analysis.overlayImageUrl ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200">
          <Image
            src={analysis.overlayImageUrl}
            alt="Tree canopy overlay"
            width={1200}
            height={420}
            className="h-64 w-full object-cover"
            unoptimized
          />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Recommendations</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            {analysis.recommendations.length ? (
              analysis.recommendations.map((item, index) => (
                <li key={index} className="leading-6">
                  • {item}
                </li>
              ))
            ) : (
              <li>No recommendations available.</li>
            )}
          </ul>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Observations</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            {analysis.observations.length ? (
              analysis.observations.map((item, index) => (
                <li key={index} className="leading-6">
                  • {item}
                </li>
              ))
            ) : (
              <li>No observations available.</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
