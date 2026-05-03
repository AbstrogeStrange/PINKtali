import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList,
  TouchableOpacity, useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Clock, Download, List } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';

const PLAYLISTS = [
  { id: 'watch-later', name: 'Watch Later',    icon: '⏱', count: 24 },
  { id: 'liked',       name: 'Liked Videos',   icon: '👍', count: 182 },
  { id: 'pl1',         name: 'React Series',   icon: '📚', count: 18 },
  { id: 'pl2',         name: 'CSS Masterclass',icon: '🎨', count: 12 },
];

const HISTORY = Array.from({ length: 5 }, (_, i) => ({
  id: `h${i}`, title: ['React 19 Deep Dive','Next.js 15','CSS Grid','TypeScript'][i%4] + ` #${i+1}`,
  channelName: ['TechBro','DesignPro'][i%2], duration: `${8+i*3}:${String(i*7+12).padStart(2,'0')}`,
  progress: Math.floor(30 + i * 15),
}));

const DOWNLOADS = Array.from({ length: 3 }, (_, i) => ({
  id: `d${i}`, title: `Downloaded Video #${i+1}`, size: `${120+i*80} MB`,
}));

export default function LibraryScreen() {
  const scheme = useColorScheme();
  const C = scheme === 'dark' ? Colors.dark : Colors.light;
  const grad = Colors.gradients;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.bg }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.heading, { color: C.text }]}>Library</Text>
        </View>

        {/* Playlists */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.textMuted }]}>PLAYLISTS</Text>
          {PLAYLISTS.map(pl => (
            <TouchableOpacity key={pl.id} onPress={() => router.push(`/playlist/${pl.id}`)}
              style={[styles.row, { borderBottomColor: C.border }]}>
              <View style={[styles.playlistThumb, { backgroundColor: C.surface }]}>
                <Text style={{ fontSize: 22 }}>{pl.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: C.text }]}>{pl.name}</Text>
                <Text style={[styles.rowMeta, { color: C.textMuted }]}>{pl.count} videos</Text>
              </View>
              <ChevronRight size={18} color={C.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Watch History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: C.textMuted }]}>RECENT HISTORY</Text>
            <TouchableOpacity><Text style={{ color: Colors.brand, fontSize: FontSize.xs, fontWeight: '600' }}>See all</Text></TouchableOpacity>
          </View>
          {HISTORY.map(item => (
            <TouchableOpacity key={item.id} style={[styles.historyRow, { borderBottomColor: C.border }]}>
              <View style={[styles.histThumb, { backgroundColor: grad[item.id.charCodeAt(0) % grad.length][0] }]}>
                <Text style={styles.histDuration}>{item.duration}</Text>
                {/* Progress bar */}
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${item.progress}%`, backgroundColor: Colors.brand }]} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: C.text }]} numberOfLines={2}>{item.title}</Text>
                <Text style={[styles.rowMeta, { color: C.textMuted }]}>{item.channelName} · {item.progress}% watched</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Downloads */}
        <View style={[styles.section, { marginBottom: 80 }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: C.textMuted }]}>DOWNLOADS</Text>
            <Download size={16} color={C.textMuted} />
          </View>
          {DOWNLOADS.map(dl => (
            <View key={dl.id} style={[styles.row, { borderBottomColor: C.border }]}>
              <View style={[styles.playlistThumb, { backgroundColor: C.surface }]}>
                <Download size={20} color={C.textMuted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: C.text }]}>{dl.title}</Text>
                <Text style={[styles.rowMeta, { color: C.textMuted }]}>{dl.size} · Offline</Text>
              </View>
              <ChevronRight size={18} color={C.textMuted} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1 },
  header:       { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  heading:      { fontSize: FontSize['2xl'], fontWeight: '800' },
  section:      { marginBottom: Spacing.xl },
  sectionHeader:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  row:          { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  playlistThumb:{ width: 56, height: 56, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  rowTitle:     { fontSize: FontSize.sm, fontWeight: '600', marginBottom: 2 },
  rowMeta:      { fontSize: FontSize.xs },
  historyRow:   { flexDirection: 'row', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
  histThumb:    { width: 100, aspectRatio: 16/9, borderRadius: Radius.md, overflow: 'hidden', justifyContent: 'flex-end', position: 'relative' },
  histDuration: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: 9, fontWeight: '700', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3 },
  progressBg:   { height: 3, backgroundColor: 'rgba(255,255,255,0.3)', width: '100%' },
  progressFill: { height: '100%', borderRadius: 2 },
});
