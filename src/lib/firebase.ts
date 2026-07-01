import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { Platform } from 'react-native';

import { firebaseConfig, isFirebaseConfigured } from '@/constants/firebase';

const { getAuth, initializeAuth } = firebaseAuth;

type ReactNativePersistenceFactory = (
  storage: typeof AsyncStorage,
) => firebaseAuth.Persistence;

const getReactNativePersistence = (
  firebaseAuth as typeof firebaseAuth & {
    getReactNativePersistence?: ReactNativePersistenceFactory;
  }
).getReactNativePersistence;

function createFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) {
    return null;
  }

  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

function createFirebaseAuth(app: FirebaseApp): firebaseAuth.Auth {
  if (Platform.OS === 'web' || !getReactNativePersistence) {
    return getAuth(app);
  }

  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if ((error as { code?: string }).code === 'auth/already-initialized') {
      return getAuth(app);
    }

    throw error;
  }
}

function createFirebaseStorage(app: FirebaseApp): FirebaseStorage | null {
  try {
    return getStorage(app);
  } catch (error) {
    console.warn('Failed to initialize Firebase Storage', error);
    return null;
  }
}

function createFirebaseDatabase(app: FirebaseApp): Database | null {
  if (!firebaseConfig.databaseURL) {
    return null;
  }

  try {
    return getDatabase(app);
  } catch (error) {
    console.warn('Failed to initialize Firebase Realtime Database', error);
    return null;
  }
}

export const firebaseApp = createFirebaseApp();
export const auth = firebaseApp ? createFirebaseAuth(firebaseApp) : null;
export const storage = firebaseApp ? createFirebaseStorage(firebaseApp) : null;
export const database = firebaseApp ? createFirebaseDatabase(firebaseApp) : null;
