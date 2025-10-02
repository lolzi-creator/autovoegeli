'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Shield, Users, ChevronLeft, ChevronRight } from 'lucide-react';
// Removed heavy animations for performance
// import { motion, AnimatePresence } from 'framer-motion';
// import Threads from '@/Backgrounds/Threads/Threads';
import ActionBox from './ActionBox';
import { loadRealVehicleData } from '@/lib/vehicle-data-loader';
import { type ScrapedVehicle } from '@/lib/autoscout-scraper';
import { loadMultilingualVehicleData, type MultilingualVehicle } from '@/lib/multilingual-vehicle-data-loader';
import { useTranslation } from '@/hooks/useTranslation';

const Hero = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [vehicles, setVehicles] = useState<ScrapedVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBikeIndex, setCurrentBikeIndex] = useState(0);
  const { t, locale } = useTranslation();

  // Load default vehicle data from Supabase
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const data = await loadMultilingualVehicleData();
        // Take first 3 bikes for hero showcase
        const bikes = data.filter(v => v.category === 'bike').slice(0, 3);
        // Convert to ScrapedVehicle format for compatibility
        const mapped: ScrapedVehicle[] = bikes.map((v: MultilingualVehicle) => ({
          id: v.id,
          title: v.title,
          brand: v.brand,
          model: v.model,
          year: v.year,
          price: v.price,
          mileage: v.mileage,
          fuel: v.fuel,
          transmission: v.transmission,
          power: v.power,
          bodyType: v.bodyType,
          color: v.color,
          images: v.images,
          description: v.description,
          features: v.features,
          location: v.location,
          dealer: v.dealer,
          url: v.url,
          condition: v.condition,
          firstRegistration: v.firstRegistration,
          doors: v.doors,
          seats: v.seats,
          co2Emission: v.co2Emission,
          consumption: v.consumption,
          fahrzeugbeschreibung: '',
          equipment: v.features,
          warranty: v.warranty,
          warrantyDetails: v.warrantyDetails,
          warrantyMonths: v.warrantyMonths,
          mfk: v.mfk,
          displacement: v.displacement as any,
          drive: v.drive,
          vehicleAge: v.vehicleAge,
          pricePerYear: v.pricePerYear,
        }));
        setVehicles(mapped);
        setLoading(false);
      } catch (error) {
        console.error('Error loading vehicles for hero:', error);
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);

  // Override hero vehicles with admin-selected featured (from Supabase) if available
  useEffect(() => {
    const loadFeaturedForHero = async () => {
      try {
        // Add cache busting parameter to ensure fresh data
        const cacheBuster = Date.now();
        const r = await fetch(`/api/settings?key=homepage_featured_vehicle_ids&t=${cacheBuster}`);
        const j = await r.json();
        const ids: string[] = Array.isArray(j?.value) ? j.value : [];
        if (ids.length === 0) return; // keep default
        const all = await loadMultilingualVehicleData();
        const pick = all.filter(v => ids.includes(v.id)).slice(0, 5);
        if (pick.length === 0) return;
        const mapped: ScrapedVehicle[] = pick.map((v: MultilingualVehicle) => ({
          id: v.id,
          title: v.title,
          brand: v.brand,
          model: v.model,
          year: v.year,
          price: v.price,
          mileage: v.mileage,
          fuel: v.fuel,
          transmission: v.transmission,
          power: v.power,
          bodyType: v.bodyType,
          color: v.color,
          images: v.images,
          description: v.description,
          features: v.features,
          location: v.location,
          dealer: v.dealer,
          url: v.url,
          condition: v.condition,
          firstRegistration: v.firstRegistration,
          doors: v.doors,
          seats: v.seats,
          co2Emission: v.co2Emission,
          consumption: v.consumption,
          fahrzeugbeschreibung: '',
          equipment: v.features,
          warranty: v.warranty,
          warrantyDetails: v.warrantyDetails,
          warrantyMonths: v.warrantyMonths,
          mfk: v.mfk,
          displacement: v.displacement as any,
          drive: v.drive,
          vehicleAge: v.vehicleAge,
          pricePerYear: v.pricePerYear,
        }));
        setVehicles(mapped);
      } catch (e) {
        // ignore; keep default
      }
    };
    loadFeaturedForHero();
  }, []);

  // Convert vehicle data to display format
  const motorbikes = vehicles.map((vehicle, index) => ({
    title: vehicle.title,
    category: vehicle.bodyType || 'Fahrzeug',
    price: `CHF ${vehicle.price.toLocaleString()}`,
    year: vehicle.year.toString(),
    mileage: `${vehicle.mileage.toLocaleString()} km`,
    power: vehicle.power || 'N/A',
    image: vehicle.images[0] || 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    gradient: ['from-emerald-500 to-green-700', 'from-cyan-500 to-blue-600', 'from-indigo-500 to-purple-600'][index] || 'from-emerald-500 to-green-700',
    id: vehicle.id
  }));

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto-rotation for hero vehicles
  useEffect(() => {
    if (motorbikes.length > 1) {
      const intervalId = window.setInterval(() => {
        setCurrentBikeIndex((prev) => (prev + 1) % motorbikes.length);
      }, 4000);
      return () => window.clearInterval(intervalId);
    }
  }, [motorbikes.length]);

  // Navigation functions
  const nextVehicle = () => {
    setCurrentBikeIndex((prev) => (prev + 1) % motorbikes.length);
  };

  const prevVehicle = () => {
    setCurrentBikeIndex((prev) => (prev - 1 + motorbikes.length) % motorbikes.length);
  };

  // Show loading state if vehicles are still loading
  if (loading || motorbikes.length === 0) {
    return (
      <section className={`relative ${isMobile ? 'min-h-[70vh] py-6' : 'min-h-[80vh]'} flex items-center overflow-hidden bg-gradient-to-br from-gray-50 to-white`}>
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className={`${isMobile ? 'text-center py-6' : 'text-left py-20'} space-y-6 lg:space-y-8`}>
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <span className="mr-2">🇨🇭</span>
                  {t('hero.badge')}
                </div>
                <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl lg:text-6xl'} font-bold text-gray-900 leading-tight`}>
                  {t('hero.title')}
                  <span className="block text-green-600">{t('hero.subtitle')}</span>
                </h1>
                <p className={`${isMobile ? 'text-base px-4' : 'text-lg lg:text-xl'} text-gray-600 max-w-xl ${isMobile ? 'mx-auto' : ''}`}>
                  {t('hero.description')}
                </p>
                <div className={`flex ${isMobile ? 'flex-col space-y-3 px-4' : 'flex-row space-x-4'} ${isMobile ? 'items-center' : 'items-start'}`}>
                  <Link
                    href={`/${locale}/fahrzeuge`}
                    className={`${isMobile ? 'w-full py-4 text-base' : 'px-8 py-4'} inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg`}
                  >
                    {t('hero.cta_vehicles')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href="/kontakt"
                    className={`${isMobile ? 'w-full py-4 text-base' : 'px-8 py-4'} inline-flex items-center justify-center border-2 border-gray-300 hover:border-green-600 text-gray-700 hover:text-green-600 font-semibold rounded-xl transition-colors duration-200 bg-white shadow-lg`}
                  >
                    {t('hero.cta_consultation')}
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative ${isMobile ? 'min-h-[70vh] py-6' : 'min-h-[80vh]'} flex items-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-100/50`}>
      
      {/* Beautiful Green Gradient Background - Performance Optimized */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100/60 via-emerald-50/40 to-green-200/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-green-100/30 via-transparent to-emerald-100/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-50/40 to-transparent"></div>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-8" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #059669 1px, transparent 0)',
          backgroundSize: '60px 60px'
        }}></div>
        {/* Additional depth */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-green-200/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-emerald-200/30 to-transparent rounded-full blur-3xl"></div>
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
                <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-xs font-semibold shadow-md">
                  <span className="mr-1.5">🇨🇭</span>
                  {t('hero.badge')}
                </div>
              )}

              {/* Desktop Badge */}
              {!isMobile && (
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-semibold shadow-lg">
                  <span className="mr-2">🇨🇭</span>
                  {t('hero.badge')}
                </div>
              )}

              {/* Main Heading */}
              <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl lg:text-6xl'} font-bold text-gray-900 leading-tight`}>
                {t('hero.title')}
                <span className="block text-green-600">{t('hero.subtitle')}</span>
              </h1>

              {/* Description */}
              <p className={`${isMobile ? 'text-base px-4' : 'text-lg lg:text-xl'} text-gray-600 max-w-xl ${isMobile ? 'mx-auto' : ''}`}>
                {t('hero.description')}
              </p>

              {/* CTA Buttons */}
              <div className={`flex ${isMobile ? 'flex-col space-y-3 px-4' : 'flex-row space-x-4'} ${isMobile ? 'items-center' : 'items-start'}`}>
                <Link
                  href="/fahrzeuge"
                  className={`${isMobile ? 'w-full py-4 text-base' : 'px-8 py-4'} inline-flex items-center justify-center bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-xl hover:shadow-green-500/25`}
                >
                  {t('hero.cta_vehicles')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/kontakt"
                  className={`${isMobile ? 'w-full py-4 text-base' : 'px-8 py-4'} inline-flex items-center justify-center border-2 border-green-300 hover:border-green-500 text-green-700 hover:text-green-800 font-semibold rounded-xl transition-all duration-200 bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-green-500/10`}
                >
                  {t('hero.cta_consultation')}
                </Link>
              </div>

              {/* Action Box */}
              <div className={`${isMobile ? 'px-4 mt-4' : 'mt-6'}`}>
                <ActionBox />
              </div>

              {/* Trust Indicators / Mobile Bike Showcase */}
              <div className={`${isMobile ? 'pt-4' : 'pt-12'}`}>
                {isMobile ? (
                  /* Mobile Bike Showcase - Improved Layout */
                  <div className="mx-4">
                    {/* Navigation Controls */}
                    {motorbikes.length > 1 && (
                      <div className="flex justify-center mb-3">
                        <button
                          onClick={prevVehicle}
                          className="p-2 rounded-full bg-white shadow-md border border-gray-200 mr-2 hover:bg-gray-50 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <div className="flex space-x-1">
                          {motorbikes.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentBikeIndex(index)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentBikeIndex ? 'bg-green-600' : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={nextVehicle}
                          className="p-2 rounded-full bg-white shadow-md border border-gray-200 ml-2 hover:bg-gray-50 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    )}
                    
                    {/* Vehicle Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                      {/* Vehicle Image */}
                      <div className="relative h-48 w-full">
                        <Image
                          src={motorbikes[currentBikeIndex]?.image || '/homepage.jpg'}
                          alt={motorbikes[currentBikeIndex]?.title || 'Vehicle'}
                          fill
                          className="object-cover"
                          sizes="100vw"
                        />
                      </div>
                      
                      {/* Vehicle Info */}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                          {motorbikes[currentBikeIndex]?.title || 'Vehicle Title'}
                        </h3>
                        
                        {/* Specs Grid */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <div className="text-xs text-gray-500 mb-1">BJ</div>
                            <div className="text-sm font-semibold text-gray-900">{motorbikes[currentBikeIndex]?.year || 'N/A'}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <div className="text-xs text-gray-500 mb-1">PS</div>
                            <div className="text-sm font-semibold text-gray-900">{motorbikes[currentBikeIndex]?.power || 'N/A'}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <div className="text-xs text-gray-500 mb-1">KM</div>
                            <div className="text-sm font-semibold text-gray-900">{motorbikes[currentBikeIndex]?.mileage || 'N/A'}</div>
                          </div>
                        </div>
                        
                        {/* Price and CTA */}
                        <div className="flex items-center justify-between">
                          <div className="text-xl font-bold text-green-600">
                            {motorbikes[currentBikeIndex]?.price || 'CHF 0'}
                          </div>
                          <Link 
                            href={`/${locale}/fahrzeuge/${motorbikes[currentBikeIndex]?.id || '#'}`} 
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                          >
                            {t('vehicles.details')}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Desktop Trust Indicators */
                  <div className="grid grid-cols-3 gap-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Shield className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{t('home.metrics_quality')}</div>
                        <div className="text-sm text-gray-600">{t('home.metrics_quality_sub')}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{t('home.metrics_years')}</div>
                        <div className="text-sm text-gray-600">{t('home.metrics_years_sub')}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Star className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{t('home.metrics_satisfaction')}</div>
                        <div className="text-sm text-gray-600">{t('home.metrics_satisfaction_sub')}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Bike Showcase - Performance Optimized */}
            {!isMobile && (
              <div className="relative">
                {/* Navigation Controls */}
                {motorbikes.length > 1 && (
                  <div className="absolute top-4 right-4 z-10 flex space-x-2">
                    <button
                      onClick={prevVehicle}
                      className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md border border-gray-200 hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={nextVehicle}
                      className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md border border-gray-200 hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                )}
                
                {/* Vehicle Image */}
                <div className={`aspect-[4/3] rounded-3xl bg-gradient-to-br ${motorbikes[currentBikeIndex]?.gradient || 'from-gray-100 to-gray-200'} shadow-2xl overflow-hidden flex items-end relative`}>
                  <Image
                    src={motorbikes[currentBikeIndex]?.image || '/homepage.jpg'}
                    alt={motorbikes[currentBikeIndex]?.title || 'Vehicle'}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                {/* Stats Card Below Image - performance optimized */}
                <div className="-mt-6 md:-mt-8 mx-4 md:mx-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-4 max-w-xl">
                    <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">{motorbikes[currentBikeIndex]?.category || 'FAHRZEUG'}</div>
                    <h3 className="text-xl md:text-2xl font-bold leading-tight mb-3 text-gray-900">{motorbikes[currentBikeIndex]?.title || 'Vehicle Title'}</h3>
                    <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-gray-500">Baujahr</div>
                        <div className="font-semibold text-gray-900">{motorbikes[currentBikeIndex]?.year || 'N/A'}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-gray-500">Leistung</div>
                        <div className="font-semibold text-gray-900">{motorbikes[currentBikeIndex]?.power || 'N/A'}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-gray-500">KM</div>
                        <div className="font-semibold text-gray-900">{motorbikes[currentBikeIndex]?.mileage || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xl md:text-2xl font-bold text-gray-900">{motorbikes[currentBikeIndex]?.price || 'CHF 0'}</div>
                      <Link href={`/${locale}/fahrzeuge/${motorbikes[currentBikeIndex]?.id || '#'}`} className="inline-flex items-center bg-gray-900 text-white hover:bg-black font-semibold px-4 py-2 text-sm rounded-lg transition-colors">
                        {t('vehicles.details')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;