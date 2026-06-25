import tr from './locales/tr.json';
import en from './locales/en.json';

export type Locale = 'tr' | 'en';

const dictionaries = {
  tr,
  en,
};

const defaultLocale: Locale = 'tr';

const locales: Locale[] = ['tr', 'en'];

function getDictionary(locale: Locale) {
  return dictionaries[locale] || dictionaries[defaultLocale];
}

export function createTranslator(locale: Locale) {
  const dictionary = getDictionary(locale);
  
  return function t(key: string, fallback?: string): string {
    const keys = key.split('.');
    let current: any = dictionary;
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return fallback || key;
      }
    }
    
    return typeof current === 'string' ? current : fallback || key;
  };
}
