import { LegalContentScreen } from '@/components/legal-content-screen';
import { TERMS_SECTIONS } from '@/constants/legal-sections';

export default function TermsScreen() {
  return (
    <LegalContentScreen
      titleKey="settings.termsAndConditions"
      introKey="legal.terms.intro"
      lastUpdatedKey="legal.terms.lastUpdated"
      sections={TERMS_SECTIONS}
    />
  );
}
