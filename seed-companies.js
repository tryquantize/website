/**
 * Seed script to add sample companies to Firestore for testing analytics
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';

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

const sampleCompanies = [
    {
        companyName: "OpenAI",
        category: "AI/ML",
        description: "Leading AI research company developing advanced AI systems",
        website: "https://openai.com",
        tagline: "Creating safe AGI that benefits all of humanity",
        headquarters: "San Francisco, CA",
        employees: "500-1000",
        founded: "2015",
        companyStage: "Growth",
        views: 150,
        clicks: 45,
        favourites: 12
    },
    {
        companyName: "Anthropic",
        category: "AI/ML",
        description: "AI safety company focused on developing safe, beneficial AI systems",
        website: "https://anthropic.com",
        tagline: "AI safety through research and engineering",
        headquarters: "San Francisco, CA",
        employees: "100-500",
        founded: "2021",
        companyStage: "Growth",
        views: 89,
        clicks: 23,
        favourites: 8
    },
    {
        companyName: "Hugging Face",
        category: "AI/ML",
        description: "Open-source platform for machine learning and AI models",
        website: "https://huggingface.co",
        tagline: "The AI community building the future",
        headquarters: "New York, NY",
        employees: "100-500",
        founded: "2016",
        companyStage: "Growth",
        views: 234,
        clicks: 67,
        favourites: 19
    },
    {
        companyName: "Stability AI",
        category: "AI/ML",
        description: "AI company focused on generative AI and open-source models",
        website: "https://stability.ai",
        tagline: "AI by the people, for the people",
        headquarters: "London, UK",
        employees: "100-500",
        founded: "2019",
        companyStage: "Growth",
        views: 178,
        clicks: 52,
        favourites: 15
    },
    {
        companyName: "Midjourney",
        category: "AI/ML",
        description: "AI-powered image generation platform",
        website: "https://midjourney.com",
        tagline: "Exploring new mediums of thought",
        headquarters: "San Francisco, CA",
        employees: "50-100",
        founded: "2021",
        companyStage: "Growth",
        views: 312,
        clicks: 89,
        favourites: 25
    }
];

async function seedCompanies() {
    try {
        console.log('Starting to seed companies...');
        
        for (const company of sampleCompanies) {
            // Use company name as document ID for consistency
            const docId = company.companyName.toLowerCase().replace(/\s+/g, '-');
            await setDoc(doc(db, 'companies', docId), company);
            console.log(`Added company: ${company.companyName}`);
        }
        
        console.log('Successfully seeded all companies!');
        console.log(`Added ${sampleCompanies.length} companies to Firestore`);
        
    } catch (error) {
        console.error('Error seeding companies:', error);
    }
}

seedCompanies();