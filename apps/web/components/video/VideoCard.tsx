'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export interface VideoCardData {
  id: string;
  title: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  channelName: string;
  channelHandle: string;
  channelAvatar?: string;
  viewCount: number;
  publishedAt: string | Date;
  duration: string; // "12:34"
  isShort?: boolean;
}

const fmt = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
  n >= 1_000     ? `${(n / 1_000).toFixed(0)}K` : String(n);

export function VideoCard({ video }: { video: VideoCardData }) {
  const age = formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true });
  const gradients = ['from-blue-600 to-purple-700', 'from-pink-500 to-rose-600', 'from-emerald-500 to-teal-600', 'from-orange-500 to-amber-600'];
  const grad = gradients[video.id.charCodeAt(0) % gradients.length];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-3 cursor-pointer group"
    >
      <Link href={`/watch/${video.id}`} className="block">
        {/* Thumbnail */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[var(--surface)]">
          {video.thumbnailUrl ? (
            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center`}>
              <span className="text-white/30 text-4xl font-black">{video.channelName[0]}</span>
            </div>
          )}
          {/* Preview on hover */}
          {video.previewUrl && (
            <img src={video.previewUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
          {/* Duration */}
          <span className="absolute bottom-2 right-2 bg-black/85 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded font-mono">
            {video.duration}
          </span>
        </div>
      </Link>

      {/* Meta */}
      <div className="flex gap-3">
        <Link href={`/channel/${video.channelHandle}`} className="shrink-0 mt-0.5">
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${grad} hover:ring-2 ring-[var(--brand)] transition-all`} />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/watch/${video.id}`}>
            <h3 className="text-sm font-semibold leading-snug clamp-2 group-hover:text-[var(--brand)] transition-colors">
              {video.title}
            </h3>
          </Link>
          <Link href={`/channel/${video.channelHandle}`} className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors mt-1 block">
            {video.channelName}
          </Link>
          <p className="text-xs text-[var(--text-muted)]">
            {fmt(video.viewCount)} views · {age}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function VideoCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="skeleton w-full aspect-video rounded-xl" />
      <div className="flex gap-3">
        <div className="skeleton w-9 h-9 rounded-full shrink-0" />
        <div className="flex-1 space-y-2 mt-1">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-3 w-2/3 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      </div>
    </div>
  );
}
