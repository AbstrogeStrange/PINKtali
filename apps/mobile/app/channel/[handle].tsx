import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  useColorScheme, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ChevronLeft, Bell } from 'lucide-react-native';
import { VideoCard, type VideoData } from '@/components/VideoCard';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';

const TABS = ['Videos', 'Shorts', 'Playlists', 'About'];

const makeVideos = (handle: string): VideoData[] =>
  Array.from({ length: 10 }, (_, i) => ({
    id: `${handle}-${i}`, title: `${handle} — Tutorial #${i+1}`,
    channelName: handle.charAt(0).toUpperCase() + handle.slice(1), channelHandle: handle,
    viewCount: Math.floor(5_000 + Math.random() * 1_000_000),
    publishedAt: new Date(Date.now() - i * 7 * 86400000).toISOString(),
    duration: `${Math.floor(5+Math.random()*40)}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`,
  }));

const fmt = (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n/1_000).toFixed(0)}K` : String(n);

export default function ChannelScreen({ route }: any) {
  const handle = route?.params?.handle ?? 'techbro';
  const channelName = handle.charAt(0).toUpperCase() + handle.slice(1);
  const scheme = useColorScheme();
  const C = scheme === 'dark' ? Colors.dark : Colors.light;
  const grad = Colors.gradients[0];

  const [tab, setTab] = useState('Videos');
  const [subscribed, setSubscribed] = useState(false);
  const videos = makeVideos(handle);

  const handleSubscribe = async () => {
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubscribed(s => !s);
  };

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: C.bg }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[2]}>
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={C.text} />
        </TouchableOpacity>

        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: grad[0] }]} />

        {/* Channel info */}
        <View style={[styles.infoCard, { backgroundColor: C.bg }]}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.md }}>
            <View style={[styles.avatar, { backgroundColor: grad[1], borderColor: C.bg }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.channelName, { color: C.text }]}>{channelName}</Text>
              <Text style={[styles.channelMeta, { color: C.textMuted }]}>@{handle} · 245K subscribers</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
            <TouchableOpacity onPress={handleSubscribe}
              style={[styles.subBtn, { backgroundColor: subscribed ? C.surfaceHover : C.text }]}>
              {subscribed && <Bell size={14} color={C.bg} />}
              <Text style={[styles.subBtnText, { color: subscribed ? C.text : C.bg }]}>{subscribed ? 'Subscribed' : 'Subscribe'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sticky tab bar */}
        <View style={[styles.tabBar, { backgroundColor: C.bg, borderBottomColor: C.border }]}>
          {TABS.map(t => (
            <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab, tab===t && { borderBottomWidth: 2, borderBottomColor: Colors.brand }]}>
              <Text style={[styles.tabText, { color: tab===t ? Colors.brand : C.textMuted }]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={{ padding: Spacing.lg, gap: Spacing.xl }}>
          {tab === 'Videos' && videos.map(v => <VideoCard key={v.id} video={v} />)}

          {tab === 'About' && (
            <View style={{ gap: Spacing.lg }}>
              <Text style={[{ fontSize: FontSize.md, fontWeight: '700' }, { color: C.text }]}>Description</Text>
              <Text style={{ color: C.textMuted, fontSize: FontSize.sm, lineHeight: 22 }}>Welcome to {channelName}! We create tutorials on web development and tech. New videos every Tuesday and Thursday.</Text>
              <Text style={[{ fontSize: FontSize.md, fontWeight: '700', marginTop: 8 }, { color: C.text }]}>Stats</Text>
              <Text style={{ color: C.textMuted, fontSize: FontSize.sm }}>Joined January 2020 · 28M total views</Text>
            </View>
          )}

          {tab === 'Shorts' && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
              {Array.from({ length: 9 }, (_, i) => (
                <View key={i} style={[styles.shortThumb, { backgroundColor: Colors.gradients[i%4][0] }]}>
                  <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 24, fontWeight: '900' }}>{i+1}</Text>
                </View>
              ))}
            </View>
          )}

          {tab === 'Playlists' && (
            <View style={{ gap: Spacing.md }}>
              {['React Series', 'CSS Masterclass', 'JS Fundamentals'].map((pl, i) => (
                <TouchableOpacity key={pl} onPress={() => router.push(`/playlist/pl${i}`)}
                  style={[styles.plRow, { backgroundColor: C.surface, borderColor: C.border }]}>
                  <View style={[styles.plThumb, { backgroundColor: Colors.gradients[i % 4][0] }]} />
                  <View>
                    <Text style={[{ fontSize: FontSize.sm, fontWeight: '700' }, { color: C.text }]}>{pl}</Text>
                    <Text style={{ color: C.textMuted, fontSize: FontSize.xs }}>{8 + i} videos</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backBtn:     { position: 'absolute', top: 10, left: 12, zIndex: 10, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 18 },
  banner:      { height: 140, width: '100%' },
  infoCard:    { padding: Spacing.lg, paddingTop: 0, marginTop: -30 },
  avatar:      { width: 72, height: 72, borderRadius: 36, borderWidth: 3, marginTop: -36 },
  channelName: { fontSize: FontSize.xl, fontWeight: '800' },
  channelMeta: { fontSize: FontSize.xs, marginTop: 2 },
  subBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radius.full },
  subBtnText:  { fontSize: FontSize.sm, fontWeight: '700' },
  tabBar:      { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth },
  tab:         { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabText:     { fontSize: FontSize.sm, fontWeight: '600' },
  shortThumb:  { width: '31%', aspectRatio: 9/16, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  plRow:       { flexDirection: 'row', gap: Spacing.md, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, alignItems: 'center' },
  plThumb:     { width: 60, aspectRatio: 16/9, borderRadius: Radius.sm },
});
