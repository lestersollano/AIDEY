import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

type IdUploadFieldProps = {
  label: string;
  imageUri?: string;
  imageCount?: number;
  onPress?: () => void;
};

export function IdUploadField({ label, imageUri, imageCount = 0, onPress }: IdUploadFieldProps) {
  const isFilled = Boolean(imageUri);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}>
      <View style={styles.row}>
        <View style={[styles.icon, isFilled && styles.iconFilled]}>
          <SymbolView
            name={
              isFilled
                ? { ios: 'checkmark', android: 'check', web: 'check' }
                : { ios: 'plus', android: 'add', web: 'add' }
            }
            size={20}
            tintColor={isFilled ? colors.primary : brand.navy}
          />
        </View>
        <View style={styles.textWrapper}>
          <Text style={styles.label}>{label}</Text>
        </View>
        <SymbolView
          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          size={16}
          tintColor={colors.secondaryPlaceholder}
        />
      </View>
      {imageUri ? (
        <View style={styles.previewWrapper}>
          <Image source={{ uri: imageUri }} style={styles.preview} contentFit="cover" />
          {imageCount > 1 ? (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>+{imageCount - 1}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.secondaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconFilled: {
    backgroundColor: '#1fa855',
  },
  textWrapper: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: brand.navy,
  },
  previewWrapper: {
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: 140,
    backgroundColor: colors.secondaryMuted,
  },
  countBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 22, 106, 0.75)',
  },
  countBadgeText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
});
