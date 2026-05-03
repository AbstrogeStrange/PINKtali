import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';
import { formatDistanceToNow } from 'date-fns';
import { router } from 'expo-router';

export interface VideoData {
  id: string;
  title: string;
  thumbnailUrl?: string;
  channelName: string;
  channelHandle: string;
  channelAvatarUrl?: string;
  viewCount: number;
  publishedAt: string;
  duration: string;
  isShort?: boolean;
}

const fmt = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
  n >= 1_000     ? `${(n / 1_000).toFixed(0)}K`     : String(n);

const GRADIENT_COLORS = Colors.gradients;

export function VideoCard({ video }: { video: VideoData }) {
  const scheme = useColorScheme();
  const C = scheme === 'dark' ? Colors.dark : Colors.light;
  const gradPair = GRADIENT_COLORS[video.id.charCodeAt(0) % GRADIENT_COLORS.length];

  const age = (() => {
    try { return formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true }); }
    catch { return 'recently'; }
  })();

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => router.push(`/watch/${video.id}`)}>
      {/* Thumbnail */}
      <View style={[styles.thumb, { backgroundColor: gradPair[0] }]}>
        {video.thumbnailUrl ? (
          <Image source={{ uri: video.thumbnailUrl }} style={styles.thumbImg} contentFit="cover" transition={300} />
        ) : (
          <View style={[styles.thumbGrad, { backgroundColor: gradPair[0] }]}>
            <Text style={styles.thumbLetter}>{video.channelName[0]}</Text>
          </View>
        )}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
      </View>

      {/* Meta row */}
      <View style={styles.meta}>
        <TouchableOpacity onPress={() => router.push(`/channel/${video.channelHandle}`)}>
          <View style={[styles.avatar, { backgroundColor: gradPair[1] }]}>
            {video.channelAvatarUrl && <Image source={{ uri: video.channelAvatarUrl }} style={styles.avatarImg} />}
          </View>
        </TouchableOpacity>
        <View style={styles.metaText}>
          <Text style={[styles.title, { color: C.text }]} numberOfLines={2}>{video.title}</Text>
          <Text style={[styles.sub, { color: C.textMuted }]}>{video.channelName}</Text>
          <Text style={[styles.sub, { color: C.textMuted }]}>{fmt(video.viewCount)} views · {age}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function VideoCardSkeleton() {
  const scheme = useColorScheme();
  const C = scheme === 'dark' ? Colors.dark : Colors.light;
  return (
    <View style={{ marginBottom: Spacing.lg }}>
      <View style={[styles.thumb, { backgroundColor: C.surface }]} />
      <View style={[styles.meta, { alignItems: 'flex-start' }]}>
        <View style={[styles.avatar, { backgroundColor: C.surfaceHover }]} />
        <View style={{ flex: 1, gap: 6 }}>
          <View style={{ height: 13, backgroundColor: C.surfaceHover, borderRadius: Radius.sm }} />
          <View style={{ height: 11, width: '70%', backgroundColor: C.surfaceHover, borderRadius: Radius.sm }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  thumb:       { width: '100%', aspectRatio: 16/9, borderRadius: Radius.lg, overflow: 'hidden', backgroundColor: '#1e293b' },
  thumbImg:    { width: '100%', height: '100%' },
  thumbGrad:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  thumbLetter: { fontSize: 40, fontWeight: '900', color: 'rgba(255,255,255,0.2)' },
  durationBadge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.85)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: Radius.sm },
  durationText:  { color: '#fff', fontSize: 11, fontWeight: '600', fontVariant: ['tabular-nums'] },
  meta:      { flexDirection: 'row', gap: Spacing.md, paddingTop: Spacing.sm, paddingHorizontal: 0 },
  avatar:    { width: 36, height: 36, borderRadius: 18, overflow: 'hidden', backgroundColor: '#334155', flexShrink: 0 },
  avatarImg: { width: '100%', height: '100%' },
  metaText:  { flex: 1, gap: 2 },
  title:     { fontSize: FontSize.sm, fontWeight: '600', lineHeight: 18 },
  sub:       { fontSize: FontSize.xs, lineHeight: 16 },
});
