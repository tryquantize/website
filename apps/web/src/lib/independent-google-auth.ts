// Completely independent Google authentication
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAy882-yKs41YpCDKrNOqEgB1iKDQcJqak",
  authDomain: "firequest-auth.firebaseapp.com",
  projectId: "firequest-auth",
  storageBucket: "firequest-auth.firebasestorage.app",
  messagingSenderId: "1065297438861",
  appId: "1:1065297438861:web:d746c00a59e9c8eebfdac4",
  measurementId: "G-64FEYVFBNJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const handleIndependentGoogleAuth = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    window.location.href = 'https://quantize.site/home';
    return { success: true, user: result.user };
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked') {
      alert('Popup was blocked. Please allow popups and try again.');
    } else if (error.code === 'auth/unauthorized-domain') {
      alert('This domain is not authorized for Google sign-in. Please contact support.');
    } else if (error.code !== 'auth/popup-closed-by-user') {
      alert(`Google sign-in failed: ${error.message}. Please try again.`);
    }
    return { success: false, error: error.message };
  }
};