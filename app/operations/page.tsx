import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';

export default function Operations() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-forest">API Operations</h2>
          <p className="text-text-muted mt-2">Monitor WeatherAI API usage and quota</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <StatCard
            label="API Calls Today"
            value="0"
          />
          <StatCard
            label="Quota Remaining"
            value="--"
          />
          <StatCard
            label="Current Plan"
            value="Free"
          />
        </div>

        <Card>
          <h3 className="text-xl font-bold text-forest mb-4">Usage Analytics</h3>
          <div className="h-64 flex items-center justify-center text-text-muted">
            API usage charts will appear here
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-forest mb-4">Recent Requests</h3>
          <div className="h-40 flex items-center justify-center text-text-muted">
            Request logs will appear here
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
