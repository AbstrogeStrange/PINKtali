'use client';

import { useState } from 'react';
import { GripVertical, Play, Shuffle } from 'lucide-react';

const fmt = (n: number) => n >= 1_000 ? `${(n/1_000).toFixed(0)}K` : String(n);

const initialItems = Array.from({ length: 12 }, (_, i) => ({
  id: `p-v${i}`, position: i+1,
  title: ['React 19 Deep Dive', 'Next.js 15 Complete Guide', 'TypeScript Advanced Patterns', 'CSS Grid Masterclass', 'Bun Runtime Review'][i%5] + ` (Part ${i+1})`,
  channelName: 'TechBro', duration: `${Math.floor(8+Math.random()*30)}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`,
  viewCount: Math.floor(50_000+Math.random()*500_000),
}));

const totalDuration = '18 hr 42 min';

export default function PlaylistPage({ params }: { params: { id: string } }) {
  const [items, setItems] = useState(initialItems);
  const [dragging, setDragging] = useState<string|null>(null);
  const isOwn = true; // In prod: check auth

  const onDragStart = (id: string) => setDragging(id);
  const onDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragging || dragging===targetId) return;
    setItems(prev => {
      const list = [...prev];
      const from = list.findIndex(v=>v.id===dragging);
      const to   = list.findIndex(v=>v.id===targetId);
      const [item] = list.splice(from, 1);
      list.splice(to, 0, item);
      return list.map((v,i)=>({...v,position:i+1}));
    });
  };
  const onDragEnd = () => setDragging(null);

  return (
    <div className="pb-20 md:pb-8">
      <div className="flex flex-col lg:flex-row gap-6 px-4 pt-5 max-w-6xl mx-auto">
        {/* Playlist header card */}
        <div className="lg:w-80 shrink-0">
          <div className="lg:sticky lg:top-[calc(var(--header-height)+1rem)]">
            <div className="aspect-video bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden">
              <div className="text-white/20 text-8xl font-black absolute">▶</div>
              <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded font-semibold">{items.length} videos</span>
            </div>
            <h1 className="text-xl font-bold">React & Frontend Masterclass</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">TechBro · Updated 2 days ago</p>
            <p className="text-sm text-[var(--text-muted)]">{items.length} videos · {totalDuration}</p>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--brand)] text-white rounded-full text-sm font-semibold hover:bg-[var(--brand-hover)] transition-colors">
                <Play size={16} fill="currentColor"/> Play all
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-[var(--border)] rounded-full text-sm font-medium hover:bg-[var(--surface-hover)] transition-colors">
                <Shuffle size={16}/> Shuffle
              </button>
            </div>
          </div>
        </div>

        {/* Video list */}
        <div className="flex-1 min-w-0 space-y-2">
          {isOwn && <p className="text-xs text-[var(--text-muted)] mb-3">Drag to reorder</p>}
          {items.map(item => (
            <div
              key={item.id}
              draggable={isOwn}
              onDragStart={() => onDragStart(item.id)}
              onDragOver={e => onDragOver(e, item.id)}
              onDragEnd={onDragEnd}
              className={`flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface-hover)] transition-colors ${dragging===item.id?'opacity-40 scale-95':''} cursor-pointer group`}
            >
              {isOwn && <GripVertical size={16} className="text-[var(--text-muted)] shrink-0 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"/>}
              <span className="text-sm text-[var(--text-muted)] w-5 shrink-0 text-center">{item.position}</span>
              <div className="w-36 aspect-video bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg shrink-0 relative">
                <span className="absolute bottom-1 right-1 bg-black/85 text-white text-[10px] font-semibold px-1 py-0.5 rounded font-mono">{item.duration}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium clamp-2">{item.title}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{item.channelName}</p>
                <p className="text-xs text-[var(--text-muted)]">{fmt(item.viewCount)} views</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
