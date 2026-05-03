'use client';

import { useState } from 'react';
import { VideoCard, type VideoCardData } from '@/components/video/VideoCard';
import { Bell, Globe } from 'lucide-react';

const TABS = ['Home', 'Videos', 'Shorts', 'Playlists', 'Community', 'About'];
const fmt = (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n/1_000).toFixed(0)}K` : String(n);

const makeVideos = (handle: string, count: number): VideoCardData[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `${handle}-v${i}`, title: `${handle} — Advanced Tutorial #${i+1}`,
    channelName: handle.charAt(0).toUpperCase()+handle.slice(1), channelHandle: handle,
    viewCount: Math.floor(5_000+Math.random()*1_000_000),
    publishedAt: new Date(Date.now()-i*7*86400000).toISOString(),
    duration: `${Math.floor(5+Math.random()*40)}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`,
  }));

export default function ChannelPage({ params }: { params: { handle: string } }) {
  const { handle } = params;
  const channelName = handle.charAt(0).toUpperCase()+handle.slice(1);
  const [activeTab, setActiveTab] = useState('Videos');
  const [subscribed, setSubscribed] = useState(false);
  const videos = makeVideos(handle, 12);

  return (
    <div className="pb-20 md:pb-8">
      <div className="w-full h-40 sm:h-52 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"/>
      <div className="px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10 sm:-mt-14 mb-6">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-[var(--bg)] bg-gradient-to-br from-blue-500 to-purple-600 shrink-0"/>
          <div className="flex-1 min-w-0 sm:pb-2">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">{channelName}</h1>
                <p className="text-sm text-[var(--text-muted)]">@{handle} · 245K subscribers · 124 videos</p>
              </div>
              <div className="flex gap-2 ml-auto sm:ml-0">
                <button className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors"><Bell size={16}/></button>
                <button onClick={()=>setSubscribed(!subscribed)} className={`btn-subscribe ${subscribed?'subscribed':''}`}>{subscribed?'Subscribed':'Subscribe'}</button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-[var(--border)] flex gap-1 overflow-x-auto mb-6">
          {TABS.map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab===tab?'border-b-2 border-[var(--text)] text-[var(--text)]':'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>{tab}</button>
          ))}
        </div>

        {activeTab==='Videos' && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">{videos.map(v=><VideoCard key={v.id} video={v}/>)}</div>}

        {activeTab==='Shorts' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({length:10},(_,i)=>i).map(i=>(
              <div key={i} className="aspect-[9/16] bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-end p-3 cursor-pointer hover:scale-[1.02] transition-transform">
                <p className="text-white text-xs font-medium">Short #{i+1}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab==='Playlists' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {['React Series','CSS Masterclass','JS Fundamentals','Next.js Deep Dive'].map((name,i)=>(
              <a key={i} href={`/playlist/pl-${i}`} className="group cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl relative overflow-hidden mb-2">
                  <span className="absolute bottom-2 left-3 text-white text-xs font-semibold">{5+i} videos</span>
                </div>
                <p className="text-sm font-semibold group-hover:text-[var(--brand)] transition-colors">{name}</p>
                <p className="text-xs text-[var(--text-muted)]">Playlist · {channelName}</p>
              </a>
            ))}
          </div>
        )}

        {activeTab==='Community' && (
          <div className="max-w-xl space-y-4">
            {[{text:'Just hit 245K subscribers! Thank you all! 🎉',likes:1200,time:'2 days ago'},{text:'New video tomorrow — React 19 full course!',likes:840,time:'5 days ago'}].map((post,i)=>(
              <div key={i} className="p-5 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600"/>
                  <div><p className="text-sm font-semibold">{channelName}</p><p className="text-xs text-[var(--text-muted)]">{post.time}</p></div>
                </div>
                <p className="text-sm">{post.text}</p>
                <button className="flex items-center gap-1 mt-3 text-xs text-[var(--text-muted)]">👍 {fmt(post.likes)}</button>
              </div>
            ))}
          </div>
        )}

        {activeTab==='About' && (
          <div className="max-w-2xl space-y-6">
            <div><h3 className="font-bold mb-2">Description</h3><p className="text-sm text-[var(--text-muted)]">Welcome to {channelName}! We create tutorials on web development and programming. New videos every Tuesday and Thursday.</p></div>
            <div><h3 className="font-bold mb-2">Stats</h3><p className="text-sm text-[var(--text-muted)]">Joined January 2020 · 28M total views</p></div>
            <div><h3 className="font-bold mb-2">Links</h3><p className="flex items-center gap-2 text-sm text-[var(--brand)]"><Globe size={14}/> streamverse.app/@{handle}</p></div>
          </div>
        )}
      </div>
    </div>
  );
}
