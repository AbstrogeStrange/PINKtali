import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'StreamVerse',
  slug: 'streamverse',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0F0F0F'
  },
  scheme: 'streamverse',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'app.streamverse.mobile',
    infoPlist: {
      NSCameraUsageDescription: 'Camera access is needed to record videos.',
      NSPhotoLibraryUsageDescription: 'Photo library access is needed to upload videos.',
      NSMicrophoneUsageDescription: 'Microphone access is needed to record audio.',
      UIBackgroundModes: ['audio', 'fetch']
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0F0F0F'
    },
    package: 'app.streamverse.mobile',
    permissions: [
      'CAMERA', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE',
      'RECORD_AUDIO', 'VIBRATE', 'RECEIVE_BOOT_COMPLETED'
    ]
  },
  plugins: [
    'expo-router',
    'expo-av',
    'expo-image-picker',
    ['expo-notifications', {
      icon: './assets/notification-icon.png',
      color: '#1A56DB'
    }]
  ],
  experiments: { typedRoutes: true }
});
