import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFirebaseAuth } from './firebase-auth-context';
import { FirebaseStorageService } from '@/services/firebase-storage';

export interface FavoriteItem {
  id: string;
  type: 'company' | 'product' | 'freelancer';
  name: string;
  description: string;
  features: string[];
  pricing: string;
  website: string;
  category: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  pinnedCards: FavoriteItem[];
  addToFavorites: (item: FavoriteItem, onSuccess?: (itemName: string) => void) => void;
  removeFromFavorites: (id: string) => void;
  isFavorite: (id: string) => boolean;
  pinCard: (item: FavoriteItem) => void;
  unpinCard: (id: string) => void;
  isPinned: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [pinnedCards, setPinnedCards] = useState<FavoriteItem[]>([]);
  const { currentUser } = useFirebaseAuth();

  // Load favorites from Firebase when user changes
  useEffect(() => {
    if (currentUser) {
      loadUserFavorites();
    } else {
      setFavorites([]);
      setPinnedCards([]);
    }
  }, [currentUser]);

  const loadUserFavorites = async () => {
    if (!currentUser) return;
    try {
      const userFavorites = await FirebaseStorageService.getFavorites(currentUser.uid);
      setFavorites(userFavorites);
      setPinnedCards(userFavorites); // All favorites are pinned
    } catch (error) {
      console.error('Error loading favorites:', error);
      // Fallback to localStorage (only on client side)
      if (typeof window !== "undefined") {
        const savedFavorites = localStorage.getItem(`favorites_${currentUser.uid}`);
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
          setPinnedCards(JSON.parse(savedFavorites));
        }
      }
    }
  };

  // Save favorites to Firebase whenever they change
  useEffect(() => {
    if (currentUser && favorites.length > 0) {
      FirebaseStorageService.saveFavorites(currentUser.uid, favorites);
      // Also save to localStorage as backup (only on client side)
      if (typeof window !== "undefined") {
        localStorage.setItem(`favorites_${currentUser.uid}`, JSON.stringify(favorites));
      }
    }
  }, [favorites, currentUser]);

  const addToFavorites = async (item: FavoriteItem, onSuccess?: (itemName: string) => void) => {
    setFavorites(prev => [...prev.filter(fav => fav.id !== item.id), item]);
    setPinnedCards(prev => [...prev.filter(pin => pin.id !== item.id), item]);
    
    if (currentUser) {
      try {
        await FirebaseStorageService.addToFavorites(currentUser.uid, item);
        if (onSuccess) {
          onSuccess(item.name);
        }
      } catch (error) {
        console.error('Error adding to favorites:', error);
      }
    } else if (onSuccess) {
      onSuccess(item.name);
    }
  };

  const removeFromFavorites = async (id: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== id));
    setPinnedCards(prev => prev.filter(pin => pin.id !== id));
    
    if (currentUser) {
      try {
        await FirebaseStorageService.removeFromFavorites(currentUser.uid, id);
      } catch (error) {
        console.error('Error removing from favorites:', error);
      }
    }
  };

  const isFavorite = (id: string) => {
    return favorites.some(fav => fav.id === id);
  };

  const pinCard = (item: FavoriteItem) => {
    setPinnedCards(prev => [...prev.filter(pin => pin.id !== item.id), item]);
  };

  const unpinCard = (id: string) => {
    setPinnedCards(prev => prev.filter(pin => pin.id !== id));
  };

  const isPinned = (id: string) => {
    return pinnedCards.some(pin => pin.id === id);
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      pinnedCards,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      pinCard,
      unpinCard,
      isPinned
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}