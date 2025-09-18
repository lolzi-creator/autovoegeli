"use client";
import React from 'react';
import Link from 'next/link';
import { MapPin, MessageCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

// WhatsApp utility function
const createWhatsAppLink = () => {
  const phoneNumber = "+41792664262"; // Remove spaces and special chars for URL
  const message = `Hallo! Ich interessiere mich für Ihre Fahrzeuge und möchte gerne eine Probefahrt vereinbaren oder weitere Informationen erhalten. Vielen Dank!`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

const VisitCta = () => {
  const { t } = useTranslation();
  return (
    <section className="relative py-14 md:py-20 bg-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-green-200/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-10 w-72 h-72 bg-emerald-200/40 rounded-full blur-3xl"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gray-200 overflow-hidden bg-gradient-to-br from-green-50 to-white">
          <div className="p-6 md:p-10 grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t('home.visit_title')}</h3>
              <p className="text-gray-600 md:text-lg">{t('home.visit_subtitle')}</p>
            </div>
            <div className="flex gap-3 md:justify-end">
              <a 
                href={createWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-xl"
              >
                <MessageCircle className="w-5 h-5" /> {t('home.visit_contact')}
              </a>
              <a href="https://maps.google.com/maps?q=Solothurnstrasse+129,+2540+Grenchen" target="_blank" className="inline-flex items-center gap-2 border-2 border-gray-300 hover:border-green-600 text-gray-700 hover:text-green-700 font-semibold px-5 py-3 rounded-xl">
                <MapPin className="w-5 h-5" /> {t('home.visit_route')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisitCta;


