import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AideyWordmark } from '@/components/aidey-wordmark';
import { Text } from '@/components/text';
import { useTranslation } from '@/contexts/locale-context';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { APP_LOCALES, LOCALE_LABELS, type AppLocale } from '@/i18n/types';

function LanguageChoice({
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
      style={({ pressed }) => [
        styles.option,
        selected && styles.optionSelected,
        pressed && styles.optionPressed,
      ]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={() => onSelect(locale)}>
      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{label}</Text>
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

export default function ChooseLanguageScreen() {
  const { setLocale } = useTranslation();
  const [selectedLocale, setSelectedLocale] = useState<AppLocale | null>(null);

  function handleContinue() {
    if (!selectedLocale) {
      return;
    }

    setLocale(selectedLocale);
    router.replace('/sign-in');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <AideyWordmark style={styles.wordmark} />
          <Text style={styles.titleFil}>Piliin ang wika</Text>
          <Text style={styles.titleEn}>Choose your language</Text>
          <Text style={styles.subtitleFil}>
            Piliin ang wikang gusto mong gamitin sa Aidey.
          </Text>
          <Text style={styles.subtitleEn}>
            Select the language you want to use in Aidey.
          </Text>
        </View>

        <Image
          source={require('@/assets/images/mascot/cropped/mainmenu.png')}
          style={styles.mascot}
          contentFit="contain"
        />

        <View style={styles.card}>
          {APP_LOCALES.map((option, index) => (
            <View key={option}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <LanguageChoice
                locale={option}
                label={LOCALE_LABELS[option]}
                selected={selectedLocale === option}
                onSelect={setSelectedLocale}
              />
            </View>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            !selectedLocale && styles.buttonDisabled,
            pressed && selectedLocale && styles.buttonPressed,
          ]}
          disabled={!selectedLocale}
          accessibilityRole="button"
          accessibilityLabel="Magpatuloy / Continue"
          onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Magpatuloy / Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 24,
  },
  hero: {
    alignItems: 'center',
    gap: 6,
  },
  wordmark: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 4,
  },
  titleFil: {
    fontSize: 22,
    fontFamily: fonts.semiBold,
    color: brand.navy,
    textAlign: 'center',
  },
  titleEn: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: brand.navy,
    textAlign: 'center',
    opacity: 0.85,
  },
  subtitleFil: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.secondary,
    textAlign: 'center',
    paddingHorizontal: 8,
    marginTop: 4,
  },
  subtitleEn: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.secondary,
    textAlign: 'center',
    paddingHorizontal: 8,
    opacity: 0.85,
  },
  mascot: {
    width: '100%',
    height: 140,
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
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  optionSelected: {
    backgroundColor: 'rgba(1, 154, 143, 0.08)',
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
  optionLabelSelected: {
    color: brand.teal,
  },
  divider: {
    height: 1,
    backgroundColor: colors.secondaryBorder,
    marginHorizontal: 16,
  },
  continueButton: {
    borderRadius: 14,
    backgroundColor: brand.navy,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  continueButtonText: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.85,
  },
});
