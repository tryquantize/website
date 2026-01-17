import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyAy882-yKs41YpCDKrNOqEgB1iKDQcJqak",
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "firequest-auth.firebaseapp.com",
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || "firequest-auth",
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "firequest-auth.firebasestorage.app",
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1065297438861",
    appId: process.env.VITE_FIREBASE_APP_ID || "1:1065297438861:web:d746c00a59e9c8eebfdac4",
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-64FEYVFBNJ"
};

// Initialize Firebase
let app: FirebaseApp;

if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

export { app };