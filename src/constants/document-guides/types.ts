import type { DocumentId } from '@/constants/documents';

export type DocumentGuideStep = {
  title: string;
  description: string;
};

/** A requirement that is satisfied automatically once the user already has
 * (has uploaded a photo of) any one of these other catalog documents. */
export type DocumentRequirementDependency = {
  label: string;
  documentIds: DocumentId[];
};

export type DocumentRequirementItem = string | DocumentRequirementDependency;

export type DocumentGuide = {
  requirements: DocumentRequirementItem[];
  steps: DocumentGuideStep[];
  timeline: string;
};

export function isDependencyRequirement(
  item: DocumentRequirementItem,
): item is DocumentRequirementDependency {
  return typeof item !== 'string';
}

export function getRequirementLabel(item: DocumentRequirementItem): string {
  return isDependencyRequirement(item) ? item.label : item;
}

/** Common "any valid government ID" style requirement — satisfied if the
 * user already has any one of these primary IDs saved in Aidey. */
export const PRIMARY_ID_OPTIONS: DocumentId[] = [
  'national-id',
  'philippine-passport',
  'drivers-license',
  'umid',
  'postal-id',
  'voters-id',
  'sss-id',
  'gsis-e-card',
  'philhealth-id',
  'pag-ibig-id',
  'prc-id',
  'senior-citizen-id',
  'pwd-id',
  'tin-id',
];

export function anyValidId(label: string): DocumentRequirementDependency {
  return { label, documentIds: PRIMARY_ID_OPTIONS };
}
