import { app } from './firebase-init';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

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