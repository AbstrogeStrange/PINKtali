import type { ReactNode } from 'react';

export default function AdsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f0f14]">
      <nav className="border-b border-white/10 bg-[#0f0f14]/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">S</div>
            <span className="text-white font-semibold">StreamVerse <span className="text-blue-400">Ads</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {[['Dashboard', '/ads/dashboard'], ['Campaigns', '/ads/campaigns'], ['Billing', '/ads/billing']].map(([label, href]) => (
              <a key={href} href={href} className="px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">{label}</a>
            ))}
          </nav>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
    </div>
  );
}
