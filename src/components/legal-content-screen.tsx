import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/text';
import { useTranslation } from '@/contexts/locale-context';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

export type LegalSection = {
  titleKey: string;
  bodyKey: string;
};

type LegalContentScreenProps = {
  titleKey: string;
  introKey?: string;
  lastUpdatedKey?: string;
  sections: LegalSection[];
  footer?: ReactNode;
};

export function LegalContentScreen({
  titleKey,
  introKey,
  lastUpdatedKey,
  sections,
  footer,
}: LegalContentScreenProps) {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={<Text style={styles.headerTitle}>{t(titleKey)}</Text>} />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {lastUpdatedKey ? (
          <Text style={styles.lastUpdated}>{t(lastUpdatedKey)}</Text>
        ) : null}

        {introKey ? <Text style={styles.intro}>{t(introKey)}</Text> : null}

        {sections.map((section) => (
          <View key={section.titleKey} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t(section.titleKey)}</Text>
            <Text style={styles.sectionBody}>{t(section.bodyKey)}</Text>
          </View>
        ))}

        {footer}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
    color: brand.navy,
    textAlign: 'center',
  },
  scrollArea: {
    flex: 1,
    marginHorizontal: -24,
  },
  scrollContent: {
    gap: 14,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  lastUpdated: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.secondaryPlaceholder,
    paddingHorizontal: 4,
  },
  intro: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.secondary,
    lineHeight: 22,
    paddingHorizontal: 4,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
    shadowColor: brand.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: brand.navy,
    lineHeight: 22,
  },
  sectionBody: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.secondary,
    lineHeight: 22,
  },
});
