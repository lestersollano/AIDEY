export const DOCUMENTS = [
  { id: 'national-id', label: 'National ID/Philsys ID' },
  { id: 'senior-citizen-id', label: 'Senior Citizen ID' },
  { id: 'solo-parent-id', label: 'Solo Parent ID' },
  { id: 'pwd-id', label: 'PWD ID' },
] as const;

export type DocumentId = (typeof DOCUMENTS)[number]['id'];

export function getDocumentById(id: string) {
  return DOCUMENTS.find((document) => document.id === id);
}
