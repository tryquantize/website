// Independent Firebase authentication - completely separate from other auth systems
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAy882-yKs41YpCDKrNOqEgB1iKDQcJqak",
  authDomain: "firequest-auth.firebaseapp.com",
  projectId: "firequest-auth",
  storageBucket: "firequest-auth.firebasestorage.app",
  messagingSenderId: "1065297438861",
  appId: "1:1065297438861:web:d746c00a59e9c8eebfdac4",
  measurementId: "G-64FEYVFBNJ"
};

// Initialize Firebase
console.log('Initializing Firebase with config:', firebaseConfig);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
console.log('Firebase initialized successfully');
console.log('Auth object:', auth);
console.log('Google provider:', googleProvider);

export { auth };
export type { User };

// Firebase Auth Service - completely independent
export class FirebaseAuthService {
  static async signUp(email: string, password: string, name: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      return { success: true, user: userCredential.user, error: null };
    } catch (error: any) {
      return { success: false, user: null, error: error.message };
    }
  }

  static async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user, error: null };
    } catch (error: any) {
      return { success: false, user: null, error: error.message };
    }
  }

  static async signOut() {
    try {
      await signOut(auth);
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async signInWithGoogle() {
    console.log('FirebaseAuthService.signInWithGoogle called');
    console.log('Auth object available:', !!auth);
    console.log('Google provider available:', !!googleProvider);
    
    if (!auth) {
      console.error('Firebase auth not initialized');
      return { success: false, user: null, error: 'Firebase not initialized' };
    }
    
    if (!googleProvider) {
      console.error('Google provider not initialized');
      return { success: false, user: null, error: 'Google provider not available' };
    }
    
    try {
      console.log('Firebase: Starting Google sign-in popup...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Firebase: Google sign-in successful', result.user);
      return { success: true, user: result.user, error: null };
    } catch (error: any) {
      console.error('Firebase: Google sign-in error', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = error.message;
      
      // Handle specific error cases
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups and try again.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for Google sign-in.';
      }
      
      return { success: false, user: null, error: errorMessage };
    }
  }

  static onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
}