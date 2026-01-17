import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, updateDoc, increment } from 'firebase/firestore';

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
    const { companyId, metric } = req.body;
    
    if (!companyId || !metric) {
      return res.status(400).json({ error: 'Company ID and metric required' });
    }

    if (!['views', 'clicks', 'favourites'].includes(metric)) {
      return res.status(400).json({ error: 'Invalid metric' });
    }

    const db = getFirestore(app);
    const companyRef = doc(db, 'companies', companyId);
    await updateDoc(companyRef, {
      [metric]: increment(1)
    });

    res.status(200).json({ success: true, message: `${metric} incremented for company ${companyId}` });
  } catch (error) {
    console.error('Error incrementing analytics:', error);
    res.status(500).json({ error: 'Failed to increment analytics' });
  }
}