import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import type { Suggestion } from '@/types/aidey-response';

type SuggestedRepliesProps = {
  suggestions: Suggestion[];
  disabled?: boolean;
  onSelect: (suggestion: Suggestion) => void;
};

export function SuggestedReplies({
  suggestions,
  disabled = false,
  onSelect,
}: SuggestedRepliesProps) {
  if (suggestions.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content}>
      {suggestions.map((suggestion, index) => (
        <Pressable
          key={`${suggestion.label}-${index}`}
          style={({ pressed }) => [
            styles.chip,
            disabled && styles.chipDisabled,
            pressed && !disabled && styles.chipPressed,
          ]}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={() => onSelect(suggestion)}>
          <Text style={[styles.chipText, disabled && styles.chipTextDisabled]}>
            {suggestion.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 8,
    paddingHorizontal: 2,
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: brand.teal,
    backgroundColor: 'rgba(1, 154, 143, 0.08)',
    justifyContent: 'center',
  },
  chipDisabled: {
    borderColor: colors.secondaryBorder,
    backgroundColor: colors.secondaryMuted,
    opacity: 0.6,
  },
  chipPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  chipText: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: brand.teal,
  },
  chipTextDisabled: {
    color: colors.secondary,
  },
});
