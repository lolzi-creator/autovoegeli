'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Shield, Users, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Threads from '@/Backgrounds/Threads/Threads';

const Hero = () => {
  const [isMobile, setIsMobile] = useState(false);
  const motorbikes = [
    { title: 'Zontes 703F ADV', category: 'Adventure', price: "ab CHF 7'990", year: '2024', mileage: '0 km', power: '70 PS', image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', gradient: 'from-emerald-500 to-green-700' },
    { title: 'KOVE 800X Pro', category: 'Adventure', price: "ab CHF 12'990", year: '2024', mileage: '0 km', power: '95 PS', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', gradient: 'from-cyan-500 to-blue-600' },
    { title: 'VOGE 900 DSX', category: 'Touring', price: "ab CHF 10'990", year: '2024', mileage: '0 km', power: '94 PS', image: 'https://images.unsplash.com/photo-1558981033-0f0309284409?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', gradient: 'from-indigo-500 to-purple-600' },
    { title: 'SWM Hoku 125 ABS', category: 'Naked', price: "ab CHF 3'990", year: '2024', mileage: '0 km', power: '15 PS', image: 'https://images.unsplash.com/photo-1559289431-9f12ee08f8b6?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', gradient: 'from-orange-500 to-red-600' },
  ];
  const [currentBikeIndex, setCurrentBikeIndex] = useState(0);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentBikeIndex((prev) => (prev + 1) % motorbikes.length);
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [motorbikes.length]);

  return (
    <section className={`relative ${isMobile ? 'min-h-[70vh] py-6' : 'min-h-[80vh]'} flex items-center overflow-hidden bg-gradient-to-br from-gray-50 to-white`}>
      
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <Threads 
          color={[0.55, 0.77, 0.26]}
          amplitude={1.2}
          distance={0.3}
          enableMouseInteraction={false}
        />
      </div>

      {/* Mobile Background Pattern */}
      {isMobile && (
        <div className="absolute inset-0 bg-gradient-to-b from-green-50/30 to-transparent"></div>
      )}

      <div className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Content */}
            <div className={`${isMobile ? 'text-center py-6' : 'text-left py-20'} space-y-6 lg:space-y-8`}>
              
              {/* Mobile Badge */}
              {isMobile && (
                <div className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  <Award className="h-3 w-3 mr-1.5" />
                  Schweizer Premium-Autohaus
                </div>
              )}

              {/* Desktop Badge */}
              {!isMobile && (
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <Award className="h-4 w-4 mr-2" />
                  Schweizer Premium-Autohaus
                </div>
              )}

              {/* Main Heading */}
              <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl lg:text-6xl'} font-bold text-gray-900 leading-tight`}>
                Ihr Traum-Auto
                <span className="block text-green-600">wartet auf Sie</span>
              </h1>

              {/* Description */}
              <p className={`${isMobile ? 'text-base px-4' : 'text-lg lg:text-xl'} text-gray-600 max-w-xl ${isMobile ? 'mx-auto' : ''}`}>
                {isMobile 
                  ? 'Entdecken Sie unsere handverlesenen Premium-Fahrzeuge mit Qualitätsgarantie und erstklassigem Service.'
                  : 'Entdecken Sie unsere handverlesenen Premium-Fahrzeuge mit Qualitätsgarantie, transparenter Beratung und erstklassigem Service.'
                }
              </p>

              {/* CTA Buttons */}
              <div className={`flex ${isMobile ? 'flex-col space-y-3 px-4' : 'flex-row space-x-4'} ${isMobile ? 'items-center' : 'items-start'}`}>
                <Link
                  href="/fahrzeuge"
                  className={`${isMobile ? 'w-full py-4 text-base' : 'px-8 py-4'} inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg`}
                >
                  Fahrzeuge entdecken
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/kontakt"
                  className={`${isMobile ? 'w-full py-4 text-base' : 'px-8 py-4'} inline-flex items-center justify-center border-2 border-gray-300 hover:border-green-600 text-gray-700 hover:text-green-600 font-semibold rounded-xl transition-colors duration-200 bg-white shadow-lg`}
                >
                  Beratung vereinbaren
                </Link>
              </div>

              {/* Trust Indicators / Mobile Bike Showcase */}
              <div className={`${isMobile ? 'pt-4' : 'pt-12'}`}>
                {isMobile ? (
                  /* Mobile Bike Showcase - Compact Horizontal */
                  <div className="mx-4">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`mobile-bike-${currentBikeIndex}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-center rounded-2xl bg-white p-3 shadow-lg border border-gray-100`}
                      >
                        {/* Image Left, Bigger */}
                        <div className="w-32 h-24 rounded-xl overflow-hidden flex-shrink-0 mr-3 relative">
                          <Image
                            src={motorbikes[currentBikeIndex].image}
                            alt={motorbikes[currentBikeIndex].title}
                            fill
                            className="object-cover"
                            sizes="128px"
                          />
                        </div>

                        {/* Stats Right */}
                        <div className="flex-1 pl-1">
                          <div className="text-[10px] uppercase tracking-wider text-gray-500">{motorbikes[currentBikeIndex].category}</div>
                          <div className="text-base font-bold leading-snug text-gray-900">{motorbikes[currentBikeIndex].title}</div>
                          <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-gray-700">
                            <div className="bg-gray-50 rounded px-2 py-1">
                              <div className="text-gray-500">BJ</div>
                              <div className="font-semibold">{motorbikes[currentBikeIndex].year}</div>
                            </div>
                            <div className="bg-gray-50 rounded px-2 py-1">
                              <div className="text-gray-500">PS</div>
                              <div className="font-semibold">{motorbikes[currentBikeIndex].power}</div>
                            </div>
                            <div className="bg-gray-50 rounded px-2 py-1">
                              <div className="text-gray-500">KM</div>
                              <div className="font-semibold">{motorbikes[currentBikeIndex].mileage}</div>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="text-base font-bold text-green-600">{motorbikes[currentBikeIndex].price}</div>
                            <Link href="/fahrzeuge" className="text-[12px] font-semibold bg-green-600 text-white px-3 py-1.5 rounded-lg">
                              Ansehen
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                ) : (
                  /* Desktop Trust Indicators */
                  <div className="grid grid-cols-3 gap-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Shield className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Qualitätsgarantie</div>
                        <div className="text-sm text-gray-600">Geprüfte Fahrzeuge</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">15+ Jahre</div>
                        <div className="text-sm text-gray-600">Erfahrung</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Star className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">98% Zufrieden</div>
                        <div className="text-sm text-gray-600">Kundenbewertung</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Bike Showcase */}
            {!isMobile && (
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentBikeIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className={`aspect-[4/3] rounded-3xl bg-gradient-to-br ${motorbikes[currentBikeIndex].gradient} shadow-2xl overflow-hidden flex items-end relative`}
                  >
                    <Image
                      src={motorbikes[currentBikeIndex].image}
                      alt={motorbikes[currentBikeIndex].title}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </motion.div>
                </AnimatePresence>
                {/* Stats Card Below Image - compact, connected, animated */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`desktop-card-${currentBikeIndex}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                    className="-mt-6 md:-mt-8 mx-4 md:mx-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-4 max-w-xl"
                  >
                    <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">{motorbikes[currentBikeIndex].category}</div>
                    <h3 className="text-xl md:text-2xl font-bold leading-tight mb-3 text-gray-900">{motorbikes[currentBikeIndex].title}</h3>
                    <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-gray-500">Baujahr</div>
                        <div className="font-semibold text-gray-900">{motorbikes[currentBikeIndex].year}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-gray-500">Leistung</div>
                        <div className="font-semibold text-gray-900">{motorbikes[currentBikeIndex].power}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-gray-500">KM</div>
                        <div className="font-semibold text-gray-900">{motorbikes[currentBikeIndex].mileage}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xl md:text-2xl font-bold text-gray-900">{motorbikes[currentBikeIndex].price}</div>
                      <a href="/fahrzeuge" className="inline-flex items-center bg-gray-900 text-white hover:bg-black font-semibold px-4 py-2 text-sm rounded-lg transition-colors">
                        Jetzt ansehen
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;