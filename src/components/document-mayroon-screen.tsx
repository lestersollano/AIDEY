import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DocumentUploadPanel } from '@/components/document-upload-panel';
import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/text';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

type DocumentMayroonScreenProps = {
  documentId: string;
  title: string;
};

export function DocumentMayroonScreen({ documentId, title }: DocumentMayroonScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={<Text style={styles.headerTitle}>{title}</Text>}
      />

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image
            source={require('@/assets/images/mascot/cropped/id_mayroon.png')}
            style={styles.mascot}
            contentFit="contain"
          />
          <Text style={styles.heading}>MAYROON na akong {title}</Text>
          <Text style={styles.message}>
            I-upload ang iyong {title} para mai-save ito sa Aidey at madaling mahanap kapag
            kailangan mo.
          </Text>
        </View>

        <DocumentUploadPanel documentId={documentId} title={title} />
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
    marginTop: 16,
  },
  scrollContent: {
    flexGrow: 1,
    gap: 24,
    paddingBottom: 32,
  },
  hero: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 8,
  },
  mascot: {
    width: 160,
    height: 160,
  },
  heading: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: brand.navy,
    textAlign: 'center',
  },
  message: {
    maxWidth: 320,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
