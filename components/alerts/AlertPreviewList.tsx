'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { AlertPreview } from '@/types/alerts';

type AlertPreviewListProps = {
  triggered: AlertPreview[];
  notTriggered: AlertPreview[];
  loaded: boolean;
  error?: string;
};

export function AlertPreviewList({ triggered, notTriggered, loaded, error }: AlertPreviewListProps) {
  if (!loaded) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Loading alert previews…</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-rose-700">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-forest">Alert previews</h3>
            <p className="mt-2 text-sm text-slate-600">Live rule evaluation based on current weather and forecast.</p>
          </div>
          <Badge variant="primary">{triggered.length} triggered</Badge>
        </div>
      </Card>

      {triggered.length === 0 && notTriggered.length === 0 ? (
        <Card className="shadow-soft">
          <p className="text-sm text-slate-600">
            No active rules are available to evaluate. Add a rule or activate paused rules to see previews.
          </p>
        </Card>
      ) : null}

      {triggered.length === 0 && notTriggered.length > 0 ? (
        <Card className="border-green-100 bg-green-50 shadow-soft">
          <p className="text-sm text-slate-700">
            No rules are triggered right now. Field conditions look manageable for active rules.
          </p>
        </Card>
      ) : null}

      {triggered.length > 0 ? (
        <div className="space-y-4">
          {triggered.map((item) => (
            <Card key={item.ruleId} className="border-red-200 bg-red-50">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-forest">{item.title}</h4>
                  <p className="mt-1 text-sm text-slate-600">{item.condition}</p>
                </div>
                <Badge variant="danger">{item.riskLevel.toUpperCase()}</Badge>
              </div>
              <p className="mt-4 text-sm text-slate-700">{item.recommendation}</p>
            </Card>
          ))}
        </div>
      ) : null}

      {notTriggered.length > 0 ? (
        <div className="space-y-4">
          <Card>
            <h4 className="text-lg font-semibold text-forest">Ready rules</h4>
            <p className="mt-2 text-sm text-slate-600">These rules are not currently triggered.</p>
          </Card>
          {notTriggered.map((item) => (
            <Card key={item.ruleId} className="border-slate-200">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-forest">{item.title}</h4>
                  <p className="mt-1 text-sm text-slate-600">{item.condition}</p>
                </div>
                <Badge variant="default">{item.riskLevel.toUpperCase()}</Badge>
              </div>
              <p className="mt-4 text-sm text-slate-700">{item.recommendation}</p>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
