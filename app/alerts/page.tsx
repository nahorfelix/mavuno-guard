'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, CloudRain } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AlertChannelCard } from '@/components/alerts/AlertChannelCard';
import { AlertPreviewList } from '@/components/alerts/AlertPreviewList';
import { AlertRuleCard } from '@/components/alerts/AlertRuleCard';
import { AlertStatusBanner } from '@/components/alerts/AlertStatusBanner';
import { CreateAlertRule } from '@/components/alerts/CreateAlertRule';
import { PlanLockedFeature } from '@/components/alerts/PlanLockedFeature';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  DEFAULT_ALERT_RULES,
  evaluateAlertRules,
  getPlanLimitationMessage,
  normalizePlanCapabilities,
} from '@/lib/alert-rules';
import type { AlertPreview, AlertRule, PlanCapabilities } from '@/types/alerts';

const fetchApi = async (endpoint: string) => {
  const response = await fetch(endpoint, { cache: 'no-store' });
  const json = await response.json().catch(() => ({}));
  return { response, json };
};

export default function AlertsPage() {
  const [capabilities, setCapabilities] = useState<PlanCapabilities | null>(null);
  const [customRules, setCustomRules] = useState<AlertRule[]>([]);
  const [triggered, setTriggered] = useState<AlertPreview[]>([]);
  const [notTriggered, setNotTriggered] = useState<AlertPreview[]>([]);
  const [weatherSummary, setWeatherSummary] = useState<string>('');

  const [planLoading, setPlanLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [planError, setPlanError] = useState('');
  const [planLimitation, setPlanLimitation] = useState(false);
  const [previewError, setPreviewError] = useState('');

  const allRules = useMemo(() => [...DEFAULT_ALERT_RULES, ...customRules], [customRules]);

  const previewMap = useMemo(() => {
    const map = new Map<string, AlertPreview>();
    [...triggered, ...notTriggered].forEach((item) => map.set(item.ruleId, item));
    return map;
  }, [triggered, notTriggered]);

  const loadPreviews = useCallback(async () => {
    setPreviewLoading(true);
    setPreviewError('');

    try {
      const [currentResult, dailyResult] = await Promise.all([
        fetchApi('/api/weather/current'),
        fetchApi('/api/weather/daily'),
      ]);

      if (!currentResult.response.ok) {
        const message =
          currentResult.json?.error?.message ||
          getPlanLimitationMessage(currentResult.response.status);
        setPreviewError(message);
        setTriggered([]);
        setNotTriggered([]);
        setWeatherSummary('');
        return;
      }

      const evaluation = evaluateAlertRules(
        allRules,
        currentResult.json,
        dailyResult.json
      );

      if (!evaluation.current) {
        setPreviewError('Current weather data is unavailable for alert previews.');
        setTriggered([]);
        setNotTriggered([]);
        setWeatherSummary('');
        return;
      }

      setTriggered(evaluation.triggered);
      setNotTriggered(evaluation.notTriggered);
      setWeatherSummary(
        `${evaluation.current.temperature}°C · ${evaluation.current.humidity}% humidity · ${evaluation.current.windSpeed} km/h wind · ${evaluation.current.precipitation}% rain risk`
      );
    } catch {
      setPreviewError('Unable to evaluate alert previews. Check weather API routes.');
      setTriggered([]);
      setNotTriggered([]);
      setWeatherSummary('');
    } finally {
      setPreviewLoading(false);
    }
  }, [allRules]);

  useEffect(() => {
    const loadPlan = async () => {
      setPlanLoading(true);
      setPlanError('');
      setPlanLimitation(false);

      try {
        const { response, json } = await fetchApi('/api/usage');
        if (!response.ok) {
          const message = json?.error?.message || getPlanLimitationMessage(response.status);
          setPlanError(message);
          setPlanLimitation(response.status === 403 || json?.error?.code === 'plan_restricted');
          setCapabilities({
            plan: 'Unknown',
            webhooks: false,
            sms: false,
            maxForecastDays: 7,
            aiRequestsRemaining: 0,
          });
          return;
        }

        const normalized = normalizePlanCapabilities(json);
        if (!normalized) {
          setPlanError('Usage response did not include plan capabilities.');
          setCapabilities({
            plan: 'free',
            webhooks: false,
            sms: false,
            maxForecastDays: 7,
            aiRequestsRemaining: 200,
          });
          return;
        }

        setCapabilities(normalized);
      } catch {
        setPlanError('Unable to load plan details from /api/usage.');
        setCapabilities({
          plan: 'free',
          webhooks: false,
          sms: false,
          maxForecastDays: 7,
          aiRequestsRemaining: 200,
        });
      } finally {
        setPlanLoading(false);
      }
    };

    loadPlan();
  }, []);

  useEffect(() => {
    loadPreviews();
  }, [loadPreviews]);

  const handleCreateRule = (rule: AlertRule) => {
    setCustomRules((current) => [rule, ...current]);
  };

  const planBadgeLabel = capabilities?.plan ?? 'Loading';
  const statusBadgeLabel = planLoading
    ? 'Checking capabilities'
    : capabilities?.webhooks && capabilities?.sms
      ? 'All channels available'
      : 'Local previews active';

  const showForecast14Lock = (capabilities?.maxForecastDays ?? 7) < 14;
  const showAiInsightLock = (capabilities?.aiRequestsRemaining ?? 200) <= 250;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-green-100 p-3">
                <Bell className="h-6 w-6 text-green-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-forest">Alert Center</h1>
                <p className="mt-2 max-w-2xl text-text-muted">
                  Create weather-risk rules for rain, wind, heat, frost, and field operations.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="primary">{planBadgeLabel} plan</Badge>
            <Badge variant={planLimitation ? 'warning' : 'success'}>{statusBadgeLabel}</Badge>
          </div>
        </div>

        <AlertStatusBanner
          capabilities={capabilities}
          loading={planLoading}
          error={planError || undefined}
          planLimitation={planLimitation}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <AlertChannelCard
            channel="In-app"
            badgeLabel="Local rule previews"
            description="Create and evaluate alert rules inside Mavuno Guard using current weather."
            available
          />
          <AlertChannelCard
            channel="Webhook"
            badgeLabel="Pro delivery"
            description="Send triggered alerts to farm systems, Slack, or custom endpoints."
            available={Boolean(capabilities?.webhooks)}
          />
          <AlertChannelCard
            channel="SMS"
            badgeLabel="Scale delivery"
            description="Reach operators in the field with urgent weather notifications."
            available={Boolean(capabilities?.sms)}
          />
        </div>

        {weatherSummary ? (
          <Card className="flex items-start gap-3 border-green-100 bg-green-50 shadow-soft">
            <CloudRain className="mt-1 h-5 w-5 text-green-primary" />
            <div>
              <p className="text-sm font-semibold text-forest">Live weather context</p>
              <p className="mt-1 text-sm text-slate-600">{weatherSummary}</p>
            </div>
          </Card>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <CreateAlertRule capabilities={capabilities} onCreate={handleCreateRule} />
          <AlertPreviewList
            triggered={triggered}
            notTriggered={notTriggered}
            loaded={!previewLoading}
            error={previewError || undefined}
          />
        </div>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-forest">Example alert rules</h2>
            <p className="mt-1 text-sm text-text-muted">
              Default farm-risk rules with live evaluation against current weather.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {allRules.map((rule) => (
              <AlertRuleCard
                key={rule.id}
                rule={rule}
                capabilities={capabilities}
                preview={previewMap.get(rule.id)}
              />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-forest">Upgrade to unlock</h2>
            <p className="mt-1 text-sm text-text-muted">
              Advanced delivery and forecast features stay locked until your WeatherAI plan supports them.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {!capabilities?.webhooks ? (
              <PlanLockedFeature
                title="Webhook alerts"
                requiredPlan="Pro"
                description="Push triggered rules to irrigation controllers, ERP systems, or team chat without opening the dashboard."
                currentPlan={capabilities?.plan ?? 'Free'}
              />
            ) : null}
            {!capabilities?.sms ? (
              <PlanLockedFeature
                title="SMS alerts"
                requiredPlan="Scale"
                description="Notify field crews immediately when wind, rain, or heat thresholds are exceeded."
                currentPlan={capabilities?.plan ?? 'Free'}
              />
            ) : null}
            {showForecast14Lock ? (
              <PlanLockedFeature
                title="14-day forecast alerts"
                requiredPlan="Pro"
                description="Plan fertilizer, spraying, and harvest windows with extended forecast-based alert rules."
                currentPlan={capabilities?.plan ?? 'Free'}
              />
            ) : null}
            {showAiInsightLock ? (
              <PlanLockedFeature
                title="AI insight alerts"
                requiredPlan="Pro"
                description="Combine AI farm summaries with alert thresholds for smarter escalation when risk compounds."
                currentPlan={capabilities?.plan ?? 'Free'}
              />
            ) : null}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
