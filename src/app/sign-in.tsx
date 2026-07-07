import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AideyWordmark } from '@/components/aidey-wordmark';
import { Text, TextInput } from '@/components/text';
import { useAuth } from '@/contexts/auth-context';
import { useTranslation } from '@/contexts/locale-context';
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { signInWithEmail, signUpWithEmail } from '@/services/auth';
import { getAuthErrorMessage } from '@/utils/auth-errors';

type AuthMode = 'sign-in' | 'sign-up';

export default function SignInScreen() {
  const { isConfigured } = useAuth();
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    isConfigured &&
    !isSubmitting &&
    (mode === 'sign-in' || acceptedTerms);

  async function handleEmailSubmit() {
    if (mode === 'sign-up' && !acceptedTerms) {
      setError(t('auth.termsRequired'));
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'sign-up') {
        await signUpWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }

      router.replace('/');
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <AideyWordmark style={styles.wordmark} />
            <Text style={styles.tagline}>
              {mode === 'sign-up' ? t('auth.signUpTagline') : t('auth.signInTagline')}
            </Text>
          </View>

          <Image
            source={require('@/assets/images/mascot/cropped/mainmenu.png')}
            style={styles.mascot}
            contentFit="contain"
          />

          {!isConfigured ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>{t('auth.firebaseSetupTitle')}</Text>
              <Text style={styles.noticeText}>{t('auth.firebaseSetupBody')}</Text>
            </View>
          ) : null}

          {mode === 'sign-up' ? (
            <View style={styles.field}>
              <Text style={styles.label}>{t('common.name')}</Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder={t('auth.namePlaceholder')}
                placeholderTextColor={colors.secondaryPlaceholder}
                autoCapitalize="words"
                autoCorrect={false}
                style={styles.input}
              />
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>{t('common.email')}</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              placeholderTextColor={colors.secondaryPlaceholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('common.password')}</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={t('auth.passwordPlaceholder')}
              placeholderTextColor={colors.secondaryPlaceholder}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {mode === 'sign-up' ? (
            <View style={styles.termsRow}>
              <Pressable
                style={styles.checkboxPressable}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: acceptedTerms }}
                accessibilityLabel={t('auth.termsAcceptPrefix')}
                onPress={() => setAcceptedTerms((current) => !current)}>
                <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                  {acceptedTerms ? (
                    <SymbolView
                      name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                      size={14}
                      tintColor={colors.primary}
                    />
                  ) : null}
                </View>
              </Pressable>
              <Text style={styles.termsText}>
                {t('auth.termsAcceptPrefix')}{' '}
                <Text
                  style={styles.termsLink}
                  accessibilityRole="link"
                  onPress={() => router.push('/terms')}>
                  {t('auth.termsAcceptLink')}
                </Text>
              </Text>
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              !canSubmit && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
            disabled={!canSubmit}
            onPress={handleEmailSubmit}>
            {isSubmitting ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.primaryButtonText}>
                {mode === 'sign-up' ? t('auth.createAccount') : t('auth.signIn')}
              </Text>
            )}
          </Pressable>

          <Pressable
            style={styles.switchModeButton}
            disabled={isSubmitting}
            onPress={() => {
              setError(null);
              setAcceptedTerms(false);
              setMode((current) => (current === 'sign-in' ? 'sign-up' : 'sign-in'));
            }}>
            <Text style={styles.switchModeText}>
              {mode === 'sign-in' ? t('auth.noAccount') : t('auth.hasAccount')}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 24,
  },
  hero: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  wordmark: {
    fontSize: 32,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.secondary,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  mascot: {
    width: '100%',
    height: 140,
  },
  noticeCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    backgroundColor: colors.secondaryMuted,
    padding: 16,
    gap: 8,
  },
  noticeTitle: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: brand.navy,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.secondary,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: brand.navy,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 15,
    color: brand.navy,
    backgroundColor: colors.primary,
  },
  errorText: {
    fontSize: 14,
    color: '#c0392b',
    lineHeight: 20,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 4,
  },
  checkboxPressable: {
    paddingTop: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.secondaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    backgroundColor: colors.primary,
  },
  checkboxChecked: {
    borderColor: brand.navy,
    backgroundColor: brand.navy,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.secondary,
  },
  termsLink: {
    fontFamily: fonts.semiBold,
    color: brand.teal,
    textDecorationLine: 'underline',
  },
  primaryButton: {
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: brand.navy,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  primaryButtonText: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  switchModeButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchModeText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: brand.teal,
  },
});
