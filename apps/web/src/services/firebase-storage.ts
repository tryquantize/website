import { app } from '../lib/firebase-init';
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { FavoriteItem } from '@/contexts/favorites-context';

const db = getFirestore(app);

export interface Conversation {
  id: string;
  title: string;
  query: string;
  timestamp: number;
  messages: ConversationMessage[];
}

export interface ConversationMessage {
  id: string;
  type: 'query' | 'response';
  content: string;
  timestamp: number;
  aiResponse?: string;
  suggestions?: string[];
  companies?: any[];
}

export class FirebaseStorageService {
  // Favorites Management
  static async saveFavorites(userId: string, favorites: FavoriteItem[]) {
    try {
      const userDoc = doc(db, 'users', userId);
      await setDoc(userDoc, { favorites }, { merge: true });
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }

  static async getFavorites(userId: string): Promise<FavoriteItem[]> {
    try {
      const userDoc = doc(db, 'users', userId);
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        return docSnap.data().favorites || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  static async addToFavorites(userId: string, item: FavoriteItem) {
    try {
      const userDoc = doc(db, 'users', userId);
      await updateDoc(userDoc, {
        favorites: arrayUnion(item)
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  }

  static async removeFromFavorites(userId: string, itemId: string) {
    try {
      const favorites = await this.getFavorites(userId);
      const updatedFavorites = favorites.filter(fav => fav.id !== itemId);
      await this.saveFavorites(userId, updatedFavorites);
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  }

  // Conversation Management
  static async saveConversation(userId: string, conversation: Conversation) {
    try {
      const conversationDoc = doc(db, 'users', userId, 'conversations', conversation.id);
      await setDoc(conversationDoc, conversation);
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }

  static async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const conversationsRef = collection(db, 'users', userId, 'conversations');
      const q = query(conversationsRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Conversation));
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  }

  static async updateConversation(userId: string, conversationId: string, message: ConversationMessage) {
    try {
      const conversationDoc = doc(db, 'users', userId, 'conversations', conversationId);
      await updateDoc(conversationDoc, {
        messages: arrayUnion(message),
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  }

  static async deleteConversation(userId: string, conversationId: string) {
    try {
      const conversationDoc = doc(db, 'users', userId, 'conversations', conversationId);
      await setDoc(conversationDoc, { deleted: true }, { merge: true });
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }
}