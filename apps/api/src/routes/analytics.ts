import { Router } from 'express';
import { getFirestore, doc, updateDoc, increment, getDoc, getDocs, collection } from 'firebase/firestore';
import { app } from '../lib/firebase-init';

const router = Router();
const db = getFirestore(app);

// Add CORS headers for all analytics routes
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Increment company analytics counter
router.post('/increment/:companyId/:metric', async (req, res) => {
  try {
    const { companyId, metric } = req.params;
    
    if (!['views', 'clicks', 'favourites'].includes(metric)) {
      return res.status(400).json({ error: 'Invalid metric' });
    }

    const companyRef = doc(db, 'companies', companyId);
    await updateDoc(companyRef, {
      [metric]: increment(1)
    });

    res.json({ success: true, message: `${metric} incremented for company ${companyId}` });
  } catch (error) {
    console.error('Error incrementing analytics:', error);
    res.status(500).json({ error: 'Failed to increment analytics' });
  }
});

// Get all companies for dropdown
router.get('/companies', async (req, res) => {
  try {
    const companiesSnapshot = await getDocs(collection(db, 'companies'));
    const companies = companiesSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().companyName || doc.data().name || 'Unknown Company',
      companyName: doc.data().companyName || doc.data().name || 'Unknown Company',
      ...doc.data()
    }));

    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Get specific company with analytics
router.get('/company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
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

    res.json(companyData);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// Update company information
router.put('/company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const updateData = req.body;

    // Remove analytics fields from update data to prevent manual manipulation
    delete updateData.views;
    delete updateData.clicks;
    delete updateData.favourites;
    delete updateData.id;

    const companyRef = doc(db, 'companies', companyId);
    await updateDoc(companyRef, updateData);

    res.json({ success: true, message: 'Company updated successfully' });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

export default router;