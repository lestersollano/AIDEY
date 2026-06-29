export const fonts = {
  extraLight: 'Nunito_200ExtraLight',
  light: 'Nunito_300Light',
  regular: 'Nunito_400Regular',
  medium: 'Nunito_500Medium',
  semiBold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extraBold: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
  default: 'Nunito_700Bold',
  fredoka: 'Fredoka_700Bold',
} as const;

export type FontFamily = (typeof fonts)[keyof typeof fonts];
