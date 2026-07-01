import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/text';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import {
  addDocumentImage,
  getDocumentImages,
  removeDocumentImage,
  type DocumentImageRecord,
} from '@/services/document-uploads';

type DocumentMayroonScreenProps = {
  documentId: string;
  title: string;
};

export function DocumentMayroonScreen({ documentId, title }: DocumentMayroonScreenProps) {
  const [images, setImages] = useState<DocumentImageRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    void getDocumentImages(documentId).then(setImages);
  }, [documentId]);

  useFocusEffect(refresh);

  const persistImage = useCallback(
    async (uri: string) => {
      setIsSaving(true);

      try {
        await addDocumentImage(documentId, uri);
        refresh();
      } catch (error) {
        console.warn('Failed to save document image', error);
        Alert.alert(
          'Hindi ma-save ang larawan',
          'Pakisubukang muli. Siguraduhing may sapat na espasyo ang iyong device.',
        );
      } finally {
        setIsSaving(false);
      }
    },
    [documentId, refresh],
  );

  const handleRemoveImage = useCallback(
    (image: DocumentImageRecord) => {
      Alert.alert('Alisin ang larawan?', 'Hindi na ito maibabalik pagkatapos alisin.', [
        { text: 'Kanselahin', style: 'cancel' },
        {
          text: 'Alisin',
          style: 'destructive',
          onPress: async () => {
            setRemovingId(image.id);

            try {
              await removeDocumentImage(documentId, image.id);
              refresh();
            } catch (error) {
              console.warn('Failed to remove document image', error);
              Alert.alert('Hindi maalis ang larawan', 'Pakisubukang muli.');
            } finally {
              setRemovingId(null);
            }
          },
        },
      ]);
    },
    [documentId, refresh],
  );

  const handleTakePhoto = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Kailangan ng pahintulot',
        'Bigyan ng access sa camera ang Aidey para makakuha ng larawan.',
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await persistImage(result.assets[0].uri);
    }
  }, [persistImage]);

  const handlePickFromLibrary = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Kailangan ng pahintulot',
        'Bigyan ng access sa photos ang Aidey para makapili ng larawan.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await persistImage(result.assets[0].uri);
    }
  }, [persistImage]);

  const hasImages = images.length > 0;

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

        {hasImages ? (
          <View style={styles.gallery}>
            {images.map((image) => (
              <View key={image.id} style={styles.galleryItem}>
                <Image source={{ uri: image.localUri }} style={styles.galleryImage} contentFit="cover" />

                <Pressable
                  style={({ pressed }) => [styles.removeButton, pressed && styles.removeButtonPressed]}
                  disabled={removingId === image.id}
                  onPress={() => handleRemoveImage(image)}
                  accessibilityRole="button"
                  accessibilityLabel="Alisin ang larawan">
                  {removingId === image.id ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <SymbolView
                      name={{ ios: 'xmark', android: 'close', web: 'close' }}
                      size={14}
                      tintColor={colors.primary}
                    />
                  )}
                </Pressable>

                <View style={styles.galleryStatus}>
                  <SymbolView
                    name={
                      image.status === 'uploaded'
                        ? { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }
                        : { ios: 'icloud.and.arrow.up', android: 'cloud_upload', web: 'cloud_upload' }
                    }
                    size={14}
                    tintColor={image.status === 'uploaded' ? brand.teal : colors.primary}
                  />
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.uploadCard, pressed && styles.uploadCardPressed]}
          disabled={isSaving}
          onPress={handleTakePhoto}
          accessibilityRole="button"
          accessibilityLabel={`Kuhanan ng larawan ang ${title}`}>
          <View style={styles.uploadIcon}>
            <SymbolView
              name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }}
              size={24}
              tintColor={brand.navy}
            />
          </View>
          <View style={styles.uploadText}>
            <Text style={styles.uploadLabel}>
              {hasImages ? 'Kumuha pa ng larawan' : `Kunan ng larawan ang ${title}`}
            </Text>
            <Text style={styles.uploadHint}>Pindutin para gamitin ang camera</Text>
          </View>
          {isSaving ? (
            <ActivityIndicator color={brand.navy} />
          ) : (
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={16}
              tintColor={colors.secondaryPlaceholder}
            />
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.uploadCard, pressed && styles.uploadCardPressed]}
          disabled={isSaving}
          onPress={handlePickFromLibrary}
          accessibilityRole="button"
          accessibilityLabel={`I-upload ang ${title}`}>
          <View style={styles.uploadIcon}>
            <SymbolView
              name={{ ios: 'photo.fill', android: 'image', web: 'image' }}
              size={24}
              tintColor={brand.navy}
            />
          </View>
          <View style={styles.uploadText}>
            <Text style={styles.uploadLabel}>
              {hasImages ? 'Mag-upload pa ng larawan' : `I-upload ang ${title}`}
            </Text>
            <Text style={styles.uploadHint}>Pindutin para pumili ng larawan</Text>
          </View>
          {isSaving ? (
            <ActivityIndicator color={brand.navy} />
          ) : (
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={16}
              tintColor={colors.secondaryPlaceholder}
            />
          )}
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
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  galleryItem: {
    position: 'relative',
    width: '31%',
    aspectRatio: 1,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    backgroundColor: colors.secondaryMuted,
    ...cardShadow,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 22, 106, 0.65)',
  },
  removeButtonPressed: {
    opacity: 0.7,
  },
  galleryStatus: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 22, 106, 0.65)',
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
