import { app } from '../lib/firebase-init';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const db = getFirestore(app);

export interface PartnerRequest {
  // User information
  userName: string;
  userEmail: string;
  userPhone: string;
  
  // Company information
  companyName: string;
  companyEmail?: string;
  companyWebsite?: string;
  companyLinkedIn?: string;
  
  // Context information
  searchQuery?: string;
  timestamp: any; // Firestore timestamp
  status: 'pending' | 'contacted' | 'completed';
}

export class PartnerRequestService {
  /**
   * Submit a new partner request to Firestore
   */
  static async submitPartnerRequest(requestData: {
    userName: string;
    userEmail: string;
    userPhone: string;
    companyName: string;
    companyEmail?: string;
    companyWebsite?: string;
    companyLinkedIn?: string;
    searchQuery?: string;
  }): Promise<string> {
    try {
      const partnerRequest: PartnerRequest = {
        ...requestData,
        timestamp: serverTimestamp(),
        status: 'pending'
      };

      const docRef = await addDoc(collection(db, 'partnerRequests'), partnerRequest);
      console.log('Partner request submitted with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error submitting partner request:', error);
      throw new Error('Failed to submit partner request');
    }
  }
}