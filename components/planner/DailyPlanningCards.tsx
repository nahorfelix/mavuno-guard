'use client';

import { Card } from '@/components/ui/Card';
import type { DailyPlanCard } from '@/types/planner';
import { getBadgeColor } from '@/lib/field-planner';

interface DailyPlanningCardsProps {
  cards: DailyPlanCard[];
  isLoading?: boolean;
  error?: string;
}

export const DailyPlanningCards = ({ cards, isLoading = false, error }: DailyPlanningCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, idx) => (
          <Card key={idx} className="h-40 rounded-3xl shadow-soft">
            <div className="h-full animate-pulse bg-gray-200 rounded-3xl" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="col-span-1 lg:col-span-3 rounded-3xl border border-alert/20 bg-red-50 p-5">
        <h3 className="text-base font-semibold text-alert">Unable to load daily planning</h3>
        <p className="text-sm text-red-700 mt-2">{error}</p>
      </Card>
    );
  }

  if (!cards.length) {
    return (
      <Card className="rounded-3xl p-5 border border-gray-200 bg-cloud-white">
        <h3 className="text-base font-semibold text-forest">No daily forecast available</h3>
        <p className="text-sm text-text-muted mt-2">Daily planning cards will appear when forecast data is available.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {cards.map((card, idx) => (
        <Card key={idx} className="rounded-3xl border border-gray-200 p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-text-muted">{card.date}</p>
              <h4 className="mt-2 text-base font-semibold text-forest">{card.condition || 'Weather summary'}</h4>
            </div>
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getBadgeColor(card.suitability)}`}>
              {card.suitability}
            </span>
          </div>

          <div className="space-y-2 text-sm text-forest">
            <p>Max: <span className="font-semibold">{Math.round(card.maxTemp)}°C</span></p>
            <p>Min: <span className="font-semibold">{Math.round(card.minTemp)}°C</span></p>
            <p>Rain: <span className="font-semibold">{card.rainProbability}%</span></p>
            <p>Wind: <span className="font-semibold">{card.windSpeed} km/h</span></p>
          </div>

          <div className="mt-4 rounded-2xl bg-cloud-white p-3 text-sm text-text-muted border border-gray-100">
            {card.recommendation}
          </div>
        </Card>
      ))}
    </div>
  );
};
