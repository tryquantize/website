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
  console.log('Independent Google auth clicked');
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Google sign-in successful:', result.user);
    
    // Redirect to the specified URL
    window.location.href = 'https://quantize.site/';
    
    return { success: true, user: result.user };
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    
    if (error.code === 'auth/popup-closed-by-user') {
      console.log('User closed the popup');
    } else if (error.code === 'auth/popup-blocked') {
      alert('Popup was blocked. Please allow popups and try again.');
    } else if (error.code === 'auth/unauthorized-domain') {
      alert('This domain is not authorized for Google sign-in. Please contact support.');
    } else {
      console.error('Full error details:', error);
      alert(`Google sign-in failed: ${error.message}. Please try again.`);
    }
    
    return { success: false, error: error.message };
  }
};