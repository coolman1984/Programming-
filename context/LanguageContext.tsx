
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { LanguageContextType, Language } from '../types';
import { translations } from '../translations';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Type-safe translation key type
type TranslationKey = keyof typeof translations.en;

// Storage key for persisting language preference
const LANGUAGE_STORAGE_KEY = 'gold-insight-language';

// Get initial language from storage or default to 'en'
const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'en' || stored === 'ar') {
      return stored;
    }
  }
  return 'en';
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [dir, setDir] = useState<'ltr' | 'rtl'>(getInitialLanguage() === 'ar' ? 'rtl' : 'ltr');

  // Update language and persist to storage
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }, []);

  // Translation function with type safety
  const t = useCallback((key: string): string => {
    const langTranslations = translations[language] as Record<string, string> | undefined;
    if (langTranslations && key in langTranslations) {
      return langTranslations[key];
    }
    // Fallback to English if key not found in current language
    const enTranslations = translations.en as Record<string, string>;
    return enTranslations[key] || key;
  }, [language]);

  // Update document attributes when language changes
  useEffect(() => {
    const newDir = language === 'ar' ? 'rtl' : 'ltr';
    setDir(newDir);
    document.documentElement.lang = language;
    document.documentElement.dir = newDir;
  }, [language]);

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
