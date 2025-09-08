"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useMemo } from 'react';

// Import translation files
import deTranslations from '@/locales/de/common.json';
import frTranslations from '@/locales/fr/common.json';
import enTranslations from '@/locales/en/common.json';

const translations = {
  de: deTranslations,
  fr: frTranslations,
  en: enTranslations,
};

export type Locale = 'de' | 'fr' | 'en';

export function useTranslation() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Extract locale from pathname or default to 'de'
  const getLocaleFromPath = (path: string): Locale => {
    if (path.startsWith('/fr')) return 'fr';
    if (path.startsWith('/en')) return 'en';
    return 'de';
  };
  
  const locale = getLocaleFromPath(pathname);

  const t = useMemo(() => {
    const currentTranslations = translations[locale] || translations.de;
    
    return (key: string, params?: Record<string, string | number>): any => {
      const keys = key.split('.');
      let value: any = currentTranslations;
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          // Fallback to German if key not found
          value = translations.de;
          for (const fallbackKey of keys) {
            if (value && typeof value === 'object' && fallbackKey in value) {
              value = value[fallbackKey];
            } else {
              return key; // Return key if not found anywhere
            }
          }
          break;
        }
      }
      
      if (typeof value === 'string') {
        // Replace parameters in the string
        if (params) {
          return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
            return params[paramKey]?.toString() || match;
          });
        }
        return value;
      }
      
      // Return arrays and other non-string values as-is
      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        return value;
      }
      
      return key;
    };
  }, [locale]);

  const changeLanguage = (newLocale: Locale) => {
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/';
    
    // Add new locale
    const newPath = newLocale === 'de' ? pathWithoutLocale : `/${newLocale}${pathWithoutLocale}`;
    
    router.push(newPath);
  };

  return {
    t,
    locale,
    changeLanguage,
    locales: ['de', 'fr', 'en'] as Locale[],
  };
}
