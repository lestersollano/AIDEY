import { getCachedLocale } from '@/contexts/locale-context';
import { translate } from '@/i18n';
import type { AppLocale } from '@/i18n/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

export type SpeechLanguage = 'fil-PH' | 'en-US';

export const SPEECH_LANGUAGE_LABELS: Record<SpeechLanguage, string> = {
  'fil-PH': 'FIL',
  'en-US': 'ENG',
};

const LANGUAGE_STORAGE_KEY = 'aidey.speechRecognitionLanguage';
const DEFAULT_LANGUAGE: SpeechLanguage = 'fil-PH';

let cachedLanguage: SpeechLanguage | null = null;
const languageListeners = new Set<(language: SpeechLanguage) => void>();

function isSpeechLanguage(value: string | null): value is SpeechLanguage {
  return value === 'fil-PH' || value === 'en-US';
}

async function persistLanguage(language: SpeechLanguage) {
  cachedLanguage = language;
  languageListeners.forEach((listener) => listener(language));
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore persistence failures; the in-memory cache still works this session.
  }
}

export function syncSpeechLanguageWithAppLocale(locale: AppLocale) {
  void persistLanguage(locale);
}

type UseSpeechToTextOptions = {
  onResult: (transcript: string) => void;
  onError?: (message: string) => void;
};

export function useSpeechToText({ onResult, onError }: UseSpeechToTextOptions) {
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguageState] = useState<SpeechLanguage>(
    cachedLanguage ?? DEFAULT_LANGUAGE,
  );
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  onResultRef.current = onResult;
  onErrorRef.current = onError;

  useEffect(() => {
    const listener = (next: SpeechLanguage) => setLanguageState(next);
    languageListeners.add(listener);

    if (cachedLanguage === null) {
      AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((stored) => {
        if (isSpeechLanguage(stored)) {
          cachedLanguage = stored;
          listener(stored);
        } else {
          cachedLanguage = DEFAULT_LANGUAGE;
        }
      });
    }

    return () => {
      languageListeners.delete(listener);
    };
  }, []);

  useSpeechRecognitionEvent('start', () => setIsListening(true));
  useSpeechRecognitionEvent('end', () => setIsListening(false));

  useSpeechRecognitionEvent('result', (event) => {
    if (!event.results[0]?.transcript || !event.isFinal) return;
    onResultRef.current(event.results[0].transcript.trim());
  });

  useSpeechRecognitionEvent('error', (event) => {
    setIsListening(false);

    if (event.error === 'aborted' || event.error === 'no-speech') {
      return;
    }

    const locale = getCachedLocale();

    if (event.error === 'not-allowed') {
      onErrorRef.current?.(translate(locale, 'speech.micPermission'));
      return;
    }

    onErrorRef.current?.(translate(locale, 'speech.processError'));
  });

  const setLanguage = useCallback((next: SpeechLanguage) => {
    void persistLanguage(next);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'fil-PH' ? 'en-US' : 'fil-PH');
  }, [language, setLanguage]);

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const start = useCallback(async () => {
    const locale = getCachedLocale();

    try {
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        onErrorRef.current?.(translate(locale, 'speech.micPermission'));
        return;
      }

      ExpoSpeechRecognitionModule.start({
        lang: language,
        interimResults: false,
        continuous: false,
      });
    } catch {
      onErrorRef.current?.(translate(locale, 'speech.startError'));
    }
  }, [language]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      void start();
    }
  }, [isListening, start, stop]);

  return {
    isListening,
    language,
    languageLabel: SPEECH_LANGUAGE_LABELS[language],
    toggleLanguage,
    toggleListening,
  };
}
