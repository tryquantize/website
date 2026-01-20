import { app } from '../lib/firebase-init';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

const db = getFirestore(app);

export interface Company {
  id: string;
  companyName: string;
  website: string;
  linkedinPage?: string;
  pitchDeckUrl?: string;
  description?: string;
  category?: string;
  logo?: string;
  phoneNumber?: string;
  email?: string;
  founded?: string;
  headquarters?: string;
  products?: string[];
  employees?: string;
  industriesServed?: string[];
  pricingRanges?: string[];
  pricingModel?: string[];
  features?: string;
  useCases?: string;
  testimonialPage?: string;
  companyStage?: string;
  topClients?: string[];
  tagline?: string;
  trialAvailable?: boolean;
  customerSegments?: string[];
  uspTagline?: string;
  deploymentType?: string[];
  idealScenarios?: string[];
  vcEventInterested?: boolean;
  ecellEventInterested?: boolean;
  ecellPreferredDates?: string[];
  founders?: Array<{ name: string; phone: string; email: string }>;
  painPoint?: string;
  createdAt?: any;
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