import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/text';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

type DocumentMayroonScreenProps = {
  title: string;
};

export function DocumentMayroonScreen({ title }: DocumentMayroonScreenProps) {
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

        <Pressable
          style={({ pressed }) => [styles.uploadCard, pressed && styles.uploadCardPressed]}
          accessibilityRole="button"
          accessibilityLabel={`I-upload ang ${title}`}>
          <View style={styles.uploadIcon}>
            <SymbolView
              name={{ ios: 'plus', android: 'add', web: 'add' }}
              size={24}
              tintColor={brand.navy}
            />
          </View>
          <View style={styles.uploadText}>
            <Text style={styles.uploadLabel}>I-upload ang {title}</Text>
            <Text style={styles.uploadHint}>Pindutin para pumili ng larawan</Text>
          </View>
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

const cardShadow = {
  shadowColor: brand.navy,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
} as const;

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
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    backgroundColor: colors.primary,
    ...cardShadow,
  },
  uploadCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.secondaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    flex: 1,
    gap: 4,
  },
  uploadLabel: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: brand.navy,
  },
  uploadHint: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.secondary,
  },
});
