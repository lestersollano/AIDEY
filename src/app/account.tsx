import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/text';
import { useAuth } from '@/contexts/auth-context';
import { useTranslation } from '@/contexts/locale-context';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

export default function AccountScreen() {
  const { user, isLoading, isConfigured } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/sign-in');
    }
  }, [isLoading, user]);

  if (isLoading || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title={<Text style={styles.headerTitle}>{t('settings.account')}</Text>} />
        <View style={styles.loadingState}>
          <ActivityIndicator color={brand.navy} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={<Text style={styles.headerTitle}>{t('settings.account')}</Text>} />

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>{t('common.name')}</Text>
            <Text style={styles.value}>{user.displayName || t('auth.noName')}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.field}>
            <Text style={styles.label}>{t('common.email')}</Text>
            <Text style={styles.value}>{user.email || t('auth.noEmail')}</Text>
          </View>

          {!isConfigured ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.noticeText}>{t('auth.firebaseIncomplete')}</Text>
            </>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: brand.navy,
    textAlign: 'center',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 24,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    backgroundColor: colors.primary,
    overflow: 'hidden',
    shadowColor: brand.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  field: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: brand.navy,
  },
  divider: {
    height: 1,
    backgroundColor: colors.secondaryBorder,
    marginHorizontal: 16,
  },
  noticeText: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    fontSize: 14,
    lineHeight: 20,
    color: colors.secondary,
  },
});
