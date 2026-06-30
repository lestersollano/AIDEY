import { Image } from 'expo-image';
import { router } from 'expo-router';
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
import { brand, colors } from '@/constants/colors';
import { fonts } from '@/constants/fonts';
import { signInWithEmail, signUpWithEmail } from '@/services/auth';
import { getAuthErrorMessage } from '@/utils/auth-errors';

type AuthMode = 'sign-in' | 'sign-up';

export default function SignInScreen() {
  const { isConfigured } = useAuth();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleEmailSubmit() {
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
              {mode === 'sign-up'
                ? 'Gumawa ng account para simulan ang iyong gabay sa dokumento at ID.'
                : 'Mag-sign in para magpatuloy sa Aidey.'}
            </Text>
          </View>

          <Image
            source={require('@/assets/images/mascot/cropped/mainmenu.png')}
            style={styles.mascot}
            contentFit="contain"
          />

          {!isConfigured ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>Kailangan ng Firebase setup</Text>
              <Text style={styles.noticeText}>
                Idagdag ang Firebase config sa `.env` file mo bago mag-sign in. Tingnan ang
                `.env.example` para sa mga kailangang variable.
              </Text>
            </View>
          ) : null}

          {mode === 'sign-up' ? (
            <View style={styles.field}>
              <Text style={styles.label}>Pangalan</Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Hal. Juan Dela Cruz"
                placeholderTextColor={colors.secondaryPlaceholder}
                autoCapitalize="words"
                autoCorrect={false}
                style={styles.input}
              />
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
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
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Hindi bababa sa 6 na character"
              placeholderTextColor={colors.secondaryPlaceholder}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              (!isConfigured || isSubmitting) && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
            disabled={!isConfigured || isSubmitting}
            onPress={handleEmailSubmit}>
            {isSubmitting ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.primaryButtonText}>
                {mode === 'sign-up' ? 'Gumawa ng account' : 'Mag-sign in'}
              </Text>
            )}
          </Pressable>

          <Pressable
            style={styles.switchModeButton}
            disabled={isSubmitting}
            onPress={() => {
              setError(null);
              setMode((current) => (current === 'sign-in' ? 'sign-up' : 'sign-in'));
            }}>
            <Text style={styles.switchModeText}>
              {mode === 'sign-in'
                ? 'Wala pang account? Gumawa ng bago'
                : 'May account na? Mag-sign in'}
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
