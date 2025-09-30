// Independent Firebase Auth Context - separate from existing auth
import React, { createContext, useContext, useEffect, useState } from 'react';
import { FirebaseAuthService, User } from '@/lib/firebase-auth';

interface FirebaseAuthContextType {
  currentUser: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{success: boolean, error: string | null}>;
  signIn: (email: string, password: string) => Promise<{success: boolean, error: string | null}>;
  signInWithGoogle: () => Promise<{success: boolean, error: string | null}>;
  signOut: () => Promise<{success: boolean, error: string | null}>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | null>(null);

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider');
  }
  return context;
}

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = FirebaseAuthService.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const result = await FirebaseAuthService.signUp(email, password, name);
    return { success: result.success, error: result.error };
  };

  const signIn = async (email: string, password: string) => {
    const result = await FirebaseAuthService.signIn(email, password);
    return { success: result.success, error: result.error };
  };

  const signInWithGoogle = async () => {
    console.log('Context: signInWithGoogle called');
    try {
      console.log('Context: Calling FirebaseAuthService.signInWithGoogle');
      const result = await FirebaseAuthService.signInWithGoogle();
      console.log('Context: FirebaseAuthService result:', result);
      return { success: result.success, error: result.error };
    } catch (error: any) {
      console.error('Context: Google sign-in error', error);
      return { success: false, error: 'Google sign-in failed. Please try again.' };
    }
  };

  const signOut = async () => {
    const result = await FirebaseAuthService.signOut();
    return { success: result.success, error: result.error };
  };

  const value = {
    currentUser,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}