'use client';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { getRuleMeta, isChannelAvailable } from '@/lib/alert-rules';
import type { AlertPreview, AlertRule, PlanCapabilities } from '@/types/alerts';

type AlertRuleCardProps = {
  rule: AlertRule;
  capabilities: PlanCapabilities | null;
  preview?: AlertPreview;
};

const riskVariant: Record<string, 'default' | 'warning' | 'danger'> = {
  low: 'default',
  medium: 'warning',
  high: 'danger',
};

const channelLabels: Record<string, string> = {
  'in-app': 'In-app',
  webhook: 'Webhook',
  sms: 'SMS',
};

const channelPlanNote: Record<string, string> = {
  webhook: 'Pro plan required',
  sms: 'Scale plan required',
};

export function AlertRuleCard({ rule, capabilities, preview }: AlertRuleCardProps) {
  const meta = getRuleMeta(rule, preview?.triggered);
  const channelOk = isChannelAvailable(rule.channel, capabilities);
  const riskLevel = preview?.riskLevel ?? meta.riskLevel;

  return (
    <Card className="space-y-4 border-slate-200 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-forest">{meta.name}</h3>
          <p className="mt-1 text-sm text-text-muted">
            {rule.location} · {channelLabels[rule.channel]}
          </p>
        </div>
        <Badge variant={channelOk ? 'success' : 'warning'}>
          {channelOk ? 'Available' : 'Plan locked'}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-cloud-white p-4 text-sm text-slate-700">
          <p className="font-semibold text-forest">Condition</p>
          <p className="mt-2">{meta.condition}</p>
        </div>
        <div className="rounded-2xl bg-cloud-white p-4 text-sm text-slate-700">
          <p className="font-semibold text-forest">Recommended action</p>
          <p className="mt-2">{meta.recommendation}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={rule.status === 'active' ? 'primary' : 'secondary'}>
          {rule.status === 'active' ? 'Active' : 'Paused'}
        </Badge>
        <Badge variant={rule.channel === 'in-app' ? 'success' : 'warning'}>
          {channelLabels[rule.channel]}
        </Badge>
        <Badge variant={riskVariant[riskLevel]}>{`${riskLevel} risk`}</Badge>
        {preview ? (
          <Badge variant={preview.triggered ? 'danger' : 'default'}>
            {preview.triggered ? 'Triggered now' : 'Not triggered'}
          </Badge>
        ) : null}
      </div>

      {!channelOk ? (
        <p className="text-sm text-gold">{channelPlanNote[rule.channel] ?? 'Upgrade plan to enable this channel.'}</p>
      ) : null}
    </Card>
  );
}
