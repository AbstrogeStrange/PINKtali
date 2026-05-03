import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

export default function AdminLayout({ children }: { children: ReactNode }) {
  // In production: server-side session check for ADMIN role
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <nav className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center gap-6">
          <div className="flex items-center gap-2 mr-4">
            <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-xs">A</div>
            <span className="font-bold text-sm">StreamVerse Admin</span>
          </div>
          {[
            ['/admin/dashboard', 'Dashboard'],
            ['/admin/users',    'Users'],
            ['/admin/videos',   'Videos'],
            ['/admin/reports',  'Reports'],
            ['/admin/strikes',  'Strikes'],
            ['/admin/ads',      'Ad Review'],
          ].map(([href, label]) => (
            <a key={href} href={href}
              className="text-sm text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-zinc-800">
              {label}
            </a>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs bg-red-600/20 text-red-400 border border-red-600/30 px-2 py-0.5 rounded-full font-medium">ADMIN</span>
          </div>
        </div>
      </nav>
      <div className="max-w-screen-2xl mx-auto px-6 py-8">{children}</div>
    </div>
  );
}
