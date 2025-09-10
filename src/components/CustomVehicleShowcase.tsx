'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, Fuel, Calendar, Gauge, MapPin, Phone, MessageCircle, Filter, Settings, X, Eye } from 'lucide-react';
// Removed framer-motion for performance
// import { motion } from 'framer-motion';
import { loadMultilingualVehicleData, formatPriceMultilingual, formatMileageMultilingual, getMultilingualText, getVehicleTitleMultilingual, type MultilingualVehicle } from '@/lib/multilingual-vehicle-data-loader';
import { useTranslation } from '@/hooks/useTranslation';

// WhatsApp utility function
const createWhatsAppLink = (vehicle: MultilingualVehicle, t: any, locale: 'de' | 'fr' | 'en') => {
  const phoneNumber = "+41792664262"; // Remove spaces and special chars for URL
  const message = t('vehicles.call_message', { title: vehicle.title, price: formatPriceMultilingual(vehicle.price, locale) });
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

// Navigation function to go to vehicle detail page
const navigateToVehicle = (vehicle: MultilingualVehicle, currentState: {
  page: number;
  filter: string;
  advancedFilters: any;
  showAdvancedFilters: boolean;
}) => {
  // Create return URL with all current state as parameters
  const currentLocale = window.location.pathname.split('/')[1] || 'de';
  const returnUrl = new URL(`/${currentLocale}/fahrzeuge`, window.location.origin);
  returnUrl.searchParams.set('page', currentState.page.toString());
  if (currentState.filter) returnUrl.searchParams.set('filter', currentState.filter);
  if (currentState.showAdvancedFilters) returnUrl.searchParams.set('showAdvanced', 'true');
  if (currentState.advancedFilters.brand) returnUrl.searchParams.set('brand', currentState.advancedFilters.brand);
  if (currentState.advancedFilters.priceRange) returnUrl.searchParams.set('priceRange', currentState.advancedFilters.priceRange);
  if (currentState.advancedFilters.yearRange) returnUrl.searchParams.set('yearRange', currentState.advancedFilters.yearRange);
  if (currentState.advancedFilters.mileageRange) returnUrl.searchParams.set('mileageRange', currentState.advancedFilters.mileageRange);
  if (currentState.advancedFilters.fuelType) returnUrl.searchParams.set('fuelType', currentState.advancedFilters.fuelType);
  if (currentState.advancedFilters.transmission) returnUrl.searchParams.set('transmission', currentState.advancedFilters.transmission);
  
  // Add scroll position to the return URL
  const scrollPosition = window.scrollY;
  returnUrl.searchParams.set('scroll', scrollPosition.toString());
  
  
  // Navigate to vehicle detail page with return URL
  window.location.href = `/${currentLocale}/fahrzeuge/${vehicle.id}?return=${encodeURIComponent(returnUrl.toString())}`;
};

const VehicleCard = ({ 
  vehicle, 
  index, 
  currentState,
  t,
  locale
}: { 
  vehicle: MultilingualVehicle; 
  index: number;
  currentState: {
    page: number;
    filter: string;
    advancedFilters: any;
    showAdvancedFilters: boolean;
  };
  t: (key: string) => string;
  locale: 'de' | 'fr' | 'en';
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-gray-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-green-500/30 cursor-pointer">
      {/* Mobile Vertical Layout */}
      <div className="md:hidden">
        {/* Mobile Image */}
        <div className="relative h-56 bg-gradient-to-br from-gray-100 via-gray-50 to-white overflow-hidden">
          <Image
            src={vehicle.images[0] || '/placeholder-bike.jpg'}
            alt={vehicle.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
          {vehicle.condition === 'new' && (
            <div className="absolute top-3 left-3">
              <span className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                {t('vehicles.new')}
              </span>
            </div>
          )}
        </div>

        {/* Mobile Info */}
        <div className="p-5">
          <div className="mb-4">
            <h3 className="text-gray-900 font-bold text-xl mb-2 line-clamp-2 leading-tight">
              {getVehicleTitleMultilingual(vehicle, locale)}t
            </h3>
            <p className="text-gray-600 text-base">
              {vehicle.year} • {formatMileageMultilingual(vehicle.mileage, locale)} • {getMultilingualText(vehicle, 'fuel', locale)}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-2xl font-black text-green-600">
              {formatPriceMultilingual(vehicle.price, locale)}
            </div>
            <button
              onClick={() => navigateToVehicle(vehicle, currentState)}
              className="inline-block bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              {t('vehicles.details_short')}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Full Layout */}
      <div className="hidden md:block">
        {/* Vehicle Image */}
        <div className="relative h-72 bg-gradient-to-br from-gray-100 via-gray-50 to-white overflow-hidden">
          <Image
            src={vehicle.images[currentImageIndex] || '/placeholder-bike.jpg'}
            alt={vehicle.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
          
          {/* Image Navigation */}
          {vehicle.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {vehicle.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Condition Badge */}
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-white ${
              vehicle.condition === 'new' ? 'bg-green-500' : 'bg-gray-600'
            }`}>
              {vehicle.condition === 'new' ? t('vehicles.new') : t('vehicles.used')}
            </span>
          </div>

          
          {/* Vehicle Title Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-xl mb-1 drop-shadow-lg">
              {getVehicleTitleMultilingual(vehicle, locale)}
            </h3>
            <p className="text-white/90 text-sm drop-shadow">
              {vehicle.year} • {vehicle.power}
            </p>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="p-6">
          {/* Key Specs Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <div className="flex items-center justify-center mb-1">
                <Gauge className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-gray-900 font-bold text-sm">{formatMileageMultilingual(vehicle.mileage, locale)}</span>
              </div>
              <div className="text-gray-500 text-xs">{t('vehicles.mileage')}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <div className="flex items-center justify-center mb-1">
                <Fuel className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-gray-900 font-bold text-sm">{getMultilingualText(vehicle, 'fuel', locale)}</span>
              </div>
              <div className="text-gray-500 text-xs">{t('vehicles.fuel')}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <div className="flex items-center justify-center mb-1">
                <Calendar className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-gray-900 font-bold text-sm">{getMultilingualText(vehicle, 'transmission', locale)}</span>
              </div>
              <div className="text-gray-500 text-xs">{t('vehicles.transmission')}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <div className="flex items-center justify-center mb-1">
                <MapPin className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-gray-900 font-bold text-sm">{vehicle.location}</span>
              </div>
              <div className="text-gray-500 text-xs">{t('vehicles.location')}</div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <div className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wide">
              {t('vehicles.equipment_highlights')}
            </div>
            <div className="flex flex-wrap gap-2">
              {vehicle.features.slice(0, 3).map((feature: string, i: number) => (
                <span
                  key={i}
                  className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-200"
                >
                  {feature}
                </span>
              ))}
              {vehicle.features.length > 3 && (
                <span className="text-green-600 text-xs font-semibold bg-green-50 px-2 py-1 rounded-full">
                  +{vehicle.features.length - 3} {t('vehicles.more_features')}
                </span>
              )}
            </div>
          </div>

          {/* Price and Location */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-3xl font-black text-green-600">
                {formatPriceMultilingual(vehicle.price, locale)}
              </div>
              <div className="text-gray-500 text-sm">
                {vehicle.location}
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="space-y-3">
            <button
              onClick={() => navigateToVehicle(vehicle, currentState)}
              className="w-full group relative overflow-hidden bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-2xl font-bold text-sm uppercase tracking-wide transition-all shadow-lg hover:shadow-green-500/25 flex items-center justify-center gap-2"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {t('vehicles.details')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => window.open('tel:032 652 11 66', '_self')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                {t('vehicles.call')}
              </button>
                            <a
                href={createWhatsAppLink(vehicle, t, locale)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium text-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                {t('vehicles.whatsapp')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomVehicleShowcase = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, locale } = useTranslation();
  
  const [vehicles, setVehicles] = useState<MultilingualVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  // Bikes/Cars toggle
  const [category, setCategory] = useState<'bike' | 'car'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const type = params.get('type');
      return (type === 'car' || type === 'bike') ? type : 'bike';
    }
    return 'bike';
  });
  const [currentPage, setCurrentPage] = useState(1);
  const vehiclesPerPage = 6;
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    maxKilometer: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    fuelType: '',
    transmission: ''
  });
  const [pendingScrollPosition, setPendingScrollPosition] = useState<number | null>(null);


  // State restoration flag
  const [shouldRestoreState, setShouldRestoreState] = useState(true);

  // Load and store saved state on mount, but don't apply it yet
  const [savedState, setSavedState] = useState<any>(null);

  // Reset filters when category changes (to avoid showing brand filters from other category)
  useEffect(() => {
    setFilter('all');
    setModelFilter('all');
    setCurrentPage(1);
  }, [category]);

  // Reset model filter when brand filter changes
  useEffect(() => {
    setModelFilter('all');
  }, [filter]);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && shouldRestoreState) {
      const savedStateStr = sessionStorage.getItem('fahrzeuge_return_state');
      if (savedStateStr) {
        try {
          const state = JSON.parse(savedStateStr);
          // Only restore if it's recent (within last 5 minutes)
          const isRecent = (Date.now() - state.timestamp) < 300000;
          
          if (isRecent) {
            setSavedState(state);
          }
          
          // Clear the state after using it
          sessionStorage.removeItem('fahrzeuge_return_state');
        } catch (error) {
          console.warn('Error restoring fahrzeuge state:', error);
        }
      }
      setShouldRestoreState(false);
    }
  }, [shouldRestoreState]);

  // Restore scroll position once the correct page content is rendered
  useEffect(() => {
    if (!loading && pendingScrollPosition !== null && vehicles.length > 0) {
      
      const restoreScroll = () => {
        // Scroll to position with smooth behavior
        window.scrollTo({
          top: pendingScrollPosition,
          behavior: 'smooth'
        });
        
        setPendingScrollPosition(null);
      };
      
      // Wait for the page content to render completely
      // Multiple attempts to ensure it works
      setTimeout(restoreScroll, 300);
      setTimeout(restoreScroll, 800);
      setTimeout(restoreScroll, 1500);
      setTimeout(restoreScroll, 2500);
    }
  }, [loading, pendingScrollPosition, vehicles.length]);

  // Handle URL parameters and auto-open modal
  useEffect(() => {
    // Check for vehicle parameter to auto-open modal
    const vehicleId = searchParams.get('vehicle');

    // Only apply other URL params if we don't have saved state to restore
    if (!savedState) {
      const page = searchParams.get('page');
      const filterParam = searchParams.get('filter');
      const showAdvanced = searchParams.get('showAdvanced');
      const scrollParam = searchParams.get('scroll');
      const typeParam = searchParams.get('type');
      
      if (page) setCurrentPage(parseInt(page));
      if (filterParam) setFilter(filterParam);
      if (showAdvanced === 'true') setShowAdvancedFilters(true);
      if (typeParam === 'car' || typeParam === 'bike') setCategory(typeParam);
      
      // Handle advanced filters from URL
      const brand = searchParams.get('brand');
      const priceRange = searchParams.get('priceRange');
      const yearRange = searchParams.get('yearRange');
      const mileageRange = searchParams.get('mileageRange');
      const fuelType = searchParams.get('fuelType');
      const transmission = searchParams.get('transmission');
      
      if (brand || priceRange || yearRange || mileageRange || fuelType || transmission) {
        setAdvancedFilters({
          maxKilometer: mileageRange || '',
          minPrice: priceRange ? priceRange.split('-')[0] || '' : '',
          maxPrice: priceRange ? priceRange.split('-')[1] || '' : '',
          minYear: yearRange ? yearRange.split('-')[0] || '' : '',
          maxYear: yearRange ? yearRange.split('-')[1] || '' : '',
          fuelType: fuelType || '',
          transmission: transmission || ''
        });
        setShowAdvancedFilters(true);
      }
      
      // Set scroll position to restore
      if (scrollParam) {
        const scrollPos = parseInt(scrollParam);
        setPendingScrollPosition(scrollPos);
      }
    }
  }, [searchParams, savedState, vehicles.length]);


  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoading(true);
        const data = await loadMultilingualVehicleData();
        setVehicles(data);
        console.log(`✅ Loaded ${data.length} real vehicles from AutoScout24`);
      } catch (error) {
        console.error('Error loading vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);


  // Apply saved state AFTER vehicles are loaded
  useEffect(() => {
    if (!loading && vehicles.length > 0 && savedState) {
      
      // Apply all the state
      setCurrentPage(savedState.page || 1);
      setFilter(savedState.filter || 'all');
      setShowAdvancedFilters(savedState.showAdvancedFilters || false);
      setAdvancedFilters(savedState.advancedFilters || {
        maxKilometer: '',
        minPrice: '',
        maxPrice: '',
        minYear: '',
        maxYear: '',
        fuelType: '',
        transmission: ''
      });
      
      // Store scroll position to restore after the page renders
      if (savedState.scrollPosition) {
        setPendingScrollPosition(savedState.scrollPosition);
      }
      
      // Clear saved state
      setSavedState(null);
    }
  }, [loading, vehicles.length, savedState]);

  const filteredVehicles = vehicles.filter(vehicle => {
    // Category filter (bike/car)
    if (vehicle.category && vehicle.category !== category) return false;
    // Basic brand filter
    if (filter !== 'all') {
      if (filter === 'new' && vehicle.condition !== 'new') return false;
      if (filter === 'used' && vehicle.condition !== 'used') return false;
      if (filter !== 'new' && filter !== 'used' && vehicle.brand.toLowerCase() !== filter.toLowerCase()) return false;
    }
    // Model filter
    if (modelFilter !== 'all' && vehicle.model.toLowerCase() !== modelFilter.toLowerCase()) return false;

    // Advanced filters
    if (advancedFilters.maxKilometer && vehicle.mileage > parseInt(advancedFilters.maxKilometer)) return false;
    if (advancedFilters.minPrice && vehicle.price < parseInt(advancedFilters.minPrice)) return false;
    if (advancedFilters.maxPrice && vehicle.price > parseInt(advancedFilters.maxPrice)) return false;
    if (advancedFilters.minYear && vehicle.year < parseInt(advancedFilters.minYear)) return false;
    if (advancedFilters.maxYear && vehicle.year > parseInt(advancedFilters.maxYear)) return false;
    if (advancedFilters.fuelType && vehicle.fuel !== advancedFilters.fuelType) return false;
    if (advancedFilters.transmission && vehicle.transmission !== advancedFilters.transmission) return false;

    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage);
  const startIndex = (currentPage - 1) * vehiclesPerPage;
  const endIndex = startIndex + vehiclesPerPage;
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes (but not when restoring saved state)
  useEffect(() => {
    // Don't reset if we're currently restoring saved state
    if (!savedState) {
      setCurrentPage(1);
    }
  }, [filter, advancedFilters, savedState]);

  const clearAllFilters = () => {
    setFilter('all');
    setModelFilter('all');
    setAdvancedFilters({
      maxKilometer: '',
      minPrice: '',
      maxPrice: '',
      minYear: '',
      maxYear: '',
      fuelType: '',
      transmission: ''
    });
  };

  const hasActiveAdvancedFilters = Object.values(advancedFilters).some(value => value !== '');

  // Get brands filtered by current category
  const brands = Array.from(new Set(
    vehicles
      .filter(v => v.category === category)
      .map(v => v.brand)
  ));

  // Get models filtered by current category and selected brand
  const models = Array.from(new Set(
    vehicles
      .filter(v => v.category === category)
      .filter(v => filter === 'all' || filter === 'new' || filter === 'used' || v.brand.toLowerCase() === filter.toLowerCase())
      .map(v => v.model)
  ));

  // Helper function to get count for each filter
  const getFilterCount = (filterType: string) => {
    return vehicles.filter(vehicle => {
      // Only count vehicles in the current category
      if (vehicle.category !== category) return false;
      
      // Apply advanced filters first
      if (advancedFilters.maxKilometer && vehicle.mileage > parseInt(advancedFilters.maxKilometer)) return false;
      if (advancedFilters.minPrice && vehicle.price < parseInt(advancedFilters.minPrice)) return false;
      if (advancedFilters.maxPrice && vehicle.price > parseInt(advancedFilters.maxPrice)) return false;
      if (advancedFilters.minYear && vehicle.year < parseInt(advancedFilters.minYear)) return false;
      if (advancedFilters.maxYear && vehicle.year > parseInt(advancedFilters.maxYear)) return false;
      if (advancedFilters.fuelType && vehicle.fuel !== advancedFilters.fuelType) return false;
      if (advancedFilters.transmission && vehicle.transmission !== advancedFilters.transmission) return false;

      // Then apply the specific filter
      if (filterType === 'all') return true;
      if (filterType === 'new') return vehicle.condition === 'new';
      if (filterType === 'used') return vehicle.condition === 'used';
      return vehicle.brand.toLowerCase() === filterType.toLowerCase();
    }).length;
  };

  // Helper function to get count for each model filter
  const getModelCount = (modelName: string) => {
    return vehicles.filter(vehicle => {
      // Only count vehicles in the current category
      if (vehicle.category !== category) return false;
      
      // Apply current brand filter
      if (filter !== 'all' && filter !== 'new' && filter !== 'used') {
        if (vehicle.brand.toLowerCase() !== filter.toLowerCase()) return false;
      }
      
      // Apply advanced filters
      if (advancedFilters.maxKilometer && vehicle.mileage > parseInt(advancedFilters.maxKilometer)) return false;
      if (advancedFilters.minPrice && vehicle.price < parseInt(advancedFilters.minPrice)) return false;
      if (advancedFilters.maxPrice && vehicle.price > parseInt(advancedFilters.maxPrice)) return false;
      if (advancedFilters.minYear && vehicle.year < parseInt(advancedFilters.minYear)) return false;
      if (advancedFilters.maxYear && vehicle.year > parseInt(advancedFilters.maxYear)) return false;
      if (advancedFilters.fuelType && vehicle.fuel !== advancedFilters.fuelType) return false;
      if (advancedFilters.transmission && vehicle.transmission !== advancedFilters.transmission) return false;

      return vehicle.model.toLowerCase() === modelName.toLowerCase();
    }).length;
  };

  return (
    <section style={{
      backgroundColor: '#f8fafc',
      paddingTop: '80px',
      paddingBottom: '100px'
    }}>
      <div className="container-width section-padding">
        {/* Section Header - Performance Optimized */}
        <div style={{
            textAlign: 'center',
            marginBottom: '48px'
          }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            {t('vehicles.title').split(' ')[0]}{' '}
            <span className="text-gradient">{t('vehicles.title').split(' ')[1]}</span>
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: '#64748b',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 32px auto'
          }}>
            Entdecken Sie unsere aktuelle Auswahl direkt von AutoScout24 
            mit allen Details und aktuellen Preisen.
          </p>

          {/* Filter Buttons */}
          <div className="flex flex-col gap-6">
            <div className="flex justify-center gap-3 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'all' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t('vehicles.filter_all')} ({getFilterCount('all')})
              </button>
              <button
                onClick={() => setFilter('new')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'new' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t('vehicles.filter_new')} ({getFilterCount('new')})
              </button>
              <button
                onClick={() => setFilter('used')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'used' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t('vehicles.filter_used')} ({getFilterCount('used')})
              </button>
              {brands.slice(0, 5).map(brand => (
                <button
                  key={brand}
                  onClick={() => setFilter(brand)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === brand 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {brand} ({getFilterCount(brand)})
                </button>
              ))}
            </div>

            {/* Model Filters - Show when a specific brand is selected */}
            {filter !== 'all' && filter !== 'new' && filter !== 'used' && models.length > 1 && (
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                <div className="text-sm text-gray-600 font-medium mb-2 w-full text-center">
                  {filter} Modelle:
                </div>
                <button
                  onClick={() => setModelFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    modelFilter === 'all'
                      ? 'bg-green-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Alle Modelle ({models.reduce((sum, model) => sum + getModelCount(model), 0)})
                </button>
                {models.slice(0, 8).map(model => (
                  <button
                    key={model}
                    onClick={() => setModelFilter(model)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      modelFilter === model
                        ? 'bg-green-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {model} ({getModelCount(model)})
                  </button>
                ))}
              </div>
            )}

            {/* Advanced Filter Toggle */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  showAdvancedFilters || hasActiveAdvancedFilters
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                {t('vehicles.advanced_filters')}
                {hasActiveAdvancedFilters && (
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                    Aktiv
                  </span>
                )}
              </button>
              
              {(filter !== 'all' || modelFilter !== 'all' || hasActiveAdvancedFilters) && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                  Zurücksetzen
                </button>
              )}
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                  <Settings className="w-5 h-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900">{t('vehicles.advanced_filters')}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Max Kilometer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max. Kilometer
                    </label>
                    <input
                      type="number"
                      placeholder="z.B. 50000"
                      value={advancedFilters.maxKilometer}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, maxKilometer: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min. Preis (CHF)
                    </label>
                    <input
                      type="number"
                      placeholder="z.B. 5000"
                      value={advancedFilters.minPrice}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, minPrice: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max. Preis (CHF)
                    </label>
                    <input
                      type="number"
                      placeholder="z.B. 20000"
                      value={advancedFilters.maxPrice}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, maxPrice: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  {/* Year Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ab Baujahr
                    </label>
                    <input
                      type="number"
                      placeholder="z.B. 2020"
                      value={advancedFilters.minYear}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, minYear: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  {/* Fuel Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('vehicles.fuel')}
                    </label>
                    <select
                      value={advancedFilters.fuelType}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, fuelType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">{t('vehicles.filter_all')}</option>
                      <option value="Benzin">Benzin</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Elektro">Elektro</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  {/* Transmission */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('vehicles.transmission')}
                    </label>
                    <select
                      value={advancedFilters.transmission}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, transmission: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">{t('vehicles.filter_all')}</option>
                      <option value="Schaltgetriebe manuell">Manuell</option>
                      <option value="Automatik">Automatik</option>
                      <option value="Stufenlos">Stufenlos</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #e2e8f0',
              borderTop: '3px solid #8bc442',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        )}

        {/* Vehicle Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {currentVehicles.map((vehicle, index) => (
              <VehicleCard 
                key={vehicle.id} 
                vehicle={vehicle} 
                index={index}
                currentState={{
                  page: currentPage,
                  filter: filter,
                  advancedFilters: advancedFilters,
                  showAdvancedFilters: showAdvancedFilters
                }}
                t={t}
                locale={locale as 'de' | 'fr' | 'en'}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col gap-4 mt-12">
            {/* Mobile Pagination */}
            <div className="flex md:hidden justify-between items-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Zurück
              </button>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <span className="text-sm font-medium text-gray-600">
                  {currentPage} von {totalPages}
                </span>
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Weiter
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop Pagination */}
            <div className="hidden md:flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Zurück
              </button>
              
              {/* Smart page number display */}
              {totalPages <= 7 ? (
                // Show all pages if 7 or fewer
                Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition-colors min-w-[40px] ${
                      currentPage === page
                        ? 'bg-green-500 text-white'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))
              ) : (
                // Smart pagination for many pages
                <>
                  {/* First page */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    className={`px-4 py-2 rounded-lg transition-colors min-w-[40px] ${
                      currentPage === 1
                        ? 'bg-green-500 text-white'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    1
                  </button>
                  
                  {/* Dots if needed */}
                  {currentPage > 3 && <span className="px-2 text-gray-400">...</span>}
                  
                  {/* Current page area */}
                  {Array.from({ length: 3 }, (_, i) => {
                    const page = currentPage - 1 + i;
                    if (page > 1 && page < totalPages) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg transition-colors min-w-[40px] ${
                            currentPage === page
                              ? 'bg-green-500 text-white'
                              : 'bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                    return null;
                  }).filter(Boolean)}
                  
                  {/* Dots if needed */}
                  {currentPage < totalPages - 2 && <span className="px-2 text-gray-400">...</span>}
                  
                  {/* Last page */}
                  {totalPages > 1 && (
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`px-4 py-2 rounded-lg transition-colors min-w-[40px] ${
                        currentPage === totalPages
                          ? 'bg-green-500 text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {totalPages}
                    </button>
                  )}
                </>
              )}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Weiter
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Results Info */}
        {!loading && (
          <div className="text-center mt-8 text-gray-600">
            <p>
              Zeige {startIndex + 1} - {Math.min(endIndex, filteredVehicles.length)} von {filteredVehicles.length} {t('vehicles.title').toLowerCase()}
              {totalPages > 1 && ` (${t('vehicles.page')} ${currentPage} ${t('vehicles.of')} ${totalPages})`}
            </p>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredVehicles.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#64748b'
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
              {t('vehicles.no_vehicles')}
            </h3>
            <p>Versuchen Sie einen anderen Filter oder kontaktieren Sie uns direkt.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

    </section>
  );
};

export default CustomVehicleShowcase; 