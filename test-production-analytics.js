// Test and seed production analytics data
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';

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
const db = getFirestore(app);

async function testAndSeedAnalytics() {
    try {
        console.log('🔍 Testing analytics API...');
        
        // Test if companies exist
        const companiesSnapshot = await getDocs(collection(db, 'companies'));
        console.log(`Found ${companiesSnapshot.docs.length} companies in database`);
        
        if (companiesSnapshot.docs.length === 0) {
            console.log('📝 No companies found, seeding data...');
            
            const companies = [
                {
                    companyName: "OpenAI",
                    category: "AI/ML",
                    description: "Leading AI research company",
                    website: "https://openai.com",
                    views: 150,
                    clicks: 45,
                    favourites: 12
                },
                {
                    companyName: "Anthropic", 
                    category: "AI/ML",
                    description: "AI safety company",
                    website: "https://anthropic.com",
                    views: 89,
                    clicks: 23,
                    favourites: 8
                }
            ];
            
            for (const company of companies) {
                const docId = company.companyName.toLowerCase().replace(/\s+/g, '-');
                await setDoc(doc(db, 'companies', docId), company);
                console.log(`✅ Added ${company.companyName}`);
            }
        }
        
        // Test analytics API endpoint
        console.log('🌐 Testing analytics API endpoint...');
        const response = await fetch('https://quantize.site/api/analytics/companies');
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Analytics API working: ${data.length} companies returned`);
        } else {
            console.log(`❌ Analytics API failed: ${response.status} ${response.statusText}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testAndSeedAnalytics();