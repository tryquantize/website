import { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  fromPage: string;
  toPage: string;
  startLoading: (from: string, to: string) => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [fromPage, setFromPage] = useState('');
  const [toPage, setToPage] = useState('');

  const startLoading = (from: string, to: string) => {
    setFromPage(from);
    setToPage(to);
    setIsLoading(true);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setFromPage('');
    setToPage('');
  };

  return (
    <LoadingContext.Provider value={{
      isLoading,
      fromPage,
      toPage,
      startLoading,
      stopLoading
    }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}