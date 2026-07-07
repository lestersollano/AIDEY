import { LegalContentScreen } from '@/components/legal-content-screen';
import { PRIVACY_SECTIONS } from '@/constants/legal-sections';

export default function PrivacyPolicyScreen() {
  return (
    <LegalContentScreen
      titleKey="settings.privacyPolicy"
      introKey="legal.privacy.intro"
      lastUpdatedKey="legal.privacy.lastUpdated"
      sections={PRIVACY_SECTIONS}
    />
  );
}
