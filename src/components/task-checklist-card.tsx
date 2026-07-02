import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { useTranslation } from '@/contexts/locale-context';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import type { ChecklistItem } from '@/types/aidey-response';

type TaskChecklistCardProps = {
  items: ChecklistItem[];
  onToggleItem?: (itemId: string, done: boolean) => void;
};

export function TaskChecklistCard({ items, onToggleItem }: TaskChecklistCardProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  const doneCount = items.filter((item) => item.done).length;
  const progress = items.length > 0 ? doneCount / items.length : 0;
  const currentItem = items.find((item) => !item.done) ?? items[items.length - 1];

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.headerRow, pressed && styles.headerRowPressed]}
        accessibilityRole="button"
        accessibilityLabel={expanded ? t('ai.collapseChecklist') : t('ai.expandChecklist')}
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((current) => !current)}>
        <Text style={styles.title}>{t('ai.taskProgress')}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.progressLabel}>
            {t('ai.progressDone', { done: doneCount, total: items.length })}
          </Text>
          <SymbolView
            name={{
              ios: expanded ? 'chevron.up' : 'chevron.down',
              android: expanded ? 'expand_less' : 'expand_more',
              web: expanded ? 'expand_less' : 'expand_more',
            }}
            size={16}
            tintColor={colors.secondary}
          />
        </View>
      </Pressable>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>

      {expanded ? (
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
      ) : currentItem ? (
        <View style={styles.currentItemRow}>
          <SymbolView
            name={{
              ios: currentItem.done ? 'checkmark.circle.fill' : 'circle',
              android: currentItem.done ? 'check_circle' : 'radio_button_unchecked',
              web: currentItem.done ? 'check_circle' : 'radio_button_unchecked',
            }}
            size={18}
            tintColor={currentItem.done ? brand.teal : colors.secondaryPlaceholder}
          />
          <Text style={styles.currentItemLabel} numberOfLines={1}>
            {currentItem.label}
          </Text>
        </View>
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
  headerRowPressed: {
    opacity: 0.7,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  currentItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currentItemLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: brand.navy,
  },
});
