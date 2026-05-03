import React, { useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WatchScreen({ route }: any) {
  const videoRef = useRef(null);
  const { videoId } = route.params || { videoId: 'default' };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          style={styles.video}
          source={{
            uri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
          }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping
        />
      </View>
      <View className="p-4">
        <Text className="text-lg font-bold text-black dark:text-white">Playing Video {videoId}</Text>
        <Text className="text-gray-500 mt-2">1.2M views • 1 year ago</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    width: '100%',
    height: Dimensions.get('window').width * (9 / 16),
    backgroundColor: 'black',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
