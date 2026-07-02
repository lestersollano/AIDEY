import { enUS } from '@/i18n/translations/en-US';
import { filPH } from '@/i18n/translations/fil-PH';
import type { AppLocale, TranslationParams, TranslationTree } from '@/i18n/types';

const translations: Record<AppLocale, TranslationTree> = {
  'en-US': enUS,
  'fil-PH': filPH,
};

function getNestedValue(tree: TranslationTree, key: string): string | undefined {
  const parts = key.split('.');
  let current: string | TranslationTree = tree;

  for (const part of parts) {
    if (typeof current !== 'object' || current === null || !(part in current)) {
      return undefined;
    }
    current = current[part];
  }

  return typeof current === 'string' ? current : undefined;
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;

  return template.replace(/\{\{(\w+)\}\}/g, (_, token: string) =>
    token in params ? String(params[token]) : `{{${token}}}`,
  );
}

export function translate(
  locale: AppLocale,
  key: string,
  params?: TranslationParams,
): string {
  const value =
    getNestedValue(translations[locale], key) ??
    getNestedValue(translations['fil-PH'], key) ??
    key;

  return interpolate(value, params);
}

export { translations };
