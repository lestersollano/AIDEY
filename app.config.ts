import type { ExpoConfig } from 'expo/config';

const baseConfig = require('./app.json').expo as ExpoConfig;

export default (): ExpoConfig => ({
  ...baseConfig,
  plugins: [
    ...(baseConfig.plugins ?? []),
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Allow Aidey to use your location to find the nearest government office.',
      },
    ],
    [
      'react-native-maps',
      {
        androidGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        iosGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    ],
    [
      'expo-speech-recognition',
      {
        microphonePermission:
          'Kailangan ng Aidey ang access sa iyong microphone para gumana ang speech-to-text.',
        speechRecognitionPermission:
          'Kailangan ng Aidey ang access sa speech recognition para maunawaan ang iyong sinasabi.',
      },
    ],
  ],
  ios: {
    ...baseConfig.ios,
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Allow Aidey to use your location to find the nearest government office.',
    },
  },
  android: {
    ...baseConfig.android,
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      ...(baseConfig.android?.permissions ?? []),
    ],
  },
});
