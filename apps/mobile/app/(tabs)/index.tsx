import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, TextInput, useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Bell } from 'lucide-react-native';
import { router } from 'expo-router';
import { VideoCard, VideoCardSkeleton, type VideoData } from '@/components/VideoCard';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';

const CATEGORIES = ['All','Gaming','Music','News','Sports','Tech','Cooking','Travel','Science','Comedy'];

const makeFeed = (page: number, cat: string): VideoData[] =>
  Array.from({ length: 12 }, (_, i) => {
    const idx = page * 12 + i;
    const channels = [
      { name: 'TechBro', handle: 'techbro' },
      { name: 'DesignPro', handle: 'designpro' },
      { name: 'GameZone', handle: 'gamezone' },
    ];
    const ch = channels[idx % channels.length];
    return {
      id: `${cat}-${idx}`,
      title: `${cat} — Tutorial #${idx + 1}: Complete Breakdown`,
      channelName: ch.name, channelHandle: ch.handle,
      viewCount: Math.floor(10_000 + Math.random() * 5_000_000),
      publishedAt: new Date(Date.now() - idx * 6 * 86400000).toISOString(),
      duration: `${Math.floor(2 + Math.random() * 45)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    };
  });

export default function HomeScreen() {
  const scheme = useColorScheme();
  const C = scheme === 'dark' ? Colors.dark : Colors.light;
  const [category, setCategory] = useState('All');
  const [videos, setVideos] = useState<VideoData[]>(() => makeFeed(0, 'All'));
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 800));
    setVideos(makeFeed(0, category));
    setPage(0);
    setRefreshing(false);
  }, [category]);

  const onEndReached = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setVideos(prev => [...prev, ...makeFeed(page + 1, category)]);
    setPage(p => p + 1);
    setLoading(false);
  }, [loading, page, category]);

  const onCategoryPress = (cat: string) => {
    setCategory(cat);
    setVideos(makeFeed(0, cat));
    setPage(0);
  };

  const renderItem = useCallback(({ item }: { item: VideoData }) => (
    <View style={{ paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl }}>
      <VideoCard video={item} />
    </View>
  ), []);

  const ListHeader = (
    <View>
      {/* App Bar */}
      <View style={[styles.appBar, { backgroundColor: C.bg }]}>
        <Text style={[styles.logo, { color: C.text }]}>StreamVerse</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/search')}>
            <Search size={22} color={C.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Bell size={22} color={C.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <View style={styles.avatarSmall} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.pillBar, { backgroundColor: C.bg }]} contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: Spacing.sm }}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat} onPress={() => onCategoryPress(cat)}
            style={[styles.pill, { backgroundColor: category === cat ? C.text : C.surface, borderColor: C.border }]}>
            <Text style={[styles.pillText, { color: category === cat ? C.bg : C.text }]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: C.bg }]} edges={['top']}>
      <FlatList
        data={videos}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        stickyHeaderIndices={[0]}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.brand} />}
        ListFooterComponent={loading ? (
          <View style={{ paddingHorizontal: Spacing.lg }}>
            {[1,2,3].map(k => <VideoCardSkeleton key={k} />)}
          </View>
        ) : null}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  logo: { fontSize: FontSize.lg, fontWeight: '800' },
  iconBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.full },
  avatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.brand },
  pillBar: { paddingVertical: Spacing.sm },
  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1, flexShrink: 0 },
  pillText: { fontSize: FontSize.sm, fontWeight: '500' },
});
