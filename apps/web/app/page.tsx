'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoCard, VideoCardSkeleton, type VideoCardData } from '@/components/video/VideoCard';

const CATEGORIES = ['All', 'Gaming', 'Music', 'News', 'Sports', 'Tech', 'Cooking', 'Travel', 'Science', 'Comedy', 'Fashion', 'Cars', 'Podcasts'];

const generateVideos = (page: number, category: string): VideoCardData[] =>
  Array.from({ length: 20 }, (_, i) => {
    const idx = page * 20 + i;
    const channels = [
      { name: 'TechBro', handle: 'techbro' },
      { name: 'DesignPro', handle: 'designpro' },
      { name: 'DailyVlog', handle: 'dailyvlog' },
      { name: 'GameZone', handle: 'gamezone' },
      { name: 'CookingWith', handle: 'cookingwith' },
    ];
    const ch = channels[idx % channels.length];
    const titles: Record<string, string[]> = {
      All:     ['Complete React 19 Tutorial', 'How AI Changed Everything', 'The Perfect Setup Tour', 'I Tried Every Code Editor', '10 CSS Tricks You Never Knew'],
      Gaming:  ['I Hit Diamond in Solo Queue!', 'New Game BREAKS Records', 'Secret Boss Fight Revealed', 'Best Settings for FPS Games', '100 Days in Minecraft'],
      Music:   ['New Album First Listen', 'How I Make Beats in 10 Minutes', 'Perfect Piano Cover', 'My Studio Setup 2026', 'Underrated Artists You Need'],
      Tech:    ['M4 MacBook Pro Review', 'Best Programming Language 2026', 'I Built an AI App in 2 Hours', 'The USB-C Era is Here', 'Keyboard That Changed My Life'],
      default: ['Amazing Content #' + idx, 'You Won\'t Believe This', 'The Truth About Everything', 'My Honest Review', 'How I Changed My Life'],
    };
    const titleArr = titles[category] || titles.default;
    return {
      id: `vid-${idx}`,
      title: titleArr[idx % titleArr.length],
      channelName: ch.name,
      channelHandle: ch.handle,
      viewCount: Math.floor(10_000 + Math.random() * 5_000_000),
      publishedAt: new Date(Date.now() - Math.floor(Math.random() * 180) * 86400000).toISOString(),
      duration: `${Math.floor(2 + Math.random() * 35)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    };
  });

export default function HomePage() {
  const [category, setCategory] = useState('All');
  const [videos, setVideos] = useState<VideoCardData[]>(() => generateVideos(0, 'All'));
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset on category change
  useEffect(() => {
    setVideos(generateVideos(0, category));
    setPage(0);
    setHasMore(true);
  }, [category]);

  // Infinite scroll
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const nextPage = page + 1;
    if (nextPage >= 5) { setHasMore(false); setLoading(false); return; }
    setVideos(prev => [...prev, ...generateVideos(nextPage, category)]);
    setPage(nextPage);
    setLoading(false);
  }, [loading, hasMore, page, category]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: '200px' });
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="pb-20 md:pb-8">
      {/* Category Pills */}
      <div className="sticky top-[var(--header-height)] z-20 bg-[var(--bg)]/95 backdrop-blur-sm border-b border-[var(--border)]">
        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
          {CATEGORIES.map(cat => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(cat)}
              className={`pill shrink-0 ${cat === category ? 'active' : ''}`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      <div className="px-4 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8"
          >
            {videos.map(v => <VideoCard key={v.id} video={v} />)}
            {loading && Array.from({ length: 8 }).map((_, i) => <VideoCardSkeleton key={`sk-${i}`} />)}
          </motion.div>
        </AnimatePresence>

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="sentinel mt-4" />

        {!hasMore && (
          <p className="text-center text-sm text-[var(--text-muted)] py-8">You've seen everything for now!</p>
        )}
      </div>
    </div>
  );
}
