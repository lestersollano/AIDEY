import { getCachedLocale } from '@/contexts/locale-context';
import { translate } from '@/i18n';

const authErrorKeys: Record<string, string> = {
  'auth/email-already-in-use': 'auth.errors.auth/email-already-in-use',
  'auth/invalid-email': 'auth.errors.auth/invalid-email',
  'auth/operation-not-allowed': 'auth.errors.auth/operation-not-allowed',
  'auth/weak-password': 'auth.errors.auth/weak-password',
  'auth/user-disabled': 'auth.errors.auth/user-disabled',
  'auth/user-not-found': 'auth.errors.auth/user-not-found',
  'auth/wrong-password': 'auth.errors.auth/wrong-password',
  'auth/invalid-credential': 'auth.errors.auth/invalid-credential',
  'auth/too-many-requests': 'auth.errors.auth/too-many-requests',
  'auth/network-request-failed': 'auth.errors.auth/network-request-failed',
};

export function getAuthErrorMessage(error: unknown, locale = getCachedLocale()): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String(error.code);
    const key = authErrorKeys[code];
    if (key) {
      return translate(locale, key);
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return translate(locale, 'common.genericError');
}
