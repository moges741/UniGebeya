import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, BOOTSTRAPPED_ADMIN_EMAIL, db, googleProvider } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreError';
import { ensureDefaultCategoriesAdmin } from '../services/marketplaceService';
import { ProfileFormValues, UserProfile } from '../types/marketplace';

interface AuthContextValue {
  firebaseUser: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  updateUserProfile: (values: ProfileFormValues) => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setProfile(null);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const isBootstrapped =
          Boolean(user.emailVerified) &&
          user.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

        let hasAdminDoc = false;
        if (!isBootstrapped) {
          try {
            const adminSnap = await getDoc(doc(db, 'admins', user.uid));
            hasAdminDoc = adminSnap.exists();
          } catch {
            hasAdminDoc = false;
          }
        }

        const adminStatus = isBootstrapped || hasAdminDoc;
        setIsAdmin(adminStatus);

        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setProfile(userSnap.data() as UserProfile);
        } else {
          const initialName =
            (user.displayName && user.displayName.trim().length >= 2
              ? user.displayName.trim()
              : user.email?.split('@')[0] || 'Uni Member'
            ).slice(0, 100);

          const newProfilePayload = {
            uid: user.uid,
            fullName: initialName,
            email: user.email || '',
            phone: '',
            organization: '',
            role: adminStatus ? ('ADMIN' as const) : ('USER' as const),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          await setDoc(userRef, newProfilePayload);
          const createdSnap = await getDoc(userRef);
          if (createdSnap.exists()) {
            setProfile(createdSnap.data() as UserProfile);
          }
        }

        // Automatically ensure core marketplace categories exist when an admin signs in
        if (adminStatus) {
          try {
            await ensureDefaultCategoriesAdmin();
          } catch (catErr) {
            console.error('Category bootstrap check skipped:', catErr);
          }
        }
      } catch (error) {
        console.error('Auth profile sync error:', error);
        setAuthError(
          error instanceof Error ? error.message : 'Unable to load your account profile.'
        );
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Sign-in could not be completed.';
      if (!message.includes('popup-closed-by-user')) {
        setAuthError(message);
      }
      throw error;
    }
  };

  const signOutUser = async () => {
    setAuthError(null);
    await signOut(auth);
  };

  const updateUserProfile = async (values: ProfileFormValues) => {
    if (!firebaseUser) return;
    const path = `users/${firebaseUser.uid}`;
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        organization: values.organization.trim(),
        updatedAt: serverTimestamp(),
      });
      const updated = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (updated.exists()) {
        setProfile(updated.data() as UserProfile);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        isAdmin,
        isLoading,
        authError,
        signInWithGoogle,
        signOutUser,
        updateUserProfile,
        clearAuthError: () => setAuthError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
