'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Zap, PlaySquare, Library, Clock, ThumbsUp, History, ChevronRight, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/',              icon: Home,        label: 'Home' },
  { href: '/shorts',        icon: Zap,         label: 'Shorts' },
  { href: '/feed/subscriptions', icon: PlaySquare,  label: 'Subscriptions' },
];

const LIBRARY_LINKS = [
  { href: '/feed/library',  icon: Library,     label: 'Library' },
  { href: '/feed/history',  icon: History,     label: 'History' },
  { href: '/playlist/watch-later', icon: Clock, label: 'Watch Later' },
  { href: '/playlist/liked-videos', icon: ThumbsUp, label: 'Liked Videos' },
];

const SUBSCRIBED = [
  { handle: 'techbro',   name: 'TechBro',   color: 'from-blue-500 to-purple-600' },
  { handle: 'designpro', name: 'DesignPro', color: 'from-pink-500 to-rose-500'  },
  { handle: 'dailyvlog', name: 'DailyVlog', color: 'from-emerald-500 to-teal-500' },
];

function NavItem({ href, icon: Icon, label, collapsed }: any) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link href={href}
      className={cn(
        'flex items-center gap-4 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
        active ? 'bg-[var(--surface-hover)] font-semibold' : 'hover:bg-[var(--surface-hover)] text-[var(--text-muted)]',
        collapsed && 'justify-center px-2'
      )}
      title={collapsed ? label : undefined}
    >
      <Icon size={20} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

export function Sidebar({ className }: { className?: string }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-[var(--header-height)] bottom-0 z-30 hidden md:flex flex-col border-r border-[var(--border)] bg-[var(--bg)] transition-all duration-300 overflow-hidden',
        collapsed ? 'w-[72px]' : 'w-[var(--sidebar-width)]',
        className
      )}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-4 z-10 w-6 h-6 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center shadow-sm hover:bg-[var(--surface-hover)] transition-colors"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {NAV_LINKS.map(l => <NavItem key={l.href} {...l} collapsed={collapsed} />)}

        {!collapsed && (
          <div className="h-px bg-[var(--border)] my-2" />
        )}

        {LIBRARY_LINKS.map(l => <NavItem key={l.href} {...l} collapsed={collapsed} />)}

        {!collapsed && (
          <>
            <div className="h-px bg-[var(--border)] my-2" />
            <p className="px-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">Subscriptions</p>
            {SUBSCRIBED.map(ch => (
              <Link key={ch.handle} href={`/channel/${ch.handle}`}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-[var(--surface-hover)] text-[var(--text-muted)] transition-colors"
              >
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${ch.color} shrink-0`} />
                <span className="truncate">{ch.name}</span>
              </Link>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}
