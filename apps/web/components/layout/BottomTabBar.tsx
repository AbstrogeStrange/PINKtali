'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Zap, Plus, PlaySquare, Library } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/',              icon: Home,      label: 'Home' },
  { href: '/shorts',        icon: Zap,       label: 'Shorts' },
  { href: '/studio/upload', icon: Plus,      label: '', isUpload: true },
  { href: '/feed/subscriptions', icon: PlaySquare, label: 'Subscriptions' },
  { href: '/feed/library',  icon: Library,   label: 'Library' },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg)]/95 backdrop-blur-sm border-t border-[var(--border)] flex items-center justify-around h-14 px-1">
      {TABS.map(tab => {
        const active = pathname === tab.href;
        if (tab.isUpload) {
          return (
            <Link key={tab.href} href={tab.href}
              className="w-12 h-9 flex items-center justify-center bg-[var(--brand)] rounded-xl shadow-lg"
              aria-label="Upload"
            >
              <Plus size={22} className="text-white" />
            </Link>
          );
        }
        return (
          <Link key={tab.href} href={tab.href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-medium transition-colors',
              active ? 'text-[var(--brand)]' : 'text-[var(--text-muted)]'
            )}
          >
            <tab.icon size={22} className={cn(active && 'stroke-[2.5]')} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
