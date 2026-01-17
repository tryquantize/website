// Test Company Outreach Functionality
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

async function testCompanyOutreach() {
    try {
        console.log('🔥 Testing Company Outreach Functionality...');
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        
        console.log('📝 Creating test company outreach request...');
        const testData = {
            userName: 'Test User',
            userEmail: 'test@example.com',
            userPhone: '+1234567890',
            searchQuery: 'AI chatbots for customer service',
            companies: [
                {
                    name: 'OpenAI',
                    website: 'https://openai.com',
                    linkedIn: 'https://linkedin.com/company/openai',
                    potentialEmail: 'contact@openai.com'
                },
                {
                    name: 'Anthropic',
                    website: 'https://anthropic.com',
                    linkedIn: 'https://linkedin.com/company/anthropic',
                    potentialEmail: 'contact@anthropic.com'
                }
            ],
            companiesCount: 2,
            timestamp: serverTimestamp(),
            status: 'pending'
        };
        
        const docRef = await addDoc(collection(db, 'companyOutreachRequests'), testData);
        
        console.log('✅ SUCCESS! Company outreach request created with ID:', docRef.id);
        console.log('🔗 Check your Firestore console at:');
        console.log('   https://console.firebase.google.com/project/firequest-auth/firestore');
        console.log('📊 Check admin dashboard at: /admindashboard');
        
        return docRef.id;
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.error('Full error:', error);
        
        if (error.code === 'permission-denied') {
            console.log('\n🔒 PERMISSION DENIED - Update Firestore rules with:');
            console.log(`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /partnerRequests/{document} {
      allow read, write: if true;
    }
    match /companyOutreachRequests/{document} {
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

testCompanyOutreach();