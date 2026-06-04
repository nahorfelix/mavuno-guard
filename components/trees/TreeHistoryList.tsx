import { NormalizedTreeHistoryItem } from '@/types/trees';

type TreeHistoryListProps = {
  history: NormalizedTreeHistoryItem[];
};

export function TreeHistoryList({ history }: TreeHistoryListProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">History</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">Recent scan sessions</h2>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="mt-6 rounded-3xl bg-slate-50 p-6 text-sm text-slate-600">
          No tree scan history is available yet. Upload a canopy image to create a new entry.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {history.map((item, index) => (
            <div key={`${item.date}-${index}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.location || item.county || 'Untitled scan'}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.date}</p>
                </div>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">{item.status}</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <p className="text-sm text-slate-700">Tree count: <span className="font-semibold text-slate-900">{item.treeCount}</span></p>
                <p className="text-sm text-slate-700">Canopy coverage: <span className="font-semibold text-slate-900">{item.canopyCoverage}%</span></p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
