import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getDocumentHelpPrompt } from '@/constants/documents';
import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/text';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

type DocumentWalaScreenProps = {
  documentId: string;
  title: string;
};

export function DocumentWalaScreen({ documentId, title }: DocumentWalaScreenProps) {
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
          accessibilityLabel="Magpatulong sa Aidey AI"
          onPress={() =>
            router.push({
              pathname: '/ai-assistant',
              params: {
                prompt: getDocumentHelpPrompt(title),
                documentLabel: title,
                documentId,
              },
            })
          }>
          <View style={styles.buttonIcon}>
            <SymbolView
              name={{
                ios: 'bubble.left.and.bubble.right.fill',
                android: 'chat_bubble',
                web: 'chat_bubble',
              }}
              size={24}
              tintColor={colors.primary}
            />
          </View>
          <Text style={styles.buttonText}>Magpatulong sa Aidey AI</Text>
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={16}
            tintColor={colors.primary}
          />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.secondaryButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Sundin na lang ang hakbang-hakbang"
          onPress={() => router.push(`/documents/${documentId}/steps`)}>
          <View style={styles.secondaryButtonIcon}>
            <SymbolView
              name={{ ios: 'checklist', android: 'checklist', web: 'checklist' }}
              size={24}
              tintColor={brand.navy}
            />
          </View>
          <Text style={styles.secondaryButtonText}>Sundin na lang ang hakbang-hakbang</Text>
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={16}
            tintColor={colors.secondaryPlaceholder}
          />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: brand.teal,
    shadowColor: brand.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  buttonIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    backgroundColor: colors.primary,
    shadowColor: brand.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  secondaryButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.secondaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: brand.navy,
  },
});
