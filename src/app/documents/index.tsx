import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { IdUploadField } from '@/components/id-upload-field';
import { SpeechToTextButton } from '@/components/speech-to-text-button';
import { Text, TextInput } from '@/components/text';
import { useTranslation } from '@/contexts/locale-context';
import { brand, colors } from '@/constants/colors';
import { DOCUMENTS } from '@/constants/documents';
import { fonts } from '@/constants/fonts';
import { useDocumentUploads, useDocumentUploadsSyncStatus } from '@/hooks/use-document-uploads';
import { filterByFuzzyMatch } from '@/utils/fuzzy-match';

export default function DocumentsScreen() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const uploads = useDocumentUploads();
  const { isLoading, isSyncing } = useDocumentUploadsSyncStatus();

  const filteredDocuments = useMemo(() => {
    const matched = filterByFuzzyMatch(DOCUMENTS, query, (document) => document.label);

    return [...matched].sort((a, b) => {
      const aFilled = (uploads[a.id]?.length ?? 0) > 0 ? 0 : 1;
      const bFilled = (uploads[b.id]?.length ?? 0) > 0 ? 0 : 1;
      return aFilled - bFilled;
    });
  }, [query, uploads]);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={<Text style={styles.headerTitle}>{t('documents.title')}</Text>} />

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            size={20}
            tintColor={brand.navy}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={t('documents.searchPlaceholder')}
            placeholderTextColor={colors.secondaryPlaceholder}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
        </View>
        <SpeechToTextButton
          style={styles.speechButton}
          pressedStyle={styles.speechButtonPressed}
          iconColor={brand.navy}
          onTranscript={(transcript) =>
            setQuery((current) => (current ? `${current} ${transcript}` : transcript))
          }
          onError={(message) => Alert.alert(t('documents.speechToText'), message)}
        />
      </View>

      {!isLoading && isSyncing ? (
        <View style={styles.syncingBanner}>
          <ActivityIndicator size="small" color={brand.navy} />
          <Text style={styles.syncingText}>{t('documents.syncing')}</Text>
        </View>
      ) : null}

      <View style={styles.scrollShadowClip}>
        <View style={styles.scrollTopShadow} />
      </View>

      <View style={styles.scrollContainer}>
        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={brand.navy} />
            <Text style={styles.loadingText}>{t('documents.loading')}</Text>
          </View>
        ) : (
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {filteredDocuments.length === 0 ? (
            <Text style={styles.emptyState}>{t('documents.empty')}</Text>
          ) : (
            filteredDocuments.map((document) => {
              const images = uploads[document.id] ?? [];

              return (
                <IdUploadField
                  key={document.id}
                  label={document.label}
                  imageUri={images[0]?.localUri}
                  imageCount={images.length}
                  onPress={() =>
                    router.push(
                      images.length > 0
                        ? `/documents/${document.id}/mayroon`
                        : `/documents/${document.id}`,
                    )
                  }
                />
              );
            })
          )}
        </ScrollView>
        )}
      </View>
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    paddingBottom: 12,
    zIndex: 1,
    backgroundColor: colors.primary,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 16,
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    backgroundColor: colors.primary,
    ...cardShadow,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontFamily: fonts.regular,
    color: brand.navy,
    backgroundColor: 'transparent',
  },
  speechButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    backgroundColor: colors.primary,
    ...cardShadow,
  },
  speechButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  scrollShadowClip: {
    overflow: 'hidden',
    height: 14,
    marginHorizontal: -24,
    zIndex: 1,
  },
  scrollTopShadow: {
    height: 1,
    backgroundColor: colors.primary,
    shadowColor: brand.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  syncingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 8,
  },
  syncingText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.secondary,
  },
  scrollContainer: {
    flex: 1,
    marginHorizontal: -24,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.secondary,
    textAlign: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  emptyState: {
    paddingTop: 32,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.secondaryPlaceholder,
    textAlign: 'center',
  },
});
