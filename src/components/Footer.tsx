'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import ContactOptions from './ContactOptions';
import LegalModal from './LegalModal';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isMobile, setIsMobile] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: 'privacy' | 'terms' | 'imprint' | null }>({
    isOpen: false,
    type: null
  });
  const { t } = useTranslation();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const openLegalModal = (type: 'privacy' | 'terms' | 'imprint') => {
    setLegalModal({ isOpen: true, type });
  };

  const closeLegalModal = () => {
    setLegalModal({ isOpen: false, type: null });
  };

  const footerSections = {
    main: {
      title: t('footer.title_main'),
      links: [
        { name: t('footer.vehicles'), href: '/fahrzeuge' },
        { name: t('footer.rent'), href: '/mieten' },
        { name: t('footer.about'), href: '/ueber-uns' },
        { name: t('footer.contact'), href: '/kontakt' },
      ]
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {isMobile ? (
          /* Mobile Layout */
          <div className="py-12 space-y-8">
            
            {/* Company Info - Mobile */}
            <div className="text-center space-y-6">
              <Link href="/" className="inline-block">
                <Image
                  src="/logo.png"
                  alt="Auto Vögeli"
                  width={120}
                  height={40}
                  className="object-contain"
                />
              </Link>
              
              {/* Contact Info - Mobile */}
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-3">
                  <Phone className="h-5 w-5 text-green-400" />
                  <span className="text-lg font-semibold">032 652 11 66</span>
                </div>
                
                {/* Contact Options */}
                <div className="flex justify-center">
                  <ContactOptions variant="default" />
                </div>
                
                <div className="flex items-center justify-center space-x-3">
                  <MapPin className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300 text-sm">Solothurnstrasse 129, 2540 Grenchen</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <Clock className="h-5 w-5 text-green-400" />
                  <div className="text-gray-300 text-sm text-center">
                    <div>Mo. - Fr. / 07:30 - 12:00 / 13:30 - 17:30</div>
                    <div>Sa. / 09:00 - 12:00</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Collapsible Sections - Mobile */}
            <div className="space-y-4">
              {Object.entries(footerSections).map(([key, section]) => (
                <div key={key} className="border-b border-gray-700 pb-4">
                  <button
                    onClick={() => toggleSection(key)}
                    className="flex items-center justify-between w-full py-3 text-left"
                  >
                    <span className="text-lg font-semibold text-white">{section.title}</span>
                    {expandedSections.includes(key) ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedSections.includes(key) && (
                    <div className="mt-3 space-y-3 pl-4">
                      {section.links.map((link) => (
                        <Link
                          key={link.name}
                          href={link.href}
                          className="block text-gray-300 hover:text-green-400 transition-colors"
                        >
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Links - Mobile */}
            <div className="pt-6 border-t border-gray-700 text-center space-y-4">
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <button 
                  onClick={() => openLegalModal('imprint')}
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  {t('footer.legal_imprint')}
                </button>
                <button 
                  onClick={() => openLegalModal('privacy')}
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  {t('footer.legal_privacy')}
                </button>
                <button 
                  onClick={() => openLegalModal('terms')}
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  {t('footer.legal_terms')}
                </button>
              </div>
              <div className="text-sm text-gray-500">
                © {currentYear} Auto Vögeli. {t('footer.copyright')}
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Layout */
          <div className="py-16">
            
            {/* Main Content */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              
              {/* Company Info */}
              <div className="space-y-6">
                <Link href="/" className="inline-block">
                  <Image
                    src="/logo.png"
                    alt="Auto Vögeli"
                    width={140}
                    height={47}
                    className="object-contain"
                  />
                </Link>
                
                <p className="text-gray-300 leading-relaxed">{t('footer.description')}</p>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-green-400" />
                    <span className="font-semibold">032 652 11 66</span>
                  </div>
                  
                  {/* Contact Options */}
                  <ContactOptions variant="default" />
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300">Solothurnstrasse 129, 2540 Grenchen</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-green-400" />
                    <div className="text-gray-300">
                      <div>Mo. - Fr. / 07:30 - 12:00 / 13:30 - 17:30</div>
                      <div>Sa. / 09:00 - 12:00</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Links Section */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-6">
                  {footerSections.main.title}
                </h3>
                <ul className="space-y-4">
                  {footerSections.main.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-gray-300 hover:text-green-400 transition-colors duration-200"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-gray-700 pt-8">
              <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
                <div className="text-gray-400">
                  © {currentYear} Auto Vögeli. {t('footer.copyright')}
                </div>
                
                <div className="flex space-x-8">
                  <button
                    onClick={() => openLegalModal('imprint')}
                    className="text-gray-400 hover:text-green-400 transition-colors duration-200"
                  >
                    {t('footer.legal_imprint')}
                  </button>
                  <button
                    onClick={() => openLegalModal('privacy')}
                    className="text-gray-400 hover:text-green-400 transition-colors duration-200"
                  >
                    {t('footer.legal_privacy')}
                  </button>
                  <button
                    onClick={() => openLegalModal('terms')}
                    className="text-gray-400 hover:text-green-400 transition-colors duration-200"
                  >
                    {t('footer.legal_terms')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legal Modal */}
      {legalModal.isOpen && legalModal.type && (
        <LegalModal
          isOpen={legalModal.isOpen}
          onClose={closeLegalModal}
          type={legalModal.type}
        />
      )}
    </footer>
  );
};

export default Footer;