import Link from 'next/link';
import { Cloud, TreePine, Zap, AlertCircle, BarChart3, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-forest via-cloud-white to-green-fresh">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-forest bg-opacity-95 backdrop-blur-sm text-cloud-white px-8 py-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-8 h-8 text-green-fresh" />
            <span className="text-2xl font-bold">Mavuno Guard</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-cloud-white hover:text-green-fresh transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-forest mb-6 leading-tight">
            Farm Risk Intelligence
          </h1>
          <p className="text-2xl md:text-3xl text-text-muted mb-8">
            Weather, trees, and field operations at your fingertips
          </p>
          <p className="text-lg text-text-muted max-w-2xl mx-auto mb-12">
            Mavuno Guard helps farmers, cooperatives, and agricultural officers turn WeatherAI forecasts and canopy data into practical field decisions—when to spray, irrigate, or hold off because conditions are risky.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Enter Dashboard
              </Button>
            </Link>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-8 bg-white bg-opacity-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-forest mb-16">
            What You Can Do
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="text-center">
              <div className="flex justify-center mb-4">
                <Cloud className="w-12 h-12 text-green-primary" />
              </div>
              <h3 className="text-xl font-bold text-forest mb-2">Live Weather</h3>
              <p className="text-text-muted">
                Real-time weather data with 7-day forecasts and hourly breakdowns for precise farm planning.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="text-center">
              <div className="flex justify-center mb-4">
                <TreePine className="w-12 h-12 text-green-primary" />
              </div>
              <h3 className="text-xl font-bold text-forest mb-2">Tree Analysis</h3>
              <p className="text-text-muted">
                Analyze canopy health, tree coverage, and forestry metrics to optimize crop conditions.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="text-center">
              <div className="flex justify-center mb-4">
                <Zap className="w-12 h-12 text-green-primary" />
              </div>
              <h3 className="text-xl font-bold text-forest mb-2">Risk Scoring</h3>
              <p className="text-text-muted">
                Weather-based farm risk scoring to flag threats before they hit the harvest.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="w-12 h-12 text-green-primary" />
              </div>
              <h3 className="text-xl font-bold text-forest mb-2">Smart Alerts</h3>
              <p className="text-text-muted">
                Get notified about weather events and farm risks before they impact your fields.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="text-center">
              <div className="flex justify-center mb-4">
                <Leaf className="w-12 h-12 text-green-primary" />
              </div>
              <h3 className="text-xl font-bold text-forest mb-2">Field Planner</h3>
              <p className="text-text-muted">
                Daily and hourly planning tools to optimize field operations based on weather.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="text-center">
              <div className="flex justify-center mb-4">
                <BarChart3 className="w-12 h-12 text-green-primary" />
              </div>
              <h3 className="text-xl font-bold text-forest mb-2">API Insights</h3>
              <p className="text-text-muted">
                Monitor usage, quotas, and API performance to manage your farm intelligence system.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-8 bg-forest text-cloud-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 text-center">
          <div>
            <p className="text-5xl font-bold text-green-fresh mb-2">7 Days</p>
            <p className="text-text-muted">Accurate Weather Forecast</p>
          </div>
          <div>
            <p className="text-5xl font-bold text-green-fresh mb-2">AI Powered</p>
            <p className="text-text-muted">Weather Summaries & Risk Analysis</p>
          </div>
          <div>
            <p className="text-5xl font-bold text-green-fresh mb-2">Real-time</p>
            <p className="text-text-muted">Alerts & Farm Operations</p>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 px-8 bg-cloud-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-forest mb-6">
            Ready to Guard Your Farm?
          </h2>
          <p className="text-lg text-text-muted mb-8">
            Start using Mavuno Guard today and make weather-powered farming decisions.
          </p>
          <Link href="/dashboard">
            <Button size="lg">Get Started Now</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
