import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';

export default function Trees() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-forest">Trees & Canopy Lab</h2>
          <p className="text-text-muted mt-2">Analyze tree health, canopy coverage, and forestry metrics</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-xl font-bold text-forest mb-4">Tree Count Analysis</h3>
            <div className="h-64 flex items-center justify-center text-text-muted">
              Tree analysis will appear here
            </div>
          </Card>

          <Card>
            <h3 className="text-xl font-bold text-forest mb-4">Canopy Health</h3>
            <div className="h-64 flex items-center justify-center text-text-muted">
              Canopy health data will appear here
            </div>
          </Card>
        </div>

        <Card>
          <h3 className="text-xl font-bold text-forest mb-4">Forestry History</h3>
          <div className="h-40 flex items-center justify-center text-text-muted">
            Historical tree data will appear here
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
