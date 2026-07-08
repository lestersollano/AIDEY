export type DocumentCategory = 'id' | 'document';

export const DOCUMENTS = [
  { id: 'afp-military-id', label: 'AFP Beneficiary ID / Military ID', category: 'id' },
  { id: 'drivers-license', label: "Driver's License", category: 'id' },
  { id: 'gocc-id', label: 'Government Office / GOCC ID', category: 'id' },
  {
    id: 'gsis-e-card',
    label: 'Government Service Insurance System (GSIS) e-Card',
    category: 'id',
  },
  { id: 'ibp-id', label: 'Integrated Bar of the Philippines (IBP) ID', category: 'id' },
  { id: 'owwa-id', label: 'OWWA ID / OFW e-Card', category: 'id' },
  { id: 'pag-ibig-id', label: 'Pag-IBIG Loyalty Card / ID', category: 'id' },
  { id: '4ps-id', label: 'Pantawid Pamilyang Pilipino Program (4Ps) ID', category: 'id' },
  { id: 'pwd-id', label: 'Persons with Disability (PWD) ID', category: 'id' },
  { id: 'philhealth-id', label: 'PhilHealth ID', category: 'id' },
  { id: 'national-id', label: 'PhilID / National ID / ePhilID', category: 'id' },
  { id: 'philippine-passport', label: 'Philippine Passport', category: 'id' },
  { id: 'postal-id', label: 'Postal ID', category: 'id' },
  { id: 'prc-id', label: 'Professional Regulation Commission (PRC) ID', category: 'id' },
  { id: 'pvao-id', label: 'PVAO ID', category: 'id' },
  { id: 'seamans-book', label: "Seaman's Book (SIRB) / MARINA ID", category: 'id' },
  { id: 'senior-citizen-id', label: 'Senior Citizen ID', category: 'id' },
  { id: 'sss-id', label: 'Social Security System (SSS) ID', category: 'id' },
  { id: 'solo-parent-id', label: 'Solo Parent ID', category: 'id' },
  { id: 'tin-id', label: 'Tax Identification Number (TIN) ID', category: 'id' },
  { id: 'umid', label: 'Unified Multi-Purpose ID (UMID)', category: 'id' },
  { id: 'voters-id', label: "Voter's ID / Voter's Certification", category: 'id' },

  {
    id: 'acr-icr',
    label: 'Alien Certificate of Registration (ACR) / Immigrant Certificate of Registration (ICR)',
    category: 'document',
  },
  { id: 'barangay-id', label: 'Barangay ID / Barangay Clearance', category: 'document' },
  { id: 'cedula', label: 'Community Tax Certificate (Cedula)', category: 'document' },
  { id: 'firearms-license', label: 'Firearms License', category: 'document' },
  { id: 'nbi-clearance', label: 'NBI Clearance', category: 'document' },
  { id: 'police-clearance', label: 'Police Clearance', category: 'document' },
  { id: 'psa-birth-certificate', label: 'PSA Birth Certificate', category: 'document' },
  {
    id: 'psa-marriage-death-certificate',
    label: 'PSA Marriage Certificate / Death Certificate',
    category: 'document',
  },
] as const;

export type DocumentId = (typeof DOCUMENTS)[number]['id'];

export function getDocumentById(id: string) {
  return DOCUMENTS.find((document) => document.id === id);
}

export function getDocumentHelpPrompt(label: string) {
  return `Wala pa akong ${label}. Paano ako makakakuha nito at ano ang mga kinakailangan?`;
}
