'use client';

import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

type PlanLockedFeatureProps = {
  title: string;
  requiredPlan: string;
  description: string;
  currentPlan?: string;
};

export function PlanLockedFeature({
  title,
  requiredPlan,
  description,
  currentPlan = 'Free',
}: PlanLockedFeatureProps) {
  return (
    <Card className="border-yellow-200 bg-yellow-50 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Lock className="mt-1 h-5 w-5 shrink-0 text-gold" />
          <div>
            <h3 className="text-lg font-semibold text-forest">{title}</h3>
            <p className="mt-2 text-sm text-slate-700">{description}</p>
          </div>
        </div>
        <Badge variant="warning">{requiredPlan}</Badge>
      </div>
      <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-100/80 p-4 text-sm text-slate-700">
        Locked on {currentPlan} plan. Upgrade to {requiredPlan} to unlock this delivery channel.
      </div>
    </Card>
  );
}
