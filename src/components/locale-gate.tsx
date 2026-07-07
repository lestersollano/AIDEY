import { useRouter, useSegments } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useLocale } from '@/contexts/locale-context';
import { brand, colors } from '@/constants/colors';

export function LocaleGate({ children }: { children: ReactNode }) {
  const { isReady, hasChosenLocale } = useLocale();
  const segments = useSegments();
  const router = useRouter();
  const onChooseLanguage = segments[0] === 'choose-language';

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!hasChosenLocale && !onChooseLanguage) {
      router.replace('/choose-language');
    }
  }, [isReady, hasChosenLocale, onChooseLanguage, router]);

  if (!isReady || (!hasChosenLocale && !onChooseLanguage)) {
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
