'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SupportedLanguage,
  LANGUAGES,
  LanguageConfig,
  translations,
  TranslationKey,
} from './i18n';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  dir: 'ltr' | 'rtl';
  currentLangConfig: LanguageConfig;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'cyber_auditor_preferred_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('ckb');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage;
      if (savedLang && LANGUAGES[savedLang]) {
        setLanguageState(savedLang);
      }
    } catch (e) {
      console.warn('Could not read saved language from localStorage', e);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (e) {
      console.warn('Could not save language to localStorage', e);
    }

    const config = LANGUAGES[language];
    if (typeof document !== 'undefined') {
      document.documentElement.dir = config.dir;
      document.documentElement.lang = config.code;
    }
  }, [language, isInitialized]);

  const setLanguage = (newLang: SupportedLanguage) => {
    if (LANGUAGES[newLang]) {
      setLanguageState(newLang);
    }
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const langDict = translations[language] || translations.ckb;
    let text = (langDict as any)[key] || (translations.en as any)[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
      });
    }

    return text;
  };

  const currentLangConfig = LANGUAGES[language];
  const dir = currentLangConfig.dir;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        dir,
        currentLangConfig,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
