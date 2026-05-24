export type AppLanguage = 'es' | 'en';

export const LANGUAGE_STORAGE_KEY = 'app_language';

export function normalizeLanguage(value: unknown): AppLanguage {
  return value === 'en' ? 'en' : 'es';
}

export function readStoredLanguage(): AppLanguage {
  if (typeof window === 'undefined') {
    return 'es';
  }

  const raw = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (raw === 'es' || raw === 'en') {
    return raw;
  }

  const browserLanguage = window.navigator.language?.toLowerCase() ?? 'es';
  return browserLanguage.startsWith('en') ? 'en' : 'es';
}

export function persistStoredLanguage(language: AppLanguage) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}
