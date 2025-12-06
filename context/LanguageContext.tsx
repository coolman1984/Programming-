
import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { LanguageContextType, Language } from '../types';
import { translations } from '../translations';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Hardcoded to English
  const language: Language = 'en';
  const dir = 'ltr';

  // No-op for setLanguage since we only support English
  const setLanguage = useCallback((lang: Language) => {
    console.warn('Language switching is disabled. Only English is supported.');
  }, []);

  // Simplified translation function
  const t = useCallback((key: string): string => {
    const enTranslations = translations.en as Record<string, string>;
    return enTranslations[key] || key;
  }, []);

  // Force document direction/lang
  React.useEffect(() => {
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
