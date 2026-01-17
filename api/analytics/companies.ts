import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAy882-yKs41YpCDKrNOqEgB1iKDQcJqak",
  authDomain: "firequest-auth.firebaseapp.com",
  projectId: "firequest-auth",
  storageBucket: "firequest-auth.firebasestorage.app",
  messagingSenderId: "1065297438861",
  appId: "1:1065297438861:web:d746c00a59e9c8eebfdac4",
  measurementId: "G-64FEYVFBNJ"
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = getFirestore(app);
    const companiesSnapshot = await getDocs(collection(db, 'companies'));
    
    const companies = companiesSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().companyName || doc.data().name || 'Unknown Company',
      companyName: doc.data().companyName || doc.data().name || 'Unknown Company',
      ...doc.data()
    }));

    res.status(200).json(companies);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
}