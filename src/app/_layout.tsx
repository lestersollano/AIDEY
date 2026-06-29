import { Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Nunito_400Regular, Nunito_700Bold, useFonts } from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform, StatusBar as RNStatusBar, StyleSheet, View } from 'react-native';

import { colors } from '@/constants/colors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Nunito_400Regular,
    Nunito_700Bold,
    Fredoka_700Bold,
  });

  useEffect(() => {
    if (error) {
      console.error('Failed to load fonts:', error);
    }
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <View style={styles.root}>
      {Platform.OS === 'android' && (
        <RNStatusBar barStyle="dark-content" backgroundColor={colors.primary} />
      )}
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: colors.primary },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary,
  },
});
