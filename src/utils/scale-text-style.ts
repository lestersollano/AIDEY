import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';

export function scaleTextStyle(
  style: StyleProp<TextStyle>,
  scale: number,
): StyleProp<TextStyle> {
  if (!style || scale === 1) {
    return style;
  }

  if (Array.isArray(style)) {
    return style.map((item) => scaleTextStyle(item, scale));
  }

  const flat = StyleSheet.flatten(style);
  if (!flat) {
    return style;
  }

  const scaled: TextStyle = { ...flat };

  if (typeof flat.fontSize === 'number') {
    scaled.fontSize = Math.round(flat.fontSize * scale);
  }

  if (typeof flat.lineHeight === 'number') {
    scaled.lineHeight = Math.round(flat.lineHeight * scale);
  }

  return scaled;
}
