import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { IdUploadField } from '@/components/id-upload-field';
import { TextInput } from '@/components/text';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';

export default function DocumentsScreen() {
  const [query, setQuery] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Mga Dokumento at ID" />

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            size={20}
            tintColor={colors.secondary}
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
        <Pressable style={styles.speechButton} accessibilityLabel="Speech to text">
          <SymbolView
            name={{ ios: 'mic.fill', android: 'mic', web: 'mic' }}
            size={22}
            tintColor={colors.secondary}
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
          <IdUploadField label="National ID/Philsys ID" />
        </ScrollView>
      </View>
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
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.secondary,
    backgroundColor: 'transparent',
  },
  speechButton: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.secondary,
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
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
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
    gap: 24,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
});
