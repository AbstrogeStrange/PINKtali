import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons'; // Assuming expo vector icons are used or mock it

interface MobilePlayerProps {
  videoId: string;
  streamUrl: string;
  poster?: string;
}

export default function MobilePlayer({ videoId, streamUrl, poster }: MobilePlayerProps) {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>({} as AVPlaybackStatus);
  const [showControls, setShowControls] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    // Check if video is cached for offline mode
    const checkOfflineCache = async () => {
      const fileUri = `${FileSystem.documentDirectory}offline_${videoId}.mp4`;
      const info = await FileSystem.getInfoAsync(fileUri);
      if (info.exists) {
        setIsOffline(true);
        setLocalUri(fileUri);
      }
    };
    checkOfflineCache();
  }, [videoId]);

  const handleDownload = async () => {
    // Logic handles falling back to a raw MP4 URL if HLS isn't natively downloadable via file system
    // Mock downloading process
    const fileUri = `${FileSystem.documentDirectory}offline_${videoId}.mp4`;
    const downloadResumable = FileSystem.createDownloadResumable(
      'https://mock-s3/raw_video_fallback.mp4',
      fileUri,
      {},
      (downloadProgress) => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        setDownloadProgress(progress);
      }
    );

    try {
      const result = await downloadResumable.downloadAsync();
      if (result) {
        setIsOffline(true);
        setLocalUri(result.uri);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const togglePlayPause = () => {
    if (status.isLoaded) {
      status.isPlaying ? videoRef.current?.pauseAsync() : videoRef.current?.playAsync();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        activeOpacity={1} 
        style={styles.videoWrapper} 
        onPress={() => setShowControls(!showControls)}
      >
        <Video
          ref={videoRef}
          style={styles.video}
          source={{ uri: isOffline ? localUri! : streamUrl }}
          posterSource={poster ? { uri: poster } : undefined}
          useNativeControls={false}
          resizeMode={ResizeMode.CONTAIN}
          onPlaybackStatusUpdate={status => setStatus(() => status)}
          isLooping={false}
          // Enable background audio and PiP (AVKit implementation on native side)
          staysActiveInBackground={true}
          pictureInPicture={true}
        />

        {(!status.isLoaded || status.isBuffering) && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}

        {showControls && status.isLoaded && (
          <View style={styles.controlsOverlay}>
            <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
              <Text style={styles.playIcon}>{status.isPlaying ? '❚❚' : '▶'}</Text>
            </TouchableOpacity>

            <View style={styles.bottomControls}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${(status.positionMillis / (status.durationMillis || 1)) * 100}%` }]} />
              </View>
              <TouchableOpacity onPress={handleDownload}>
                <Text style={styles.downloadText}>
                  {isOffline ? 'Downloaded' : downloadProgress > 0 ? `${(downloadProgress * 100).toFixed(0)}%` : 'Download'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'black',
  },
  videoWrapper: {
    width: '100%',
    height: Dimensions.get('window').width * (9 / 16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  playButton: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 50,
  },
  playIcon: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginRight: 15,
    borderRadius: 2,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'red',
    borderRadius: 2,
  },
  downloadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  }
});
