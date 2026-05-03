'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Share2, Bookmark, Bell, ChevronDown, ChevronUp, Heart } from 'lucide-react';
import { type VideoCardData } from '@/components/video/VideoCard';

const fmt = (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n/1_000).toFixed(0)}K` : String(n);

const mockVideo = {
  id: 'vid-1', title: 'Complete React 19 Tutorial — New Features, Hooks & Performance',
  viewCount: 1_240_000, likeCount: 48_200, publishedAt: '2026-04-10',
  description: `In this comprehensive tutorial, we cover everything new in React 19.\n\n⏱ Chapters:\n00:00 Introduction\n08:30 The React Compiler\n22:10 Server Components\n40:30 Real-World Project`,
  channelName: 'TechBro', channelHandle: 'techbro', subscriberCount: 245_000,
};

const recommended: VideoCardData[] = Array.from({ length: 10 }, (_, i) => ({
  id: `rec-${i}`, title: ['Next.js 15', 'TypeScript Mastery', 'CSS Grid', 'Bun vs Node', 'AI in 2026'][i % 5] + ` #${i+1}`,
  channelName: ['TechBro', 'DesignPro', 'CodeWithMe'][i % 3], channelHandle: ['techbro','designpro','codewithme'][i % 3],
  viewCount: Math.floor(50_000 + Math.random() * 2_000_000),
  publishedAt: new Date(Date.now() - i * 3 * 86400000).toISOString(),
  duration: `${Math.floor(4+Math.random()*40)}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`,
}));

const SUPER_THANKS = [0.99, 2, 5, 10, 20, 50, 100, 500];

function SuperThanksModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState(5);
  const [sent, setSent] = useState(false);
  if (sent) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div initial={{scale:0.8}} animate={{scale:1}} className="bg-[var(--surface)] rounded-2xl p-8 flex flex-col items-center gap-4 max-w-sm mx-4">
        <div className="text-6xl">💖</div>
        <h2 className="text-xl font-bold">Thanks sent!</h2>
        <button onClick={onClose} className="px-6 py-2.5 bg-[var(--brand)] text-white rounded-full text-sm font-semibold">Done</button>
      </motion.div>
    </div>
  );
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} className="bg-[var(--surface)] rounded-2xl p-6 max-w-sm w-full mx-4 space-y-4" onClick={e=>e.stopPropagation()}>
        <h2 className="text-lg font-bold">💖 Super Thanks</h2>
        <div className="flex flex-wrap gap-2">
          {SUPER_THANKS.map(a => (
            <button key={a} onClick={()=>setAmount(a)} className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${amount===a?'bg-[var(--brand)] text-white border-[var(--brand)]':'border-[var(--border)]'}`}>${a}</button>
          ))}
        </div>
        <textarea placeholder="Add a message (optional)" rows={3} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)] resize-none"/>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-[var(--border)] text-sm">Cancel</button>
          <button onClick={()=>setSent(true)} className="flex-1 py-2.5 bg-[var(--brand)] text-white rounded-full text-sm font-semibold">Send ${amount}</button>
        </div>
      </motion.div>
    </div>
  );
}

export default function WatchPage({ params }: { params: { videoId: string } }) {
  const [liked, setLiked] = useState<boolean|null>(null);
  const [likeCount, setLikeCount] = useState(mockVideo.likeCount);
  const [subscribed, setSubscribed] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [superThanksOpen, setSuperThanksOpen] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [comment, setComment] = useState('');

  const handleLike = (val: boolean) => { setLiked(liked===val?null:val); setLikeCount(val&&liked!==true?mockVideo.likeCount+1:mockVideo.likeCount); };
  const handleShare = () => { navigator.clipboard.writeText(window.location.href).catch(()=>{}); setShareToast(true); setTimeout(()=>setShareToast(false),2000); };

  return (
    <div className="pb-20 md:pb-8">
      <div className="flex flex-col lg:flex-row gap-6 px-4 pt-4 max-w-screen-2xl mx-auto">
        <div className="flex-1 min-w-0">
          {/* Player */}
          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center">
            <p className="text-white/40 text-sm">HLS stream — {params.videoId}</p>
          </div>

          <h1 className="text-lg font-bold mt-4">{mockVideo.title}</h1>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
            <p className="text-sm text-[var(--text-muted)]">{fmt(mockVideo.viewCount)} views · {mockVideo.publishedAt}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex rounded-full overflow-hidden border border-[var(--border)]">
                <motion.button whileTap={{scale:0.85}} onClick={()=>handleLike(true)} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium hover:bg-[var(--surface-hover)] transition-colors ${liked===true?'text-[var(--brand)]':''}`}>
                  <ThumbsUp size={16} className={liked===true?'fill-current':''}/> {fmt(likeCount)}
                </motion.button>
                <div className="w-px bg-[var(--border)]"/>
                <motion.button whileTap={{scale:0.85}} onClick={()=>handleLike(false)} className={`px-3 py-2 hover:bg-[var(--surface-hover)] transition-colors ${liked===false?'text-[var(--brand)]':''}`}><ThumbsDown size={16}/></motion.button>
              </div>
              <button onClick={handleShare} className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-full border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors relative">
                <Share2 size={16}/> Share
                <AnimatePresence>{shareToast&&<motion.span initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[var(--surface)] border border-[var(--border)] text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-md">Copied!</motion.span>}</AnimatePresence>
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-full border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors"><Bookmark size={16}/> Save</button>
              <button onClick={()=>setSuperThanksOpen(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] transition-colors"><Heart size={16}/> Thanks</button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 p-4 bg-[var(--surface)] rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shrink-0"/>
              <div><p className="font-semibold text-sm">{mockVideo.channelName}</p><p className="text-xs text-[var(--text-muted)]">{fmt(mockVideo.subscriberCount)} subscribers</p></div>
            </div>
            <motion.button whileTap={{scale:0.95}} onClick={()=>setSubscribed(!subscribed)} className={`btn-subscribe ${subscribed?'subscribed':''} flex items-center gap-2`}>
              {subscribed&&<Bell size={14}/>}{subscribed?'Subscribed':'Subscribe'}
            </motion.button>
          </div>

          <div className="mt-3 bg-[var(--surface)] rounded-xl p-4">
            <div className={`text-sm whitespace-pre-line ${!descExpanded?'line-clamp-3':''}`}>{mockVideo.description}</div>
            <button onClick={()=>setDescExpanded(!descExpanded)} className="mt-2 text-sm font-semibold flex items-center gap-1">
              {descExpanded?<><ChevronUp size={16}/> Show less</>:<><ChevronDown size={16}/> Show more</>}
            </button>
          </div>

          <div className="mt-6">
            <h2 className="font-bold mb-4">Comments</h2>
            <div className="flex gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shrink-0"/>
              <div className="flex-1">
                <input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add a comment..." className="w-full bg-transparent border-b border-[var(--border)] focus:border-[var(--brand)] py-2 text-sm outline-none"/>
                {comment&&<div className="flex justify-end gap-2 mt-2">
                  <button onClick={()=>setComment('')} className="px-4 py-1.5 rounded-full text-sm">Cancel</button>
                  <button className="px-4 py-1.5 bg-[var(--brand)] text-white rounded-full text-sm font-semibold">Comment</button>
                </div>}
              </div>
            </div>
            {Array.from({length:6},(_,i)=>({id:`c${i}`,author:`User${i+1}`,text:['Great tutorial!','Loved the compiler section!','Very clear explanation!'][i%3],likes:i*40,time:`${i+1}d ago`})).map(c=>(
              <div key={c.id} className="flex gap-3 mb-5">
                <div className="w-9 h-9 rounded-full bg-[var(--surface)] shrink-0 flex items-center justify-center font-bold text-xs">{c.author[0]}</div>
                <div>
                  <div className="flex items-baseline gap-2"><span className="text-sm font-semibold">{c.author}</span><span className="text-xs text-[var(--text-muted)]">{c.time}</span></div>
                  <p className="text-sm mt-1">{c.text}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <button className="flex items-center gap-1 text-xs text-[var(--text-muted)]"><ThumbsUp size={13}/> {c.likes}</button>
                    <button className="text-xs font-medium">Reply</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="w-full lg:w-96 shrink-0 space-y-3">
          <h2 className="font-semibold text-sm">Up next</h2>
          {recommended.map(v => (
            <a key={v.id} href={`/watch/${v.id}`} className="flex gap-3 hover:bg-[var(--surface-hover)] rounded-xl p-2 transition-colors">
              <div className="w-40 aspect-video rounded-lg bg-gradient-to-br from-blue-600 to-purple-700 shrink-0 relative">
                <span className="absolute bottom-1 right-1 bg-black/85 text-white text-[10px] font-semibold px-1 py-0.5 rounded font-mono">{v.duration}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium clamp-2">{v.title}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{v.channelName}</p>
                <p className="text-xs text-[var(--text-muted)]">{fmt(v.viewCount)} views</p>
              </div>
            </a>
          ))}
        </aside>
      </div>
      {superThanksOpen&&<SuperThanksModal onClose={()=>setSuperThanksOpen(false)}/>}
    </div>
  );
}
