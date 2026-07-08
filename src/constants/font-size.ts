export const FONT_SIZE_LEVELS = [
  { id: 'small', scale: 0.85 },
  { id: 'default', scale: 1 },
  { id: 'large', scale: 1.15 },
  { id: 'extraLarge', scale: 1.3 },
] as const;

export type FontSizeLevelId = (typeof FONT_SIZE_LEVELS)[number]['id'];

export const DEFAULT_FONT_SIZE_LEVEL: FontSizeLevelId = 'default';

export function getFontSizeLevel(id: FontSizeLevelId) {
  return FONT_SIZE_LEVELS.find((level) => level.id === id) ?? FONT_SIZE_LEVELS[1];
}

export function getFontSizeScale(id: FontSizeLevelId): number {
  return getFontSizeLevel(id).scale;
}

export function getFontSizeLevelIndex(id: FontSizeLevelId): number {
  const index = FONT_SIZE_LEVELS.findIndex((level) => level.id === id);
  return index === -1 ? 1 : index;
}
