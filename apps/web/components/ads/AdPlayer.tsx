'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface AdCreative {
  id: string;
  impressionId: string;
  assetUrl: string;
  clickUrl: string;
  ctaText: string;
  format: 'PRE_ROLL' | 'MID_ROLL' | 'POST_ROLL' | 'DISPLAY';
  durationSeconds: number;
  skipAfterSeconds: number;
}

interface AdPlayerProps {
  creative: AdCreative;
  onAdComplete: () => void;
  onAdSkipped: () => void;
}

const QUARTILE_POINTS = [0.25, 0.5, 0.75, 1.0];

export function AdPlayer({ creative, onAdComplete, onAdSkipped }: AdPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [timeLeft, setTimeLeft] = useState(creative.durationSeconds);
  const [skipCountdown, setSkipCountdown] = useState(creative.skipAfterSeconds);
  const [canSkip, setCanSkip] = useState(false);
  const [progress, setProgress] = useState(0);
  const firedQuartiles = useRef(new Set<number>());

  const fireEvent = useCallback(async (event: string, secondsWatched?: number) => {
    // POST /api/v1/ads/events
    console.log(`[AdPlayer] Event: ${event} | ${creative.impressionId} | ${secondsWatched ?? 0}s`);
    await fetch('/api/v1/ads/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ impressionId: creative.impressionId, event, secondsWatched })
    }).catch(() => {});
  }, [creative.impressionId]);

  useEffect(() => {
    fireEvent('IMPRESSION');
  }, [fireEvent]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      const current = video.currentTime;
      const duration = video.duration || creative.durationSeconds;
      const pct = current / duration;

      setTimeLeft(Math.max(0, Math.ceil(duration - current)));
      setProgress(pct * 100);

      // Skip countdown
      if (current < creative.skipAfterSeconds) {
        setSkipCountdown(Math.ceil(creative.skipAfterSeconds - current));
      } else {
        setCanSkip(true);
      }

      // Quartile events
      for (const q of QUARTILE_POINTS) {
        if (pct >= q && !firedQuartiles.current.has(q)) {
          firedQuartiles.current.add(q);
          const eventName = q === 1.0 ? 'COMPLETE' : `QUARTILE_${Math.round(q * 100)}`;
          fireEvent(eventName, Math.round(current));
          if (q === 1.0) onAdComplete();
        }
      }
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    return () => video.removeEventListener('timeupdate', onTimeUpdate);
  }, [creative, fireEvent, onAdComplete]);

  const handleSkip = () => {
    if (!canSkip) return;
    const video = videoRef.current;
    fireEvent('SKIP', Math.round(video?.currentTime ?? 0));
    onAdSkipped();
  };

  const handleClick = () => {
    fireEvent('CLICK', Math.round(videoRef.current?.currentTime ?? 0));
    window.open(creative.clickUrl, '_blank', 'noopener,noreferrer');
  };

  // Display Ad (banner)
  if (creative.format === 'DISPLAY') {
    return (
      <div className="absolute bottom-14 left-0 right-0 mx-6 z-30 flex items-center bg-black/80 backdrop-blur rounded-lg overflow-hidden border border-white/10">
        <div className="flex-1 p-3 cursor-pointer" onClick={handleClick}>
          <span className="text-xs text-yellow-400 font-bold mr-2 border border-yellow-400 px-1 rounded">Ad</span>
          <span className="text-white text-sm">{creative.ctaText}</span>
        </div>
        <button className="p-3 text-white/60 hover:text-white text-lg leading-none" onClick={onAdSkipped}>✕</button>
      </div>
    );
  }

  // Pre/Mid/Post Roll
  return (
    <div className="absolute inset-0 z-20 bg-black flex flex-col">
      {/* Ad video */}
      <video
        ref={videoRef}
        src={creative.assetUrl}
        autoPlay
        playsInline
        className="flex-1 w-full object-contain cursor-pointer"
        onClick={handleClick}
      />

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div className="h-full bg-yellow-400 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* Ad badge */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <span className="text-xs font-bold bg-yellow-400 text-black px-2 py-0.5 rounded">Ad</span>
        <span className="text-white/80 text-xs">{creative.ctaText}</span>
      </div>

      {/* Timer & Skip */}
      <div className="absolute bottom-4 right-4 flex items-center gap-3">
        <span className="text-white/70 text-sm tabular-nums">{timeLeft}s</span>
        {canSkip ? (
          <button
            onClick={handleSkip}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            Skip Ad <span className="text-white/60">›</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-white/60 text-sm px-4 py-2 rounded">
            Skip in {skipCountdown}s
          </div>
        )}
      </div>

      {/* Visit advertiser button */}
      <button
        onClick={handleClick}
        className="absolute bottom-4 left-4 bg-white/10 hover:bg-white/20 text-white text-sm border border-white/20 px-4 py-2 rounded transition-colors"
      >
        Visit Site ↗
      </button>
    </div>
  );
}
