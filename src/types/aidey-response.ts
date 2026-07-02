export type SuggestionAction = 'reply' | 'share_location' | 'open_maps' | 'save_document';

export type Suggestion = {
  label: string;
  value: string;
  action?: SuggestionAction;
};

export type MapDestination = {
  name: string;
  address?: string;
  query?: string;
  latitude?: number;
  longitude?: number;
};

export type AideyStep = {
  current: number;
  total?: number;
  label?: string;
};

export type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

export type AideyReply = {
  message: string;
  step?: AideyStep;
  suggestions: Suggestion[];
  needsLocation?: boolean;
  mapDestination?: MapDestination;
  checklist?: ChecklistItem[];
};

export const AIDEY_RESPONSE_JSON_SCHEMA = {
  type: 'object',
  required: ['message', 'suggestions'],
  properties: {
    message: {
      type: 'string',
      description: 'One short step or one question only.',
    },
    step: {
      type: 'object',
      properties: {
        current: { type: 'integer' },
        total: { type: 'integer' },
        label: { type: 'string' },
      },
      required: ['current'],
    },
    suggestions: {
      type: 'array',
      minItems: 2,
      maxItems: 5,
      items: {
        type: 'object',
        required: ['label', 'value'],
        properties: {
          label: { type: 'string' },
          value: { type: 'string' },
          action: {
            type: 'string',
            enum: ['reply', 'share_location', 'open_maps', 'save_document'],
          },
        },
      },
    },
    needsLocation: { type: 'boolean' },
    mapDestination: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        address: { type: 'string' },
        query: { type: 'string' },
        latitude: { type: 'number' },
        longitude: { type: 'number' },
      },
      required: ['name'],
    },
    checklist: {
      type: 'array',
      minItems: 2,
      maxItems: 6,
      items: {
        type: 'object',
        required: ['id', 'label', 'done'],
        properties: {
          id: { type: 'string' },
          label: { type: 'string' },
          done: { type: 'boolean' },
        },
      },
    },
  },
} as const;

export const WELCOME_SUGGESTIONS: Suggestion[] = [
  { label: 'Kumuha ng PhilID', value: 'Gusto kong kumuha ng PhilID / National ID.' },
  { label: 'Ano ang kailangan?', value: 'Ano ang mga dokumentong kailangan para sa isang government ID?' },
  { label: 'Hanapin ang opisina', value: 'Tulungan mo akong hanapin ang pinakamalapit na opisina ng gobyerno.' },
];

export const FALLBACK_SUGGESTIONS: Suggestion[] = [
  { label: 'Oo', value: 'Oo' },
  { label: 'Hindi', value: 'Hindi' },
  { label: 'Paano?', value: 'Pakipaliwanag pa.' },
];

export function isValidSuggestion(value: unknown): value is Suggestion {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return typeof item.label === 'string' && typeof item.value === 'string';
}

export function isValidChecklistItem(value: unknown): value is ChecklistItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    item.id.trim().length > 0 &&
    typeof item.label === 'string' &&
    item.label.trim().length > 0 &&
    typeof item.done === 'boolean'
  );
}

const VALID_ACTIONS = new Set<SuggestionAction>([
  'reply',
  'share_location',
  'open_maps',
  'save_document',
]);

export function parseAideyReply(raw: string): AideyReply | null {
  try {
    const parsed = JSON.parse(raw) as Partial<AideyReply>;
    if (!parsed.message || typeof parsed.message !== 'string') return null;
    if (!Array.isArray(parsed.suggestions) || parsed.suggestions.length < 2) return null;
    if (!parsed.suggestions.every(isValidSuggestion)) return null;
    return {
      message: parsed.message.trim(),
      step: parsed.step,
      suggestions: parsed.suggestions.map((suggestion) => ({
        label: suggestion.label.trim(),
        value: suggestion.value.trim(),
        action:
          suggestion.action && VALID_ACTIONS.has(suggestion.action)
            ? suggestion.action
            : 'reply',
      })),
      needsLocation: parsed.needsLocation,
      mapDestination: parsed.mapDestination,
      checklist: Array.isArray(parsed.checklist)
        ? parsed.checklist
            .filter(isValidChecklistItem)
            .map((item) => ({
              id: item.id.trim(),
              label: item.label.trim(),
              done: item.done,
            }))
        : undefined,
    };
  } catch {
    return null;
  }
}

export function createFallbackReply(text: string): AideyReply {
  return {
    message: text,
    suggestions: FALLBACK_SUGGESTIONS,
  };
}

/** A generic end-to-end journey checklist, seeded client-side so it appears
 * reliably instead of depending on the AI to decide to create one. */
export function createDefaultChecklist(documentLabel?: string): ChecklistItem[] {
  const suffix = documentLabel ? ` ng ${documentLabel}` : '';

  return [
    { id: 'gather-documents', label: `Ihanda ang mga kinakailangang dokumento${suffix}`, done: false },
    { id: 'go-to-office', label: 'Pumunta sa opisina', done: false },
    { id: 'talk-to-staff', label: 'Kausapin ang clerk o staff', done: false },
    { id: 'complete-application', label: 'Kumpletuhin ang aplikasyon o tanggapin ang output', done: false },
  ];
}
