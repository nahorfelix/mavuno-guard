import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';

export default function Docs() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-forest">Developer Notes</h2>
          <p className="text-text-muted mt-2">Learn about Mavuno Guard and WeatherAI API integration</p>
        </div>

        <Card>
          <h3 className="text-xl font-bold text-forest mb-4">Getting Started</h3>
          <div className="prose prose-sm max-w-none space-y-4">
            <p className="text-text-muted">
              Mavuno Guard integrates the WeatherAI Developer Platform to provide comprehensive farm intelligence.
            </p>
            <p className="text-text-muted">
              Documentation will be available here soon.
            </p>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-forest mb-4">API Integration</h3>
          <div className="h-40 flex items-center justify-center text-text-muted">
            API documentation will appear here
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-forest mb-4">Features</h3>
          <div className="space-y-2 text-text-muted">
            <p>✓ Real-time weather data</p>
            <p>✓ 7-day weather forecasts</p>
            <p>✓ Tree and canopy analysis</p>
            <p>✓ Farm risk scoring</p>
            <p>✓ Weather alerts</p>
            <p>✓ API usage tracking</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
