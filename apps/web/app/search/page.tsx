'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

// Mock results
const MOCK_VIDEOS = Array.from({ length: 12 }, (_, i) => ({
  id: `v${i}`,
  type: i % 4 === 0 ? 'channel' : 'video',
  title: `Result ${i + 1}: Amazing Tutorial about the Search Query`,
  channelName: `TechChannel${i}`,
  channelHandle: `techchannel${i}`,
  views: Math.floor(Math.random() * 2_000_000),
  publishedAt: new Date(Date.now() - i * 86_400_000 * 3),
  duration: `${Math.floor(Math.random() * 30)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
  subscriberCount: Math.floor(Math.random() * 500_000),
}));

const formatCount = (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(0)}K` : String(n);
const formatAge = (d: Date) => {
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  return days === 0 ? 'Today' : days === 1 ? '1 day ago' : `${days} days ago`;
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [activeType, setActiveType] = useState<string>('all');
  const [activeDate, setActiveDate] = useState<string>('');
  const [activeDuration, setActiveDuration] = useState<string>('');
  const [activeSort, setActiveSort] = useState<string>('relevance');

  const filterGroups = [
    { label: 'Type',     key: 'type',     options: ['all', 'video', 'short', 'channel', 'playlist'] },
    { label: 'Date',     key: 'date',     options: ['any', 'hour', 'today', 'week', 'month', 'year'] },
    { label: 'Duration', key: 'duration', options: ['any', 'short (<4 min)', 'medium (4-20 min)', 'long (>20 min)'] },
    { label: 'Sort',     key: 'sort',     options: ['relevance', 'date', 'viewCount', 'rating'] },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        <Sidebar className="hidden md:block" />

        <main className="flex-1 max-w-6xl px-4 py-6 mx-auto w-full">
          {/* Filter Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Showing results for <span className="font-semibold text-foreground">"{q}"</span></p>
              <Button variant="outline" size="sm" className="gap-2 md:hidden" onClick={() => setFiltersOpen(!filtersOpen)}>
                <Filter size={14} /> Filters {filtersOpen ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
              </Button>
            </div>

            <div className={`flex flex-wrap gap-3 ${filtersOpen ? 'flex' : 'hidden md:flex'}`}>
              {filterGroups.map(group => (
                <div key={group.key} className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground mr-1">{group.label}:</span>
                  {group.options.map(opt => (
                    <button key={opt} 
                      className={`px-3 py-1 rounded-full text-xs font-medium border capitalize transition-colors ${
                        (group.key === 'type' && activeType === opt) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'
                      }`}
                      onClick={() => {
                        if (group.key === 'type') setActiveType(opt);
                        if (group.key === 'date') setActiveDate(opt);
                        if (group.key === 'duration') setActiveDuration(opt);
                        if (group.key === 'sort') setActiveSort(opt);
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="flex flex-col gap-4">
            {MOCK_VIDEOS.map(item => (
              item.type === 'channel' ? (
                // Channel Result Card
                <div key={item.id} className="flex gap-6 p-4 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shrink-0 flex items-center justify-center text-white text-3xl font-bold">
                    {item.channelName[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.channelName}</h3>
                    <p className="text-sm text-muted-foreground">@{item.channelHandle} · {formatCount(item.subscriberCount)} subscribers</p>
                    <p className="text-sm mt-2 text-foreground/80 line-clamp-2">This is a great channel about technology, programming, and the latest in software development.</p>
                    <Button variant="secondary" size="sm" className="mt-3 rounded-full">Subscribe</Button>
                  </div>
                </div>
              ) : (
                // Video Result Card
                <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group">
                  <div className="relative w-full sm:w-64 aspect-video bg-muted rounded-xl overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">{item.duration}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{formatCount(item.views)} views · {formatAge(item.publishedAt)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-6 h-6 rounded-full bg-secondary shrink-0" />
                      <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">{item.channelName}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2 hidden sm:block">
                      This is a detailed description for this video that matches the search query...
                    </p>
                  </div>
                </div>
              )
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
