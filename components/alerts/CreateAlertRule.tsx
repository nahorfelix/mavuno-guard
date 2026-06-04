'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { AlertChannel, AlertRule, AlertType, AlertStatus, PlanCapabilities } from '@/types/alerts';

const types: Array<{ value: AlertType; label: string; thresholdLabel: string; thresholdPlaceholder: string }> = [
  { value: 'heavy rain', label: 'Heavy rain', thresholdLabel: 'Rain threshold (%)', thresholdPlaceholder: '60' },
  { value: 'strong wind', label: 'Strong wind', thresholdLabel: 'Wind threshold (km/h)', thresholdPlaceholder: '20' },
  { value: 'heat stress', label: 'Heat stress', thresholdLabel: 'Temperature threshold (°C)', thresholdPlaceholder: '30' },
  { value: 'frost risk', label: 'Frost risk', thresholdLabel: 'Temperature threshold (°C)', thresholdPlaceholder: '4' },
  { value: 'irrigation reminder', label: 'Irrigation reminder', thresholdLabel: 'Temperature threshold (°C)', thresholdPlaceholder: '28' },
  { value: 'fertilizer warning', label: 'Fertilizer warning', thresholdLabel: 'Humidity threshold (%)', thresholdPlaceholder: '80' },
  { value: 'spraying window', label: 'Spraying window', thresholdLabel: 'Rain threshold (%)', thresholdPlaceholder: '30' },
];

const channels: Array<{ value: AlertChannel; label: string; plan: string }> = [
  { value: 'in-app', label: 'In-app', plan: 'Free' },
  { value: 'webhook', label: 'Webhook', plan: 'Pro' },
  { value: 'sms', label: 'SMS', plan: 'Scale' },
];

const statuses: Array<{ value: AlertStatus; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
];

const buildRuleLabel = (alertType: AlertType, value: number) => {
  switch (alertType) {
    case 'heavy rain':
      return `Heavy rain above ${value}%`;
    case 'strong wind':
      return `Wind speed above ${value} km/h`;
    case 'heat stress':
      return `Heat above ${value}°C`;
    case 'frost risk':
      return `Frost risk below ${value}°C`;
    case 'irrigation reminder':
      return `Irrigation reminder above ${value}°C`;
    case 'fertilizer warning':
      return `Humidity above ${value}%`;
    case 'spraying window':
      return `Spraying window below ${value}% rain`;
    default:
      return 'Custom alert rule';
  }
};

type CreateAlertRuleProps = {
  capabilities: PlanCapabilities | null;
  onCreate: (rule: AlertRule) => void;
};

export function CreateAlertRule({ capabilities, onCreate }: CreateAlertRuleProps) {
  const [type, setType] = useState<AlertType>('heavy rain');
  const [location, setLocation] = useState('Farm field');
  const [threshold, setThreshold] = useState(60);
  const [channel, setChannel] = useState<AlertChannel>('in-app');
  const [status, setStatus] = useState<AlertStatus>('active');
  const [error, setError] = useState('');

  const selectedType = types.find((item) => item.value === type)!;

  const channelAvailable = useMemo(() => {
    if (channel === 'webhook') return capabilities?.webhooks;
    if (channel === 'sms') return capabilities?.sms;
    return true;
  }, [channel, capabilities]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!location.trim()) {
      setError('Please provide a location.');
      return;
    }

    if (threshold <= 0) {
      setError('Threshold must be greater than zero.');
      return;
    }

    if (!channelAvailable) {
      setError(`The ${channel} channel is locked on your plan.`);
      return;
    }

    onCreate({
      id: `${type}-${Date.now()}`,
      type,
      label: buildRuleLabel(type, threshold),
      location: location.trim(),
      threshold,
      channel,
      status,
    });

    setLocation('Farm field');
    setThreshold(60);
    setChannel('in-app');
    setStatus('active');
  };

  return (
    <Card className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Create rule</p>
        <h2 className="mt-2 text-xl font-semibold text-forest">Add a new alert rule</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-700">
            Alert type
            <select
              value={type}
              onChange={(event) => setType(event.target.value as AlertType)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-green-primary focus:ring-2 focus:ring-green-100"
            >
              {types.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-slate-700">
            Location
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-green-primary focus:ring-2 focus:ring-green-100"
              placeholder="E.g. North field"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-700">
            {selectedType.thresholdLabel}
            <input
              type="number"
              value={threshold}
              onChange={(event) => setThreshold(Number(event.target.value))}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-green-primary focus:ring-2 focus:ring-green-100"
              placeholder={selectedType.thresholdPlaceholder}
            />
          </label>

          <label className="block text-sm text-slate-700">
            Channel
            <select
              value={channel}
              onChange={(event) => setChannel(event.target.value as AlertChannel)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-green-primary focus:ring-2 focus:ring-green-100"
            >
              {channels.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                  disabled={item.value !== 'in-app' && !((item.value === 'webhook' && capabilities?.webhooks) || (item.value === 'sms' && capabilities?.sms))}
                >
                  {item.label} {item.value !== 'in-app' ? `(${item.plan})` : ''}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm text-slate-700">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as AlertStatus)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-green-primary focus:ring-2 focus:ring-green-100"
          >
            {statuses.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>

        {channel !== 'in-app' && !channelAvailable ? (
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-slate-700">
            <Badge variant="warning" className="mb-2">
              {channel === 'webhook' ? 'Pro required' : 'Scale required'}
            </Badge>
            <p>
              {channel === 'webhook'
                ? 'Webhook alerts require the Pro plan. You can still create in-app rules on the Free plan.'
                : 'SMS alerts require the Scale plan. You can still create in-app rules on the Free plan.'}
            </p>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-3xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
        ) : null}

        <Button type="submit" variant="primary" className="w-full">
          Create alert rule
        </Button>
      </form>
    </Card>
  );
}
