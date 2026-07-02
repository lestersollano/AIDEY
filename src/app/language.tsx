import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/text';
import { useTranslation } from '@/contexts/locale-context';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { APP_LOCALES, LOCALE_LABELS, type AppLocale } from '@/i18n/types';

function LanguageOption({
  locale,
  label,
  selected,
  onSelect,
}: {
  locale: AppLocale;
  label: string;
  selected: boolean;
  onSelect: (locale: AppLocale) => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={() => onSelect(locale)}>
      <Text style={styles.optionLabel}>{label}</Text>
      {selected ? (
        <SymbolView
          name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
          size={22}
          tintColor={brand.teal}
        />
      ) : (
        <SymbolView
          name={{ ios: 'circle', android: 'radio_button_unchecked', web: 'radio_button_unchecked' }}
          size={22}
          tintColor={colors.secondaryPlaceholder}
        />
      )}
    </Pressable>
  );
}

export default function LanguageScreen() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={<Text style={styles.headerTitle}>{t('language.title')}</Text>} />

      <View style={styles.content}>
        <Text style={styles.subtitle}>{t('language.subtitle')}</Text>

        <View style={styles.card}>
          {APP_LOCALES.map((option, index) => (
            <View key={option}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <LanguageOption
                locale={option}
                label={LOCALE_LABELS[option]}
                selected={locale === option}
                onSelect={setLocale}
              />
            </View>
          ))}
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
  content: {
    flex: 1,
    paddingTop: 24,
    gap: 12,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.secondary,
    lineHeight: 20,
    paddingHorizontal: 4,
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
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionPressed: {
    opacity: 0.85,
    backgroundColor: colors.secondaryMuted,
  },
  optionLabel: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: brand.navy,
  },
  divider: {
    height: 1,
    backgroundColor: colors.secondaryBorder,
    marginHorizontal: 16,
  },
});
