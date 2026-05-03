'use client';

import { useState } from 'react';
import { VideoCard, VideoCardSkeleton, type VideoCardData } from '@/components/video/VideoCard';
import { useSearchParams } from 'next/navigation';
import { LayoutGrid, LayoutList, Filter, ChevronDown } from 'lucide-react';

const SORT_OPTIONS = ['relevance', 'date', 'viewCount', 'rating'];
const DATE_OPTIONS  = ['any', 'hour', 'today', 'week', 'month', 'year'];
const DUR_OPTIONS   = ['any', 'short (<4 min)', 'medium (4-20 min)', 'long (>20 min)'];
const TYPE_OPTIONS  = ['all', 'video', 'short', 'channel', 'playlist'];

const fakeResults = (q: string): VideoCardData[] =>
  Array.from({ length: 18 }, (_, i) => ({
    id: `sr-${i}`, title: `"${q}" — Result #${i+1}: Complete Tutorial`,
    channelName: ['TechBro', 'DesignPro', 'GameZone'][i % 3],
    channelHandle: ['techbro', 'designpro', 'gamezone'][i % 3],
    viewCount: Math.floor(10_000 + Math.random() * 3_000_000),
    publishedAt: new Date(Date.now() - i * 5 * 86400000).toISOString(),
    duration: `${Math.floor(2+Math.random()*40)}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`,
  }));

const fmt = (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n/1_000).toFixed(0)}K` : String(n);

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('search_query') ?? searchParams.get('q') ?? '';
  const [layout, setLayout] = useState<'grid'|'list'>('list');
  const [sort, setSort] = useState('relevance');
  const [date, setDate] = useState('any');
  const [dur, setDur] = useState('any');
  const [type, setType] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = fakeResults(q);

  return (
    <div className="pb-20 md:pb-8 px-4 pt-5 max-w-5xl">
      {/* Filter bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-[var(--text-muted)]">Results for <span className="font-semibold text-[var(--text)]">"{q}"</span></p>
          <div className="flex items-center gap-2">
            <button onClick={() => setFiltersOpen(!filtersOpen)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-[var(--border)] rounded-full hover:bg-[var(--surface-hover)] transition-colors">
              <Filter size={14}/> Filters <ChevronDown size={14} className={filtersOpen?'rotate-180 transition-transform':'transition-transform'}/>
            </button>
            <button onClick={() => setLayout('list')} className={`p-2 rounded-lg ${layout==='list'?'bg-[var(--surface-hover)]':''}`}><LayoutList size={16}/></button>
            <button onClick={() => setLayout('grid')} className={`p-2 rounded-lg ${layout==='grid'?'bg-[var(--surface-hover)]':''}`}><LayoutGrid size={16}/></button>
          </div>
        </div>

        {filtersOpen && (
          <div className="flex flex-wrap gap-x-6 gap-y-3 p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
            {[{label:'Type',opts:TYPE_OPTIONS,val:type,set:setType},{label:'Date',opts:DATE_OPTIONS,val:date,set:setDate},{label:'Duration',opts:DUR_OPTIONS,val:dur,set:setDur},{label:'Sort',opts:SORT_OPTIONS,val:sort,set:setSort}].map(f=>(
              <div key={f.label} className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-[var(--text-muted)]">{f.label}:</span>
                {f.opts.map(o=>(
                  <button key={o} onClick={()=>f.set(o)} className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors capitalize ${f.val===o?'bg-[var(--text)] text-[var(--bg)] border-[var(--text)]':'border-[var(--border)] hover:bg-[var(--surface-hover)]'}`}>{o}</button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {layout === 'list' ? (
        <div className="space-y-4">
          {results.map(v => (
            <a key={v.id} href={`/watch/${v.id}`} className="flex flex-col sm:flex-row gap-4 p-3 rounded-xl hover:bg-[var(--surface-hover)] transition-colors group">
              <div className="sm:w-72 aspect-video bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl shrink-0 relative">
                <span className="absolute bottom-2 right-2 bg-black/85 text-white text-xs font-semibold px-1.5 py-0.5 rounded font-mono">{v.duration}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base clamp-2 group-hover:text-[var(--brand)] transition-colors">{v.title}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">{fmt(v.viewCount)} views · {new Date(v.publishedAt).toLocaleDateString()}</p>
                <p className="text-sm text-[var(--text-muted)] mt-1.5">{v.channelName}</p>
                <p className="text-sm text-[var(--text-muted)] mt-2 clamp-2 hidden sm:block">This video covers the topic "{q}" in depth with practical examples and real-world use cases.</p>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8">
          {results.map(v => <VideoCard key={v.id} video={v}/>)}
        </div>
      )}
    </div>
  );
}
