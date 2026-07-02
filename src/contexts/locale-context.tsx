import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { translate } from '@/i18n';
import type { AppLocale, TranslationParams } from '@/i18n/types';
import { DEFAULT_LOCALE } from '@/i18n/types';
import { syncSpeechLanguageWithAppLocale } from '@/hooks/use-speech-to-text';

const LOCALE_STORAGE_KEY = 'aidey.appLocale';

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: string, params?: TranslationParams) => string;
  isReady: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

let cachedLocale: AppLocale = DEFAULT_LOCALE;

export function getCachedLocale(): AppLocale {
  return cachedLocale;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(cachedLocale);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(LOCALE_STORAGE_KEY).then((stored) => {
      if (cancelled) return;

      if (stored === 'en-US' || stored === 'fil-PH') {
        cachedLocale = stored;
        setLocaleState(stored);
      }

      setIsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback((next: AppLocale) => {
    cachedLocale = next;
    setLocaleState(next);
    syncSpeechLanguageWithAppLocale(next);
    void AsyncStorage.setItem(LOCALE_STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (key: string, params?: TranslationParams) => translate(locale, key, params),
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      isReady,
    }),
    [locale, setLocale, t, isReady],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

export function useTranslation() {
  const { locale, setLocale, t } = useLocale();
  return { locale, setLocale, t };
}
