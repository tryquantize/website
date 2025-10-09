// Independent Firebase authentication - completely separate from other auth systems
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAy882-yKs41YpCDKrNOqEgB1iKDQcJqak",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "firequest-auth.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "firequest-auth",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "firequest-auth.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1065297438861",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1065297438861:web:d746c00a59e9c8eebfdac4",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-64FEYVFBNJ"
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
      let errorMessage = error.message;
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please try logging in instead.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use at least 6 characters.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support.';
          break;
        default:
          errorMessage = 'Failed to create account. Please try again.';
      }
      
      return { success: false, user: null, error: errorMessage };
    }
  }

  static async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user, error: null };
    } catch (error: any) {
      let errorMessage = error.message;
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email. Please sign up first.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage = 'Failed to sign in. Please check your credentials.';
      }
      
      return { success: false, user: null, error: errorMessage };
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