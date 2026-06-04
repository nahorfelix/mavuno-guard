'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Farm Command Center',
  '/planner': 'Field Planner',
  '/trees': 'Tree & Canopy Lab',
  '/alerts': 'Alert Center',
  '/operations': 'Operations',
  '/docs': 'Documentation',
};

export const Header = () => {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? 'Farm Command Center';

  return (
    <header className="fixed top-0 left-64 right-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-forest">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/" className="text-sm text-text-muted hover:text-forest">
          Home
        </Link>
      </div>
    </header>
  );
};
