import { Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Nunito_400Regular, Nunito_700Bold, useFonts } from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform, StatusBar as RNStatusBar, StyleSheet, View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { AuthGate } from '@/components/auth-gate';
import { InternetErrorListener } from '@/components/internet-error-listener';
import { AuthProvider } from '@/contexts/auth-context';
import { LocaleProvider } from '@/contexts/locale-context';
import { colors } from '@/constants/colors';

const fadeScreenOptions = {
  animation: 'fade' as const,
  animationDuration: 250,
};

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
    <LocaleProvider>
      <AuthProvider>
        <KeyboardProvider>
        <View style={styles.root}>
          {Platform.OS === 'android' && (
            <RNStatusBar barStyle="dark-content" backgroundColor={colors.primary} />
          )}
          <StatusBar style="dark" />
          <AuthGate>
            <Stack
              screenOptions={{
                headerShown: false,
                ...fadeScreenOptions,
                contentStyle: { backgroundColor: colors.primary },
              }}>
              <Stack.Screen name="index" options={fadeScreenOptions} />
              <Stack.Screen name="sign-in" options={fadeScreenOptions} />
              <Stack.Screen name="account" options={fadeScreenOptions} />
              <Stack.Screen name="settings" options={fadeScreenOptions} />
              <Stack.Screen name="language" options={fadeScreenOptions} />
              <Stack.Screen name="ai-assistant" options={fadeScreenOptions} />
              <Stack.Screen name="map-directions" options={fadeScreenOptions} />
              <Stack.Screen name="documents/index" options={fadeScreenOptions} />
              <Stack.Screen name="documents/[id]/index" options={fadeScreenOptions} />
              <Stack.Screen name="documents/[id]/mayroon" options={fadeScreenOptions} />
              <Stack.Screen name="documents/[id]/wala" options={fadeScreenOptions} />
              <Stack.Screen name="documents/[id]/steps" options={fadeScreenOptions} />
            </Stack>
          </AuthGate>
          <InternetErrorListener />
        </View>
        </KeyboardProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary,
  },
});
