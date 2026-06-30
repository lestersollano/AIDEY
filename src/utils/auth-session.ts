import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from 'firebase/auth';

const SESSION_EXPIRY_KEY = '@aidey/auth-session-expires-at';

export const ACCOUNT_PERSISTENCE_MS = 7 * 24 * 60 * 60 * 1000;

function expiryFromLastSignIn(user: User): number {
  const lastSignIn = user.metadata.lastSignInTime;

  if (lastSignIn) {
    return new Date(lastSignIn).getTime() + ACCOUNT_PERSISTENCE_MS;
  }

  return Date.now() + ACCOUNT_PERSISTENCE_MS;
}

export async function saveSessionExpiry(): Promise<void> {
  await AsyncStorage.setItem(SESSION_EXPIRY_KEY, String(Date.now() + ACCOUNT_PERSISTENCE_MS));
}

export async function clearSessionExpiry(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_EXPIRY_KEY);
}

async function getStoredSessionExpiry(): Promise<number | null> {
  const value = await AsyncStorage.getItem(SESSION_EXPIRY_KEY);

  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function resolveSessionExpiry(user: User): Promise<number> {
  const stored = await getStoredSessionExpiry();
  return stored ?? expiryFromLastSignIn(user);
}

export async function isSessionExpired(user: User): Promise<boolean> {
  const expiresAt = await resolveSessionExpiry(user);
  return Date.now() > expiresAt;
}
