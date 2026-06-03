import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Cloud, Droplets, Wind, Eye } from 'lucide-react';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-bold text-forest">Dashboard</h2>
          <p className="text-text-muted mt-2">Monitor your farm's weather and risk status in real-time</p>
        </div>

        {/* Current Status Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard
            label="Temperature"
            value="--°C"
            icon={<Cloud className="w-8 h-8" />}
          />
          <StatCard
            label="Humidity"
            value="--"
            icon={<Droplets className="w-8 h-8" />}
          />
          <StatCard
            label="Wind Speed"
            value="-- km/h"
            icon={<Wind className="w-8 h-8" />}
          />
          <StatCard
            label="Visibility"
            value="-- km"
            icon={<Eye className="w-8 h-8" />}
          />
        </div>

        {/* Weather Forecast */}
        <Card>
          <h3 className="text-xl font-bold text-forest mb-4">7-Day Forecast</h3>
          <div className="h-48 flex items-center justify-center text-text-muted">
            Weather forecast data will appear here
          </div>
        </Card>

        {/* Risk Summary */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-xl font-bold text-forest mb-4">Farm Risk Score</h3>
            <div className="h-40 flex items-center justify-center text-text-muted">
              Risk assessment will appear here
            </div>
          </Card>

          <Card>
            <h3 className="text-xl font-bold text-forest mb-4">Active Alerts</h3>
            <div className="space-y-3">
              <Badge variant="default">No active alerts</Badge>
              <p className="text-sm text-text-muted">Alerts will appear here when triggered</p>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
