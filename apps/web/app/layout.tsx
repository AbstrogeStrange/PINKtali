import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomTabBar } from '@/components/layout/BottomTabBar';

export const metadata: Metadata = {
  title: { default: 'StreamVerse', template: '%s | StreamVerse' },
  description: 'Watch, share and discover the world\'s best videos on StreamVerse.',
  openGraph: { type: 'website', siteName: 'StreamVerse' },
  themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#0f0f0f' }, { media: '(prefers-color-scheme: light)', color: '#ffffff' }]
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1 pt-[56px]">
              <Sidebar />
              <main className="flex-1 md:ml-60 min-w-0">
                {children}
              </main>
            </div>
            <BottomTabBar />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
