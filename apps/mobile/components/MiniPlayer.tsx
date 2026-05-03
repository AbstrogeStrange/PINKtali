import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  PanResponder, Dimensions, useColorScheme
} from 'react-native';
import { Play, Pause, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { usePlayerStore } from '@/store';
import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

const { width: W } = Dimensions.get('window');
const PLAYER_H = 64;

/**
 * MiniPlayer — rendered as a portal at the bottom of the screen.
 * Draggable thumbnail: swipe right to dismiss, tap to expand.
 */
export function MiniPlayer() {
  const scheme = useColorScheme();
  const C = scheme === 'dark' ? Colors.dark : Colors.light;
  const { miniPlayerVideo, isPlaying, togglePlay, dismissMiniPlayer } = usePlayerStore();

  const translateX = new Animated.Value(0);

  const pan = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,
    onPanResponderMove: (_, g) => translateX.setValue(g.dx),
    onPanResponderRelease: (_, g) => {
      if (Math.abs(g.dx) > W * 0.4) {
        Animated.timing(translateX, { toValue: g.dx > 0 ? W : -W, duration: 200, useNativeDriver: true }).start(() => dismissMiniPlayer());
      } else {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      }
    }
  });

  if (!miniPlayerVideo) return null;

  return (
    <Animated.View style={[styles.container, { backgroundColor: C.surface, borderColor: C.border, transform: [{ translateX }] }]} {...pan.panHandlers}>
      {/* Thumbnail */}
      <View style={[styles.thumb, { backgroundColor: Colors.gradients[0][0] }]} />

      {/* Info */}
      <TouchableOpacity style={styles.info} onPress={() => router.push(`/watch/${miniPlayerVideo.id}`)}>
        <Text style={[styles.title, { color: C.text }]} numberOfLines={1}>{miniPlayerVideo.title}</Text>
        <Text style={[styles.channel, { color: C.textMuted }]}>{miniPlayerVideo.channelName}</Text>
      </TouchableOpacity>

      {/* Controls */}
      <TouchableOpacity onPress={togglePlay} style={styles.ctrl}>
        {isPlaying ? <Pause size={20} color={C.text} /> : <Play size={20} color={C.text} />}
      </TouchableOpacity>
      <TouchableOpacity onPress={dismissMiniPlayer} style={styles.ctrl}>
        <X size={20} color={C.text} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 60, left: 0, right: 0, height: PLAYER_H, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 12 },
  thumb:     { width: 88, height: 50, borderRadius: Radius.sm },
  info:      { flex: 1, gap: 2 },
  title:     { fontSize: FontSize.sm, fontWeight: '600' },
  channel:   { fontSize: FontSize.xs },
  ctrl:      { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
