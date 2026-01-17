import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

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
    const { slug } = req.query;
    const db = getFirestore(app);

    // If no slug, return all companies
    if (!slug || slug.length === 0) {
      const companiesSnapshot = await getDocs(collection(db, 'companies'));
      const companies = companiesSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().companyName || doc.data().name || 'Unknown Company',
        companyName: doc.data().companyName || doc.data().name || 'Unknown Company',
        ...doc.data()
      }));
      return res.status(200).json(companies);
    }

    // Handle different endpoints
    const [endpoint, companyId] = Array.isArray(slug) ? slug : [slug];

    if (endpoint === 'companies') {
      const companiesSnapshot = await getDocs(collection(db, 'companies'));
      const companies = companiesSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().companyName || doc.data().name || 'Unknown Company',
        companyName: doc.data().companyName || doc.data().name || 'Unknown Company',
        ...doc.data()
      }));
      return res.status(200).json(companies);
    }

    if (endpoint === 'company' && companyId) {
      const companyDoc = await getDoc(doc(db, 'companies', companyId));
      
      if (!companyDoc.exists()) {
        return res.status(404).json({ error: 'Company not found' });
      }

      const companyData = {
        id: companyDoc.id,
        ...companyDoc.data(),
        views: companyDoc.data().views || 0,
        clicks: companyDoc.data().clicks || 0,
        favourites: companyDoc.data().favourites || 0
      };

      return res.status(200).json(companyData);
    }

    res.status(404).json({ error: 'Endpoint not found' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}