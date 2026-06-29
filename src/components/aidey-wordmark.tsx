import { StyleSheet, View, type StyleProp, type TextStyle } from 'react-native';

import { Text } from '@/components/text';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

const wordmarkColors = {
  ai: '#00166a',
  de: '#005ade',
  y: '#019a8f',
} as const;

const letters = [
  { char: 'A', color: wordmarkColors.ai },
  { char: 'I', color: wordmarkColors.ai },
  { char: 'D', color: wordmarkColors.de },
  { char: 'E', color: wordmarkColors.de },
  { char: 'Y', color: wordmarkColors.y },
] as const;

type AideyWordmarkProps = {
  style?: StyleProp<TextStyle>;
  suffix?: string;
  suffixStyle?: StyleProp<TextStyle>;
};

export function AideyWordmark({ style, suffix, suffixStyle }: AideyWordmarkProps) {
  const flatStyle = StyleSheet.flatten(style);

  return (
    <View
      style={[
        styles.container,
        flatStyle?.flex != null && { flex: flatStyle.flex },
        flatStyle?.textAlign === 'center' && styles.containerCentered,
      ]}>
      {letters.map(({ char, color }) => (
        <Text key={char} style={[styles.letter, { color, fontSize: flatStyle?.fontSize }]}>
          {char}
        </Text>
      ))}
      {suffix ? (
        <Text
          style={[
            styles.letter,
            styles.suffix,
            { fontSize: flatStyle?.fontSize, color: colors.secondary },
            suffixStyle,
          ]}>
          {suffix}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  containerCentered: {
    justifyContent: 'center',
  },
  letter: {
    fontFamily: fonts.fredoka,
  },
  suffix: {
    marginLeft: 2,
  },
});
