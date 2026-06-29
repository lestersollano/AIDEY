import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/text';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

function pressableStyle(baseStyle: object, pressedStyle: object) {
  return ({ pressed }: { pressed: boolean }) => [baseStyle, pressed && pressedStyle];
}

type DocumentDetailScreenProps = {
  title: string;
  children?: ReactNode;
};

export function DocumentDetailScreen({ title, children }: DocumentDetailScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={<Text style={styles.headerTitle}>{title}</Text>}
      />
      <View style={styles.content}>
        <View style={styles.actions}>
          <Pressable
            style={pressableStyle(styles.actionButton, styles.actionButtonPressed)}
            accessibilityRole="button">
            <Text style={styles.actionButtonText}>WALA pa akong {title}</Text>
          </Pressable>
          <Pressable
            style={pressableStyle(styles.actionButton, styles.actionButtonPressed)}
            accessibilityRole="button">
            <Text style={styles.actionButtonText}>MERON na akong {title}</Text>
          </Pressable>
        </View>
        {children}
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
    marginTop: 16,
  },
  actions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  actionButton: {
    width: '100%',
    maxWidth: 320,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    backgroundColor: colors.primary,
    alignItems: 'center',
    shadowColor: brand.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: brand.navy,
    textAlign: 'center',
  },
});
