import type { ReactNode } from 'react';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTranslation } from '@/contexts/locale-context';
import { colors } from '@/constants/colors';

const HEADER_SIDE_WIDTH = 40;

type ScreenHeaderProps = {
  title: ReactNode;
  right?: ReactNode;
};

export function ScreenHeader({ title, right }: ScreenHeaderProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.header}>
      <View style={styles.side}>
        <Pressable
          style={styles.backButton}
          accessibilityLabel={t('common.back')}
          onPress={() => router.back()}>
          <SymbolView
            name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
            size={24}
            tintColor={colors.secondary}
          />
        </Pressable>
      </View>
      <View style={styles.titleWrapper}>{title}</View>
      <View style={styles.side}>{right}</View>
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
  titleWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
