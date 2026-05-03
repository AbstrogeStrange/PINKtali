import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, FlatList, Dimensions, StyleSheet,
  TouchableOpacity, useColorScheme, Platform
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Heart, MessageCircle, Share2, Bookmark, Volume2, VolumeX } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, Radius } from '@/constants/theme';
import { router } from 'expo-router';

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('window');

const SHORTS: Array<{ id: string; title: string; channelName: string; channelHandle: string; likes: number; comments: number; uri?: string }> = Array.from({ length: 10 }, (_, i) => ({
  id: `s${i}`, title: `Short #${i+1}: ${['Life hack!','You won\'t believe','Watch till end','This changed everything','Mind-blowing trick'][i % 5]}`,
  channelName: ['TechBro','DesignPro','DailyVlog'][i % 3], channelHandle: ['techbro','designpro','dailyvlog'][i % 3],
  likes: Math.floor(10_000 + Math.random() * 500_000), comments: Math.floor(500 + Math.random() * 10_000),
}));

const fmt = (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n/1_000).toFixed(0)}K` : String(n);

function ShortItem({ item, isActive }: { item: typeof SHORTS[0]; isActive: boolean }) {
  const scheme = useColorScheme();
  const [liked, setLiked] = useState(false);
  const [muted, setMuted] = useState(true);
  const gradPair = Colors.gradients[item.id.charCodeAt(0) % Colors.gradients.length];

  const handleLike = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setLiked(l => !l);
  };

  return (
    <View style={[styles.shortContainer, { width: SCREEN_W, height: SCREEN_H }]}>
      {/* Background / video */}
      <View style={[styles.videoBg, { backgroundColor: gradPair[0] }]}>
        <Text style={styles.bgLetter}>{item.channelName[0]}</Text>
      </View>

      {/* Gradient overlay */}
      <View style={styles.overlay} />

      {/* Bottom info */}
      <View style={styles.bottomInfo}>
        <TouchableOpacity onPress={() => router.push(`/channel/${item.channelHandle}`)}>
          <Text style={styles.channelName}>@{item.channelHandle}</Text>
        </TouchableOpacity>
        <Text style={styles.shortTitle} numberOfLines={2}>{item.title}</Text>
      </View>

      {/* Right action column */}
      <View style={styles.actions}>
        {/* Channel avatar */}
        <View style={styles.shortAvatar}>
          <View style={[styles.avatarInner, { backgroundColor: gradPair[1] }]} />
          <View style={styles.followBadge}><Text style={styles.followPlus}>+</Text></View>
        </View>

        {/* Like */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
          <Heart size={32} color={liked ? '#ff4d6d' : '#fff'} fill={liked ? '#ff4d6d' : 'none'} />
          <Text style={styles.actionCount}>{fmt(item.likes + (liked ? 1 : 0))}</Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/watch/${item.id}`)}>
          <MessageCircle size={32} color="#fff" />
          <Text style={styles.actionCount}>{fmt(item.comments)}</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={styles.actionBtn}>
          <Share2 size={30} color="#fff" />
          <Text style={styles.actionCount}>Share</Text>
        </TouchableOpacity>

        {/* Mute */}
        <TouchableOpacity style={styles.actionBtn} onPress={() => setMuted(m => !m)}>
          {muted ? <VolumeX size={28} color="#fff" /> : <Volume2 size={28} color="#fff" />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ShortsScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 70 });
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index);
  });

  return (
    <FlatList
      data={SHORTS}
      keyExtractor={item => item.id}
      renderItem={({ item, index }) => <ShortItem item={item} isActive={index === activeIndex} />}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={SCREEN_H}
      snapToAlignment="start"
      decelerationRate="fast"
      viewabilityConfig={viewabilityConfig.current}
      onViewableItemsChanged={onViewableItemsChanged.current}
    />
  );
}

const styles = StyleSheet.create({
  shortContainer: { position: 'relative' },
  videoBg:        { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' },
  bgLetter:       { fontSize: 120, fontWeight: '900', color: 'rgba(255,255,255,0.15)' },
  overlay:        { position: 'absolute', bottom: 0, left: 0, right: 0, height: 300, backgroundColor: 'rgba(0,0,0,0)', },
  bottomInfo:     { position: 'absolute', bottom: 80, left: 16, right: 80 },
  channelName:    { color: '#fff', fontWeight: '700', fontSize: FontSize.md, marginBottom: 6, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4 },
  shortTitle:     { color: '#fff', fontSize: FontSize.sm, lineHeight: 20, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4 },
  actions:        { position: 'absolute', right: 12, bottom: 80, alignItems: 'center', gap: 20 },
  shortAvatar:    { marginBottom: 4 },
  avatarInner:    { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#fff' },
  followBadge:    { position: 'absolute', bottom: -10, left: '50%', marginLeft: -10, width: 20, height: 20, borderRadius: 10, backgroundColor: '#ff0050', alignItems: 'center', justifyContent: 'center' },
  followPlus:     { color: '#fff', fontSize: 14, fontWeight: '700', lineHeight: 20 },
  actionBtn:      { alignItems: 'center', gap: 4 },
  actionCount:    { color: '#fff', fontSize: 12, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 4 },
});
