import { useMemo } from 'react';
import { Text as RNText, TextInput as RNTextInput, StyleSheet } from 'react-native';
import type { TextInputProps, TextProps } from 'react-native';

import { useOptionalFontScale } from '@/contexts/font-size-context';
import { fonts } from '@/constants/fonts';
import { scaleTextStyle } from '@/utils/scale-text-style';

export function Text({ style, ...props }: TextProps) {
  const fontScale = useOptionalFontScale();
  const scaledStyle = useMemo(() => scaleTextStyle(style, fontScale), [style, fontScale]);

  return <RNText style={[styles.text, scaledStyle]} {...props} />;
}

export function TextInput({ style, ...props }: TextInputProps) {
  const fontScale = useOptionalFontScale();
  const scaledStyle = useMemo(() => scaleTextStyle(style, fontScale), [style, fontScale]);

  return <RNTextInput style={[styles.text, scaledStyle]} {...props} />;
}

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.default,
  },
});
