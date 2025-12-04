
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { LanguageContextType, Language } from '../types';
import { translations } from '../translations';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // STRICTLY ENGLISH ONLY (International)
  const language: Language = 'en';
  const dir = 'ltr';

  const t = (key: string): string => {
    // @ts-ignore
    return translations['en']?.[key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: () => {}, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (undefined === context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
