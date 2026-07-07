import { useRouter, useSegments } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import { brand, colors } from '@/constants/colors';

const PUBLIC_ROUTES = new Set([
  'sign-in',
  'terms',
  'privacy-policy',
  'help',
  'about',
]);

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const currentRoute = segments[0] ?? '';
    const isPublicRoute = PUBLIC_ROUTES.has(currentRoute);

    if (!user && !isPublicRoute) {
      router.replace('/sign-in');
    } else if (user && currentRoute === 'sign-in') {
      router.replace('/');
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={brand.navy} size="large" />
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
});
