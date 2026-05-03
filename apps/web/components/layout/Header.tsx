'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Upload, Sun, Moon, Menu, User, LogOut, Settings } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchBar } from './SearchBar';

export function Header() {
  const { theme, setTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const router = useRouter();

  const mockNotifs = [
    { id: 1, text: 'TechBro uploaded: "React 19 Deep Dive"', time: '2h ago', read: false },
    { id: 2, text: 'Your video hit 10,000 views! 🎉',         time: '5h ago', read: false },
    { id: 3, text: 'DesignPro replied to your comment',       time: '1d ago', read: true  },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[var(--header-height)] bg-[var(--bg)]/95 backdrop-blur-sm border-b border-[var(--border)] flex items-center px-4 gap-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 shrink-0 mr-2">
        <div className="w-8 h-8 rounded-lg bg-[var(--brand)] flex items-center justify-center">
          <span className="text-white font-black text-sm">SV</span>
        </div>
        <span className="font-bold text-base hidden sm:block tracking-tight">StreamVerse</span>
      </Link>

      {/* Search */}
      <div className="flex-1 flex justify-center max-w-2xl mx-auto">
        <SearchBar />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--surface-hover)] transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Upload */}
        <button
          onClick={() => router.push('/studio/upload')}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--surface-hover)] transition-colors"
          aria-label="Upload video"
        >
          <Upload size={18} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            whileHover={{ rotate: [0, -15, 15, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
            onClick={() => { setNotifOpen(!notifOpen); setAvatarOpen(false); }}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--surface-hover)] transition-colors relative"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </motion.button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <button className="text-xs text-[var(--brand)]">Mark all read</button>
                </div>
                {mockNotifs.map(n => (
                  <div key={n.id} className={`px-4 py-3 flex gap-3 hover:bg-[var(--surface-hover)] transition-colors ${!n.read ? 'border-l-2 border-[var(--brand)]' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">{n.text}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{n.time}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 bg-[var(--brand)] rounded-full shrink-0 mt-1.5" />}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <div className="relative">
          <button
            onClick={() => { setAvatarOpen(!avatarOpen); setNotifOpen(false); }}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 ml-1 hover:ring-2 ring-[var(--brand)] transition-all"
            aria-label="Account"
          />

          <AnimatePresence>
            {avatarOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <p className="font-semibold text-sm">Creator</p>
                  <p className="text-xs text-[var(--text-muted)]">creator@streamverse.app</p>
                </div>
                {[
                  { href: '/channel/creator', icon: User, label: 'Your channel' },
                  { href: '/studio',           icon: Upload, label: 'Studio' },
                  { href: '/settings',         icon: Settings, label: 'Settings' },
                ].map(item => (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--surface-hover)] transition-colors"
                    onClick={() => setAvatarOpen(false)}
                  >
                    <item.icon size={16} className="text-[var(--text-muted)]" />
                    {item.label}
                  </Link>
                ))}
                <div className="h-px bg-[var(--border)] my-1" />
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-[var(--surface-hover)] transition-colors">
                  <LogOut size={16} />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
