import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getDocumentHelpPrompt } from '@/constants/documents';
import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/text';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

type DocumentWalaScreenProps = {
  title: string;
};

export function DocumentWalaScreen({ title }: DocumentWalaScreenProps) {
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
            source={require('@/assets/images/mascot/cropped/id_wala.png')}
            style={styles.mascot}
            contentFit="contain"
          />
          <Text style={styles.heading}>WALA pa akong {title}</Text>
          <Text style={styles.message}>
            Tutulungan ka namin hakbang-hakbang — mula sa mga kinakailangan hanggang sa
            direksyon sa pinakamalapit na opisina gamit ang mapa.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: '/ai-assistant',
              params: {
                prompt: getDocumentHelpPrompt(title),
                documentLabel: title,
              },
            })
          }>
          <Text style={styles.buttonText}>Magpatulong sa Aidey AI</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.secondaryButtonPressed,
          ]}
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: '/ai-assistant',
              params: {
                prompt: getDocumentHelpPrompt(title),
                documentLabel: title,
              },
            })
          }>
          <Text style={styles.secondaryButtonText}>Sundin na lang ang hakbang-hakbang</Text>
        </Pressable>
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
  button: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 320,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: brand.teal,
    alignItems: 'center',
    shadowColor: brand.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  secondaryButton: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 320,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    backgroundColor: colors.primary,
    alignItems: 'center',
    shadowColor: brand.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: brand.navy,
  },
});
