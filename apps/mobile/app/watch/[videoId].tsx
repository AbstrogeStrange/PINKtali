import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  useColorScheme, Platform, Share, Animated, PanResponder, Dimensions
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  ThumbsUp, ThumbsDown, Share2, Bookmark, Bell,
  ChevronDown, ChevronUp, X, Play, Pause
} from 'lucide-react-native';
import { VideoCard, VideoCardSkeleton, type VideoData } from '@/components/VideoCard';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';
import { usePlayerStore } from '@/store';

const fmt = (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n/1_000).toFixed(0)}K` : String(n);
const { width: W } = Dimensions.get('window');

const MOCK = {
  id: 'vid-1', title: 'Complete React 19 Tutorial — New Hooks & Compiler',
  channelName: 'TechBro', channelHandle: 'techbro', subscriberCount: 245_000,
  viewCount: 1_240_000, likeCount: 48_200, publishedAt: '2026-04-10',
  description: 'In this tutorial we cover React 19 from the ground up.\n\n⏱ Chapters:\n0:00 Intro\n2:15 New Hooks\n14:45 Compiler\n31:00 Project',
  duration: '58:42',
};

const RECOMMENDED: VideoData[] = Array.from({ length: 8 }, (_, i) => ({
  id: `r${i}`, title: ['Next.js 15','TypeScript Tips','CSS Grid','Bun Runtime','AI Dev'][i%5] + ` #${i+1}`,
  channelName: ['TechBro','DesignPro'][i%2], channelHandle: ['techbro','designpro'][i%2],
  viewCount: Math.floor(30_000+Math.random()*1_000_000),
  publishedAt: new Date(Date.now()-i*4*86400000).toISOString(),
  duration: `${Math.floor(4+Math.random()*35)}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`,
}));

export default function WatchScreen({ route }: any) {
  const videoId = route?.params?.videoId ?? 'vid-1';
  const scheme = useColorScheme();
  const C = scheme === 'dark' ? Colors.dark : Colors.light;
  const [liked, setLiked] = useState<boolean|null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<Video>(null);
  const { setMiniPlayer } = usePlayerStore();

  const handleLike = async (val: boolean) => {
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLiked(liked === val ? null : val);
  };
  const handleSubscribe = async () => {
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubscribed(s => !s);
  };
  const handleShare = async () => {
    await Share.share({ message: `Watch "${MOCK.title}" on StreamVerse: streamverse.app/watch/${videoId}` });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.bg }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Video Player */}
        <View style={styles.playerContainer}>
          <Video
            ref={videoRef}
            style={styles.player}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={isPlaying}
            isLooping={false}
            onPlaybackStatusUpdate={status => {
              if (!status.isLoaded) return;
            }}
          />
          {/* Play/Pause overlay */}
          <TouchableOpacity style={styles.playerOverlay} onPress={() => setIsPlaying(p => !p)} activeOpacity={1}>
            <View style={styles.playerGrad}>
              <Text style={styles.playerPlaceholder}>Tap to {isPlaying?'pause':'play'}</Text>
            </View>
            {/* Mini-player button */}
            <TouchableOpacity style={styles.miniBtn} onPress={() => setMiniPlayer({ id: videoId, title: MOCK.title, channelName: MOCK.channelName })}>
              <ChevronDown size={20} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        <View style={{ padding: Spacing.lg, gap: Spacing.md }}>
          {/* Title */}
          <Text style={[styles.title, { color: C.text }]}>{MOCK.title}</Text>

          {/* Stats */}
          <Text style={[styles.meta, { color: C.textMuted }]}>{fmt(MOCK.viewCount)} views · {MOCK.publishedAt}</Text>

          {/* Action buttons */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm }}>
            {/* Like */}
            <TouchableOpacity style={[styles.actionPill, { backgroundColor: C.surface, borderColor: liked===true ? Colors.brand : C.border }]} onPress={() => handleLike(true)}>
              <ThumbsUp size={16} color={liked===true ? Colors.brand : C.text} fill={liked===true ? Colors.brand : 'none'} />
              <Text style={[styles.actionLabel, { color: liked===true ? Colors.brand : C.text }]}>{fmt(MOCK.likeCount)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionPill, { backgroundColor: C.surface, borderColor: liked===false ? Colors.brand : C.border }]} onPress={() => handleLike(false)}>
              <ThumbsDown size={16} color={liked===false ? Colors.brand : C.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionPill, { backgroundColor: C.surface, borderColor: C.border }]} onPress={handleShare}>
              <Share2 size={16} color={C.text} /><Text style={[styles.actionLabel, { color: C.text }]}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionPill, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Bookmark size={16} color={C.text} /><Text style={[styles.actionLabel, { color: C.text }]}>Save</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Channel row */}
          <View style={[styles.channelRow, { backgroundColor: C.surface, borderColor: C.border }]}>
            <View style={[styles.channelAvatar, { backgroundColor: Colors.gradients[0][0] }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.channelName, { color: C.text }]}>{MOCK.channelName}</Text>
              <Text style={[styles.subCount, { color: C.textMuted }]}>{fmt(MOCK.subscriberCount)} subscribers</Text>
            </View>
            <TouchableOpacity onPress={handleSubscribe} style={[styles.subBtn, { backgroundColor: subscribed ? C.surfaceHover : C.text }]}>
              {subscribed && <Bell size={14} color={C.bg} />}
              <Text style={[styles.subBtnText, { color: subscribed ? C.text : C.bg }]}>{subscribed ? 'Subscribed' : 'Subscribe'}</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <TouchableOpacity style={[styles.descBox, { backgroundColor: C.surface }]} onPress={() => setDescExpanded(e => !e)} activeOpacity={0.8}>
            <Text style={[styles.descText, { color: C.text }]} numberOfLines={descExpanded ? undefined : 3}>{MOCK.description}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
              {descExpanded ? <ChevronUp size={14} color={C.textMuted} /> : <ChevronDown size={14} color={C.textMuted} />}
              <Text style={[styles.descToggle, { color: C.textMuted }]}>{descExpanded ? 'Show less' : 'Show more'}</Text>
            </View>
          </TouchableOpacity>

          {/* Comments preview */}
          <TouchableOpacity style={[styles.commentsCard, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Text style={[styles.sectionLabel, { color: C.text }]}>Comments · 4,820</Text>
            <Text style={[styles.commentPreview, { color: C.textMuted }]}>Great video! The compiler part blew my mind 🔥</Text>
          </TouchableOpacity>

          {/* Recommended */}
          <Text style={[styles.sectionLabel, { color: C.text }]}>Up next</Text>
          {RECOMMENDED.map(v => (
            <View key={v.id} style={{ marginBottom: Spacing.lg }}>
              <VideoCard video={v} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1 },
  playerContainer: { width: '100%', aspectRatio: 16/9, backgroundColor: '#000', position: 'relative' },
  player:        { width: '100%', height: '100%' },
  playerOverlay: { position: 'absolute', inset: 0 },
  playerGrad:    { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  playerPlaceholder: { color: 'rgba(255,255,255,0.5)', fontSize: FontSize.sm },
  miniBtn:       { position: 'absolute', top: 8, left: 8, width: 32, height: 32, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  title:         { fontSize: FontSize.md, fontWeight: '700', lineHeight: 22 },
  meta:          { fontSize: FontSize.xs },
  actionPill:    { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1 },
  actionLabel:   { fontSize: FontSize.sm, fontWeight: '600' },
  channelRow:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1 },
  channelAvatar: { width: 40, height: 40, borderRadius: 20 },
  channelName:   { fontSize: FontSize.sm, fontWeight: '700' },
  subCount:      { fontSize: FontSize.xs },
  subBtn:        { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full },
  subBtnText:    { fontSize: FontSize.sm, fontWeight: '700' },
  descBox:       { padding: Spacing.md, borderRadius: Radius.lg },
  descText:      { fontSize: FontSize.sm, lineHeight: 20 },
  descToggle:    { fontSize: FontSize.sm, fontWeight: '600' },
  commentsCard:  { padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, gap: 6 },
  sectionLabel:  { fontSize: FontSize.md, fontWeight: '700' },
  commentPreview:{ fontSize: FontSize.sm, lineHeight: 19 },
});
