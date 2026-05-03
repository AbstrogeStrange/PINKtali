'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data
const mockShorts = [
  { id: '1', title: 'Amazing CSS Tricks', channel: 'WebDevSimplified', url: 'https://mock-s3/short1.mp4', likes: '1.2M', comments: '45K' },
  { id: '2', title: 'React Hooks Explained', channel: 'Fireship', url: 'https://mock-s3/short2.mp4', likes: '800K', comments: '12K' },
  { id: '3', title: 'Day in the life of a SWE', channel: 'TechLead', url: 'https://mock-s3/short3.mp4', likes: '500K', comments: '8K' },
];

export default function ShortsFeed() {
  const [shorts, setShorts] = useState(mockShorts);
  const [isMuted, setIsMuted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => console.log('Autoplay blocked'));
            
            // Infinite load trigger
            const index = videoRefs.current.indexOf(video);
            if (index >= shorts.length - 2) {
              setShorts(prev => [...prev, ...mockShorts.map(s => ({...s, id: s.id + Date.now()}))]);
            }
          } else {
            video.pause();
            video.currentTime = 0;
          }
        });
      },
      { threshold: 0.6 }
    );

    videoRefs.current.forEach(video => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [shorts.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      const height = window.innerHeight;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        containerRef.current.scrollBy({ top: height, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        containerRef.current.scrollBy({ top: -height, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory relative"
      style={{ scrollBehavior: 'smooth' }}
    >
      {/* Global Mute Toggle Header */}
      <div className="fixed top-4 right-4 z-50">
         <Button variant="secondary" size="icon" className="rounded-full bg-black/50 hover:bg-black/80 text-white" onClick={() => setIsMuted(!isMuted)}>
           {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
         </Button>
      </div>

      {shorts.map((short, index) => (
        <div key={short.id} className="h-screen w-full snap-start snap-always relative flex items-center justify-center bg-zinc-900">
          
          <video
            ref={el => videoRefs.current[index] = el}
            src={short.url}
            className="h-full max-w-[500px] w-full object-cover"
            loop
            muted={isMuted}
            playsInline
            onClick={(e) => {
              const v = e.target as HTMLVideoElement;
              v.paused ? v.play() : v.pause();
            }}
          />

          {/* Overlays (Only visible on the max-w-[500px] container frame to mimic mobile) */}
          <div className="absolute inset-y-0 max-w-[500px] w-full mx-auto pointer-events-none">
            
            {/* Right Side Actions */}
            <div className="absolute bottom-20 right-4 flex flex-col items-center gap-6 pointer-events-auto">
              <div className="flex flex-col items-center gap-1">
                <button className="p-3 bg-black/40 rounded-full text-white hover:bg-black/60 transition"><Heart size={28} /></button>
                <span className="text-white text-xs font-medium">{short.likes}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <button className="p-3 bg-black/40 rounded-full text-white hover:bg-black/60 transition"><MessageCircle size={28} /></button>
                <span className="text-white text-xs font-medium">{short.comments}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <button className="p-3 bg-black/40 rounded-full text-white hover:bg-black/60 transition"><Share2 size={28} /></button>
                <span className="text-white text-xs font-medium">Share</span>
              </div>
              <button className="p-3 bg-black/40 rounded-full text-white hover:bg-black/60 transition"><MoreVertical size={24} /></button>
              
              <div className="w-10 h-10 bg-zinc-800 rounded-md border-2 border-white overflow-hidden mt-4">
                 {/* Audio Track Thumbnail */}
              </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-4 left-4 right-20 text-white pointer-events-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-zinc-600 rounded-full border border-white/50" />
                <span className="font-bold text-base">@{short.channel}</span>
                <button className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-bold ml-2">Subscribe</button>
              </div>
              <p className="text-sm font-medium line-clamp-2">{short.title} #shorts #programming</p>
              <div className="flex items-center gap-2 mt-2 bg-black/40 w-fit px-3 py-1.5 rounded-full text-xs font-medium">
                 <Volume2 size={14} /> <span>Original Sound - {short.channel}</span>
              </div>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}
