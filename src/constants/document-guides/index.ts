import type { DocumentId } from '@/constants/documents';
import type { AppLocale } from '@/i18n/types';

import { DOCUMENT_GUIDES_FIL } from './fil';
import { DOCUMENT_GUIDES_EN } from './en';
import type { DocumentGuide } from './types';

export * from './types';

export function getDocumentGuide(documentId: string, locale: AppLocale = 'fil-PH'): DocumentGuide | undefined {
  const guides = locale === 'en-US' ? DOCUMENT_GUIDES_EN : DOCUMENT_GUIDES_FIL;
  return guides[documentId as DocumentId];
}
