import { DOCUMENTS, type DocumentId } from '@/constants/documents';

export type GovernmentAgency = {
  id: string;
  name: string;
  placeQuery: string;
  aliases: string[];
};

export const GOVERNMENT_AGENCIES: Record<string, GovernmentAgency> = {
  psa: {
    id: 'psa',
    name: 'Philippine Statistics Authority (PSA)',
    placeQuery: 'Philippine Statistics Authority PSA civil registry',
    aliases: ['psa', 'philsys', 'philid', 'national id', 'birth certificate', 'civil registry'],
  },
  dfa: {
    id: 'dfa',
    name: 'Department of Foreign Affairs (DFA)',
    placeQuery: 'DFA passport office Philippines',
    aliases: ['dfa', 'passport', 'foreign affairs'],
  },
  lto: {
    id: 'lto',
    name: 'Land Transportation Office (LTO)',
    placeQuery: 'LTO office Philippines',
    aliases: ['lto', 'drivers license', "driver's license", 'drivers licence'],
  },
  sss: {
    id: 'sss',
    name: 'Social Security System (SSS)',
    placeQuery: 'SSS branch office Philippines',
    aliases: ['sss', 'social security', 'umid'],
  },
  gsis: {
    id: 'gsis',
    name: 'Government Service Insurance System (GSIS)',
    placeQuery: 'GSIS office Philippines',
    aliases: ['gsis'],
  },
  philhealth: {
    id: 'philhealth',
    name: 'PhilHealth',
    placeQuery: 'PhilHealth office Philippines',
    aliases: ['philhealth'],
  },
  pagibig: {
    id: 'pagibig',
    name: 'Pag-IBIG Fund',
    placeQuery: 'Pag-IBIG office Philippines',
    aliases: ['pag-ibig', 'pagibig', 'hdmf'],
  },
  philpost: {
    id: 'philpost',
    name: 'Philippine Postal Corporation',
    placeQuery: 'Philippine Post Office postal ID Philippines',
    aliases: ['postal', 'philpost', 'post office'],
  },
  comelec: {
    id: 'comelec',
    name: 'Commission on Elections (COMELEC)',
    placeQuery: 'COMELEC office Philippines',
    aliases: ['comelec', 'voters', "voter's"],
  },
  prc: {
    id: 'prc',
    name: 'Professional Regulation Commission (PRC)',
    placeQuery: 'PRC office Philippines',
    aliases: ['prc', 'professional regulation'],
  },
  bir: {
    id: 'bir',
    name: 'Bureau of Internal Revenue (BIR)',
    placeQuery: 'BIR office Philippines',
    aliases: ['bir', 'tin', 'tax identification'],
  },
  nbi: {
    id: 'nbi',
    name: 'National Bureau of Investigation (NBI)',
    placeQuery: 'NBI clearance office Philippines',
    aliases: ['nbi'],
  },
  pnp: {
    id: 'pnp',
    name: 'Philippine National Police (PNP)',
    placeQuery: 'PNP police station Philippines',
    aliases: ['police clearance', 'pnp', 'police station'],
  },
  barangay: {
    id: 'barangay',
    name: 'Barangay Hall',
    placeQuery: 'barangay hall Philippines',
    aliases: ['barangay', 'cedula', 'community tax'],
  },
  osca: {
    id: 'osca',
    name: 'Office of Senior Citizens Affairs (OSCA)',
    placeQuery: 'OSCA senior citizen office Philippines',
    aliases: ['senior citizen', 'osca'],
  },
  pwd: {
    id: 'pwd',
    name: 'Persons with Disability Office',
    placeQuery: 'PWD office Philippines',
    aliases: ['pwd', 'disability'],
  },
  marina: {
    id: 'marina',
    name: 'MARINA',
    placeQuery: 'MARINA office Philippines seafarers',
    aliases: ['marina', "seaman's book", 'seafarer'],
  },
  owwa: {
    id: 'owwa',
    name: 'OWWA',
    placeQuery: 'OWWA office Philippines',
    aliases: ['owwa', 'ofw'],
  },
};

const DOCUMENT_AGENCY_IDS: Partial<Record<DocumentId, string>> = {
  'national-id': 'psa',
  'philippine-passport': 'dfa',
  'drivers-license': 'lto',
  umid: 'sss',
  'postal-id': 'philpost',
  'voters-id': 'comelec',
  'sss-id': 'sss',
  'gsis-e-card': 'gsis',
  'philhealth-id': 'philhealth',
  'pag-ibig-id': 'pagibig',
  'senior-citizen-id': 'osca',
  'pwd-id': 'pwd',
  'prc-id': 'prc',
  'tin-id': 'bir',
  'nbi-clearance': 'nbi',
  'police-clearance': 'pnp',
  'barangay-id': 'barangay',
  cedula: 'barangay',
  'psa-birth-certificate': 'psa',
  'psa-marriage-death-certificate': 'psa',
  'seamans-book': 'marina',
  'owwa-id': 'owwa',
};

export function getAgencyForDocumentLabel(label: string): GovernmentAgency | null {
  const document = DOCUMENTS.find(
    (item) => item.label.toLowerCase() === label.toLowerCase(),
  );
  if (!document) return null;

  const agencyId = DOCUMENT_AGENCY_IDS[document.id];
  return agencyId ? (GOVERNMENT_AGENCIES[agencyId] ?? null) : null;
}

export function getAgencyById(id: string): GovernmentAgency | null {
  return GOVERNMENT_AGENCIES[id] ?? null;
}
