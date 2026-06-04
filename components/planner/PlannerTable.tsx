'use client';

import { Card } from '@/components/ui/Card';
import type { HourlyPlanRow } from '@/types/planner';
import { getBadgeColor } from '@/lib/field-planner';

interface PlannerTableProps {
  rows: HourlyPlanRow[];
  isLoading?: boolean;
  error?: string;
}

export const PlannerTable = ({ rows, isLoading = false, error }: PlannerTableProps) => {
  if (isLoading) {
    return (
      <Card className="col-span-1 lg:col-span-2 p-5 rounded-3xl shadow-soft">
        <div className="space-y-3 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-1 lg:col-span-2 rounded-3xl border border-alert/20 bg-red-50 p-5">
        <h3 className="text-base font-semibold text-alert">Unable to load hourly plan</h3>
        <p className="text-sm text-red-700 mt-2">{error}</p>
      </Card>
    );
  }

  if (!rows.length) {
    return (
      <Card className="col-span-1 lg:col-span-2 rounded-3xl p-5 border border-gray-200 bg-cloud-white">
        <h3 className="text-base font-semibold text-forest">No hourly data available</h3>
        <p className="text-sm text-text-muted mt-2">Hourly forecast could not be loaded. Check your API route.</p>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2 rounded-3xl p-5 border border-gray-200 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-forest">Hourly Operation Plan</h3>
        <p className="text-sm text-text-muted">Next 12 hours</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-xs uppercase text-text-muted">
              <th className="pb-3 pr-4">Time</th>
              <th className="pb-3 pr-4">Temp</th>
              <th className="pb-3 pr-4">Rain Risk</th>
              <th className="pb-3 pr-4">Wind Risk</th>
              <th className="pb-3 pr-4">Humidity</th>
              <th className="pb-3 pb-3 pr-4">Action</th>
              <th className="pb-3">Suitability</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="bg-white rounded-3xl shadow-card mb-2 align-middle">
                <td className="py-4 pr-4 font-semibold text-forest">{row.time}</td>
                <td className="py-4 pr-4 text-sm text-text-muted">{Math.round(row.temperature)}°C</td>
                <td className="py-4 pr-4 text-sm text-text-muted">{row.rainProbability}%</td>
                <td className="py-4 pr-4 text-sm text-text-muted">{row.windSpeed} km/h</td>
                <td className="py-4 pr-4 text-sm text-text-muted">{row.humidity}%</td>
                <td className="py-4 pr-4 text-sm text-forest max-w-[220px]">{row.action}</td>
                <td className="py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getBadgeColor(row.suitability)}`}>
                    {row.suitability}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
