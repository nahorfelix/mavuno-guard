import type { ReactNode } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const dataTranslation = [
  {
    source: 'Current weather (`GET /v1/current`)',
    becomes: 'Farm Command Center status cards, risk inputs, and live alert rule evaluation',
  },
  {
    source: 'Hourly forecast (`GET /v1/hourly`)',
    becomes: 'Spraying and irrigation windows, hourly planner table, and trend charts',
  },
  {
    source: 'Daily forecast (`GET /v1/daily`)',
    becomes: 'Daily field planning cards, fertilizer and drainage warnings',
  },
  {
    source: 'Tree analysis (`POST /v1/trees/analyze`)',
    becomes: 'Canopy coverage, density, and health breakdown in Tree & Canopy Lab',
  },
  {
    source: 'Usage (`GET /v1/usage`)',
    becomes: 'Quota visibility on the dashboard and Operations dashboard metrics',
  },
  {
    source: 'Plan capabilities from usage',
    becomes: 'Honest locked states for webhooks (Pro) and SMS (Scale) instead of fake delivery',
  },
];

const apiRoutes = [
  { external: 'GET /v1/current', internal: '/api/weather/current', note: 'Live conditions' },
  { external: 'GET /v1/weather', internal: '/api/weather/forecast', note: 'Multi-day forecast' },
  { external: 'GET /v1/daily', internal: '/api/weather/daily', note: 'Daily field planning' },
  { external: 'GET /v1/hourly', internal: '/api/weather/hourly', note: 'Hourly operation windows' },
  { external: 'GET /v1/weather-geo', internal: '/api/weather/geo', note: 'Geo weather lookup' },
  { external: 'GET /v1/usage', internal: '/api/usage', note: 'Plan, quota, rate limits' },
  { external: 'POST /v1/trees/analyze', internal: '/api/trees/analyze', note: 'Canopy image analysis' },
  { external: 'GET /v1/trees/history', internal: '/api/trees/history', note: 'Scan history' },
  { external: 'GET /v1/trees/quota', internal: '/api/trees/quota', note: 'Tree scan allowance' },
  { external: 'POST /v1/forestry/count-trees', internal: '/api/forestry/count', note: 'Forestry batch count' },
];

const errorCodes = [
  { code: '400', label: 'Invalid request', detail: 'Bad or missing parameters.' },
  { code: '401', label: 'Invalid API key', detail: 'Key missing or not accepted by WeatherAI.' },
  { code: '403', label: 'Plan unsupported', detail: 'Feature not on current plan; UI shows locked states, not fake success.' },
  { code: '429', label: 'Quota exceeded', detail: 'Usage limit hit; retry after reset.' },
  { code: '500', label: 'Server error', detail: 'Upstream or proxy failure.' },
  { code: '503', label: 'Service unavailable', detail: 'Temporary WeatherAI outage.' },
];

const applicationModules = [
  { route: '/', label: 'Landing page', detail: 'Product overview and navigation' },
  { route: '/dashboard', label: 'Farm Command Center', detail: 'Current weather, farm risk score, and recommendations' },
  { route: '/planner', label: 'Field Planner', detail: 'Hourly and daily operation windows' },
  { route: '/trees', label: 'Tree & Canopy Lab', detail: 'Canopy analysis, quota, and history' },
  { route: '/alerts', label: 'Alert Center', detail: 'Plan-aware weather-risk rules' },
  { route: '/operations', label: 'Operations Dashboard', detail: 'Usage, quota, and integration health' },
  { route: '/docs', label: 'Developer Notes', detail: 'Architecture, security, and API decisions' },
];

const futureItems = [
  'User accounts',
  'Saved farm profiles',
  'Persistent alert rules',
  'SMS delivery where the plan allows',
  'Webhook automation',
  'Historical analytics',
];

export default function DocsPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-text-muted">Developer notes</p>
          <h1 className="mt-2 text-3xl font-bold text-forest">Mavuno Guard Developer Notes</h1>
          <p className="mt-3 text-text-muted">
            How Mavuno Guard consumes WeatherAI APIs and turns weather, quota, and canopy data into farm operation
            decisions.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Badge variant="primary">WeatherAI integration</Badge>
            <Badge variant="success">API key protected</Badge>
          </div>
        </div>

        <DocSection title="What I built">
          <p>
            Mavuno Guard is a farm operations dashboard built on the WeatherAI Developer Platform. It turns live
            weather, forecasts, tree and canopy analysis, quota data, and plan capabilities into practical decisions
            for field work—not a raw API explorer.
          </p>
          <p className="mt-3">
            The app is organized into focused modules so each WeatherAI endpoint maps to a clear farm operations
            workflow.
          </p>
        </DocSection>

        <DocSection title="How WeatherAI data is translated">
          <p className="mb-4">
            Each integration normalizes upstream responses (live <code className="rounded bg-slate-100 px-1">payload</code>{' '}
            or demo <code className="rounded bg-slate-100 px-1">data</code>) before it reaches the UI. That keeps
            components stable when the key is missing or when fields vary between responses.
          </p>
          <ul className="space-y-3">
            {dataTranslation.map((row) => (
              <li
                key={row.source}
                className="rounded-2xl border border-slate-200 bg-cloud-white px-4 py-3 text-sm text-slate-700"
              >
                <span className="font-semibold text-forest">{row.source}</span>
                <span className="mt-1 block text-slate-600">→ {row.becomes}</span>
              </li>
            ))}
          </ul>
        </DocSection>

        <DocSection title="WeatherAI APIs integrated">
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-cloud-white text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-3">WeatherAI endpoint</th>
                  <th className="px-4 py-3">Internal route</th>
                  <th className="px-4 py-3">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {apiRoutes.map((row) => (
                  <tr key={row.internal} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-forest">{row.external}</td>
                    <td className="px-4 py-3 font-mono text-xs text-green-primary">{row.internal}</td>
                    <td className="px-4 py-3 text-slate-600">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-text-muted">
            Connectivity checks use <code className="rounded bg-slate-100 px-1">/api/health/weather-ai</code> (server-side
            usage ping, no key in the response).
          </p>
        </DocSection>

        <DocSection title="Architecture">
          <pre className="overflow-x-auto rounded-2xl bg-forest p-4 text-sm text-cloud-white">
{`Browser (React UI)
  → fetch /api/* only
Next.js route handlers (app/api)
  → lib/weather-ai-client.ts
WeatherAI API`}
          </pre>
          <ul className="mt-4 list-inside list-disc space-y-2 text-slate-700">
            <li>The browser never calls WeatherAI directly.</li>
            <li>
              <code className="rounded bg-slate-100 px-1">WEATHER_AI_API_KEY</code> is read only on the server.
            </li>
            <li>
              Without a valid key, routes return demo payloads so the project stays reviewable without live billing.
            </li>
            <li>Errors pass through <code className="rounded bg-slate-100 px-1">lib/error-mapper.ts</code> for consistent UI messaging.</li>
          </ul>
        </DocSection>

        <DocSection title="Security decisions">
          <ul className="list-inside list-disc space-y-2 text-slate-700">
            <li>API key stored in <code className="rounded bg-slate-100 px-1">WEATHER_AI_API_KEY</code> (local: <code className="rounded bg-slate-100 px-1">.env.local</code>; production: Vercel env vars).</li>
            <li><code className="rounded bg-slate-100 px-1">.env.local</code> is gitignored—never committed.</li>
            <li>No API route returns the key in JSON or headers.</li>
            <li>All WeatherAI traffic goes through the server-side proxy in <code className="rounded bg-slate-100 px-1">lib/weather-ai-client.ts</code>.</li>
          </ul>
        </DocSection>

        <DocSection title="Error and plan handling">
          <p className="mb-4">
            HTTP failures from WeatherAI are mapped to stable codes and messages. On{' '}
            <strong>403 plan restrictions</strong>, the UI shows locked or limited states—webhooks, SMS, and extended
            forecast are not presented as working when usage data says they are unavailable.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {errorCodes.map((item) => (
              <div key={item.code} className="rounded-2xl border border-slate-200 bg-cloud-white p-4">
                <p className="font-semibold text-forest">
                  {item.code} — {item.label}
                </p>
                <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Free-plan workflows still support in-app alert previews and core weather modules; Pro/Scale delivery channels
            are labeled clearly when locked.
          </p>
        </DocSection>

        <DocSection title="Application modules">
          <p className="mb-4">
            Mavuno Guard is organized into focused modules for farm operations, planning, canopy analysis, alerts, and
            API visibility.
          </p>
          <ol className="space-y-3">
            {applicationModules.map((step, index) => (
              <li
                key={step.route}
                className="flex gap-3 rounded-2xl border border-slate-200 bg-cloud-white px-4 py-3 text-sm"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-primary text-xs font-bold text-white">
                  {index + 1}
                </span>
                <div>
                  <Link href={step.route} className="font-semibold text-green-primary hover:underline">
                    {step.label}
                  </Link>
                  <span className="font-mono text-xs text-text-muted"> ({step.route})</span>
                  <p className="mt-1 text-slate-600">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-text-muted">
            Integration health is available at{' '}
            <code className="rounded bg-slate-100 px-1">/api/health/weather-ai</code> without exposing credentials.
          </p>
        </DocSection>

        <DocSection title="Future improvements">
          <ul className="list-inside list-disc space-y-1 text-slate-700">
            {futureItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </DocSection>

        <DocSection title="Quick links">
          <div className="flex flex-wrap gap-3">
            <DocLink href="/dashboard">Dashboard</DocLink>
            <DocLink href="/operations">Operations</DocLink>
            <DocLink href="https://github.com/nahorfelix/mavuno-guard" external>
              GitHub repository
            </DocLink>
          </div>
          <p className="mt-4 text-sm text-text-muted">
            Setup, deployment, and environment variables are documented in the{' '}
            <a
              href="https://github.com/nahorfelix/mavuno-guard#readme"
              className="font-medium text-green-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              README
            </a>
            .
          </p>
        </DocSection>
      </div>
    </DashboardLayout>
  );
}

function DocSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="shadow-soft">
      <h2 className="text-xl font-bold text-forest">{title}</h2>
      <div className="prose prose-sm mt-4 max-w-none text-slate-700">{children}</div>
    </Card>
  );
}

function DocLink({
  href,
  children,
  external,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  const className =
    'inline-flex items-center rounded-full border border-green-primary px-4 py-2 text-sm font-medium text-green-primary transition-colors hover:bg-green-50';

  if (external) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
