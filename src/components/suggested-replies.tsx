import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import type { Suggestion } from '@/types/aidey-response';

type SuggestedRepliesProps = {
  suggestions: Suggestion[];
  disabled?: boolean;
  align?: 'start' | 'center';
  onSelect: (suggestion: Suggestion) => void;
};

export function SuggestedReplies({
  suggestions,
  disabled = false,
  align = 'start',
  onSelect,
}: SuggestedRepliesProps) {
  if (suggestions.length === 0) return null;

  return (
    <View style={[styles.content, align === 'center' && styles.contentCentered]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  contentCentered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
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
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: brand.teal,
    textAlign: 'center',
  },
  chipTextDisabled: {
    color: colors.secondary,
  },
});
