import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/text';
import { useAuth } from '@/contexts/auth-context';
import { useTranslation } from '@/contexts/locale-context';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { LOCALE_LABELS } from '@/i18n/types';

type SymbolViewName = ComponentProps<typeof SymbolView>['name'];
type PlatformSymbolName = Extract<SymbolViewName, { ios?: unknown }>;

type SettingsOption = {
  id: string;
  label: string;
  subtitle?: string;
  icon: PlatformSymbolName;
};

function SettingsRow({
  option,
  onPress,
}: {
  option: SettingsOption;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      accessibilityLabel={option.label}
      onPress={onPress}>
      <View style={styles.rowIcon}>
        <SymbolView name={option.icon} size={20} tintColor={brand.navy} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{option.label}</Text>
        {option.subtitle ? <Text style={styles.rowSubtitle}>{option.subtitle}</Text> : null}
      </View>
      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        size={16}
        tintColor={colors.secondaryPlaceholder}
      />
    </Pressable>
  );
}

function SettingsSection({
  title,
  options,
  onOptionPress,
}: {
  title: string;
  options: SettingsOption[];
  onOptionPress?: (option: SettingsOption) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {options.map((option, index) => (
          <View key={option.id}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <SettingsRow
              option={option}
              onPress={onOptionPress ? () => onOptionPress(option) : undefined}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { user } = useAuth();
  const { locale, t } = useTranslation();

  const generalOptions: SettingsOption[] = [
    {
      id: 'account',
      label: t('settings.account'),
      icon: { ios: 'person.circle', android: 'person', web: 'person' },
    },
    {
      id: 'notifications',
      label: t('settings.notifications'),
      icon: { ios: 'bell', android: 'notifications', web: 'notifications' },
    },
    {
      id: 'language',
      label: t('settings.language'),
      subtitle: LOCALE_LABELS[locale],
      icon: { ios: 'globe', android: 'language', web: 'language' },
    },
  ];

  const supportOptions: SettingsOption[] = [
    {
      id: 'help',
      label: t('settings.help'),
      icon: { ios: 'questionmark.circle', android: 'help', web: 'help' },
    },
    {
      id: 'privacy',
      label: t('settings.privacyPolicy'),
      icon: { ios: 'hand.raised', android: 'privacy_tip', web: 'privacy_tip' },
    },
    {
      id: 'about',
      label: t('settings.about'),
      icon: { ios: 'info.circle', android: 'info', web: 'info' },
    },
  ];

  const generalOptionsWithAccount: SettingsOption[] = generalOptions.map((option) =>
    option.id === 'account'
      ? {
          ...option,
          subtitle: user?.email ?? t('common.signIn'),
        }
      : option,
  );

  function handleOptionPress(option: SettingsOption) {
    if (option.id === 'account') {
      router.push('/account');
    } else if (option.id === 'language') {
      router.push('/language');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={<Text style={styles.headerTitle}>{t('settings.title')}</Text>}
      />

      <View style={styles.scrollContainer}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <SettingsSection
            title={t('settings.general')}
            options={generalOptionsWithAccount}
            onOptionPress={handleOptionPress}
          />
          <SettingsSection title={t('settings.support')} options={supportOptions} />
        </ScrollView>
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
  scrollContainer: {
    flex: 1,
    marginHorizontal: -24,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    gap: 24,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },
  sectionCard: {
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowPressed: {
    opacity: 0.85,
    backgroundColor: colors.secondaryMuted,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.secondaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: brand.navy,
  },
  rowSubtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.secondaryBorder,
    marginHorizontal: 16,
  },
});
