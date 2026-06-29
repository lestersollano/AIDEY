import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { colors } from '@/constants/colors';

const HEADER_SIDE_WIDTH = 40;

type ScreenHeaderProps = {
  title: string;
};

export function ScreenHeader({ title }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.side}>
        <Pressable
          style={styles.backButton}
          accessibilityLabel="Back"
          onPress={() => router.back()}>
          <SymbolView
            name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
            size={24}
            tintColor={colors.secondary}
          />
        </Pressable>
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: {
    width: HEADER_SIDE_WIDTH,
    height: HEADER_SIDE_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: HEADER_SIDE_WIDTH,
    height: HEADER_SIDE_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 17,
    textAlign: 'center',
    color: colors.secondary,
  },
});
