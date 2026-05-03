import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  useColorScheme
} from 'react-native';
import { GripVertical, Play, Shuffle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';

const makeItems = (count = 10) =>
  Array.from({ length: count }, (_, i) => ({
    id: `pl-v${i}`, position: i+1,
    title: ['React 19 Tutorial','Next.js Deep Dive','CSS Grid Mastery','TypeScript Advanced'][i%4] + ` (Part ${i+1})`,
    channelName: 'TechBro', duration: `${8+i*2}:${String(i*7+10).padStart(2,'0')}`,
  }));

export default function PlaylistScreen({ route }: any) {
  const playlistId = route?.params?.id ?? 'pl1';
  const scheme = useColorScheme();
  const C = scheme === 'dark' ? Colors.dark : Colors.light;
  const [items, setItems] = useState(makeItems(10));

  const Header = (
    <View>
      {/* Artwork */}
      <View style={[styles.artwork, { backgroundColor: Colors.gradients[0][0] }]}>
        <Text style={styles.artworkText}>🎬</Text>
        <Text style={[styles.artworkTitle, { color: '#fff' }]}>React & Frontend Masterclass</Text>
        <Text style={[styles.artworkMeta, { color: 'rgba(255,255,255,0.7)' }]}>{items.length} videos · TechBro</Text>
      </View>

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg }}>
        <TouchableOpacity style={[styles.playBtn, { backgroundColor: Colors.brand }]}>
          <Play size={18} color="#fff" fill="#fff" />
          <Text style={styles.playBtnText}>Play all</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.shuffleBtn, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Shuffle size={18} color={C.text} />
          <Text style={[styles.shuffleText, { color: C.text }]}>Shuffle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: C.bg }]} edges={['top']}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        ListHeaderComponent={Header}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.row, { borderBottomColor: C.border }]} onPress={() => router.push(`/watch/${item.id}`)}>
            <Text style={[styles.pos, { color: C.textMuted }]}>{item.position}</Text>
            <View style={[styles.thumb, { backgroundColor: Colors.gradients[item.id.charCodeAt(0)%4][0] }]}>
              <Text style={styles.dur}>{item.duration}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: C.text }]} numberOfLines={2}>{item.title}</Text>
              <Text style={[styles.channel, { color: C.textMuted }]}>{item.channelName}</Text>
            </View>
            <GripVertical size={16} color={C.textMuted} />
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  artwork:     { alignItems: 'center', justifyContent: 'flex-end', padding: Spacing.xl, height: 220, gap: Spacing.sm },
  artworkText: { fontSize: 56 },
  artworkTitle:{ fontSize: FontSize.xl, fontWeight: '800', textAlign: 'center' },
  artworkMeta: { fontSize: FontSize.sm },
  playBtn:     { flex: 1, flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: Radius.xl },
  playBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
  shuffleBtn:  { flex: 1, flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: Radius.xl, borderWidth: 1 },
  shuffleText: { fontWeight: '600', fontSize: FontSize.sm },
  row:         { flexDirection: 'row', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
  pos:         { width: 20, fontSize: FontSize.sm, textAlign: 'center' },
  thumb:       { width: 88, aspectRatio: 16/9, borderRadius: Radius.sm, justifyContent: 'flex-end', alignItems: 'flex-end', padding: 3 },
  dur:         { color: '#fff', fontSize: 9, fontWeight: '700', backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3 },
  title:       { fontSize: FontSize.sm, fontWeight: '600', marginBottom: 2 },
  channel:     { fontSize: FontSize.xs },
});
