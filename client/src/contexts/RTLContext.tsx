import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface RTLContextType {
  isRTL: boolean;
  setRTL: (rtl: boolean) => void;
}

const RTLContext = createContext<RTLContextType | null>(null);

export const useRTL = () => {
  const context = useContext(RTLContext);
  if (!context) {
    throw new Error('useRTL must be used within a RTLProvider');
  }
  return context;
};

interface RTLProviderProps {
  children: ReactNode;
}

export const RTLProvider: React.FC<RTLProviderProps> = ({ children }) => {
  const [isRTL, setRTL] = useState(true); // Default to RTL for Arabic

  useEffect(() => {
    // Set the document direction
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    
    // Add or remove RTL class to body
    if (isRTL) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [isRTL]);

  return (
    <RTLContext.Provider value={{ isRTL, setRTL }}>
      {children}
    </RTLContext.Provider>
  );
};
