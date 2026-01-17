/**
 * Firestore Integration for Partner Requests
 * 
 * This file provides functions to store partner requests directly in Firestore.
 * To use this instead of the current API approach:
 * 
 * 1. Import this service in company-cards.tsx
 * 2. Replace the API call with direct Firestore storage
 * 3. Make sure Firebase is properly configured
 */

import { app } from '../lib/firebase-init';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, where } from 'firebase/firestore';

const db = getFirestore(app);

export interface PartnerRequestData {
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

export class FirestorePartnerService {
  /**
   * Submit a partner request directly to Firestore
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
      const partnerRequest: PartnerRequestData = {
        ...requestData,
        timestamp: serverTimestamp(),
        status: 'pending'
      };

      const docRef = await addDoc(collection(db, 'partnerRequests'), partnerRequest);
      console.log('Partner request submitted to Firestore with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error submitting partner request to Firestore:', error);
      throw new Error('Failed to submit partner request');
    }
  }

  /**
   * Get all partner requests (for admin use)
   */
  static async getAllPartnerRequests(): Promise<PartnerRequestData[]> {
    try {
      const q = query(collection(db, 'partnerRequests'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PartnerRequestData & { id: string }));
    } catch (error) {
      console.error('Error fetching partner requests:', error);
      throw new Error('Failed to fetch partner requests');
    }
  }

  /**
   * Get partner requests for a specific company
   */
  static async getPartnerRequestsForCompany(companyName: string): Promise<PartnerRequestData[]> {
    try {
      const q = query(
        collection(db, 'partnerRequests'), 
        where('companyName', '==', companyName),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PartnerRequestData & { id: string }));
    } catch (error) {
      console.error('Error fetching partner requests for company:', error);
      throw new Error('Failed to fetch partner requests for company');
    }
  }
}

/**
 * Example usage in company-cards.tsx:
 * 
 * import { FirestorePartnerService } from '@/services/firestore-partner-service';
 * 
 * const handlePartnerSubmit = async (formData) => {
 *   try {
 *     const requestId = await FirestorePartnerService.submitPartnerRequest({
 *       userName: formData.name,
 *       userEmail: formData.email,
 *       userPhone: formData.phone,
 *       companyName: partnerPopup.companyContactInfo.companyName,
 *       companyEmail: formData.companyEmail,
 *       companyWebsite: formData.companyWebsite,
 *       companyLinkedIn: formData.companyLinkedIn,
 *       searchQuery
 *     });
 *     
 *     // Show success message
 *     console.log('Partner request submitted with ID:', requestId);
 *   } catch (error) {
 *     console.error('Failed to submit partner request:', error);
 *   }
 * };
 */