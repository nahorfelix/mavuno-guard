'use client';

import Link from 'next/link';

export const Header = () => {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between z-40">
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-forest">Farm Command Center</h1>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/" className="text-sm text-text-muted hover:text-forest">
          Home
        </Link>
      </div>
    </header>
  );
};
