'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Globe, ChevronDown } from 'lucide-react';

const languageNames = {
  de: 'Deutsch',
  fr: 'Français', 
  en: 'English'
};

const languageFlags = {
  de: '🇩🇪',
  fr: '🇫🇷',
  en: '🇬🇧'
};

export default function LanguageSwitcher() {
  const { locale, changeLanguage, locales } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {languageFlags[locale]} {languageNames[locale]}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px]">
          {locales.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                changeLanguage(lang);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                locale === lang ? 'bg-green-50 text-green-700' : 'text-gray-700'
              }`}
            >
              <span>{languageFlags[lang]}</span>
              <span>{languageNames[lang]}</span>
            </button>
          ))}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

