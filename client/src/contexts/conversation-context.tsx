import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFirebaseAuth } from './firebase-auth-context';
import { FirebaseStorageService, Conversation, ConversationMessage } from '@/services/firebase-storage';

interface ConversationContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  createNewConversation: (query: string) => string;
  addMessageToConversation: (conversationId: string, message: ConversationMessage) => void;
  loadConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  isLoading: boolean;
}

const ConversationContext = createContext<ConversationContextType | null>(null);

export function useConversations() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversations must be used within ConversationProvider');
  }
  return context;
}

export function ConversationProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useFirebaseAuth();

  // Load conversations when user changes
  useEffect(() => {
    if (currentUser) {
      loadUserConversations();
    } else {
      setConversations([]);
      setCurrentConversation(null);
    }
  }, [currentUser]);

  const loadUserConversations = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const userConversations = await FirebaseStorageService.getConversations(currentUser.uid);
      setConversations(userConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = (query: string): string => {
    if (!currentUser) return '';

    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newConversation: Conversation = {
      id: conversationId,
      title: query.length > 50 ? query.substring(0, 50) + '...' : query,
      query,
      timestamp: Date.now(),
      messages: []
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newConversation);

    // Save to Firebase
    FirebaseStorageService.saveConversation(currentUser.uid, newConversation);

    return conversationId;
  };

  const addMessageToConversation = async (conversationId: string, message: ConversationMessage) => {
    if (!currentUser) return;

    // Update local state
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, messages: [...conv.messages, message], timestamp: Date.now() }
        : conv
    ));

    if (currentConversation?.id === conversationId) {
      setCurrentConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, message],
        timestamp: Date.now()
      } : null);
    }

    // Save to Firebase
    try {
      await FirebaseStorageService.updateConversation(currentUser.uid, conversationId, message);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const loadConversation = (conversationId: string) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!currentUser) return;

    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
    }

    try {
      await FirebaseStorageService.deleteConversation(currentUser.uid, conversationId);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  return (
    <ConversationContext.Provider value={{
      conversations,
      currentConversation,
      createNewConversation,
      addMessageToConversation,
      loadConversation,
      deleteConversation,
      isLoading
    }}>
      {children}
    </ConversationContext.Provider>
  );
}