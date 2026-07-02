import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

type AccordionSectionProps = {
  index: number;
  title: string;
  subtitle?: string;
  locked?: boolean;
  completed?: boolean;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export function AccordionSection({
  index,
  title,
  subtitle,
  locked = false,
  completed = false,
  expanded,
  onToggle,
  children,
}: AccordionSectionProps) {
  const isOpen = expanded && !locked;

  return (
    <View style={[styles.card, completed && styles.cardCompleted]}>
      <Pressable
        style={({ pressed }) => [styles.header, pressed && !locked && styles.headerPressed]}
        disabled={locked}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen, disabled: locked }}
        accessibilityLabel={title}
        onPress={onToggle}>
        <View style={[styles.badge, completed && styles.badgeCompleted, locked && styles.badgeLocked]}>
          {completed ? (
            <SymbolView
              name={{ ios: 'checkmark', android: 'check', web: 'check' }}
              size={16}
              tintColor={colors.primary}
            />
          ) : locked ? (
            <SymbolView
              name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
              size={14}
              tintColor={colors.secondaryPlaceholder}
            />
          ) : (
            <Text style={styles.badgeText}>{index}</Text>
          )}
        </View>

        <View style={styles.headerText}>
          <Text style={[styles.title, locked && styles.titleLocked]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, locked && styles.titleLocked]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {!locked ? (
          <SymbolView
            name={{
              ios: isOpen ? 'chevron.up' : 'chevron.down',
              android: isOpen ? 'expand_less' : 'expand_more',
              web: isOpen ? 'expand_less' : 'expand_more',
            }}
            size={16}
            tintColor={colors.secondary}
          />
        ) : null}
      </Pressable>

      {isOpen ? <View style={styles.content}>{children}</View> : null}
    </View>
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
  cardCompleted: {
    borderColor: 'rgba(1, 154, 143, 0.35)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerPressed: {
    opacity: 0.75,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryMuted,
  },
  badgeCompleted: {
    backgroundColor: brand.teal,
  },
  badgeLocked: {
    backgroundColor: colors.secondaryMuted,
  },
  badgeText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: brand.navy,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: brand.navy,
  },
  titleLocked: {
    color: colors.secondaryPlaceholder,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.secondary,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.secondaryBorder,
    paddingTop: 14,
  },
});
