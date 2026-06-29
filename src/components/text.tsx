import { Text as RNText, TextInput as RNTextInput, StyleSheet } from 'react-native';
import type { TextInputProps, TextProps } from 'react-native';

import { fonts } from '@/constants/fonts';

export function Text({ style, ...props }: TextProps) {
  return <RNText style={[styles.text, style]} {...props} />;
}

export function TextInput({ style, ...props }: TextInputProps) {
  return <RNTextInput style={[styles.text, style]} {...props} />;
}

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.default,
  },
});
