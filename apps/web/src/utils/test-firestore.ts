import { app } from '../lib/firebase-init';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function testFirestoreConnection() {
  try {
    console.log('Testing Firestore connection...');
    
    const db = getFirestore(app);
    
    // Test data
    const testData = {
      userName: 'Test User',
      userEmail: 'test@example.com',
      userPhone: '+1234567890',
      companyName: 'Test Company',
      companyEmail: 'contact@testcompany.com',
      companyWebsite: 'https://testcompany.com',
      companyLinkedIn: 'https://linkedin.com/company/testcompany',
      searchQuery: 'test search',
      timestamp: serverTimestamp(),
      status: 'pending'
    };
    
    console.log('Attempting to add document to partnerRequests collection...');
    const docRef = await addDoc(collection(db, 'partnerRequests'), testData);
    
    console.log('✅ SUCCESS! Document written with ID:', docRef.id);
    console.log('Check your Firestore console at: https://console.firebase.google.com/project/firequest-auth/firestore');
    
    return docRef.id;
  } catch (error) {
    console.error('❌ FAILED! Firestore error:', error);
    throw error;
  }
}

// Add to window for testing in browser console
if (typeof window !== 'undefined') {
  (window as any).testFirestore = testFirestoreConnection;
}