import { LegalContentScreen } from '@/components/legal-content-screen';
import { HELP_SECTIONS } from '@/constants/legal-sections';

export default function HelpScreen() {
  return (
    <LegalContentScreen
      titleKey="settings.help"
      introKey="legal.help.intro"
      lastUpdatedKey="legal.help.lastUpdated"
      sections={HELP_SECTIONS}
    />
  );
}
