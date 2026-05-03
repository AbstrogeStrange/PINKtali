import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ScrollView,
  TouchableOpacity, useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { VideoCard, type VideoData } from '@/components/VideoCard';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';

const SUBSCRIBED_CHANNELS = [
  { id: 'c1', name: 'TechBro',   handle: 'techbro',   color: Colors.gradients[0][0] },
  { id: 'c2', name: 'DesignPro', handle: 'designpro', color: Colors.gradients[1][0] },
  { id: 'c3', name: 'GameZone',  handle: 'gamezone',  color: Colors.gradients[2][0] },
  { id: 'c4', name: 'DailyVlog', handle: 'dailyvlog', color: Colors.gradients[3][0] },
  { id: 'c5', name: 'CodeWithMe',handle: 'codewithme',color: Colors.gradients[0][1] },
];

const FEED: VideoData[] = Array.from({ length: 15 }, (_, i) => {
  const ch = SUBSCRIBED_CHANNELS[i % SUBSCRIBED_CHANNELS.length];
  return {
    id: `sub-${i}`, title: `${ch.name} — New Video #${i+1}`,
    channelName: ch.name, channelHandle: ch.handle,
    viewCount: Math.floor(5_000 + Math.random() * 500_000),
    publishedAt: new Date(Date.now() - i * 4 * 3600000).toISOString(),
    duration: `${Math.floor(4 + Math.random() * 35)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
  };
});

export default function SubscriptionsScreen() {
  const scheme = useColorScheme();
  const C = scheme === 'dark' ? Colors.dark : Colors.light;

  const ListHeader = (
    <View>
      <View style={styles.appBar}>
        <Text style={[styles.heading, { color: C.text }]}>Subscriptions</Text>
      </View>
      {/* Horizontal channel avatar row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.avatarBar, { backgroundColor: C.bg }]} contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: Spacing.lg, alignItems: 'center' }}>
        {SUBSCRIBED_CHANNELS.map(ch => (
          <TouchableOpacity key={ch.id} style={styles.channelChip} onPress={() => router.push(`/channel/${ch.handle}`)}>
            <View style={[styles.channelCircle, { backgroundColor: ch.color }]}>
              <Text style={styles.channelInitial}>{ch.name[0]}</Text>
            </View>
            <Text style={[styles.channelLabel, { color: C.text }]} numberOfLines={1}>{ch.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={[styles.divider, { backgroundColor: C.border }]} />
    </View>
  );

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: C.bg }]} edges={['top']}>
      <FlatList
        data={FEED}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl }}>
            <VideoCard video={item} />
          </View>
        )}
        ListHeaderComponent={ListHeader}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appBar:        { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  heading:       { fontSize: FontSize['2xl'], fontWeight: '800' },
  avatarBar:     { paddingVertical: Spacing.md },
  channelChip:   { alignItems: 'center', width: 64, gap: Spacing.xs },
  channelCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  channelInitial:{ color: '#fff', fontSize: 22, fontWeight: '800' },
  channelLabel:  { fontSize: 11, fontWeight: '500', textAlign: 'center' },
  divider:       { height: StyleSheet.hairlineWidth, marginTop: Spacing.xs },
});
