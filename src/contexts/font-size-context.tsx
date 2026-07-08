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

import {
  DEFAULT_FONT_SIZE_LEVEL,
  FONT_SIZE_LEVELS,
  getFontSizeScale,
  type FontSizeLevelId,
} from '@/constants/font-size';

const FONT_SIZE_STORAGE_KEY = 'aidey.fontSizeLevel';

type FontSizeContextValue = {
  fontSizeLevel: FontSizeLevelId;
  fontScale: number;
  setFontSizeLevel: (level: FontSizeLevelId) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  canIncrease: boolean;
  canDecrease: boolean;
  isReady: boolean;
};

const FontSizeContext = createContext<FontSizeContextValue | null>(null);

let cachedFontSizeLevel: FontSizeLevelId = DEFAULT_FONT_SIZE_LEVEL;

function isFontSizeLevelId(value: string | null): value is FontSizeLevelId {
  return FONT_SIZE_LEVELS.some((level) => level.id === value);
}

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSizeLevel, setFontSizeLevelState] = useState<FontSizeLevelId>(cachedFontSizeLevel);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(FONT_SIZE_STORAGE_KEY).then((stored) => {
      if (cancelled) return;

      if (isFontSizeLevelId(stored)) {
        cachedFontSizeLevel = stored;
        setFontSizeLevelState(stored);
      }

      setIsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const setFontSizeLevel = useCallback((next: FontSizeLevelId) => {
    cachedFontSizeLevel = next;
    setFontSizeLevelState(next);
    void AsyncStorage.setItem(FONT_SIZE_STORAGE_KEY, next);
  }, []);

  const levelIndex = FONT_SIZE_LEVELS.findIndex((level) => level.id === fontSizeLevel);

  const increaseFontSize = useCallback(() => {
    const next = FONT_SIZE_LEVELS[levelIndex + 1];
    if (next) {
      setFontSizeLevel(next.id);
    }
  }, [levelIndex, setFontSizeLevel]);

  const decreaseFontSize = useCallback(() => {
    const next = FONT_SIZE_LEVELS[levelIndex - 1];
    if (next) {
      setFontSizeLevel(next.id);
    }
  }, [levelIndex, setFontSizeLevel]);

  const value = useMemo(
    () => ({
      fontSizeLevel,
      fontScale: getFontSizeScale(fontSizeLevel),
      setFontSizeLevel,
      increaseFontSize,
      decreaseFontSize,
      canIncrease: levelIndex < FONT_SIZE_LEVELS.length - 1,
      canDecrease: levelIndex > 0,
      isReady,
    }),
    [
      fontSizeLevel,
      setFontSizeLevel,
      increaseFontSize,
      decreaseFontSize,
      levelIndex,
      isReady,
    ],
  );

  return <FontSizeContext.Provider value={value}>{children}</FontSizeContext.Provider>;
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
}

export function useOptionalFontScale(): number {
  const context = useContext(FontSizeContext);
  return context?.fontScale ?? 1;
}
