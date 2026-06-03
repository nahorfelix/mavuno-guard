import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';

export default function Planner() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-forest">Field Planner</h2>
          <p className="text-text-muted mt-2">Plan your daily and hourly field operations based on weather</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-xl font-bold text-forest mb-4">Daily Plan</h3>
            <div className="h-64 flex items-center justify-center text-text-muted">
              Daily planning interface will appear here
            </div>
          </Card>

          <Card>
            <h3 className="text-xl font-bold text-forest mb-4">Hourly Schedule</h3>
            <div className="h-64 flex items-center justify-center text-text-muted">
              Hourly schedule will appear here
            </div>
          </Card>
        </div>

        <Card>
          <h3 className="text-xl font-bold text-forest mb-4">Weather-Optimized Recommendations</h3>
          <div className="h-40 flex items-center justify-center text-text-muted">
            Recommendations will appear here
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
