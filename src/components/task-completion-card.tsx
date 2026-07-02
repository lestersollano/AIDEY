import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { useTranslation } from '@/contexts/locale-context';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

type TaskCompletionCardProps = {
  documentLabel?: string;
  isFinished: boolean;
  onFinish: () => void;
  onAddToGallery: () => void;
};

export function TaskCompletionCard({
  documentLabel,
  isFinished,
  onFinish,
  onAddToGallery,
}: TaskCompletionCardProps) {
  const { t } = useTranslation();

  if (!isFinished) {
    return (
      <Pressable
        style={({ pressed }) => [styles.finishButton, pressed && styles.finishButtonPressed]}
        accessibilityRole="button"
        accessibilityLabel={t('ai.finishTask')}
        onPress={onFinish}>
        <SymbolView
          name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
          size={18}
          tintColor={colors.primary}
        />
        <Text style={styles.finishButtonText}>{t('ai.finishTask')}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.doneCard}>
      <View style={styles.doneHeader}>
        <SymbolView
          name={{ ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' }}
          size={20}
          tintColor={brand.teal}
        />
        <Text style={styles.doneText}>{t('ai.taskDone')}</Text>
      </View>

      {documentLabel ? (
        <Pressable
          style={({ pressed }) => [
            styles.galleryButton,
            pressed && styles.galleryButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('ai.addToGalleryA11y', { label: documentLabel })}
          onPress={onAddToGallery}>
          <View style={styles.galleryIcon}>
            <SymbolView
              name={{
                ios: 'photo.on.rectangle.angled',
                android: 'photo_library',
                web: 'photo_library',
              }}
              size={20}
              tintColor={brand.navy}
            />
          </View>
          <View style={styles.galleryTextWrapper}>
            <Text style={styles.galleryLabel}>{t('ai.addToGallery')}</Text>
            <Text style={styles.galleryHint} numberOfLines={1}>
              {documentLabel}
            </Text>
          </View>
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>{t('ai.comingSoon')}</Text>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

const cardShadow = {
  shadowColor: brand.navy,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
} as const;

const styles = StyleSheet.create({
  finishButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: brand.teal,
    ...cardShadow,
  },
  finishButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  finishButtonText: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  doneCard: {
    marginTop: 12,
    gap: 10,
  },
  doneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  doneText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: brand.navy,
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    backgroundColor: colors.primary,
    ...cardShadow,
  },
  galleryButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  galleryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.secondaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryTextWrapper: {
    flex: 1,
    gap: 2,
  },
  galleryLabel: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: brand.navy,
  },
  galleryHint: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.secondary,
  },
  comingSoonBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: colors.secondaryMuted,
  },
  comingSoonText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
});
