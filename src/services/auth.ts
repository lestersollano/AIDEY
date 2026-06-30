import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';

import { auth } from '@/lib/firebase';
import { clearSessionExpiry, saveSessionExpiry } from '@/utils/auth-session';

function requireAuth() {
  if (!auth) {
    throw new Error('Firebase is not configured. Add your Firebase env vars to .env.');
  }

  return auth;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string,
): Promise<User> {
  const firebaseAuth = requireAuth();
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);

  if (displayName?.trim()) {
    await updateProfile(credential.user, { displayName: displayName.trim() });
  }

  await saveSessionExpiry();
  return credential.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const firebaseAuth = requireAuth();
  const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
  await saveSessionExpiry();
  return credential.user;
}

export async function signOut(): Promise<void> {
  const firebaseAuth = requireAuth();
  await clearSessionExpiry();
  await firebaseSignOut(firebaseAuth);
}
