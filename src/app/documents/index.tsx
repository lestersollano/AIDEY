import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { IdUploadField } from '@/components/id-upload-field';
import { Text, TextInput } from '@/components/text';
import { brand, colors } from '@/constants/colors';
import { DOCUMENTS } from '@/constants/documents';
import { fonts } from '@/constants/fonts';
import { filterByFuzzyMatch } from '@/utils/fuzzy-match';

function pressableStyle(baseStyle: object, pressedStyle: object) {
  return ({ pressed }: { pressed: boolean }) => [baseStyle, pressed && pressedStyle];
}

export default function DocumentsScreen() {
  const [query, setQuery] = useState('');

  const filteredDocuments = useMemo(
    () => filterByFuzzyMatch(DOCUMENTS, query, (document) => document.label),
    [query],
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={<Text style={styles.headerTitle}>Mga Dokumento at ID</Text>}
      />

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            size={20}
            tintColor={brand.navy}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="I-type dito ang kailangan"
            placeholderTextColor={colors.secondaryPlaceholder}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
        </View>
        <Pressable
          style={pressableStyle(styles.speechButton, styles.speechButtonPressed)}
          accessibilityLabel="Speech to text">
          <SymbolView
            name={{ ios: 'mic.fill', android: 'mic', web: 'mic' }}
            size={22}
            tintColor={brand.navy}
          />
        </Pressable>
      </View>

      <View style={styles.scrollShadowClip}>
        <View style={styles.scrollTopShadow} />
      </View>

      <View style={styles.scrollContainer}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {filteredDocuments.length === 0 ? (
            <Text style={styles.emptyState}>Walang nahanap na dokumento.</Text>
          ) : (
            filteredDocuments.map((document) => (
              <IdUploadField
                key={document.id}
                label={document.label}
                onPress={() => router.push(`/documents/${document.id}`)}
              />
            ))
          )}
        </ScrollView>
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
  scrollContainer: {
    flex: 1,
    marginHorizontal: -24,
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
