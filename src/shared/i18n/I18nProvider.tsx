import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { readStoredAuthSession } from '@services/auth';
import { messages } from './messages';
import { normalizeLanguage, persistStoredLanguage, readStoredLanguage, type AppLanguage } from './storage';

type TranslationParams = Record<string, string | number>;

type I18nContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: string, params?: TranslationParams) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function resolveMessage(language: AppLanguage, key: string): string {
  const segments = key.split('.');
  let current: unknown = messages[language];

  for (const segment of segments) {
    if (!current || typeof current !== 'object' || !(segment in current)) {
      return key;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return typeof current === 'string' ? current : key;
}

function applyParams(template: string, params?: TranslationParams): string {
  if (!params) {
    return template;
  }

  return Object.entries(params).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    template
  );
}

export function I18nProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<AppLanguage>(() => readStoredLanguage());

  useEffect(() => {
    const rawSessionLanguage = readStoredAuthSession()?.user?.preferred_language;
    if ((rawSessionLanguage === 'es' || rawSessionLanguage === 'en') && rawSessionLanguage !== language) {
      const sessionLanguage = normalizeLanguage(rawSessionLanguage);
      setLanguageState(sessionLanguage);
      persistStoredLanguage(sessionLanguage);
    }
  }, [language]);

  useEffect(() => {
    const syncLanguage = () => {
      const rawSessionLanguage = readStoredAuthSession()?.user?.preferred_language;
      const nextLanguage =
        rawSessionLanguage === 'es' || rawSessionLanguage === 'en'
          ? normalizeLanguage(rawSessionLanguage)
          : readStoredLanguage();
      setLanguageState(nextLanguage);
      persistStoredLanguage(nextLanguage);
    };

    window.addEventListener('storage', syncLanguage);
    window.addEventListener('app-language-sync', syncLanguage as EventListener);

    return () => {
      window.removeEventListener('storage', syncLanguage);
      window.removeEventListener('app-language-sync', syncLanguage as EventListener);
    };
  }, []);

  const value = useMemo<I18nContextValue>(() => ({
    language,
    setLanguage: (nextLanguage) => {
      setLanguageState(nextLanguage);
      persistStoredLanguage(nextLanguage);
      window.dispatchEvent(new Event('app-language-sync'));
    },
    t: (key, params) => applyParams(resolveMessage(language, key), params),
  }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n debe usarse dentro de I18nProvider.');
  }

  return context;
}
