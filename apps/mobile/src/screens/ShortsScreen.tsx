import React, { useRef, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { FlashList } from '@shopify/flash-list';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView, TapGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withSequence } from 'react-native-reanimated';

const { height: WINDOW_HEIGHT, width: WINDOW_WIDTH } = Dimensions.get('window');

const mockShorts = [
  { id: '1', url: 'https://mock-s3/short1.mp4', channel: 'TechBro', title: 'Coding Tips' },
  { id: '2', url: 'https://mock-s3/short2.mp4', channel: 'DesignPro', title: 'UI Magic' },
  { id: '3', url: 'https://mock-s3/short3.mp4', channel: 'DailyVlog', title: 'Coffee Run' },
];

const ShortItem = ({ item, isActive, onOpenComments }: any) => {
  const videoRef = useRef<Video>(null);
  const heartScale = useSharedValue(0);

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartScale.value,
  }));

  const onDoubleTap = useCallback(() => {
    heartScale.value = withSequence(
      withSpring(1.2),
      withSpring(0)
    );
    // API call to like
  }, []);

  return (
    <View style={styles.shortContainer}>
      <TapGestureHandler numberOfTaps={2} onActivated={onDoubleTap}>
        <Animated.View style={StyleSheet.absoluteFill}>
          <Video
            ref={videoRef}
            style={StyleSheet.absoluteFill}
            source={{ uri: item.url }}
            resizeMode={ResizeMode.COVER}
            shouldPlay={isActive}
            isLooping
          />
          
          <Animated.View style={[styles.heartOverlay, animatedHeartStyle]}>
            <Text style={{ fontSize: 100 }}>❤️</Text>
          </Animated.View>
        </Animated.View>
      </TapGestureHandler>

      <View style={styles.rightActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onDoubleTap}>
          <Text style={styles.actionIcon}>❤️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onOpenComments}>
          <Text style={styles.actionIcon}>💬</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>↗️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomInfo}>
        <Text style={styles.channelName}>@{item.channel}</Text>
        <Text style={styles.title}>{item.title}</Text>
      </View>
    </View>
  );
};

export default function ShortsScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '90%'], []);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'black' }}>
      <FlashList
        data={mockShorts}
        renderItem={({ item, index }) => (
          <ShortItem 
            item={item} 
            isActive={index === activeIndex} 
            onOpenComments={() => bottomSheetRef.current?.expand()}
          />
        )}
        keyExtractor={item => item.id}
        estimatedItemSize={WINDOW_HEIGHT}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#222' }}
        handleIndicatorStyle={{ backgroundColor: '#fff' }}
      >
        <BottomSheetView style={styles.commentsSheet}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Comments</Text>
          <Text style={{ color: 'gray', marginTop: 10 }}>Loading comments...</Text>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  shortContainer: {
    height: WINDOW_HEIGHT,
    width: WINDOW_WIDTH,
  },
  rightActions: {
    position: 'absolute',
    right: 10,
    bottom: 100,
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
    borderRadius: 30,
  },
  actionIcon: {
    fontSize: 24,
    color: 'white',
  },
  bottomInfo: {
    position: 'absolute',
    left: 15,
    bottom: 30,
  },
  channelName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
  heartOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentsSheet: {
    flex: 1,
    padding: 20,
  }
});
