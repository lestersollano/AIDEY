import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
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

export const firebaseApp = createFirebaseApp();
export const auth = firebaseApp ? createFirebaseAuth(firebaseApp) : null;
