// Test Firestore Connection
// Run this in Node.js to test Firestore

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAy882-yKs41YpCDKrNOqEgB1iKDQcJqak",
    authDomain: "firequest-auth.firebaseapp.com",
    projectId: "firequest-auth",
    storageBucket: "firequest-auth.firebasestorage.app",
    messagingSenderId: "1065297438861",
    appId: "1:1065297438861:web:d746c00a59e9c8eebfdac4",
    measurementId: "G-64FEYVFBNJ"
};

async function testFirestore() {
    try {
        console.log('🔥 Initializing Firebase...');
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        
        console.log('📝 Creating test partner request...');
        const testData = {
            userName: 'Test User',
            userEmail: 'test@example.com',
            userPhone: '+1234567890',
            companyName: 'Test Company',
            companyEmail: 'contact@testcompany.com',
            companyWebsite: 'https://testcompany.com',
            companyLinkedIn: 'https://linkedin.com/company/testcompany',
            searchQuery: 'test search query',
            timestamp: serverTimestamp(),
            status: 'pending'
        };
        
        const docRef = await addDoc(collection(db, 'partnerRequests'), testData);
        
        console.log('✅ SUCCESS! Document created with ID:', docRef.id);
        console.log('🔗 Check your Firestore console at:');
        console.log('   https://console.firebase.google.com/project/firequest-auth/firestore');
        
        return docRef.id;
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.error('Full error:', error);
        
        if (error.code === 'permission-denied') {
            console.log('\n🔒 PERMISSION DENIED - You need to update Firestore rules:');
            console.log('1. Go to: https://console.firebase.google.com/project/firequest-auth/firestore/rules');
            console.log('2. Replace the rules with:');
            console.log(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /partnerRequests/{document} {
      allow read, write: if true;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
            `);
        }
    }
}

testFirestore();