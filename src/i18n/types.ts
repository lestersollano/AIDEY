export type AppLocale = 'fil-PH' | 'en-US';

export const APP_LOCALES: AppLocale[] = ['en-US', 'fil-PH'];

export const LOCALE_LABELS: Record<AppLocale, string> = {
  'en-US': 'English (US)',
  'fil-PH': 'Filipino',
};

export const DEFAULT_LOCALE: AppLocale = 'fil-PH';

export type TranslationParams = Record<string, string | number>;

export type TranslationTree = {
  [key: string]: string | TranslationTree;
};
