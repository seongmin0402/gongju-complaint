'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS: { href: string; label: string; highlight?: boolean }[] = [
  { href: '/info/ai-guide',    label: '🤖 AI 배출안내', highlight: true },
  { href: '/info/recycling',   label: '재활용분리배출' },
  { href: '/info/food-waste',  label: '음식물쓰레기' },
  { href: '/info/trash',       label: '생활쓰레기' },
  { href: '/info/bulk-waste',  label: '대형폐기물' },
  { href: '/info/bag-store',   label: '종량제봉투판매소' },
  { href: '/info/special-bag', label: '특수규격봉투판매소' },
];

export default function InfoTabNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-[57px] z-10 shadow-sm">
      <div className="max-w-3xl mx-auto px-2 flex overflow-x-auto scrollbar-none gap-0.5 py-1">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-shrink-0 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                active
                  ? 'bg-green-600 text-white'
                  : tab.highlight
                  ? 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
