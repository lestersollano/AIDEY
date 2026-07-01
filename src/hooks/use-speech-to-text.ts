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

type UseSpeechToTextOptions = {
  /** Called with the final recognized transcript. */
  onResult: (transcript: string) => void;
  /** Called with a user-facing (Filipino) error message. */
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

    if (event.error === 'not-allowed') {
      onErrorRef.current?.(
        'Kailangan ng pahintulot sa microphone para gumana ang speech-to-text.',
      );
      return;
    }

    onErrorRef.current?.('Hindi na-proseso ang boses. Subukan muli.');
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
    try {
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        onErrorRef.current?.(
          'Kailangan ng pahintulot sa microphone para gumana ang speech-to-text.',
        );
        return;
      }

      ExpoSpeechRecognitionModule.start({
        lang: language,
        interimResults: false,
        continuous: false,
      });
    } catch {
      onErrorRef.current?.('Hindi ma-simulan ang speech-to-text. Subukan muli.');
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
