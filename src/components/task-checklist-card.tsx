import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import type { ChecklistItem } from '@/types/aidey-response';

type TaskChecklistCardProps = {
  items: ChecklistItem[];
  onToggleItem?: (itemId: string, done: boolean) => void;
};

export function TaskChecklistCard({ items, onToggleItem }: TaskChecklistCardProps) {
  if (items.length === 0) return null;

  const doneCount = items.filter((item) => item.done).length;
  const progress = items.length > 0 ? doneCount / items.length : 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Progreso ng Gawain</Text>
        <Text style={styles.progressLabel}>
          {doneCount}/{items.length} tapos
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>

      <View style={styles.itemsList}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: item.done }}
            accessibilityLabel={item.label}
            disabled={!onToggleItem}
            onPress={() => onToggleItem?.(item.id, !item.done)}>
            <SymbolView
              name={{
                ios: item.done ? 'checkmark.circle.fill' : 'circle',
                android: item.done ? 'check_circle' : 'radio_button_unchecked',
                web: item.done ? 'check_circle' : 'radio_button_unchecked',
              }}
              size={20}
              tintColor={item.done ? brand.teal : colors.secondaryPlaceholder}
            />
            <Text style={[styles.itemLabel, item.done && styles.itemLabelDone]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
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
  container: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    gap: 10,
    ...cardShadow,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: brand.navy,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.secondary,
  },
  progressTrack: {
    height: 6,
    borderRadius: 4,
    backgroundColor: colors.secondaryMuted,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: brand.teal,
  },
  itemsList: {
    gap: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  itemPressed: {
    opacity: 0.7,
  },
  itemLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: brand.navy,
  },
  itemLabelDone: {
    color: colors.secondary,
    textDecorationLine: 'line-through',
  },
});
