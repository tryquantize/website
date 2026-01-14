import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';
import { app } from '@/lib/firebase-init';

export interface CompanyNotification {
  id: string;
  name: string;
  usp: string;
  website?: string;
}

export async function getCompanyNotifications(): Promise<CompanyNotification[]> {
  try {
    const db = getFirestore(app);
    const companiesRef = collection(db, 'companies');
    const querySnapshot = await getDocs(companiesRef);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || data.companyName || 'Unknown Company',
        usp: data.usp || data.uspTagline || data.tagline || data.description || 'Innovative AI solutions',
        website: data.website || data.websiteUrl || undefined
      };
    });
  } catch (error) {
    console.error('Error fetching company notifications:', error);
    // Fallback data if Firestore fails
    return [
      { id: '1', name: 'OpenAI', usp: 'Leading AI research and deployment', website: 'https://openai.com' },
      { id: '2', name: 'Anthropic', usp: 'Safe, beneficial AI systems', website: 'https://anthropic.com' },
      { id: '3', name: 'Perplexity', usp: 'AI-powered search engine', website: 'https://perplexity.ai' }
    ];
  }
}