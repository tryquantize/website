import React, { createContext, useContext } from 'react';

interface NotificationContextType {
  showFavoritesNotification?: (itemName: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({});

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ 
  children, 
  showFavoritesNotification 
}: { 
  children: React.ReactNode;
  showFavoritesNotification?: (itemName: string) => void;
}) {
  return (
    <NotificationContext.Provider value={{ showFavoritesNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}