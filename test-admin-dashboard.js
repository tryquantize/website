// Test Admin Dashboard Data Access
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAy882-yKs41YpCDKrNOqEgB1iKDQcJqak",
    authDomain: "firequest-auth.firebaseapp.com",
    projectId: "firequest-auth",
    storageBucket: "firequest-auth.firebasestorage.app",
    messagingSenderId: "1065297438861",
    appId: "1:1065297438861:web:d746c00a59e9c8eebfdac4",
    measurementId: "G-64FEYVFBNJ"
};

async function testAdminDashboard() {
    try {
        console.log('🔥 Testing Admin Dashboard Data Access...');
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        
        // Test partner requests
        console.log('📋 Loading partner requests...');
        const partnerQuery = query(collection(db, 'partnerRequests'), orderBy('timestamp', 'desc'));
        const partnerSnapshot = await getDocs(partnerQuery);
        const partnerRequests = partnerSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log(`✅ Found ${partnerRequests.length} partner requests`);
        if (partnerRequests.length > 0) {
            console.log('Sample partner request:', partnerRequests[0]);
        }
        
        // Test company outreach requests
        console.log('📋 Loading company outreach requests...');
        const outreachQuery = query(collection(db, 'companyOutreachRequests'), orderBy('timestamp', 'desc'));
        const outreachSnapshot = await getDocs(outreachQuery);
        const outreachRequests = outreachSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log(`✅ Found ${outreachRequests.length} company outreach requests`);
        if (outreachRequests.length > 0) {
            console.log('Sample outreach request:', outreachRequests[0]);
        }
        
        console.log('\n🎯 Admin Dashboard Summary:');
        console.log(`- Partner Requests: ${partnerRequests.length}`);
        console.log(`- Company Outreach Requests: ${outreachRequests.length}`);
        console.log(`- Total Requests: ${partnerRequests.length + outreachRequests.length}`);
        
        console.log('\n🔗 Access admin dashboard at: http://localhost:3001/admindashboard');
        
        return {
            partnerRequests: partnerRequests.length,
            outreachRequests: outreachRequests.length
        };
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.error('Full error:', error);
        
        if (error.code === 'permission-denied') {
            console.log('\n🔒 PERMISSION DENIED - Update Firestore rules!');
        }
    }
}

testAdminDashboard();