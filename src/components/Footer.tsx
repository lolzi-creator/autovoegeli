'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isMobile, setIsMobile] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
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

  const footerSections = {
    services: {
      title: t('footer.title_services'),
      links: [
        { name: t('footer.sale'), href: '/fahrzeuge' },
        { name: t('footer.financing'), href: '/finanzierung' },
        { name: t('footer.leasing'), href: '/leasing' },
        { name: t('footer.service_maintenance'), href: '/service' },
      ]
    },
    company: {
      title: t('footer.title_company'),
      links: [
        { name: t('footer.about'), href: '/ueber-uns' },
        { name: t('footer.career'), href: '/karriere' },
        { name: t('footer.press'), href: '/presse' },
        { name: t('footer.locations'), href: '/standorte' },
      ]
    },
    support: {
      title: t('footer.title_support'),
      links: [
        { name: t('footer.contact'), href: '/kontakt' },
        { name: t('footer.faq'), href: '/faq' },
        { name: t('footer.warranty'), href: '/garantie' },
        { name: t('footer.testdrive'), href: '/probefahrt' },
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
                  className="object-contain brightness-0 invert"
                />
              </Link>
              
              {/* Contact Info - Mobile */}
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-3">
                  <Phone className="h-5 w-5 text-green-400" />
                  <span className="text-lg font-semibold">032 652 11 66</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <Mail className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">info@autovoegeli.ch</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <Clock className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300 text-sm">Mo-Fr 8:00-18:00</span>
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
                <Link href="/impressum" className="text-gray-400 hover:text-green-400 transition-colors">
                  {t('footer.legal_imprint')}
                </Link>
                <Link href="/datenschutz" className="text-gray-400 hover:text-green-400 transition-colors">
                  {t('footer.legal_privacy')}
                </Link>
                <Link href="/agb" className="text-gray-400 hover:text-green-400 transition-colors">
                  {t('footer.legal_terms')}
                </Link>
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
            <div className="grid lg:grid-cols-4 gap-8 mb-12">
              
              {/* Company Info */}
              <div className="lg:col-span-1 space-y-6">
                <Link href="/" className="inline-block">
                  <Image
                    src="/logo.png"
                    alt="Auto Vögeli"
                    width={140}
                    height={47}
                    className="object-contain brightness-0 invert"
                  />
                </Link>
                
                <p className="text-gray-300 leading-relaxed">{t('footer.description')}</p>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-green-400" />
                    <span className="font-semibold">032 652 11 66</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300">info@autovoegeli.ch</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300">{t('footer.hours')}</span>
                  </div>
                </div>
              </div>

              {/* Links Sections */}
              {Object.entries(footerSections).map(([key, section]) => (
                <div key={key}>
                  <h3 className="text-lg font-semibold text-white mb-6">
                    {section.title}
                  </h3>
                  <ul className="space-y-4">
                    {section.links.map((link) => (
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
              ))}
            </div>

            {/* Bottom Section */}
            <div className="border-t border-gray-700 pt-8">
              <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
                <div className="text-gray-400">
                  © {currentYear} Auto Vögeli. {t('footer.copyright')}
                </div>
                
                <div className="flex space-x-8">
                  <Link
                    href="/impressum"
                    className="text-gray-400 hover:text-green-400 transition-colors duration-200"
                  >
                    {t('footer.legal_imprint')}
                  </Link>
                  <Link
                    href="/datenschutz"
                    className="text-gray-400 hover:text-green-400 transition-colors duration-200"
                  >
                    {t('footer.legal_privacy')}
                  </Link>
                  <Link
                    href="/agb"
                    className="text-gray-400 hover:text-green-400 transition-colors duration-200"
                  >
                    {t('footer.legal_terms')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;