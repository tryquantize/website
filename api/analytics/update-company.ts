import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { companyId, updateData } = req.body;
    
    if (!companyId || !updateData) {
      return res.status(400).json({ error: 'Company ID and update data required' });
    }

    // Remove analytics fields from update data to prevent manual manipulation
    const cleanUpdateData = { ...updateData };
    delete cleanUpdateData.views;
    delete cleanUpdateData.clicks;
    delete cleanUpdateData.favourites;
    delete cleanUpdateData.id;

    const db = getFirestore(app);
    const companyRef = doc(db, 'companies', companyId);
    await updateDoc(companyRef, cleanUpdateData);

    res.status(200).json({ success: true, message: 'Company updated successfully' });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
}