import type { DocumentId } from '@/constants/documents';

import { anyValidId } from './types';
import type { DocumentGuide } from './types';

// Sourced and summarized from assets/GLAK.md (Prerequisites / The Process /
// Estimated Timelines sections for each document).
export const DOCUMENT_GUIDES_EN: Record<DocumentId, DocumentGuide> = {
  'national-id': {
    requirements: [
      {
        label:
          "One (1) original Primary Document: PSA Birth Certificate (with 1 gov't ID), Passport, UMID, or Driver's License/Student Permit",
        documentIds: ['psa-birth-certificate', 'philippine-passport', 'umid', 'drivers-license'],
      },
      'If no primary document: secondary documents with full name, photo, signature, address, and date of birth (e.g. PRC ID, Senior Citizen ID, Voter\'s ID, NBI Clearance, School ID, Barangay ID)',
      'Bring original documents — photocopies are not accepted',
      'The entire registration process is free',
    ],
    steps: [
      {
        title: 'Go to a Registration Center',
        description:
          'Find the nearest PhilSys Registration Center (PSA offices, malls, or LGU). Walk-in only; no appointment required.',
      },
      {
        title: 'Have your documents verified',
        description:
          'Present supporting documents to the Registration Kit Operator (RKO) to verify identity and encode demographic data.',
      },
      {
        title: 'Biometric data collection',
        description: 'You will be captured for 10 fingerprints, iris scans of both eyes, and a front-facing photo.',
      },
      {
        title: 'Get your Transaction Slip',
        description:
          'This contains your Transaction Reference Number (TRN) — important for digital ID access.',
      },
      {
        title: 'Access your Digital ID or ePhilID',
        description:
          'Use the eGovPH Super App for the Digital National ID, or request a printed ePhilID at the registration center while waiting for the physical card.',
      },
    ],
    timeline:
      'Registration takes 30–60 minutes; the physical card may take several months to a year, but the ePhilID/Digital ID is available immediately.',
  },

  'philippine-passport': {
    requirements: [
      {
        label: "1 valid Primary ID (PhilSys National ID, ePhilID, UMID, Driver's License, Postal ID, or PRC ID)",
        documentIds: ['national-id', 'umid', 'drivers-license', 'postal-id', 'prc-id'],
      },
      {
        label: 'Original PSA Birth Certificate (transcribed copy from Local Civil Registrar if details are unclear)',
        documentIds: ['psa-birth-certificate'],
      },
      {
        label: 'PSA Marriage Certificate (for married women using their spouse\'s surname only)',
        documentIds: ['psa-marriage-death-certificate'],
      },
      'Confirmed online appointment from the DFA portal',
      'Fee: ₱950 (Regular) or ₱1,200 (Expedited), plus ~₱50 convenience fee',
    ],
    steps: [
      {
        title: 'Book an online appointment',
        description:
          'Go to passport.gov.ph, select a DFA office, date, and time. Complete the online application form.',
      },
      {
        title: 'Pay the processing fee',
        description:
          'Within 24 hours, pay the fee at an authorized payment center (7-Eleven, Bayad Center, GCash, Maya, or bank).',
      },
      {
        title: 'Print the application packet',
        description:
          'Print on A4 paper the application form, appointment checklist, and e-Receipt sent to your email.',
      },
      {
        title: 'Attend your DFA appointment',
        description: 'Bring the printed packet and all original documents. Personal appearance is required.',
      },
      {
        title: 'Document verification and biometrics',
        description: 'Documents will be processed, and a digital photo, signature, and fingerprints will be taken.',
      },
      {
        title: 'Claim your passport',
        description: 'Pick up in person at the DFA office or avail of courier delivery.',
      },
    ],
    timeline: '5–12 working days depending on processing type and location.',
  },

  'drivers-license': {
    requirements: [
      'Active LTMS Portal account (portal.lto.gov.ph)',
      'Valid Student Permit (must be held for 31+ days)',
      'Practical Driving Course (PDC) Certificate from an accredited driving school',
      'Medical Certificate from an LTO-accredited clinic (within 60 days)',
      'Completed Application for Permits and License (APL) Form',
      { label: 'TIN (if employed)', documentIds: ['tin-id'] },
      'For 17-year-olds: notarized consent letter from parent/guardian + ID',
      'Fee: ₱685 (₱100 application + ₱585 license fee), plus medical exam and PDC course fees',
    ],
    steps: [
      {
        title: 'Check your LTMS account',
        description:
          'Ensure your driving school and clinic have transmitted your PDC Certificate and Medical Certificate to LTMS.',
      },
      {
        title: 'Go to an LTO branch',
        description:
          'Submit your Student Permit, Medical Certificate, PDC Certificate, and APL form at the Evaluation window.',
      },
      {
        title: 'Pay the application fee',
        description: 'Pay the ₱100 Application Fee and get your Official Receipt.',
      },
      {
        title: 'Take the theoretical exam',
        description: 'Computerized exam on traffic laws — you need 48/60 to pass.',
      },
      {
        title: 'Take the practical driving test',
        description: 'Demonstrate driving ability in front of an LTO examiner.',
      },
      {
        title: 'Biometrics and license fee payment',
        description: 'Photo, signature, and fingerprints will be taken, then pay the ₱585 License Fee.',
      },
      {
        title: "Claim your Driver's License",
        description: 'Sign the release logbook and collect your card or temporary receipt.',
      },
    ],
    timeline: "3–5 hours at the LTO branch; the new license is valid for 5 years.",
  },

  umid: {
    requirements: [
      'Existing SSS-issued UMID card (upgrade only — new UMID applications are no longer accepted)',
      'Active My.SSS account',
      'Updated contact info (mobile and email) in SSS records',
      'Smartphone for the UnionBank app',
      'Upgrade is free',
    ],
    steps: [
      {
        title: 'Provide consent in My.SSS',
        description: "Log in to My.SSS and click 'Provide Consent' for the UMID ATM Pay Card Upgrade.",
      },
      {
        title: 'Download the UnionBank app',
        description: 'Install the UnionBank Online App and select a new account.',
      },
      {
        title: 'Select the Government Card option',
        description: "Choose 'Government Cards with Savings Account' then enter your SSS details.",
      },
      {
        title: 'Complete eKYC verification',
        description: 'Enter the OTP, take a live selfie scan, and provide a digital signature.',
      },
      {
        title: 'Wait for delivery and activate',
        description: 'When the card arrives, activate it in the app and set your 6-digit ATM PIN.',
      },
    ],
    timeline: '15 banking days (Metro Manila) to 20 banking days (provinces).',
  },

  'postal-id': {
    requirements: [
      'Two (2) copies of the Postal ID (PID) Application Form',
      {
        label: "1 Primary ID (PSA Birth Certificate, National ID/ePhilID, UMID, Driver's License, or Passport) or 2 secondary IDs if no primary",
        documentIds: ['psa-birth-certificate', 'national-id', 'umid', 'drivers-license', 'philippine-passport'],
      },
      'Proof of Address (Barangay Certificate of Residency, utility bill, or bank statement)',
      'Fee: ₱550 (Regular) or ₱650 (Rush)',
    ],
    steps: [
      {
        title: 'Fill out the application form',
        description: 'Complete 2 copies of the PID form with no blank fields.',
      },
      {
        title: 'Submit documents and pay',
        description:
          'Go to a PHLPost branch, submit documents, pay the fee, and keep the receipt.',
      },
      {
        title: 'Biometrics data capture',
        description: 'Photo, fingerprints, and digital signature will be taken.',
      },
      {
        title: 'Wait for delivery',
        description:
          'Regular Postal ID will be mailed to your address; Rush processing may offer same-day release.',
      },
    ],
    timeline: '10–30 working days (Regular); same-day to next working day (Rush at major branches).',
  },

  'voters-id': {
    requirements: [
      'Active/registered voter status (not deactivated)',
      anyValidId('1 valid government-issued ID'),
      'Fee: ₱75 (free for Senior Citizens, PWD, IP, and Indigent)',
      'If through a representative: authorization letter + IDs of both parties',
    ],
    steps: [
      {
        title: 'Go to a COMELEC office',
        description:
          "Visit the Office of the Election Officer (OEO) where you are registered, or the COMELEC Main Office in Intramuros.",
      },
      {
        title: 'Verify your registration record',
        description: 'Present a valid ID to verify active status in the Voter Registration System.',
      },
      {
        title: 'Pay the certification fee',
        description: 'Pay ₱75 at the cashier and get your Official Receipt (or show exemption proof).',
      },
      {
        title: "Claim your Voter's Certification",
        description:
          'Verify the details before leaving — it bears the COMELEC dry seal and Election Officer signature.',
      },
    ],
    timeline: 'Same-day release, typically 15–30 minutes.',
  },

  'sss-id': {
    requirements: [
      'Permanent SS Number (birth/marriage documents already submitted)',
      'Active My.SSS account',
      'Updated address, mobile number, and email in SSS records',
      {
        label: 'Registered in PhilSys National ID (used for eVerify biometrics)',
        documentIds: ['national-id'],
      },
      'Name and date of birth must match SSS and National ID records',
      'No application fee; partner bank may require a minimal deposit',
    ],
    steps: [
      {
        title: 'Verify records and start application',
        description: 'Log in to My.SSS, go to Services > MySSS Card, and review your details.',
      },
      {
        title: 'Allow National ID eVerify',
        description: 'Consent for SSS to verify your identity using PhilSys records.',
      },
      {
        title: 'Facial scan and bank selection',
        description: 'Complete the facial scan and choose a partner bank.',
      },
      {
        title: 'Open a bank account',
        description: 'Download the partner bank app (e.g. UnionBank/DiskarTech) and complete onboarding.',
      },
      {
        title: 'Claim your card',
        description: 'Wait for notification from the bank for delivery or pick-up.',
      },
    ],
    timeline: '15 working days (Metro Manila) to 20 working days (provinces).',
  },

  'gsis-e-card': {
    requirements: [
      'Active government employee/GSIS member, new pensioner, or legal guardian',
      'Completed GSIS UMID-eCard Enrollment Form',
      anyValidId('2 valid government-issued IDs'),
      'Free for first-time applicants; replacement fee (~₱200) for lost card replacement',
    ],
    steps: [
      {
        title: 'Fill out the Enrollment Form',
        description: 'Select your servicing bank (UnionBank or LandBank) on the form.',
      },
      {
        title: 'Go to a GSIS office',
        description: 'Submit the form and 2 valid IDs at the eCard enrollment area.',
      },
      {
        title: 'Biometrics data capture',
        description: 'Photo, signature, and fingerprints will be taken.',
      },
      {
        title: 'Wait for SMS confirmation',
        description: 'Not same-day release — wait for a text on where/when to claim the card.',
      },
      {
        title: 'Claim and activate your eCard',
        description: 'Activate at a G-W@PS kiosk using the fingerprint scanner.',
      },
    ],
    timeline: '~30 calendar days from biometrics to printing.',
  },

  'philhealth-id': {
    requirements: [
      'Two (2) copies of PhilHealth Member Registration Form (PMRF)',
      anyValidId('1 valid government-issued ID'),
      {
        label: 'PSA Birth Certificate (for first-time registrants)',
        documentIds: ['psa-birth-certificate'],
      },
      '2 copies of 1x1 ID photo',
      'Notarized Affidavit of Loss (for lost ID replacement)',
      'Regular ID is free; ₱90–₱150 for PVC upgrade',
    ],
    steps: [
      {
        title: '(Optional) Get a PIN online',
        description: 'Register on the PhilHealth Member Portal and upload your PSA Birth Certificate.',
      },
      {
        title: 'Fill out the PMRF',
        description: 'Enter your PIN if you already have one from a previous employer or online registration.',
      },
      {
        title: 'Go to a PhilHealth office',
        description: 'Visit an LHIO or PhilHealth Express branch.',
      },
      {
        title: 'Submit your documents',
        description: 'Submit the PMRF, valid ID, and Birth Certificate for evaluation.',
      },
      {
        title: 'Claim your ID and MDR',
        description: 'ID and Member Data Record are printed on the spot; sign the card.',
      },
    ],
    timeline: 'Same-day walk-in processing; 3–5 working days for online PIN registration.',
  },

  'pag-ibig-id': {
    requirements: [
      'Active membership (at least 1 posted monthly contribution in the past 6 months)',
      'Permanent Pag-IBIG MID Number',
      "Updated member records (Member's Data Form if updates are needed)",
      'Completed Pag-IBIG Loyalty Card Plus Application Form (HQP-PFF-108)',
      anyValidId('1 valid primary government ID'),
      'Fee: ₱125',
    ],
    steps: [
      {
        title: 'Fill out the application form',
        description: 'Ensure nothing is erased and details match your ID.',
      },
      {
        title: 'Go to a Pag-IBIG branch',
        description: 'Visit a branch with a Loyalty Card Plus enrollment kiosk.',
      },
      {
        title: 'Pay the card fee',
        description: 'Pay ₱125 at the cashier.',
      },
      {
        title: 'Biometrics data capture',
        description: 'Photo, fingerprints, and digital signature at the partner-bank kiosk.',
      },
      {
        title: 'Claim your card',
        description: 'Card is printed immediately — link it to your mobile banking app to monitor.',
      },
    ],
    timeline: 'Same-day release — arrive early as there is a daily cut-off for printing.',
  },

  'senior-citizen-id': {
    requirements: [
      '60 years old or above',
      {
        label: 'PSA-issued Birth Certificate (or valid ID with date of birth)',
        documentIds: ['psa-birth-certificate', 'national-id', 'philippine-passport', 'drivers-license'],
      },
      {
        label: 'Barangay Certificate of Residency or utility bill',
        documentIds: ['barangay-id'],
      },
      '2-3 copies of 1x1/2x2 ID photo',
      'Completed OSCA Application Form',
      'The entire process is free',
    ],
    steps: [
      {
        title: 'Get and fill out the application form',
        description: 'At the OSCA office or Barangay Hall. A representative may apply if bedridden or homebound.',
      },
      {
        title: 'Submit your documents',
        description: 'For age and residency verification.',
      },
      {
        title: 'Sign and provide a thumbmark',
        description: 'On the ID card and OSCA logbook.',
      },
      {
        title: 'Claim your ID and booklets',
        description: 'Includes Medicine Booklet and Grocery Booklet for discounts.',
      },
    ],
    timeline: 'Same-day at many LGUs; 1–7 working days in some provinces.',
  },

  'pwd-id': {
    requirements: [
      'Proof of Disability: Medical Certificate from a specialist (non-apparent) or photo/Certificate of Disability (apparent)',
      'Completed PRPWD Application Form',
      '2 copies of 1x1/2x2 ID photo',
      anyValidId('1 valid government-issued ID with current address'),
      'Authorization letter if applying through a representative',
      'The entire process is free',
    ],
    steps: [
      {
        title: 'Fill out the application form',
        description: 'Ensure all details match your valid ID and medical certificate.',
      },
      {
        title: 'Complete medical clearance',
        description:
          'Obtain a certificate from a specialist or Certificate of Disability at the City/Municipal Health Office.',
      },
      {
        title: 'Submit to PDAO/MSWDO',
        description: 'Submit the form, medical documents, photos, and ID photocopies.',
      },
      {
        title: 'Wait for data encoding',
        description: 'Data will be encoded in the DOH PRPWD system to obtain your permanent PWD ID number.',
      },
      {
        title: 'Claim your PWD ID',
        description: 'Includes Medicine Booklet and Grocery Booklet.',
      },
    ],
    timeline: '1–3 working days; same-day possible at some LGUs.',
  },

  'solo-parent-id': {
    requirements: [
      'Proof of Solo Parent status depending on situation (PSA Death Certificate, Barangay Certification/Affidavit, court decree, or medical certificate)',
      {
        label: "Child's PSA Birth Certificate",
        documentIds: ['psa-birth-certificate'],
      },
      {
        label: 'Barangay Certificate of Residency (6 months residency)',
        documentIds: ['barangay-id'],
      },
      'ITR or Certificate of Indigency',
      '2 copies of 1x1/2x2 ID photo',
      'Completed Solo Parent Registration Form',
      'The entire process is free',
    ],
    steps: [
      {
        title: 'Get the application form',
        description: 'At the LSWDO or Solo Parents Office (SPO) of the City/Municipal Hall.',
      },
      {
        title: 'Submit your documents',
        description: 'A social worker will receive them and issue an acknowledgment receipt.',
      },
      {
        title: 'Undergo an interview',
        description: 'A social worker will verify your situation as a solo parent.',
      },
      {
        title: 'Wait for LGU verification',
        description: 'A background check at the barangay may be conducted.',
      },
      {
        title: 'Claim your Solo Parent ID',
        description: 'Includes Solo Parent Booklet for discounts and subsidies.',
      },
    ],
    timeline: '7–15 working days; up to 30 days with additional verification. Valid for 1 year.',
  },

  '4ps-id': {
    requirements: [
      'Official notification from DSWD/CBMS that the household is qualified',
      { label: 'PhilSys National ID', documentIds: ['national-id'] },
      {
        label: 'PSA Birth Certificates of all family members',
        documentIds: ['psa-birth-certificate'],
      },
      { label: 'Marriage Certificate (if applicable)', documentIds: ['psa-marriage-death-certificate'] },
      'School enrollment records and health/immunization records',
      'The entire process is free',
    ],
    steps: [
      {
        title: 'Wait for notification',
        description: 'The barangay or City/Municipal Link will inform you if the household qualifies.',
      },
      {
        title: 'Attend the Community Assembly',
        description: 'Undergo a validation interview with a DSWD social worker.',
      },
      {
        title: 'Authenticate your identity',
        description: 'Present your PhilSys National ID and supporting documents.',
      },
      {
        title: 'Sign the Oath of Commitment',
        description:
          'Agree to program conditions (school attendance, health check-ups, etc.).',
      },
      {
        title: 'Wait for ID processing',
        description: 'The 4Ps ID will be processed and distributed through the City/Municipal Link.',
      },
    ],
    timeline: '1–2 months until enrollment; 2–6 months for ID and cash card release.',
  },

  'prc-id': {
    requirements: [
      'Active LERIS account (online.prc.gov.ph)',
      'Printed Oath Form (auto-generated after payment)',
      'Original Notice of Admission (NOA) + photocopy',
      { label: 'Valid Community Tax Certificate (Cedula)', documentIds: ['cedula'] },
      '2 copies of ID photo in collared attire',
      '2 documentary stamps',
      'Fee: ₱1,050 (Baccalaureate) or ₱870 (Non-Baccalaureate)',
    ],
    steps: [
      {
        title: 'Update your LERIS profile',
        description: 'Upload a new 2x2 photo per PRC guidelines.',
      },
      {
        title: 'Book an Initial Registration appointment',
        description: 'Select profession, enter Application Number, choose branch, date, and time.',
      },
      {
        title: 'Pay fees online',
        description: 'Via GCash, PayMaya, or LandBank.',
      },
      {
        title: 'Print the Oath Form',
        description: 'Do not sign until in front of a PRC officer.',
      },
      {
        title: 'Submit documents at PRC',
        description: 'Personal appearance with all requirements.',
      },
      {
        title: 'Sign the Registry Book',
        description: 'You will receive a claim slip for ID release.',
      },
      {
        title: 'Attend Oath-Taking',
        description:
          'Required before you can officially practice your profession and claim your ID.',
      },
    ],
    timeline: '1–2 hours at the PRC office; ID release 3–7 working days after oath-taking. Valid for 3 years.',
  },

  'ibp-id': {
    requirements: [
      'Active Roll Number (enrolled in Roll of Attorneys at the Supreme Court)',
      'Good standing status — no outstanding dues or pending disciplinary case',
      'High-resolution 2x2 ID photo (blazer or Barong)',
      'IBP Lawyers ID Form (for manual/email application)',
      'Fee: ₱350 (ID fee) + ₱200 (courier, optional)',
    ],
    steps: [
      {
        title: 'Update your dues',
        description: 'Ensure annual dues are paid on the myIBP app.',
      },
      {
        title: 'Submit application',
        description: 'Via myIBP app or email to IBP National Office with photo and proof of payment.',
      },
      {
        title: 'Wait for Chapter Endorsement',
        description:
          'Your local IBP chapter will verify membership status before endorsing to the National Office.',
      },
      {
        title: 'Claim your IBP ID',
        description: 'Delivery or personal pick-up at IBP Main Office in Pasig.',
      },
    ],
    timeline: '3–5 working days processing after chapter endorsement; +3–7 days if courier.',
  },

  'tin-id': {
    requirements: [
      'Active email address',
      anyValidId('Valid government-issued ID (photo/scan)'),
      '1x1 digital photo with white background, taken within the last 6 months',
      'ORUS account (orus.bir.gov.ph)',
    ],
    steps: [
      {
        title: 'Register or log in to ORUS',
        description: 'Create an account as an Individual.',
      },
      {
        title: 'Update personal information',
        description: 'Ensure your email address is verified and up to date.',
      },
      {
        title: 'Upload your photo',
        description: 'Follow strict specifications (white background, front-facing, no face coverings).',
      },
      {
        title: 'Submit and generate',
        description: 'Download your Digital TIN ID from your ORUS profile.',
      },
      {
        title: '(Optional) Sync with eGovPH app',
        description: 'Access your Digital TIN ID as a mobile ID wallet card.',
      },
    ],
    timeline: 'Digital TIN ID is instant; ₱100 fee for physical card at RDO.',
  },

  'seamans-book': {
    requirements: [
      {
        label: 'PSA Birth Certificate (SECPA) or valid Philippine Passport',
        documentIds: ['psa-birth-certificate', 'philippine-passport'],
      },
      { label: 'Valid, multi-purpose NBI Clearance', documentIds: ['nbi-clearance'] },
      'Basic Safety Training (BST) or Basic Training (BT) Certificate',
      'Official Receipt of Basic Training course',
      {
        label: 'PSA Marriage Contract (for married women)',
        documentIds: ['psa-marriage-death-certificate'],
      },
      'Fee: ₱1,000 (New/Renewal) or ₱1,800 (Onboard/Expedited)',
    ],
    steps: [
      {
        title: 'Register on the eGovPH App',
        description: 'Create an account and complete profile verification.',
      },
      {
        title: 'Book an appointment',
        description: "Select Seafarer's Record Book (SRB) in the MARINA services section.",
      },
      {
        title: 'Fill out the application',
        description: 'Upload clear scans of requirements.',
      },
      {
        title: 'Submit and pay',
        description: 'Pay within the app; you will receive a confirmation email.',
      },
      {
        title: 'Go to a MARINA office',
        description: 'Arrive 1 hour before your schedule with printed confirmation and 2 documentary stamps.',
      },
      {
        title: 'Biometrics and data capture',
        description: 'Photo, signature, and fingerprint scanning — collared shirt required.',
      },
      {
        title: 'Claim your SRB',
        description: 'Usually released within 2-3 hours after data capture.',
      },
    ],
    timeline: 'Next-day slots may be available; ~2.5 hours processing at the MARINA office.',
  },

  'owwa-id': {
    requirements: [
      'Active OWWA Membership (valid 2 years from payment)',
      { label: 'Valid Passport (6+ months validity)', documentIds: ['philippine-passport'] },
      'Overseas Employment Certificate (OEC) or Balik-Manggagawa Exemption Number',
      'Account on OWWA portal or eGovPH app',
    ],
    steps: [
      {
        title: 'Verify membership status',
        description: "Check on the OWWA Mobile App or website if status is 'Active'; renew if not.",
      },
      {
        title: 'Access the Digital e-Card',
        description:
          'Automatically generated when membership is active — available on eGovPH or OWWA app.',
      },
      {
        title: '(Optional) Apply for a physical e-Card',
        description: 'Go to OWWA Central Office, Regional Welfare Office, or NAIA counters.',
      },
      {
        title: 'Data capture',
        description: 'Present passport and OEC; photo and digital signature will be taken.',
      },
      {
        title: 'Claim/wait for delivery',
        description: 'Same-day at major hubs; several weeks if regional.',
      },
    ],
    timeline: 'Digital e-Card is instant; same-day to 3-4 weeks for physical card.',
  },

  'afp-military-id': {
    requirements: [
      'Completed Application Form from Unit Adjutant/OTAG',
      anyValidId('Your own valid government-issued ID'),
      {
        label:
          'PSA-certified proof of relationship (Marriage Contract/CENOMAR for spouse, Birth Certificate for child/parent)',
        documentIds: ['psa-marriage-death-certificate', 'psa-birth-certificate'],
      },
      'Military Orders (Retirement/Separation or Promotion/Re-enlistment Orders)',
      'AFP-issued Declaration of Legal Beneficiaries from JAGO/PGMC',
      '2x2 ID photos (15 days old or less)',
      'Affidavit of Loss + Police Blotter for lost ID replacement',
    ],
    steps: [
      {
        title: 'Contact your military unit',
        description: 'Obtain the official application form from the Unit Adjutant.',
      },
      {
        title: 'Fill out and get form endorsed',
        description: 'Requires signature of Unit Commander or Adjutant.',
      },
      {
        title: 'Submit documents',
        description: 'At the admin office of your branch (OTAG, Army, Navy, or Air Force).',
      },
      {
        title: 'Verification and biometrics',
        description: 'Personal appearance for photo, signature, and thumbprint.',
      },
      {
        title: 'Claim your ID',
        description: 'Sign the release logbook after approval.',
      },
    ],
    timeline: '1–4 weeks depending on unit workload.',
  },

  'pvao-id': {
    requirements: [
      'Active PVAO Pension status',
      'Completed PPISO Application Form',
      anyValidId('2 valid government-issued IDs'),
      '2 copies of 2x2 photo with white background',
      {
        label: 'Barangay Clearance + newspaper photo (if not personal appearance) or SPA (if representative)',
        documentIds: ['barangay-id'],
      },
    ],
    steps: [
      {
        title: 'Get the application form',
        description: 'At Veterans Field Service Unit (VFSU) or E-Veterans portal.',
      },
      {
        title: 'Fill out the form',
        description: 'Use a black sign pen for thumbprint and signature.',
      },
      {
        title: 'Submit requirements',
        description: 'At PPISO in Camp Aguinaldo or your local VFSU.',
      },
      {
        title: 'Biometric data capture',
        description: 'Photo and thumbprints (or follow special requirements if through a representative).',
      },
      {
        title: 'Claim your ID',
        description: 'Wait for notification from PPISO or VFSU.',
      },
    ],
    timeline: '15–30 working days; application and ID are free.',
  },

  'gocc-id': {
    requirements: [
      'Employment or appointment at a government office/GOCC (Certificate of Employment or Appointment Order)',
      anyValidId('1-2 valid government-issued IDs'),
      '2x2 ID photo (white background)',
      'Completed ID application/request form from HR or Admin office',
      'Usually free — depends on agency policy',
    ],
    steps: [
      {
        title: 'Contact HR/Admin office',
        description: 'Ask for the official ID request form and your agency\'s requirements.',
      },
      {
        title: 'Submit documents',
        description: 'Submit the form, appointment order, and ID photo to HR/Admin.',
      },
      {
        title: 'Biometrics/data capture',
        description: 'Photo and signature taken if required by the agency.',
      },
      {
        title: 'Claim your office ID',
        description: 'Pick up at HR/Admin office or Personnel section after processing.',
      },
    ],
    timeline: 'Varies by agency — typically a few days to several weeks.',
  },

  'nbi-clearance': {
    requirements: [
      'Active email and mobile number',
      anyValidId('2 original, unexpired valid government-issued IDs'),
      'Fee: ₱155 (free for First-Time Job Seekers with Barangay Certification)',
      'Device with internet access',
    ],
    steps: [
      {
        title: 'Register online',
        description:
          'Create an account at clearance.nbi.gov.ph with email and mobile number; verify with OTP.',
      },
      {
        title: 'Complete your profile',
        description: 'Enter civil status, physical attributes, and family background.',
      },
      {
        title: 'Book an appointment',
        description: 'Select valid IDs, NBI branch, date, and time.',
      },
      {
        title: 'Pay online',
        description: 'Choose a payment method and keep the Reference Number as your gate pass.',
      },
      {
        title: 'Personal appearance and biometrics',
        description: 'Present Reference Number and 2 valid IDs; fingerprint scan, photo, and digital signature.',
      },
      {
        title: 'Claim your clearance',
        description: "Same-day release if no 'HIT'; 8-15 days if a hit requires verification.",
      },
    ],
    timeline: '10-15 minutes online; same-day at branch if no hit.',
  },

  'police-clearance': {
    requirements: [
      'Active email address',
      anyValidId('2 original valid government-issued IDs'),
      'Fee: ~₱150',
      'Device with internet',
      'Barangay Certification for First-Time Job Seeker (if availing of free processing)',
    ],
    steps: [
      {
        title: 'Register online',
        description: 'Create an account at pnpclearance.ph and verify your email.',
      },
      {
        title: 'Complete your profile',
        description: 'Enter address, civil status, and contact information.',
      },
      {
        title: 'Schedule an appointment',
        description: 'Select the nearest Police Station, date, and time.',
      },
      {
        title: 'Pay online',
        description: 'Pay the fee and keep the Reference Number.',
      },
      {
        title: 'Go to the Police Station',
        description: 'Present receipt, Reference Number, and 2 valid IDs; biometrics capture.',
      },
      {
        title: 'Claim your clearance',
        description: "Released immediately if there is no 'hit' on record.",
      },
    ],
    timeline: 'Same-day release, 10-15 minutes after biometrics.',
  },

  'barangay-id': {
    requirements: [
      anyValidId('1 valid government-issued photo ID'),
      { label: 'Updated Community Tax Certificate (Cedula)', documentIds: ['cedula'] },
      'Proof of residency (utility bill or lease contract) — 6 months residency',
      'Application form (free at Barangay Hall)',
      'Fee: ₱20–₱150 depending on barangay ordinance',
    ],
    steps: [
      {
        title: 'Get and fill out the application form',
        description: 'At the Barangay Hall, enter the correct purpose of request.',
      },
      {
        title: 'Submit documents',
        description: 'Barangay Secretary will verify and cross-check the blotter database.',
      },
      {
        title: 'Pay the fee',
        description: 'At the Barangay Treasurer, get your Official Receipt.',
      },
      {
        title: 'Biometrics and signing',
        description: 'Signature, thumbmark, and possibly a photo.',
      },
      {
        title: 'Claim your Barangay Clearance/ID',
        description: 'Must bear the Barangay Captain signature and dry seal.',
      },
    ],
    timeline: '15–30 minutes; valid for 6 months.',
  },

  cedula: {
    requirements: [
      anyValidId('1 valid government-issued photo ID'),
      'Proof of income (payslip, Certificate of Compensation, or BIR 2316) if applicable',
      'Community Tax Declaration Form (CTDF) — free at the office',
      'Fee: ₱5 basic tax + ₱1 per ₱1,000 of annual income/property value',
    ],
    steps: [
      {
        title: 'Check eligibility',
        description: '18 years old or above and resident of the locality.',
      },
      {
        title: 'Get and fill out the CTDF',
        description: 'At the Treasurer\u2019s Office of City/Municipal/Barangay Hall.',
      },
      {
        title: 'Submit for assessment',
        description: 'Form and proof of income will be evaluated to calculate the fee.',
      },
      {
        title: 'Pay and provide thumbmark',
        description: 'At the cashier, after signing and providing your right thumbprint.',
      },
      {
        title: 'Claim your Cedula',
        description: 'Verify name, address, and purpose before leaving.',
      },
    ],
    timeline: '5-20 minutes; valid only until December 31 of the year issued.',
  },

  'firearms-license': {
    requirements: [
      {
        label: 'PSA Birth Certificate or valid Passport',
        documentIds: ['psa-birth-certificate', 'philippine-passport'],
      },
      { label: 'Valid NBI Clearance', documentIds: ['nbi-clearance'] },
      { label: 'National Police Clearance', documentIds: ['police-clearance'] },
      'Neuro-Psychiatric Clearance and Drug Test Result',
      'Gun Safety and Responsible Gun Ownership (GSRGO) Certificate',
      'Proof of Income (ITR, Certificate of Employment, Business Permit, or Oath of Office)',
      {
        label: 'Proof of Billing or Barangay Clearance',
        documentIds: ['barangay-id'],
      },
      anyValidId('2 valid government-issued IDs and 2x2 photos'),
      'Notarized LTOPF Application Form',
      'Fee: ₱1,200–₱10,200 depending on Type 1-5',
    ],
    steps: [
      {
        title: 'Create an FEO online account',
        description: 'At feo.pnp.gov.ph, complete your profile.',
      },
      {
        title: 'Obtain clearances and seminar',
        description: 'Attend Gun Safety Seminar, Drug Test, and Neuro-Psychiatric Exam.',
      },
      {
        title: 'Apply online',
        description: 'Upload all scanned requirements to your FEO account.',
      },
      {
        title: 'Pay the assessment',
        description: 'Pay the fee at Landbank using the Order of Payment.',
      },
      {
        title: 'Personal appearance at FEO',
        description: 'Bring all original documents to Camp Crame or RCSU.',
      },
      {
        title: 'Biometrics and LTOPF release',
        description: 'Biometrics taken if needed, then card is released.',
      },
    ],
    timeline: '1-3 days for clearances; 3-7 days for online assessment; same-day release on office visit.',
  },

  'psa-birth-certificate': {
    requirements: [
      'Full name, date, and place of birth, including parents\' names',
      anyValidId('1 valid government-issued ID of the requester'),
      'Authorization letter + ID if applying through a representative',
      'Fee: ₱365 (online, with delivery) or ₱155 (walk-in)',
    ],
    steps: [
      {
        title: 'Choose a method: Online or Walk-in',
        description: 'Order at PSAHelpline.ph or visit a PSA outlet in person.',
      },
      {
        title: 'Order online at PSAHelpline.ph',
        description: 'Fill out the order form, select quantity, and pay (GCash, Maya, card, etc.).',
      },
      {
        title: 'Or visit a PSA outlet (walk-in)',
        description: 'Get a queue number and fill out the application form on-site.',
      },
      {
        title: 'Submit and pay',
        description: 'Submit form/ID, pay the fee, get reference/claim stub.',
      },
      {
        title: 'Claim your certificate',
        description: 'Via courier delivery (online) or same-day release (walk-in).',
      },
    ],
    timeline: 'Same-day (walk-in, 1-3 hours); 1-3 weeks (online end-to-end).',
  },

  'psa-marriage-death-certificate': {
    requirements: [
      'For Marriage: full names of spouses, date and place of marriage',
      'For Death: full name, date, and place of death of the deceased',
      anyValidId('1 valid government-issued ID of requester (married party or immediate family member)'),
      'Authorization letter + ID if applying through a representative',
      'Fee: ₱365 (online) or ₱155 (walk-in)',
    ],
    steps: [
      {
        title: 'Choose a method: Online or Walk-in',
        description: 'Order at PSAHelpline.ph or visit a PSA outlet in person.',
      },
      {
        title: 'Order online at PSAHelpline.ph',
        description: 'Select Marriage or Death certificate, enter details, and pay.',
      },
      {
        title: 'Or visit a PSA outlet (walk-in)',
        description: 'Get a queue number and fill out the application on-site.',
      },
      {
        title: 'Submit and pay',
        description: 'Submit form/ID and pay the fee.',
      },
      {
        title: 'Claim your certificate',
        description: 'Via courier (online) or same-day release (walk-in).',
      },
    ],
    timeline: 'Same-day (walk-in); 1-3 weeks (online).',
  },

  'acr-icr': {
    requirements: [
      'Foreign national with visa (59+ days stay in the Philippines)',
      'Completed ACR I-Card Application Form',
      'Valid passport + photocopies of bio-page, visa, and admission stamp',
      'Certified true copy of BOC Order (visa/extension)',
      '2 copies of 2x2 colored photo',
      'Fee: $50 USD + PHP admin fees (Express Lane, Legal Research, Alien Registration)',
    ],
    steps: [
      {
        title: 'Fill out the application form',
        description: 'Download from BI E-Services or get one at a BI office.',
      },
      {
        title: 'Submit for pre-screening',
        description: 'At BI Main Office (Intramuros) or authorized District/Field Office.',
      },
      {
        title: 'Pay the Order of Payment',
        description: 'Pay USD card fee and PHP admin fees at the cashier.',
      },
      {
        title: 'Biometric data capture',
        description: 'Photo, fingerprint scan, and electronic signature.',
      },
      {
        title: 'Claim your ACR I-Card',
        description: 'Return to the BI office on the date indicated on the claim stub.',
      },
    ],
    timeline: '2-4 weeks (standard); 7-10 working days (Express Lane).',
  },
};
