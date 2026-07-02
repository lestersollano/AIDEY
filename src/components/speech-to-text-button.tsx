import { SymbolView } from 'expo-symbols';
import { useRef } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useSpeechToText } from '@/hooks/use-speech-to-text';
import { Text } from '@/components/text';
import { useTranslation } from '@/contexts/locale-context';

type SpeechToTextButtonProps = {
  onTranscript: (transcript: string) => void;
  onError?: (message: string) => void;
  size?: number;
  iconColor: string;
  activeColor?: string;
  style?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

const LONG_PRESS_MS = 400;

export function SpeechToTextButton({
  onTranscript,
  onError,
  size = 22,
  iconColor,
  activeColor = '#E0483E',
  style,
  pressedStyle,
  disabled,
}: SpeechToTextButtonProps) {
  const { t } = useTranslation();
  const { isListening, languageLabel, toggleLanguage, toggleListening } = useSpeechToText({
    onResult: onTranscript,
    onError,
  });
  const longPressTriggeredRef = useRef(false);

  function handlePressIn() {
    longPressTriggeredRef.current = false;
  }

  function handleLongPress() {
    longPressTriggeredRef.current = true;
    toggleLanguage();
  }

  function handlePress() {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }
    toggleListening();
  }

  return (
    <Pressable
      style={({ pressed }) => [style, pressed && pressedStyle]}
      accessibilityLabel={
        isListening
          ? t('speech.stopListening')
          : t('speech.startListening', { language: languageLabel })
      }
      accessibilityHint={t('speech.toggleHint')}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={LONG_PRESS_MS}
      hitSlop={8}>
      <View>
        <SymbolView
          name={{ ios: 'mic.fill', android: 'mic', web: 'mic' }}
          size={size}
          tintColor={isListening ? activeColor : iconColor}
        />
        <View style={[styles.badge, isListening && styles.badgeActive]}>
          <Text style={styles.badgeText}>{languageLabel}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    bottom: -6,
    right: -14,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  badgeActive: {
    backgroundColor: '#E0483E',
  },
  badgeText: {
    fontSize: 8,
    lineHeight: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
