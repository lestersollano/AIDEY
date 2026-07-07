import { LegalContentScreen } from '@/components/legal-content-screen';
import { ABOUT_SECTIONS } from '@/constants/legal-sections';

export default function AboutScreen() {
  return (
    <LegalContentScreen
      titleKey="settings.about"
      introKey="legal.about.intro"
      lastUpdatedKey="legal.about.lastUpdated"
      sections={ABOUT_SECTIONS}
    />
  );
}
