// Independent Firebase Firestore service for waitlist - completely separate from auth
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAy882-yKs41YpCDKrNOqEgB1iKDQcJqak",
  authDomain: "firequest-auth.firebaseapp.com",
  projectId: "firequest-auth",
  storageBucket: "firequest-auth.firebasestorage.app",
  messagingSenderId: "1065297438861",
  appId: "1:1065297438861:web:d746c00a59e9c8eebfdac4",
  measurementId: "G-64FEYVFBNJ"
};

// Initialize Firebase (reuse existing app if already initialized)
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error: any) {
  if (error.code === 'app/duplicate-app') {
    app = initializeApp(firebaseConfig, 'waitlist-app');
  } else {
    throw error;
  }
}

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
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting waitlist count:', error);
      return 0;
    }
  }

  static onWaitlistCountChange(callback: (count: number) => void) {
    return onSnapshot(collection(db, this.COLLECTION_NAME), (snapshot) => {
      callback(snapshot.size);
    }, (error) => {
      console.error('Error listening to waitlist changes:', error);
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