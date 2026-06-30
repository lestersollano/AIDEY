export const DOCUMENTS = [
  // Primary Identification & Travel
  { id: 'national-id', label: 'PhilID / National ID / ePhilID' },
  { id: 'philippine-passport', label: 'Philippine Passport' },
  { id: 'drivers-license', label: "Driver's License" },
  { id: 'umid', label: 'Unified Multi-Purpose ID (UMID)' },
  { id: 'postal-id', label: 'Postal ID' },
  { id: 'voters-id', label: "Voter's ID / Voter's Certification" },

  // Social Security & Welfare
  { id: 'sss-id', label: 'Social Security System (SSS) ID' },
  { id: 'gsis-e-card', label: 'Government Service Insurance System (GSIS) e-Card' },
  { id: 'philhealth-id', label: 'PhilHealth ID' },
  { id: 'pag-ibig-id', label: 'Pag-IBIG Loyalty Card / ID' },
  { id: 'senior-citizen-id', label: 'Senior Citizen ID' },
  { id: 'pwd-id', label: 'Persons with Disability (PWD) ID' },
  { id: 'solo-parent-id', label: 'Solo Parent ID' },
  { id: '4ps-id', label: 'Pantawid Pamilyang Pilipino Program (4Ps) ID' },

  // Professional, Tax, & Employment
  { id: 'prc-id', label: 'Professional Regulation Commission (PRC) ID' },
  { id: 'ibp-id', label: 'Integrated Bar of the Philippines (IBP) ID' },
  { id: 'tin-id', label: 'Tax Identification Number (TIN) ID' },
  { id: 'seamans-book', label: "Seaman's Book (SIRB) / MARINA ID" },
  { id: 'owwa-id', label: 'OWWA ID / OFW e-Card' },
  { id: 'afp-military-id', label: 'AFP Beneficiary ID / Military ID' },
  { id: 'pvao-id', label: 'PVAO ID' },
  { id: 'gocc-id', label: 'Government Office / GOCC ID' },

  // Clearances & Certifications
  { id: 'nbi-clearance', label: 'NBI Clearance' },
  { id: 'police-clearance', label: 'Police Clearance' },
  { id: 'barangay-id', label: 'Barangay ID / Barangay Clearance' },
  { id: 'cedula', label: 'Community Tax Certificate (Cedula)' },
  { id: 'firearms-license', label: 'Firearms License' },

  // Civil Registry & Immigration Documents
  { id: 'psa-birth-certificate', label: 'PSA Birth Certificate' },
  { id: 'psa-marriage-death-certificate', label: 'PSA Marriage Certificate / Death Certificate' },
  {
    id: 'acr-icr',
    label: 'Alien Certificate of Registration (ACR) / Immigrant Certificate of Registration (ICR)',
  },
] as const;

export type DocumentId = (typeof DOCUMENTS)[number]['id'];

export function getDocumentById(id: string) {
  return DOCUMENTS.find((document) => document.id === id);
}

export function getDocumentHelpPrompt(label: string) {
  return `Wala pa akong ${label}. Paano ako makakakuha nito at ano ang mga kinakailangan?`;
}
