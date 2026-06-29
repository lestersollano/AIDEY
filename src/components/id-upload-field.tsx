import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

type IdUploadFieldProps = {
  label: string;
  uploadLabel?: string;
  onPress?: () => void;
};

export function IdUploadField({
  label,
  uploadLabel = 'Maglagay ng ID',
  onPress,
}: IdUploadFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.uploadZone} onPress={onPress}>
        <SymbolView
          name={{ ios: 'plus', android: 'add', web: 'add' }}
          size={28}
          tintColor={colors.secondary}
        />
        <Text style={styles.uploadLabel}>{uploadLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.secondary,
  },
  uploadZone: {
    width: '100%',
    aspectRatio: 1.6,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadLabel: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.secondary,
  },
});
