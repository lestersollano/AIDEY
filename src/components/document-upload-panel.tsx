import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/text';
import { useTranslation } from '@/contexts/locale-context';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { useDocumentUploadsSyncStatus } from '@/hooks/use-document-uploads';
import {
  addDocumentImage,
  getDocumentImages,
  removeDocumentImage,
  subscribeToDocumentUploads,
  type DocumentImageRecord,
} from '@/services/document-uploads';

type DocumentUploadPanelProps = {
  documentId: string;
  title: string;
  onImagesChange?: (images: DocumentImageRecord[]) => void;
};

export function DocumentUploadPanel({ documentId, title, onImagesChange }: DocumentUploadPanelProps) {
  const { t } = useTranslation();
  const [images, setImages] = useState<DocumentImageRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { isLoading, isSyncing } = useDocumentUploadsSyncStatus();

  const refresh = useCallback(() => {
    void getDocumentImages(documentId).then(setImages);
  }, [documentId]);

  useFocusEffect(refresh);

  // Keeps the gallery in sync while this screen stays open — e.g. once a
  // background image download finishes, or another device adds/removes a
  // photo for this document.
  useEffect(() => subscribeToDocumentUploads(refresh), [refresh]);

  useEffect(() => {
    onImagesChange?.(images);
  }, [images, onImagesChange]);

  const persistImage = useCallback(
    async (uri: string) => {
      setIsSaving(true);

      try {
        await addDocumentImage(documentId, uri);
        refresh();
      } catch (error) {
        console.warn('Failed to save document image', error);
        Alert.alert(t('documents.upload.saveError'), t('documents.upload.saveErrorBody'));
      } finally {
        setIsSaving(false);
      }
    },
    [documentId, refresh, t],
  );

  const handleRemoveImage = useCallback(
    (image: DocumentImageRecord) => {
      Alert.alert(t('documents.upload.removeTitle'), t('documents.upload.removeBody'), [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.remove'),
          style: 'destructive',
          onPress: async () => {
            setRemovingId(image.id);

            try {
              await removeDocumentImage(documentId, image.id);
              refresh();
            } catch (error) {
              console.warn('Failed to remove document image', error);
              Alert.alert(t('documents.upload.removeError'), t('common.genericError'));
            } finally {
              setRemovingId(null);
            }
          },
        },
      ]);
    },
    [documentId, refresh, t],
  );

  const handleTakePhoto = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(t('documents.upload.permissionTitle'), t('documents.upload.cameraPermission'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await persistImage(result.assets[0].uri);
    }
  }, [persistImage, t]);

  const handlePickFromLibrary = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(t('documents.upload.permissionTitle'), t('documents.upload.photosPermission'));
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
  }, [persistImage, t]);

  const hasImages = images.length > 0;

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={brand.navy} />
          <Text style={styles.loadingText}>{t('documents.loading')}</Text>
        </View>
      ) : (
        <>
          {isSyncing ? (
            <View style={styles.syncingBanner}>
              <ActivityIndicator size="small" color={brand.navy} />
              <Text style={styles.syncingText}>{t('documents.syncing')}</Text>
            </View>
          ) : null}

          {hasImages ? (
            <View style={styles.gallery}>
              {images.map((image) => {
                // Still shown straight from the cloud URL while the quiet
                // background download writes a local copy for offline use.
                const isDownloading = Boolean(image.remoteUrl) && image.localUri === image.remoteUrl;

                return (
                  <View key={image.id} style={styles.galleryItem}>
                    <Image
                      source={{ uri: image.localUri }}
                      style={styles.galleryImage}
                      contentFit="cover"
                    />

                    {isDownloading ? (
                      <View
                        style={styles.downloadingOverlay}
                        accessibilityLabel={t('documents.upload.downloading')}>
                        <ActivityIndicator size="small" color={colors.primary} />
                      </View>
                    ) : null}

                    <Pressable
                      style={({ pressed }) => [
                        styles.removeButton,
                        pressed && styles.removeButtonPressed,
                      ]}
                      disabled={removingId === image.id}
                      onPress={() => handleRemoveImage(image)}
                      accessibilityRole="button"
                      accessibilityLabel={t('documents.upload.removeA11y')}>
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

                    {!isDownloading ? (
                      <View style={styles.galleryStatus}>
                        <SymbolView
                          name={
                            image.status === 'uploaded'
                              ? {
                                  ios: 'checkmark.circle.fill',
                                  android: 'check_circle',
                                  web: 'check_circle',
                                }
                              : { ios: 'icloud.and.arrow.up', android: 'cloud_upload', web: 'cloud_upload' }
                          }
                          size={14}
                          tintColor={image.status === 'uploaded' ? brand.teal : colors.primary}
                        />
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ) : null}
        </>
      )}

      <Pressable
        style={({ pressed }) => [styles.uploadCard, pressed && styles.uploadCardPressed]}
        disabled={isSaving}
        onPress={handleTakePhoto}
        accessibilityRole="button"
        accessibilityLabel={t('documents.upload.takePhoto', { title })}>
        <View style={styles.uploadIcon}>
          <SymbolView
            name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }}
            size={24}
            tintColor={brand.navy}
          />
        </View>
        <View style={styles.uploadText}>
          <Text style={styles.uploadLabel}>
            {hasImages
              ? t('documents.upload.takeMore')
              : t('documents.upload.takePhoto', { title })}
          </Text>
          <Text style={styles.uploadHint}>{t('documents.upload.cameraHint')}</Text>
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
        accessibilityLabel={t('documents.upload.uploadPhoto', { title })}>
        <View style={styles.uploadIcon}>
          <SymbolView
            name={{ ios: 'photo.fill', android: 'image', web: 'image' }}
            size={24}
            tintColor={brand.navy}
          />
        </View>
        <View style={styles.uploadText}>
          <Text style={styles.uploadLabel}>
            {hasImages
              ? t('documents.upload.uploadMore')
              : t('documents.upload.uploadPhoto', { title })}
          </Text>
          <Text style={styles.uploadHint}>{t('documents.upload.libraryHint')}</Text>
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
    </View>
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
    gap: 12,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.secondary,
    textAlign: 'center',
  },
  syncingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncingText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.secondary,
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
  downloadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 22, 106, 0.25)',
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
