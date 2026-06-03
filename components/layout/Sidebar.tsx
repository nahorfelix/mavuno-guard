'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cloud, TreePine, AlertCircle, Settings, FileText, BarChart3, Leaf } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/planner', label: 'Planner', icon: Leaf },
  { href: '/trees', label: 'Trees & Canopy', icon: TreePine },
  { href: '/alerts', label: 'Alerts', icon: AlertCircle },
  { href: '/operations', label: 'Operations', icon: Settings },
  { href: '/docs', label: 'Docs', icon: FileText },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-forest text-cloud-white p-6 flex flex-col overflow-y-auto">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Cloud className="w-8 h-8 text-green-fresh" />
        <span className="text-xl font-bold">Mavuno Guard</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-green-primary text-white'
                  : 'text-cloud-white hover:bg-forest-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-forest-600 pt-4 text-xs text-text-muted">
        <p>Version 1.0.0</p>
        <p className="mt-2">Farm risk intelligence</p>
      </div>
    </div>
  );
};
