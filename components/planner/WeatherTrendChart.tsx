'use client';

import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  Line,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Card } from '@/components/ui/Card';

interface WeatherTrendChartProps {
  data: Array<{ time: string; temperature: number; rain: number }>;
  isLoading?: boolean;
}

export const WeatherTrendChart = ({ data, isLoading = false }: WeatherTrendChartProps) => {
  if (isLoading) {
    return (
      <Card className="rounded-3xl p-5 shadow-soft">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card className="rounded-3xl p-5 border border-gray-200 bg-cloud-white">
        <h3 className="text-lg font-semibold text-forest mb-2">Weather Trends</h3>
        <p className="text-sm text-text-muted">Hourly trend data is unavailable for charting.</p>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl p-5 shadow-soft">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-forest">Weather Trend Charts</h3>
        <p className="text-sm text-text-muted">Hourly forecast</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip />
              <Line type="monotone" dataKey="temperature" stroke="#2F855A" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip />
              <Bar dataKey="rain" fill="#F2C94C" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};
