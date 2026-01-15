import { app } from '../lib/firebase-init';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

const db = getFirestore(app);

export interface Company {
  id: string;
  companyName: string;
  website: string;
  description?: string;
  category?: string;
  logo?: string;
}

export class CompanyService {
  static async getAllCompanies(): Promise<Company[]> {
    try {
      const companiesRef = collection(db, 'companies');
      const q = query(companiesRef, orderBy('companyName', 'asc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Company));
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  }
}