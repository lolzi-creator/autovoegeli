'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Phone, Mail, MapPin, Globe } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitcher from './LanguageSwitcher';
import ContactOptions from './ContactOptions';

// Mobile Language Switcher Component
const MobileLanguageSwitcher = () => {
  const { locale, changeLanguage, locales } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languageFlags = {
    de: '🇩🇪',
    fr: '🇫🇷',
    en: '🇬🇧'
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-gray-50 transition-colors duration-200"
        title="Sprache ändern"
      >
        <Globe className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
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
              <span className="capitalize">{lang}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { t, locale } = useTranslation();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const navigation = [
    { name: t('navigation.vehicles'), href: `/${locale}/fahrzeuge` },
    { name: t('navigation.rent'), href: `/${locale}/mieten` },
    { name: t('navigation.financing'), href: `/${locale}/finanzierung` },
    { name: t('navigation.about'), href: `/${locale}/ueber-uns` },
    { name: t('navigation.contact'), href: `/${locale}/kontakt` },
  ];

  const openGoogleMaps = () => {
    // Auto Vögeli garage address - you can update this with your actual address
    const address = "Auto Vögeli, Solothurnstrasse 129, 2540 Grenchen, Switzerland";
    const encodedAddress = encodeURIComponent(address);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <>
      {/* Top Bar - Desktop Only */}
      {!isMobile && (
        <div className="bg-gray-900 text-white py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>032 652 11 66</span>
                </div>
                <ContactOptions variant="inline" />
              </div>
              <div className="text-gray-300">
                <div>Mo. - Fr. / 07:30 - 12:00 / 13:30 - 17:30</div>
                <div>Sa. / 09:00 - 12:00</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Auto Vögeli"
                width={isMobile ? 120 : 140}
                height={isMobile ? 40 : 47}
                className="object-contain"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-200 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center space-x-3">
              <LanguageSwitcher />
              <button
                onClick={openGoogleMaps}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors duration-200"
                title="Route zu uns planen"
              >
                <MapPin className="h-4 w-4" />
                <span>Route</span>
              </button>
              <Link
                href={`/${locale}/kontakt`}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
              >
                {t('contact.consultation')}
              </Link>
            </div>

            {/* Mobile Menu Button & Language Switcher */}
            <div className="lg:hidden flex items-center space-x-2">
              {/* Compact Language Switcher */}
              <MobileLanguageSwitcher />
              
              {/* Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-gray-50 transition-colors duration-200"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              
              {/* Mobile Contact Info */}
              <div className="px-3 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-3 mb-3">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-gray-900">032 652 11 66</span>
                </div>
                
                {/* Contact Options */}
                <ContactOptions variant="compact" />
              </div>

              {/* Mobile Navigation */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile CTA */}
              <div className="px-3 pt-4 pb-2 space-y-3">
                <div className="flex justify-center">
                  <LanguageSwitcher />
                </div>
                <button
                  onClick={() => {
                    openGoogleMaps();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center justify-center space-x-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Route zu uns planen</span>
                </button>
                <Link
                  href={`/${locale}/kontakt`}
                  className="block w-full bg-green-600 hover:bg-green-700 text-white text-center px-4 py-3 rounded-lg font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('contact.consultation')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;