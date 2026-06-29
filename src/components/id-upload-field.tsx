import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

type IdUploadFieldProps = {
  label: string;
  onPress?: () => void;
};

export function IdUploadField({ label, onPress }: IdUploadFieldProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}>
      <View style={styles.icon}>
        <SymbolView
          name={{ ios: 'plus', android: 'add', web: 'add' }}
          size={20}
          tintColor={brand.navy}
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    backgroundColor: colors.primary,
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
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.secondaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: brand.navy,
  },
});
