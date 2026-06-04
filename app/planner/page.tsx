'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PlannerStatusBanner } from '@/components/planner/PlannerStatusBanner';
import { PlannerTable } from '@/components/planner/PlannerTable';
import { DailyPlanningCards } from '@/components/planner/DailyPlanningCards';
import { OperationWindowCard } from '@/components/planner/OperationWindowCard';
import { WeatherTrendChart } from '@/components/planner/WeatherTrendChart';
import {
  normalizeHourlyWeather,
  normalizeDailyWeather,
  mapHourlyToPlannerRows,
  createDailyPlanCards,
  buildChartData,
  getBestSprayingWindow,
  getBestIrrigationWindow,
  getFertilizerWarning,
  getHarvestingSuitability,
  getDrainageWarning,
} from '@/lib/field-planner';
import type {
  HourlyPlanRow,
  DailyPlanCard,
  OperationWindowSummary,
  PlannerStatus,
} from '@/types/planner';

export default function PlannerPage() {
  const [hourlyRows, setHourlyRows] = useState<HourlyPlanRow[]>([]);
  const [dailyCards, setDailyCards] = useState<DailyPlanCard[]>([]);
  const [chartData, setChartData] = useState<Array<{ time: string; temperature: number; rain: number }>>([]);
  const [operationSummaries, setOperationSummaries] = useState<OperationWindowSummary[]>([]);
  const [status, setStatus] = useState<PlannerStatus>({
    isLoading: true,
    hasHourly: false,
    hasDaily: false,
    errors: {},
  });

  useEffect(() => {
    const fetchPlannerData = async () => {
      setStatus({ isLoading: true, hasHourly: false, hasDaily: false, errors: {} });
      const errors: Record<string, string> = {};

      try {
        const [hourlyRes, dailyRes] = await Promise.all([
          fetch('/api/weather/hourly'),
          fetch('/api/weather/daily'),
        ]);

        const hourlyJson = await hourlyRes.json().catch(() => ({}));
        const dailyJson = await dailyRes.json().catch(() => ({}));

        const hourly = normalizeHourlyWeather(hourlyJson);
        const daily = normalizeDailyWeather(dailyJson);

        if (!hourlyRes.ok || !hourly.length) {
          errors.hourly = hourlyJson?.error?.message || 'Hourly data unavailable';
          setHourlyRows([]);
          setChartData([]);
        } else {
          setHourlyRows(mapHourlyToPlannerRows(hourly));
          setChartData(buildChartData(hourly));
        }

        if (!dailyRes.ok || !daily.length) {
          errors.daily = dailyJson?.error?.message || 'Daily data unavailable';
          setDailyCards([]);
        } else {
          setDailyCards(createDailyPlanCards(daily));
        }

        setOperationSummaries([
          getBestSprayingWindow(hourly),
          getBestIrrigationWindow(hourly),
          getFertilizerWarning(daily),
          getHarvestingSuitability(daily),
          getDrainageWarning(daily),
        ]);

        setStatus({
          isLoading: false,
          hasHourly: hourly.length > 0,
          hasDaily: daily.length > 0,
          errors,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        setStatus({
          isLoading: false,
          hasHourly: false,
          hasDaily: false,
          errors: { fetch: message },
        });
      }
    };

    fetchPlannerData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-forest">Field Planner</h2>
          <p className="text-text-muted mt-2">Plan your upcoming work windows using hourly and daily weather intelligence.</p>
        </div>

        <PlannerStatusBanner status={status} />

        <div className="grid gap-6 xl:grid-cols-3">
          {operationSummaries.map((summary) => (
            <OperationWindowCard key={summary.title} summary={summary} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <PlannerTable rows={hourlyRows} isLoading={status.isLoading} error={status.errors.hourly} />
          <WeatherTrendChart data={chartData} isLoading={status.isLoading} />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-forest mb-4">Daily Field Plan</h3>
          <DailyPlanningCards cards={dailyCards} isLoading={status.isLoading} error={status.errors.daily} />
        </div>
      </div>
    </DashboardLayout>
  );
}
