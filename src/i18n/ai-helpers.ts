import type { AideyReply, ChecklistItem, Suggestion } from '@/types/aidey-response';

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export function getWelcomeSuggestions(t: TranslateFn): Suggestion[] {
  return [
    {
      label: t('ai.welcomeSuggestions.philId.label'),
      value: t('ai.welcomeSuggestions.philId.value'),
    },
    {
      label: t('ai.welcomeSuggestions.requirements.label'),
      value: t('ai.welcomeSuggestions.requirements.value'),
    },
    {
      label: t('ai.welcomeSuggestions.findOffice.label'),
      value: t('ai.welcomeSuggestions.findOffice.value'),
    },
  ];
}

export function getFallbackSuggestions(t: TranslateFn): Suggestion[] {
  return [
    { label: t('ai.fallbackSuggestions.yes.label'), value: t('ai.fallbackSuggestions.yes.value') },
    { label: t('ai.fallbackSuggestions.no.label'), value: t('ai.fallbackSuggestions.no.value') },
    { label: t('ai.fallbackSuggestions.how.label'), value: t('ai.fallbackSuggestions.how.value') },
  ];
}

export function createLocalizedChecklist(
  t: TranslateFn,
  documentLabel?: string,
): ChecklistItem[] {
  const suffix = documentLabel
    ? t('ai.checklist.suffix', { label: documentLabel })
    : '';

  return [
    {
      id: 'gather-documents',
      label: t('ai.checklist.gather', { suffix }),
      done: false,
    },
    { id: 'go-to-office', label: t('ai.checklist.goToOffice'), done: false },
    { id: 'talk-to-staff', label: t('ai.checklist.talkToStaff'), done: false },
    { id: 'complete-application', label: t('ai.checklist.complete'), done: false },
  ];
}

export function getDocumentHelpPrompt(t: TranslateFn, label: string): string {
  return t('documents.helpPrompt', { label });
}

export function getDefaultChatTitle(t: TranslateFn): string {
  return t('ai.defaultSessionTitle');
}

export function createLocalizedFallbackReply(t: TranslateFn, text: string): AideyReply {
  return {
    message: text,
    suggestions: getFallbackSuggestions(t),
  };
}
