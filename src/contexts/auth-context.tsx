import { onAuthStateChanged, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { isFirebaseConfigured } from '@/constants/firebase';
import { auth } from '@/lib/firebase';
import { resetChatSessionsStore } from '@/services/chat-sessions';
import { resetDocumentGuideProgressStore } from '@/services/document-guide-progress';
import { resetDocumentUploadsStore } from '@/services/document-uploads';
import { clearSessionExpiry, isSessionExpired } from '@/utils/auth-session';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isConfigured: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isConfigured = isFirebaseConfigured();

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const firebaseAuth = auth;
    let previousUid: string | undefined;

    return onAuthStateChanged(firebaseAuth, (nextUser) => {
      void (async () => {
        if (nextUser && (await isSessionExpired(nextUser))) {
          await clearSessionExpiry();
          await firebaseSignOut(firebaseAuth);
          setUser(null);
          setIsLoading(false);
          return;
        }

        const nextUid = nextUser?.uid;
        if (previousUid !== nextUid) {
          resetChatSessionsStore();
          resetDocumentUploadsStore();
          resetDocumentGuideProgressStore();
          previousUid = nextUid;
        }

        setUser(nextUser);
        setIsLoading(false);
      })();
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isConfigured,
    }),
    [user, isLoading, isConfigured],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
