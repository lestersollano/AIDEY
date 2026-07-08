import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/text';
import { useFontSize } from '@/contexts/font-size-context';
import { useTranslation } from '@/contexts/locale-context';
import { brand, colors } from '@/constants/colors';
import { FONT_SIZE_LEVELS } from '@/constants/font-size';
import { fonts } from '@/constants/fonts';

export default function FontSizeScreen() {
  const { t } = useTranslation();
  const {
    fontSizeLevel,
    setFontSizeLevel,
    increaseFontSize,
    decreaseFontSize,
    canIncrease,
    canDecrease,
  } = useFontSize();

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={<Text style={styles.headerTitle}>{t('fontSize.title')}</Text>} />

      <View style={styles.content}>
        <Text style={styles.subtitle}>{t('fontSize.subtitle')}</Text>

        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>{t('fontSize.previewLabel')}</Text>
          <Text style={styles.previewText}>{t('fontSize.previewText')}</Text>
        </View>

        <View style={styles.controlsCard}>
          <Pressable
            style={({ pressed }) => [
              styles.stepButton,
              !canDecrease && styles.stepButtonDisabled,
              pressed && canDecrease && styles.stepButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('fontSize.decrease')}
            disabled={!canDecrease}
            onPress={decreaseFontSize}>
            <SymbolView
              name={{ ios: 'minus', android: 'remove', web: 'remove' }}
              size={22}
              tintColor={canDecrease ? brand.navy : colors.secondaryPlaceholder}
            />
          </Pressable>

          <View style={styles.levelDisplay}>
            <Text style={styles.levelLabel}>{t(`fontSize.level.${fontSizeLevel}`)}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.stepButton,
              !canIncrease && styles.stepButtonDisabled,
              pressed && canIncrease && styles.stepButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('fontSize.increase')}
            disabled={!canIncrease}
            onPress={increaseFontSize}>
            <SymbolView
              name={{ ios: 'plus', android: 'add', web: 'add' }}
              size={22}
              tintColor={canIncrease ? brand.navy : colors.secondaryPlaceholder}
            />
          </Pressable>
        </View>

        <View style={styles.optionsCard}>
          {FONT_SIZE_LEVELS.map((level, index) => (
            <View key={level.id}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <Pressable
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                accessibilityRole="radio"
                accessibilityState={{ selected: fontSizeLevel === level.id }}
                accessibilityLabel={t(`fontSize.level.${level.id}`)}
                onPress={() => setFontSizeLevel(level.id)}>
                <Text style={styles.optionLabel}>{t(`fontSize.level.${level.id}`)}</Text>
                {fontSizeLevel === level.id ? (
                  <SymbolView
                    name={{
                      ios: 'checkmark.circle.fill',
                      android: 'check_circle',
                      web: 'check_circle',
                    }}
                    size={22}
                    tintColor={brand.teal}
                  />
                ) : (
                  <SymbolView
                    name={{
                      ios: 'circle',
                      android: 'radio_button_unchecked',
                      web: 'radio_button_unchecked',
                    }}
                    size={22}
                    tintColor={colors.secondaryPlaceholder}
                  />
                )}
              </Pressable>
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
    gap: 16,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.secondary,
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  previewCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    backgroundColor: colors.secondaryMuted,
    padding: 20,
    gap: 10,
  },
  previewLabel: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  previewText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.regular,
    color: brand.navy,
  },
  controlsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: brand.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  stepButtonPressed: {
    opacity: 0.85,
    backgroundColor: colors.secondaryMuted,
  },
  stepButtonDisabled: {
    opacity: 0.5,
  },
  levelDisplay: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  levelLabel: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: brand.navy,
    textAlign: 'center',
  },
  optionsCard: {
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
