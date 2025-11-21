// Independent Firebase Firestore service for waitlist - completely separate from auth
import { app } from './firebase-init';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp, onSnapshot } from 'firebase/firestore';

const db = getFirestore(app);

export interface WaitlistEntry {
  id?: string;
  name: string;
  email: string;
  whatsappNumber?: string;
  timestamp: any;
  position?: number;
}

export class WaitlistService {
  private static readonly COLLECTION_NAME = 'waitlist';

  static async addToWaitlist(name: string, email: string, whatsappNumber?: string): Promise<{ success: boolean; position?: number; error?: string }> {
    try {
      // Prepare the data object
      const data: any = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString()
      };

      // Add WhatsApp number if provided
      if (whatsappNumber) {
        data.whatsappNumber = whatsappNumber.trim();
      }

      // Add the entry to Firestore
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), data);

      // Get the current position (count of all entries)
      const position = await this.getWaitlistCount();

      return {
        success: true,
        position: position
      };
    } catch (error: any) {
      console.error('Error adding to waitlist:', error);
      return {
        success: false,
        error: error.message || 'Failed to join waitlist'
      };
    }
  }

  static async getWaitlistCount(): Promise<number> {
    try {
      const querySnapshot = await getDocs(collection(db, this.COLLECTION_NAME));
      // Start at 100 and add actual entries
      return 100 + querySnapshot.size;
    } catch (error) {
      console.error('Error getting waitlist count:', error);
      return 100; // Return 100 as fallback
    }
  }

  static onWaitlistCountChange(callback: (count: number) => void) {
    return onSnapshot(collection(db, this.COLLECTION_NAME), (snapshot) => {
      // Start at 100 and add actual entries
      callback(100 + snapshot.size);
    }, (error) => {
      console.error('Error listening to waitlist changes:', error);
      callback(100); // Fallback to 100
    });
  }

  static async getAllWaitlistEntries(): Promise<WaitlistEntry[]> {
    try {
      const q = query(collection(db, this.COLLECTION_NAME), orderBy('timestamp', 'asc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        position: index + 1
      })) as WaitlistEntry[];
    } catch (error) {
      console.error('Error getting waitlist entries:', error);
      return [];
    }
  }
}