'use client';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

type AlertChannelCardProps = {
  channel: string;
  description: string;
  available: boolean;
  badgeLabel: string;
};

export function AlertChannelCard({ channel, description, available, badgeLabel }: AlertChannelCardProps) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{channel}</p>
          <h3 className="mt-2 text-lg font-semibold text-forest">{badgeLabel}</h3>
        </div>
        <Badge variant={available ? 'success' : 'warning'}>
          {available ? 'Available' : 'Locked'}
        </Badge>
      </div>
      <p className="text-sm text-slate-600">{description}</p>
    </Card>
  );
}
