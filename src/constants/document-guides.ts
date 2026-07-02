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
const PRIMARY_ID_OPTIONS: DocumentId[] = [
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

function anyValidId(label: string): DocumentRequirementDependency {
  return { label, documentIds: PRIMARY_ID_OPTIONS };
}

// Sourced and summarized from assets/GLAK.md (Prerequisites / The Process /
// Estimated Timelines sections for each document).
export const DOCUMENT_GUIDES: Record<DocumentId, DocumentGuide> = {
  'national-id': {
    requirements: [
      {
        label:
          "Isang (1) orihinal na Primary Document: PSA Birth Certificate (may kasamang 1 gov't ID), Passport, UMID, o Driver's License/Student Permit",
        documentIds: ['psa-birth-certificate', 'philippine-passport', 'umid', 'drivers-license'],
      },
      "Kung walang primary document: secondary documents na may buong pangalan, larawan, lagda, address, at petsa ng kapanganakan (hal. PRC ID, Senior Citizen ID, Voter's ID, NBI Clearance, School ID, Barangay ID)",
      'Dalhin ang mga orihinal na dokumento — hindi tinatanggap ang photocopy',
      'Libre ang buong proseso ng rehistrasyon',
    ],
    steps: [
      {
        title: 'Pumunta sa Registration Center',
        description:
          'Maghanap ng pinakamalapit na PhilSys Registration Center (PSA offices, malls, o LGU). Walk-in lang, walang kailangang appointment.',
      },
      {
        title: 'Ipa-verify ang mga dokumento',
        description:
          'Ipakita ang supporting documents sa Registration Kit Operator (RKO) para ma-verify ang identity at ma-encode ang demographic data.',
      },
      {
        title: 'Biometric data collection',
        description: 'Kukunan ka ng 10 fingerprints, iris scan ng magkabilang mata, at front-facing na larawan.',
      },
      {
        title: 'Kunin ang Transaction Slip',
        description:
          'Naglalaman ito ng iyong Transaction Reference Number (TRN) — importante para sa digital ID access.',
      },
      {
        title: 'I-access ang Digital ID o ePhilID',
        description:
          'Gamitin ang eGovPH Super App para sa Digital National ID, o humingi ng printed ePhilID sa registration center habang hinihintay ang physical card.',
      },
    ],
    timeline:
      '30–60 minuto ang rehistrasyon; ilang buwan hanggang isang taon ang paghihintay sa physical card, pero agad magagamit ang ePhilID/Digital ID.',
  },

  'philippine-passport': {
    requirements: [
      {
        label: "1 valid Primary ID (PhilSys National ID, ePhilID, UMID, Driver's License, Postal ID, o PRC ID)",
        documentIds: ['national-id', 'umid', 'drivers-license', 'postal-id', 'prc-id'],
      },
      {
        label: 'Orihinal na PSA Birth Certificate (transcribed copy sa Local Civil Registrar kung malabo ang detalye)',
        documentIds: ['psa-birth-certificate'],
      },
      {
        label: 'PSA Marriage Certificate (para lang sa mga babaeng may asawa na gagamit ng apelyido ng asawa)',
        documentIds: ['psa-marriage-death-certificate'],
      },
      'Kumpirmadong online appointment mula sa DFA portal',
      'Bayad: ₱950 (Regular) o ₱1,200 (Expedited), plus ~₱50 convenience fee',
    ],
    steps: [
      {
        title: 'Mag-book ng online appointment',
        description:
          'Pumunta sa passport.gov.ph, pumili ng DFA office, petsa, at oras. Kumpletuhin ang online application form.',
      },
      {
        title: 'Bayaran ang processing fee',
        description:
          'Sa loob ng 24 oras, bayaran ang fee sa authorized payment center (7-Eleven, Bayad Center, GCash, Maya, o bangko).',
      },
      {
        title: 'I-print ang application packet',
        description:
          'I-print sa A4 paper ang application form, appointment checklist, at e-Receipt na ipapadala sa email.',
      },
      {
        title: 'Pumunta sa DFA appointment',
        description: 'Dalhin ang printed packet at lahat ng orihinal na dokumento. Personal appearance ay required.',
      },
      {
        title: 'Document verification at biometrics',
        description: 'Ipapasa ang mga dokumento, kukunan ng digital photo, lagda, at fingerprints.',
      },
      {
        title: 'Kunin ang passport',
        description: 'Personal pick-up sa DFA office o mag-avail ng courier delivery.',
      },
    ],
    timeline: '5–12 working days depende sa processing type at lokasyon.',
  },

  'drivers-license': {
    requirements: [
      'Active LTMS Portal account (portal.lto.gov.ph)',
      'Valid Student Permit (kailangang 31+ araw nang meron)',
      "Practical Driving Course (PDC) Certificate mula sa accredited driving school",
      'Medical Certificate mula sa LTO-accredited clinic (nasa loob ng 60 araw)',
      'Naka-fill out na Application for Permits and License (APL) Form',
      { label: 'TIN (kung employed)', documentIds: ['tin-id'] },
      'Para sa 17-year-old: notarized consent letter ng magulang/guardian + ID',
      'Bayad: ₱685 (₱100 application + ₱585 license fee), plus medical exam at PDC course fees',
    ],
    steps: [
      {
        title: 'I-check ang LTMS account',
        description:
          'Siguraduhing na-transmit na ng driving school at clinic ang iyong PDC Certificate at Medical Certificate sa LTMS.',
      },
      {
        title: 'Pumunta sa LTO branch',
        description:
          'Isumite ang Student Permit, Medical Certificate, PDC Certificate, at APL form sa Evaluation window.',
      },
      {
        title: 'Bayaran ang application fee',
        description: 'Bayaran ang ₱100 Application Fee at kunin ang Official Receipt.',
      },
      {
        title: 'Kunin ang theoretical exam',
        description: 'Computerized exam tungkol sa traffic laws — kailangan ng 48/60 para pumasa.',
      },
      {
        title: 'Kunin ang practical driving test',
        description: 'Ipakita ang kakayahang magmaneho sa harap ng LTO examiner.',
      },
      {
        title: 'Biometrics at bayad sa license fee',
        description: 'Kukunan ng larawan, lagda, at fingerprints, tapos bayaran ang ₱585 License Fee.',
      },
      {
        title: "Kunin ang Driver's License",
        description: 'Pumirma sa release logbook at kunin ang card o temporary receipt.',
      },
    ],
    timeline: "3–5 oras sa LTO branch; valid ang bagong lisensya ng 5 taon.",
  },

  umid: {
    requirements: [
      'Umiiral na SSS-issued UMID card (para lang ito sa pag-upgrade — hindi na puwede ang bagong UMID)',
      'Active My.SSS account',
      'Updated contact info (mobile at email) sa SSS records',
      'Smartphone para sa UnionBank app',
      'Libre ang pag-upgrade',
    ],
    steps: [
      {
        title: 'Magbigay ng consent sa My.SSS',
        description: "Mag-log in sa My.SSS at i-click ang 'Provide Consent' para sa UMID ATM Pay Card Upgrade.",
      },
      {
        title: 'I-download ang UnionBank app',
        description: 'I-install ang UnionBank Online App at pumili ng bagong account.',
      },
      {
        title: 'Piliin ang Government Card option',
        description: "Piliin ang 'Government Cards with Savings Account' tapos ilagay ang SSS details.",
      },
      {
        title: 'Kumpletuhin ang eKYC verification',
        description: 'Ilagay ang OTP, gumawa ng live selfie scan, at maglagay ng digital signature.',
      },
      {
        title: 'Hintayin ang delivery at i-activate',
        description: 'Pagdating ng card, i-activate ito sa app at itakda ang 6-digit ATM PIN.',
      },
    ],
    timeline: '15 banking days (Metro Manila) hanggang 20 banking days (probinsya).',
  },

  'postal-id': {
    requirements: [
      'Dalawang (2) kopya ng Postal ID (PID) Application Form',
      {
        label: "1 Primary ID (PSA Birth Certificate, National ID/ePhilID, UMID, Driver's License, o Passport) o 2 secondary IDs kung walang primary",
        documentIds: ['psa-birth-certificate', 'national-id', 'umid', 'drivers-license', 'philippine-passport'],
      },
      'Proof of Address (Barangay Certificate of Residency, utility bill, o bank statement)',
      'Bayad: ₱550 (Regular) o ₱650 (Rush)',
    ],
    steps: [
      {
        title: 'Punan ang application form',
        description: 'Kumpletuhin ang 2 kopya ng PID form nang walang blangkong field.',
      },
      {
        title: 'Isumite ang dokumento at bayaran',
        description:
          'Pumunta sa PHLPost branch, ipasa ang mga dokumento, bayaran ang fee, at itago ang resibo.',
      },
      {
        title: 'Biometrics data capture',
        description: 'Kukunan ng larawan, fingerprints, at digital signature.',
      },
      {
        title: 'Hintayin ang delivery',
        description:
          'Ipapadala ang Regular Postal ID sa iyong address; puwedeng same-day release ang Rush processing.',
      },
    ],
    timeline: '10–30 working days (Regular); same-day hanggang next working day (Rush sa mga major branch).',
  },

  'voters-id': {
    requirements: [
      'Active/registered voter status (hindi deactivated)',
      anyValidId('1 valid government-issued ID'),
      'Bayad: ₱75 (libre para sa Senior Citizens, PWD, IP, at Indigent)',
      'Kung sa pamamagitan ng representative: authorization letter + IDs ng dalawa',
    ],
    steps: [
      {
        title: 'Pumunta sa COMELEC office',
        description:
          "Pumunta sa Office of the Election Officer (OEO) kung saan ka rehistrado, o sa COMELEC Main Office sa Intramuros.",
      },
      {
        title: 'I-verify ang registration record',
        description: 'Ipakita ang valid ID para ma-verify ang active status sa Voter Registration System.',
      },
      {
        title: 'Bayaran ang certification fee',
        description: 'Bayaran ang ₱75 sa cashier at kunin ang Official Receipt (o ipakita ang exemption proof).',
      },
      {
        title: "Kunin ang Voter's Certification",
        description:
          'Tiyakin ang tamang detalye bago umalis — may COMELEC dry seal at lagda ito ng Election Officer.',
      },
    ],
    timeline: 'Same-day release, karaniwang 15–30 minuto.',
  },

  'sss-id': {
    requirements: [
      'Permanent SS Number (naisumite na ang birth/marriage documents)',
      'Active My.SSS account',
      'Updated address, mobile number, at email sa SSS records',
      {
        label: 'Rehistrado sa PhilSys National ID (ginagamit para sa eVerify biometrics)',
        documentIds: ['national-id'],
      },
      'Dapat magkatugma ang pangalan at petsa ng kapanganakan sa SSS at National ID records',
      'Walang bayad ang application; posibleng may minimal deposit ang partner bank',
    ],
    steps: [
      {
        title: 'I-verify ang records at simulan ang application',
        description: 'Mag-log in sa My.SSS, pumunta sa Services > MySSS Card, at i-check ang mga detalye.',
      },
      {
        title: 'Payagan ang National ID eVerify',
        description: 'Bigyan ng consent ang SSS na i-verify ang identity gamit ang PhilSys records.',
      },
      {
        title: 'Facial scan at pagpili ng bangko',
        description: 'Kumpletuhin ang facial scan at pumili ng partner bank.',
      },
      {
        title: 'Buksan ang bank account',
        description: 'I-download ang app ng partner bank (hal. UnionBank/DiskarTech) at kumpletuhin ang onboarding.',
      },
      {
        title: 'Kunin ang card',
        description: 'Hihintayin ang notification mula sa bangko para sa delivery o pick-up.',
      },
    ],
    timeline: '15 working days (Metro Manila) hanggang 20 working days (probinsya).',
  },

  'gsis-e-card': {
    requirements: [
      'Active government employee/GSIS member, bagong pensioner, o legal guardian',
      'Naka-fill out na GSIS UMID-eCard Enrollment Form',
      anyValidId('2 valid government-issued IDs'),
      'Libre para sa first-time applicants; may replacement fee (~₱200) kung palit ng nawalang card',
    ],
    steps: [
      {
        title: 'Punan ang Enrollment Form',
        description: 'Piliin ang servicing bank (UnionBank o LandBank) sa form.',
      },
      {
        title: 'Pumunta sa GSIS office',
        description: 'Isumite ang form at 2 valid IDs sa eCard enrollment area.',
      },
      {
        title: 'Biometrics data capture',
        description: 'Kukunan ng larawan, lagda, at fingerprints.',
      },
      {
        title: 'Hintayin ang SMS confirmation',
        description: 'Hindi same-day release — hihintayin ang text kung saan/kailan ma-cclaim ang card.',
      },
      {
        title: 'Kunin at i-activate ang eCard',
        description: 'I-activate sa G-W@PS kiosk gamit ang fingerprint scanner.',
      },
    ],
    timeline: '~30 calendar days mula sa biometrics hanggang printing.',
  },

  'philhealth-id': {
    requirements: [
      'Dalawang (2) kopya ng PhilHealth Member Registration Form (PMRF)',
      anyValidId('1 valid government-issued ID'),
      {
        label: 'PSA Birth Certificate (para sa first-time registrants)',
        documentIds: ['psa-birth-certificate'],
      },
      '2 kopya ng 1x1 ID photo',
      'Notarized Affidavit of Loss (kung palit ng nawalang ID)',
      'Libre ang regular ID; ₱90–₱150 kung PVC upgrade',
    ],
    steps: [
      {
        title: '(Optional) Kumuha ng PIN online',
        description: 'Mag-rehistro sa PhilHealth Member Portal at mag-upload ng PSA Birth Certificate.',
      },
      {
        title: 'Punan ang PMRF',
        description: 'Isulat ang PIN kung mayroon na mula sa nakaraang employer o online registration.',
      },
      {
        title: 'Pumunta sa PhilHealth office',
        description: 'Pumunta sa LHIO o PhilHealth Express branch.',
      },
      {
        title: 'Isumite ang mga dokumento',
        description: 'Ipasa ang PMRF, valid ID, at Birth Certificate para sa evaluation.',
      },
      {
        title: 'Kunin ang ID at MDR',
        description: 'I-print ang ID at Member Data Record on the spot, at pirmahan ang card.',
      },
    ],
    timeline: 'Same-day walk-in processing; 3–5 working days ang online PIN registration.',
  },

  'pag-ibig-id': {
    requirements: [
      'Active membership (may 1 posted monthly contribution sa nakaraang 6 buwan)',
      'Permanent Pag-IBIG MID Number',
      "Updated member records (Member's Data Form kung kailangan i-update)",
      'Naka-fill out na Pag-IBIG Loyalty Card Plus Application Form (HQP-PFF-108)',
      anyValidId('1 valid primary government ID'),
      'Bayad: ₱125',
    ],
    steps: [
      {
        title: 'Punan ang application form',
        description: 'Siguraduhing walang burado at tugma sa iyong ID.',
      },
      {
        title: 'Pumunta sa Pag-IBIG branch',
        description: 'Pumunta sa branch na may Loyalty Card Plus enrollment kiosk.',
      },
      {
        title: 'Bayaran ang card fee',
        description: 'Bayaran ang ₱125 sa cashier.',
      },
      {
        title: 'Biometrics data capture',
        description: 'Kukunan ng larawan, fingerprints, at digital signature sa partner-bank kiosk.',
      },
      {
        title: 'Kunin ang card',
        description: 'I-print agad ang card — i-link sa mobile banking app para ma-monitor.',
      },
    ],
    timeline: 'Same-day release — pumunta nang maaga dahil may daily cut-off sa printing.',
  },

  'senior-citizen-id': {
    requirements: [
      '60 taong gulang pataas',
      {
        label: 'PSA-issued Birth Certificate (o valid ID na may petsa ng kapanganakan)',
        documentIds: ['psa-birth-certificate', 'national-id', 'philippine-passport', 'drivers-license'],
      },
      {
        label: 'Barangay Certificate of Residency o utility bill',
        documentIds: ['barangay-id'],
      },
      '2-3 kopya ng 1x1/2x2 ID photo',
      'Naka-fill out na OSCA Application Form',
      'Libre ang buong proseso',
    ],
    steps: [
      {
        title: 'Kunin at punan ang application form',
        description: 'Sa OSCA office o Barangay Hall. Puwedeng representative kung bedridden o homebound.',
      },
      {
        title: 'Isumite ang mga dokumento',
        description: 'Para sa verification ng edad at residency.',
      },
      {
        title: 'Pumirma at maglagay ng thumbmark',
        description: 'Sa ID card at OSCA logbook.',
      },
      {
        title: 'Kunin ang ID at booklets',
        description: 'Kasama ang Medicine Booklet at Grocery Booklet para sa discounts.',
      },
    ],
    timeline: 'Same-day sa maraming LGU; 1–7 working days sa ilang probinsya.',
  },

  'pwd-id': {
    requirements: [
      'Proof of Disability: Medical Certificate mula sa specialist (non-apparent) o larawan/Certificate of Disability (apparent)',
      'Naka-fill out na PRPWD Application Form',
      '2 kopya ng 1x1/2x2 ID photo',
      anyValidId('1 valid government-issued ID na may kasalukuyang address'),
      'Authorization letter kung sa pamamagitan ng representative',
      'Libre ang buong proseso',
    ],
    steps: [
      {
        title: 'Punan ang application form',
        description: 'Tiyakin na tugma ang lahat ng detalye sa valid ID at medical certificate.',
      },
      {
        title: 'Kumpletuhin ang medical clearance',
        description:
          'Kumuha ng certificate mula sa specialist o Certificate of Disability sa City/Municipal Health Office.',
      },
      {
        title: 'Isumite sa PDAO/MSWDO',
        description: 'Ipasa ang form, medical documents, larawan, at ID photocopies.',
      },
      {
        title: 'Hintayin ang data encoding',
        description: 'Ie-encode ang datos sa DOH PRPWD system para makuha ang permanenteng PWD ID number.',
      },
      {
        title: 'Kunin ang PWD ID',
        description: 'May kasamang Medicine Booklet at Grocery Booklet.',
      },
    ],
    timeline: '1–3 working days; posibleng same-day sa ilang LGU.',
  },

  'solo-parent-id': {
    requirements: [
      'Proof of Solo Parent status depende sa sitwasyon (PSA Death Certificate, Barangay Certification/Affidavit, court decree, o medical certificate)',
      {
        label: 'PSA Birth Certificate ng anak',
        documentIds: ['psa-birth-certificate'],
      },
      {
        label: 'Barangay Certificate of Residency (6 buwang residency)',
        documentIds: ['barangay-id'],
      },
      'ITR o Certificate of Indigency',
      '2 kopya ng 1x1/2x2 ID photo',
      'Naka-fill out na Solo Parent Registration Form',
      'Libre ang buong proseso',
    ],
    steps: [
      {
        title: 'Kunin ang application form',
        description: 'Sa LSWDO o Solo Parents Office (SPO) ng City/Municipal Hall.',
      },
      {
        title: 'Isumite ang mga dokumento',
        description: 'Ipapasa sa social worker na mag-iissue ng acknowledgment receipt.',
      },
      {
        title: 'Sumailalim sa interview',
        description: 'I-verify ng social worker ang iyong sitwasyon bilang solo parent.',
      },
      {
        title: 'Hintayin ang LGU verification',
        description: 'Posibleng magkaroon ng background check sa barangay.',
      },
      {
        title: 'Kunin ang Solo Parent ID',
        description: 'Kasama ang Solo Parent Booklet para sa discounts at subsidies.',
      },
    ],
    timeline: '7–15 working days; hanggang 30 araw kung may karagdagang verification. Valid ng 1 taon.',
  },

  '4ps-id': {
    requirements: [
      'Official notification mula DSWD/CBMS na kwalipikado ang sambahayan',
      { label: 'PhilSys National ID', documentIds: ['national-id'] },
      {
        label: 'PSA Birth Certificates ng lahat ng miyembro ng pamilya',
        documentIds: ['psa-birth-certificate'],
      },
      { label: 'Marriage Certificate (kung applicable)', documentIds: ['psa-marriage-death-certificate'] },
      'School enrollment records at health/immunization records',
      'Libre ang buong proseso',
    ],
    steps: [
      {
        title: 'Hintayin ang notification',
        description: 'Ipapaalam ng barangay o City/Municipal Link kung kwalipikado ang sambahayan.',
      },
      {
        title: 'Dumalo sa Community Assembly',
        description: 'Sumailalim sa validation interview ng DSWD social worker.',
      },
      {
        title: 'I-authenticate ang identity',
        description: 'Ipakita ang PhilSys National ID at supporting documents.',
      },
      {
        title: 'Pumirma sa Oath of Commitment',
        description:
          'Sumang-ayon sa mga kondisyon ng programa (school attendance, health check-ups, atbp).',
      },
      {
        title: 'Hintayin ang ID processing',
        description: 'Ipoproseso at ipapamahagi ang 4Ps ID sa pamamagitan ng City/Municipal Link.',
      },
    ],
    timeline: '1–2 buwan hanggang enrollment; 2–6 buwan para sa ID at cash card release.',
  },

  'prc-id': {
    requirements: [
      'Active LERIS account (online.prc.gov.ph)',
      'Naka-print na Oath Form (auto-generated pagkatapos magbayad)',
      'Orihinal na Notice of Admission (NOA) + photocopy',
      { label: 'Valid Community Tax Certificate (Cedula)', documentIds: ['cedula'] },
      '2 kopya ng ID photo na may collared attire',
      '2 documentary stamps',
      'Bayad: ₱1,050 (Baccalaureate) o ₱870 (Non-Baccalaureate)',
    ],
    steps: [
      {
        title: 'I-update ang LERIS profile',
        description: 'Mag-upload ng bagong 2x2 photo ayon sa PRC guidelines.',
      },
      {
        title: 'Mag-book ng Initial Registration appointment',
        description: 'Piliin ang propesyon, ilagay ang Application Number, pumili ng branch, petsa, oras.',
      },
      {
        title: 'Bayaran ang fees online',
        description: 'Sa pamamagitan ng GCash, PayMaya, o LandBank.',
      },
      {
        title: 'I-print ang Oath Form',
        description: 'Huwag pipirmahan hangga\u2019t hindi harap ng PRC officer.',
      },
      {
        title: 'Isumite ang mga dokumento sa PRC',
        description: 'Personal appearance kasama ang lahat ng requirements.',
      },
      {
        title: 'Pumirma sa Registry Book',
        description: 'Kukunin ang claim slip para sa ID release.',
      },
      {
        title: 'Dumalo sa Oath-Taking',
        description:
          'Kailangan ito bago maging opisyal ang practice ng propesyon at ma-claim ang ID.',
      },
    ],
    timeline: '1–2 oras sa PRC office; ID release 3–7 working days pagkatapos ng oath-taking. Valid ng 3 taon.',
  },

  'ibp-id': {
    requirements: [
      'Active Roll Number (naka-Roll of Attorneys na sa Supreme Court)',
      'Good standing status — walang utang na dues o pending disciplinary case',
      'High-resolution 2x2 ID photo (blazer o Barong)',
      'IBP Lawyers ID Form (kung manual/email application)',
      'Bayad: ₱350 (ID fee) + ₱200 (courier, optional)',
    ],
    steps: [
      {
        title: 'I-update ang dues',
        description: 'Siguraduhing bayad na ang annual dues sa myIBP app.',
      },
      {
        title: 'Isumite ang application',
        description: 'Via myIBP app o email sa IBP National Office kasama ang photo at proof of payment.',
      },
      {
        title: 'Hintayin ang Chapter Endorsement',
        description:
          'Ive-verify ng local IBP chapter ang membership status bago i-endorse sa National Office.',
      },
      {
        title: 'Kunin ang IBP ID',
        description: 'I-deliver o personal pick-up sa IBP Main Office sa Pasig.',
      },
    ],
    timeline: '3–5 working days processing pagkatapos ng chapter endorsement; +3–7 araw kung courier.',
  },

  'tin-id': {
    requirements: [
      'Active email address',
      anyValidId('Valid government-issued ID (photo/scan)'),
      '1x1 digital photo na white background, huling 6 buwan',
      'ORUS account (orus.bir.gov.ph)',
    ],
    steps: [
      {
        title: 'Mag-register o mag-log in sa ORUS',
        description: 'Gumawa ng account bilang Individual.',
      },
      {
        title: 'I-update ang personal information',
        description: 'Siguraduhing verified at updated ang email address.',
      },
      {
        title: 'I-upload ang larawan',
        description: 'Sundin ang strict specifications (white background, harap, walang takip sa mukha).',
      },
      {
        title: 'I-submit at i-generate',
        description: 'I-download ang Digital TIN ID mula sa ORUS profile.',
      },
      {
        title: '(Optional) I-sync sa eGovPH app',
        description: 'I-access ang Digital TIN ID bilang mobile ID wallet card.',
      },
    ],
    timeline: 'Instant ang Digital TIN ID; ₱100 fee kung physical card sa RDO.',
  },

  'seamans-book': {
    requirements: [
      {
        label: 'PSA Birth Certificate (SECPA) o valid Philippine Passport',
        documentIds: ['psa-birth-certificate', 'philippine-passport'],
      },
      { label: 'Valid, multi-purpose NBI Clearance', documentIds: ['nbi-clearance'] },
      'Basic Safety Training (BST) o Basic Training (BT) Certificate',
      'Official Receipt ng Basic Training course',
      {
        label: 'PSA Marriage Contract (para sa may asawang babae)',
        documentIds: ['psa-marriage-death-certificate'],
      },
      'Bayad: ₱1,000 (New/Renewal) o ₱1,800 (Onboard/Expedited)',
    ],
    steps: [
      {
        title: 'Mag-register sa eGovPH App',
        description: 'Gumawa ng account at kumpletuhin ang profile verification.',
      },
      {
        title: 'Mag-book ng appointment',
        description: "Piliin ang Seafarer's Record Book (SRB) sa MARINA services section.",
      },
      {
        title: 'Punan ang application',
        description: 'I-upload ang malinaw na scans ng requirements.',
      },
      {
        title: 'Isumite at magbayad',
        description: 'Bayaran sa loob ng app; makakatanggap ng confirmation email.',
      },
      {
        title: 'Pumunta sa MARINA office',
        description: 'Dumating nang 1 oras bago ang schedule, dala ang printed confirmation at 2 documentary stamps.',
      },
      {
        title: 'Biometrics at data capture',
        description: 'Larawan, lagda, at fingerprint scanning — kailangan ng collared shirt.',
      },
      {
        title: 'Kunin ang SRB',
        description: 'Karaniwang mailalabas sa loob ng 2-3 oras pagkatapos ng data capture.',
      },
    ],
    timeline: 'Puwedeng makakuha ng slot kinabukasan; ~2.5 oras ang processing sa MARINA office.',
  },

  'owwa-id': {
    requirements: [
      'Active OWWA Membership (valid 2 taon mula bayad)',
      { label: 'Valid Passport (6+ buwan validity)', documentIds: ['philippine-passport'] },
      'Overseas Employment Certificate (OEC) o Balik-Manggagawa Exemption Number',
      'Account sa OWWA portal o eGovPH app',
    ],
    steps: [
      {
        title: 'I-verify ang membership status',
        description: "I-check sa OWWA Mobile App o website kung 'Active'; i-renew kung hindi.",
      },
      {
        title: 'I-access ang Digital e-Card',
        description:
          'Awtomatikong ma-ge-generate kapag active na ang membership — makikita sa eGovPH o OWWA app.',
      },
      {
        title: '(Optional) Mag-apply ng physical e-Card',
        description: 'Pumunta sa OWWA Central Office, Regional Welfare Office, o NAIA counters.',
      },
      {
        title: 'Data capture',
        description: 'Ipapakita ang passport at OEC; kukunan ng larawan at digital signature.',
      },
      {
        title: 'Kunin/hintayin ang delivery',
        description: 'Same-day sa major hubs; ilang linggo kung regional.',
      },
    ],
    timeline: 'Instant ang digital e-Card; same-day hanggang 3-4 linggo ang physical card.',
  },

  'afp-military-id': {
    requirements: [
      'Naka-fill out na Application Form mula sa Unit Adjutant/OTAG',
      anyValidId('Sariling valid government-issued ID'),
      {
        label:
          'PSA-certified proof of relationship (Marriage Contract/CENOMAR para sa asawa, Birth Certificate para sa anak/magulang)',
        documentIds: ['psa-marriage-death-certificate', 'psa-birth-certificate'],
      },
      'Military Orders (Retirement/Separation o Promotion/Re-enlistment Orders)',
      'AFP-issued Declaration of Legal Beneficiaries mula JAGO/PGMC',
      '2x2 ID photos (15 araw pababa)',
      'Affidavit of Loss + Police Blotter kung palit ng nawalang ID',
    ],
    steps: [
      {
        title: 'Makipag-ugnayan sa military unit',
        description: 'Kunin ang official application form mula sa Unit Adjutant.',
      },
      {
        title: 'Punan at ipa-endorse ang form',
        description: 'Kailangan ng lagda ng Unit Commander o Adjutant.',
      },
      {
        title: 'Isumite ang mga dokumento',
        description: 'Sa admin office ng branch (OTAG, Army, Navy, o Air Force).',
      },
      {
        title: 'Verification at biometrics',
        description: 'Personal appearance para sa larawan, lagda, at thumbprint.',
      },
      {
        title: 'Kunin ang ID',
        description: 'Pumirma sa release logbook pagkatapos ma-approve.',
      },
    ],
    timeline: '1–4 linggo depende sa unit workload.',
  },

  'pvao-id': {
    requirements: [
      'Active PVAO Pension status',
      'Naka-fill out na PPISO Application Form',
      anyValidId('2 valid government-issued IDs'),
      '2 kopya ng 2x2 photo na white background',
      {
        label: 'Barangay Clearance + newspaper photo (kung hindi personal appearance) o SPA (kung representative)',
        documentIds: ['barangay-id'],
      },
    ],
    steps: [
      {
        title: 'Kunin ang application form',
        description: 'Sa Veterans Field Service Unit (VFSU) o E-Veterans portal.',
      },
      {
        title: 'Punan ang form',
        description: 'Gamitin ang black sign pen para sa thumbprint at lagda.',
      },
      {
        title: 'Isumite ang requirements',
        description: 'Sa PPISO sa Camp Aguinaldo o sa lokal na VFSU.',
      },
      {
        title: 'Biometric data capture',
        description: 'Larawan at thumbprints (o sundin ang special requirements kung representative).',
      },
      {
        title: 'Kunin ang ID',
        description: 'Hihintayin ang notification mula PPISO o VFSU.',
      },
    ],
    timeline: '15–30 working days; libre ang application at ID.',
  },

  'gocc-id': {
    requirements: [
      'Employment o appointment sa government office/GOCC (Certificate of Employment o Appointment Order)',
      anyValidId('1-2 valid government-issued ID'),
      '2x2 ID photo (white background)',
      'Naka-fill out na ID application/request form mula sa HR o Admin office',
      'Karaniwang libre — depende sa patakaran ng ahensya',
    ],
    steps: [
      {
        title: 'Makipag-ugnayan sa HR/Admin office',
        description: 'Itanong ang official ID request form at requirements ng iyong ahensya.',
      },
      {
        title: 'Isumite ang mga dokumento',
        description: 'Ipasa ang form, appointment order, at ID photo sa HR/Admin.',
      },
      {
        title: 'Biometrics/data capture',
        description: 'Kukunan ng larawan at lagda kung kailangan ng agency.',
      },
      {
        title: 'Kunin ang office ID',
        description: 'I-claim sa HR/Admin office o Personnel section pagkatapos maproseso.',
      },
    ],
    timeline: 'Depende sa ahensya — karaniwang ilang araw hanggang ilang linggo.',
  },

  'nbi-clearance': {
    requirements: [
      'Active email at mobile number',
      anyValidId('2 orihinal, unexpired valid government-issued IDs'),
      'Bayad: ₱155 (libre para sa First-Time Job Seekers na may Barangay Certification)',
      'Device na may internet access',
    ],
    steps: [
      {
        title: 'Mag-register online',
        description:
          'Gumawa ng account sa clearance.nbi.gov.ph gamit ang email at mobile number; i-verify gamit OTP.',
      },
      {
        title: 'Kumpletuhin ang profile',
        description: 'Ilagay ang civil status, physical attributes, at family background.',
      },
      {
        title: 'Mag-book ng appointment',
        description: 'Piliin ang mga valid ID, NBI branch, petsa, at oras.',
      },
      {
        title: 'Magbayad online',
        description: 'Pumili ng payment method at itago ang Reference Number bilang gate pass.',
      },
      {
        title: 'Personal appearance at biometrics',
        description: 'Ipakita ang Reference Number at 2 valid ID; fingerprint scan, larawan, at digital signature.',
      },
      {
        title: 'Kunin ang clearance',
        description: "Same-day release kung walang 'HIT'; 8-15 araw kung may hit na kailangang i-verify.",
      },
    ],
    timeline: '10-15 minuto online; same-day sa branch kung walang hit.',
  },

  'police-clearance': {
    requirements: [
      'Active email address',
      anyValidId('2 orihinal valid government-issued IDs'),
      'Bayad: ~₱150',
      'Device na may internet',
      'Barangay Certification for First-Time Job Seeker (kung libre ang gustong i-avail)',
    ],
    steps: [
      {
        title: 'Mag-register online',
        description: 'Gumawa ng account sa pnpclearance.ph at i-verify ang email.',
      },
      {
        title: 'Kumpletuhin ang profile',
        description: 'Ilagay ang address, civil status, at contact information.',
      },
      {
        title: 'Mag-schedule ng appointment',
        description: 'Piliin ang pinakamalapit na Police Station, petsa, at oras.',
      },
      {
        title: 'Magbayad online',
        description: 'Bayaran ang fee at itago ang Reference Number.',
      },
      {
        title: 'Pumunta sa Police Station',
        description: 'Ipakita ang resibo, Reference Number, at 2 valid ID; biometrics capture.',
      },
      {
        title: 'Kunin ang clearance',
        description: "Ile-release kaagad kung walang 'hit' sa record.",
      },
    ],
    timeline: 'Same-day release, 10-15 minuto pagkatapos ng biometrics.',
  },

  'barangay-id': {
    requirements: [
      anyValidId('1 valid government-issued photo ID'),
      { label: 'Updated Community Tax Certificate (Cedula)', documentIds: ['cedula'] },
      'Proof of residency (utility bill o lease contract) — 6 buwang residency',
      'Application form (libre sa Barangay Hall)',
      'Bayad: ₱20–₱150 depende sa ordinansa ng barangay',
    ],
    steps: [
      {
        title: 'Kunin at punan ang application form',
        description: 'Sa Barangay Hall, ilagay ang tamang purpose ng request.',
      },
      {
        title: 'Isumite ang mga dokumento',
        description: 'I-verify ng Barangay Secretary at i-cross-check sa blotter database.',
      },
      {
        title: 'Bayaran ang fee',
        description: 'Sa Barangay Treasurer, kunin ang Official Receipt.',
      },
      {
        title: 'Biometrics at pagpirma',
        description: 'Lagda, thumbmark, at posibleng larawan.',
      },
      {
        title: 'Kunin ang Barangay Clearance/ID',
        description: 'Dapat may lagda ng Barangay Captain at dry seal.',
      },
    ],
    timeline: '15–30 minuto; valid ng 6 buwan.',
  },

  cedula: {
    requirements: [
      anyValidId('1 valid government-issued photo ID'),
      'Proof of income (payslip, Certificate of Compensation, o BIR 2316) kung applicable',
      'Community Tax Declaration Form (CTDF) — libre sa opisina',
      'Bayad: ₱5 basic tax + ₱1 kada ₱1,000 ng annual income/property value',
    ],
    steps: [
      {
        title: 'I-check ang eligibility',
        description: '18 taong gulang pataas at residente ng lugar.',
      },
      {
        title: 'Kunin at punan ang CTDF',
        description: 'Sa Treasurer\u2019s Office ng City/Municipal/Barangay Hall.',
      },
      {
        title: 'Isumite para sa assessment',
        description: 'Ie-evaluate ang form at proof of income para makalkula ang bayad.',
      },
      {
        title: 'Magbayad at maglagay ng thumbmark',
        description: 'Sa cashier, pagkatapos pumirma at maglagay ng right thumbprint.',
      },
      {
        title: 'Kunin ang Cedula',
        description: 'I-verify ang pangalan, address, at purpose bago umalis.',
      },
    ],
    timeline: '5-20 minuto; valid lang hanggang Disyembre 31 ng taong ininsyu.',
  },

  'firearms-license': {
    requirements: [
      {
        label: 'PSA Birth Certificate o valid Passport',
        documentIds: ['psa-birth-certificate', 'philippine-passport'],
      },
      { label: 'Valid NBI Clearance', documentIds: ['nbi-clearance'] },
      { label: 'National Police Clearance', documentIds: ['police-clearance'] },
      'Neuro-Psychiatric Clearance at Drug Test Result',
      'Gun Safety and Responsible Gun Ownership (GSRGO) Certificate',
      'Proof of Income (ITR, Certificate of Employment, Business Permit, o Oath of Office)',
      {
        label: 'Proof of Billing o Barangay Clearance',
        documentIds: ['barangay-id'],
      },
      anyValidId('2 valid government-issued IDs at 2x2 photos'),
      'Notarized LTOPF Application Form',
      'Bayad: ₱1,200–₱10,200 depende sa Type 1-5',
    ],
    steps: [
      {
        title: 'Gumawa ng FEO online account',
        description: 'Sa feo.pnp.gov.ph, kumpletuhin ang profile.',
      },
      {
        title: 'Kumuha ng clearances at seminar',
        description: 'Attend ang Gun Safety Seminar, Drug Test, at Neuro-Psychiatric Exam.',
      },
      {
        title: 'Mag-apply online',
        description: 'I-upload ang lahat ng scanned requirements sa FEO account.',
      },
      {
        title: 'Bayaran ang assessment',
        description: 'Bayaran ang fee sa Landbank gamit ang Order of Payment.',
      },
      {
        title: 'Personal appearance sa FEO',
        description: 'Dalhin ang lahat ng original documents sa Camp Crame o RCSU.',
      },
      {
        title: 'Biometrics at pagkuha ng LTOPF',
        description: 'Kukunan ng biometrics kung kailangan, tapos ilalabas ang card.',
      },
    ],
    timeline: '1-3 araw ang clearances; 3-7 araw ang online assessment; same-day release sa office visit.',
  },

  'psa-birth-certificate': {
    requirements: [
      'Buong pangalan, petsa, at lugar ng kapanganakan, kasama ang pangalan ng mga magulang',
      anyValidId('1 valid government-issued ID ng requester'),
      'Authorization letter + ID kung sa pamamagitan ng representative',
      'Bayad: ₱365 (online, may delivery) o ₱155 (walk-in)',
    ],
    steps: [
      {
        title: 'Pumili ng paraan: Online o Walk-in',
        description: 'Puwedeng mag-order sa PSAHelpline.ph o pumunta mismo sa PSA outlet.',
      },
      {
        title: 'Mag-order online sa PSAHelpline.ph',
        description: 'Punan ang order form, piliin ang quantity, at magbayad (GCash, Maya, card, atbp).',
      },
      {
        title: 'O pumunta sa PSA outlet (walk-in)',
        description: 'Kumuha ng queue number, punan ang application form on-site.',
      },
      {
        title: 'Isumite at magbayad',
        description: 'Ipasa ang form/ID, bayaran ang fee, kunin ang reference/claim stub.',
      },
      {
        title: 'Kunin ang certificate',
        description: 'Via courier delivery (online) o same-day release (walk-in).',
      },
    ],
    timeline: 'Same-day (walk-in, 1-3 oras); 1-3 linggo (online end-to-end).',
  },

  'psa-marriage-death-certificate': {
    requirements: [
      'Para sa Marriage: buong pangalan ng mag-asawa, petsa at lugar ng kasal',
      'Para sa Death: buong pangalan, petsa, at lugar ng kamatayan ng namatay',
      anyValidId('1 valid government-issued ID ng requester (kasal na partido o immediate family member)'),
      'Authorization letter + ID kung sa pamamagitan ng representative',
      'Bayad: ₱365 (online) o ₱155 (walk-in)',
    ],
    steps: [
      {
        title: 'Pumili ng paraan: Online o Walk-in',
        description: 'Puwedeng mag-order sa PSAHelpline.ph o pumunta mismo sa PSA outlet.',
      },
      {
        title: 'Mag-order online sa PSAHelpline.ph',
        description: 'Piliin ang Marriage o Death certificate, ilagay ang detalye, at magbayad.',
      },
      {
        title: 'O pumunta sa PSA outlet (walk-in)',
        description: 'Kumuha ng queue number at punan ang application on-site.',
      },
      {
        title: 'Isumite at magbayad',
        description: 'Ipasa ang form/ID at bayaran ang fee.',
      },
      {
        title: 'Kunin ang certificate',
        description: 'Via courier (online) o same-day release (walk-in).',
      },
    ],
    timeline: 'Same-day (walk-in); 1-3 linggo (online).',
  },

  'acr-icr': {
    requirements: [
      'Foreign national na may visa (59+ araw ng pananatili sa Pilipinas)',
      'Naka-fill out na ACR I-Card Application Form',
      'Valid passport + photocopies ng bio-page, visa, at admission stamp',
      'Certified true copy ng BOC Order (visa/extension)',
      '2 kopya ng 2x2 colored photo',
      'Bayad: $50 USD + PHP admin fees (Express Lane, Legal Research, Alien Registration)',
    ],
    steps: [
      {
        title: 'Punan ang application form',
        description: 'I-download mula sa BI E-Services o kunin sa BI office.',
      },
      {
        title: 'Isumite para sa pre-screening',
        description: 'Sa BI Main Office (Intramuros) o authorized District/Field Office.',
      },
      {
        title: 'Bayaran ang Order of Payment',
        description: 'Bayaran ang USD card fee at PHP admin fees sa cashier.',
      },
      {
        title: 'Biometric data capture',
        description: 'Larawan, fingerprint scan, at electronic signature.',
      },
      {
        title: 'Kunin ang ACR I-Card',
        description: 'Balikan ang BI office sa petsang nakasaad sa claim stub.',
      },
    ],
    timeline: '2-4 linggo (standard); 7-10 working days (Express Lane).',
  },
};

export function getDocumentGuide(documentId: string): DocumentGuide | undefined {
  return DOCUMENT_GUIDES[documentId as DocumentId];
}
