// Check Firebase collections and fix analytics
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

async function checkCollections() {
    try {
        console.log('🔍 Checking Firebase collections...');
        
        // Check companies collection
        const companiesSnapshot = await getDocs(collection(db, 'companies'));
        console.log(`📊 Companies collection: ${companiesSnapshot.docs.length} documents`);
        
        if (companiesSnapshot.docs.length > 0) {
            const firstCompany = companiesSnapshot.docs[0];
            console.log('Sample company:', firstCompany.id, firstCompany.data());
        }
        
        // Check if there are other collections that might contain company data
        const collections = ['aiTools', 'tools', 'startups', 'submissions'];
        
        for (const collectionName of collections) {
            try {
                const snapshot = await getDocs(collection(db, collectionName));
                console.log(`📊 ${collectionName} collection: ${snapshot.docs.length} documents`);
                
                if (snapshot.docs.length > 0) {
                    const firstDoc = snapshot.docs[0];
                    console.log(`Sample ${collectionName}:`, firstDoc.id, Object.keys(firstDoc.data()));
                }
            } catch (error) {
                console.log(`❌ ${collectionName} collection: Not accessible or doesn't exist`);
            }
        }
        
        // If companies collection is empty, create some test data
        if (companiesSnapshot.docs.length === 0) {
            console.log('📝 Creating test companies...');
            
            const testCompanies = [
                {
                    companyName: "OpenAI",
                    name: "OpenAI", 
                    category: "AI/ML",
                    description: "Leading AI research company",
                    website: "https://openai.com",
                    views: 150,
                    clicks: 45,
                    favourites: 12
                },
                {
                    companyName: "Anthropic",
                    name: "Anthropic",
                    category: "AI/ML", 
                    description: "AI safety company",
                    website: "https://anthropic.com",
                    views: 89,
                    clicks: 23,
                    favourites: 8
                }
            ];
            
            for (const company of testCompanies) {
                const docId = company.companyName.toLowerCase().replace(/\s+/g, '-');
                await setDoc(doc(db, 'companies', docId), company);
                console.log(`✅ Created ${company.companyName}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkCollections();