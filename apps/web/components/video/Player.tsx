'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Subtitles, Settings } from 'lucide-react';

interface PlayerProps {
  manifestUrl: string;
  poster?: string;
  autoPlay?: boolean;
}

export const Player: React.FC<PlayerProps> = ({ manifestUrl, poster, autoPlay = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      
      hls.loadSource(manifestUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) video.play().catch(() => console.log('Autoplay blocked'));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = manifestUrl;
      if (autoPlay) video.play();
    }

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [manifestUrl, autoPlay]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      switch(e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          toggleMute();
          break;
        case 'j':
          video.currentTime = Math.max(video.currentTime - 10, 0);
          break;
        case 'l':
          video.currentTime = Math.min(video.currentTime + 10, video.duration);
          break;
        case 'arrowleft':
          video.currentTime = Math.max(video.currentTime - 5, 0);
          break;
        case 'arrowright':
          video.currentTime = Math.min(video.currentTime + 5, video.duration);
          break;
        default:
          if (e.key >= '0' && e.key <= '9') {
            const percent = parseInt(e.key) * 10;
            video.currentTime = (video.duration * percent) / 100;
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full aspect-video bg-black group overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full cursor-pointer"
        poster={poster}
        onClick={togglePlay}
        onTimeUpdate={() => setProgress((videoRef.current!.currentTime / videoRef.current!.duration) * 100)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        playsInline
      />

      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Progress Bar (simplified) */}
        <div className="w-full h-1 bg-white/30 cursor-pointer mb-4 relative rounded-full group/progress">
          <div 
            className="absolute top-0 left-0 h-full bg-red-600 rounded-full"
            style={{ width: `${progress || 0}%` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full scale-0 group-hover/progress:scale-100 transition-transform"
            style={{ left: `${progress || 0}%`, marginLeft: '-6px' }}
          />
        </div>

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="hover:text-white/80">
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <div className="flex items-center gap-2 group/volume">
              <button onClick={toggleMute} className="hover:text-white/80">
                {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              {/* Volume Slider would go here */}
            </div>
            <span className="text-sm font-medium">0:00 / 0:00</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="hover:text-white/80"><Subtitles size={20} /></button>
            <button className="hover:text-white/80"><Settings size={20} /></button>
            <button onClick={toggleFullscreen} className="hover:text-white/80">
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
