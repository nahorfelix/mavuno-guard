import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function Alerts() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-forest">Alert Center</h2>
          <p className="text-text-muted mt-2">Manage weather alerts and farm risk notifications</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-bold text-forest mb-2">Critical Alerts</h3>
            <p className="text-3xl font-bold text-alert">0</p>
            <p className="text-sm text-text-muted mt-2">Active urgent alerts</p>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-forest mb-2">Warnings</h3>
            <p className="text-3xl font-bold text-gold">0</p>
            <p className="text-sm text-text-muted mt-2">Active warnings</p>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-forest mb-2">Info Notices</h3>
            <p className="text-3xl font-bold text-green-primary">0</p>
            <p className="text-sm text-text-muted mt-2">Active notices</p>
          </Card>
        </div>

        <Card>
          <h3 className="text-xl font-bold text-forest mb-4">Recent Alerts</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <Badge variant="default">No alerts</Badge>
              <p className="text-text-muted">Alerts will appear here when triggered</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
