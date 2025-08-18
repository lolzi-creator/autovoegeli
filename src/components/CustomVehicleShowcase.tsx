'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Heart, Fuel, Calendar, Gauge, MapPin, Phone, Mail, Filter, Settings, X, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { loadRealVehicleData, formatPrice, formatMileage } from '@/lib/vehicle-data-loader';
import { type ScrapedVehicle } from '@/lib/autoscout-scraper';
import VehicleDetailModal from './VehicleDetailModal';

const VehicleCard = ({ vehicle, index, onViewDetails }: { vehicle: ScrapedVehicle; index: number; onViewDetails: (vehicle: ScrapedVehicle) => void }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      viewport={{ once: true, margin: "-50px" }}
      className="bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-gray-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-green-500/30 cursor-pointer"
    >
      {/* Mobile Vertical Layout */}
      <div className="md:hidden">
        {/* Mobile Image */}
        <div className="relative h-56 bg-gradient-to-br from-gray-100 via-gray-50 to-white overflow-hidden">
          <img
            src={vehicle.images[0] || '/placeholder-bike.jpg'}
            alt={vehicle.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
          {vehicle.condition === 'new' && (
            <div className="absolute top-3 left-3">
              <span className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                NEU
              </span>
            </div>
          )}
          {/* Heart Icon */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="absolute top-3 right-3 w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm border border-white/20"
          >
            <Heart 
              className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} 
            />
          </button>
        </div>

        {/* Mobile Info */}
        <div className="p-5">
          <div className="mb-4">
            <h3 className="text-gray-900 font-bold text-xl mb-2 line-clamp-2 leading-tight">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-gray-600 text-base">
              {vehicle.year} • {formatMileage(vehicle.mileage)} • {vehicle.fuel}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-2xl font-black text-green-600">
              {formatPrice(vehicle.price)}
            </div>
            <button
              onClick={() => onViewDetails(vehicle)}
              className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              DETAILS
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Full Layout */}
      <div className="hidden md:block">
        {/* Vehicle Image */}
        <div className="relative h-72 bg-gradient-to-br from-gray-100 via-gray-50 to-white overflow-hidden">
          <img
            src={vehicle.images[currentImageIndex] || '/placeholder-bike.jpg'}
            alt={vehicle.title}
            className="absolute inset-0 w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
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
              {vehicle.condition === 'new' ? 'Neu' : 'Occasion'}
            </span>
          </div>

          {/* Like Button */}
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg"
          >
            <Heart className={`w-5 h-5 transition-colors ${
              isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`} />
          </button>
          
          {/* Vehicle Title Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-xl mb-1 drop-shadow-lg">
              {vehicle.brand} {vehicle.model}
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
                <span className="text-gray-900 font-bold text-sm">{formatMileage(vehicle.mileage)}</span>
              </div>
              <div className="text-gray-500 text-xs">Kilometerstand</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <div className="flex items-center justify-center mb-1">
                <Fuel className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-gray-900 font-bold text-sm">{vehicle.fuel}</span>
              </div>
              <div className="text-gray-500 text-xs">Kraftstoff</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <div className="flex items-center justify-center mb-1">
                <Calendar className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-gray-900 font-bold text-sm">{vehicle.transmission}</span>
              </div>
              <div className="text-gray-500 text-xs">Getriebe</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <div className="flex items-center justify-center mb-1">
                <MapPin className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-gray-900 font-bold text-sm">{vehicle.location}</span>
              </div>
              <div className="text-gray-500 text-xs">Standort</div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <div className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wide">
              Ausstattung Highlights
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
                  +{vehicle.features.length - 3} weitere
                </span>
              )}
            </div>
          </div>

          {/* Price and Location */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-3xl font-black text-green-600">
                {formatPrice(vehicle.price)}
              </div>
              <div className="text-gray-500 text-sm">
                {vehicle.location}
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="space-y-3">
            <button
              onClick={() => onViewDetails(vehicle)}
              className="w-full group relative overflow-hidden bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-2xl font-bold text-sm uppercase tracking-wide transition-all shadow-lg hover:shadow-green-500/25 flex items-center justify-center gap-2"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Details ansehen
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => window.open('tel:032 652 11 66', '_self')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                Anrufen
              </button>
              <button 
                onClick={() => window.open('mailto:info@autovoegeli.ch?subject=Anfrage: ' + encodeURIComponent(vehicle.title), '_self')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-colors"
              >
                <Mail className="w-4 h-4" />
                E-Mail
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CustomVehicleShowcase = () => {
  const [vehicles, setVehicles] = useState<ScrapedVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
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
  const [selectedVehicle, setSelectedVehicle] = useState<ScrapedVehicle | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleViewDetails = (vehicle: ScrapedVehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedVehicle(null);
  };

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoading(true);
        const data = await loadRealVehicleData();
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

  const filteredVehicles = vehicles.filter(vehicle => {
    // Basic brand filter
    if (filter !== 'all') {
      if (filter === 'new' && vehicle.condition !== 'new') return false;
      if (filter === 'used' && vehicle.condition !== 'used') return false;
      if (filter !== 'new' && filter !== 'used' && vehicle.brand.toLowerCase() !== filter.toLowerCase()) return false;
    }

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

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, advancedFilters]);

  const clearAllFilters = () => {
    setFilter('all');
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

  const brands = Array.from(new Set(vehicles.map(v => v.brand)));

  // Helper function to get count for each filter
  const getFilterCount = (filterType: string) => {
    return vehicles.filter(vehicle => {
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

  return (
    <section style={{
      backgroundColor: '#f8fafc',
      paddingTop: '80px',
      paddingBottom: '100px'
    }}>
      <div className="container-width section-padding">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          style={{
            textAlign: 'center',
            marginBottom: '48px'
          }}
        >
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            Unsere{' '}
            <span className="text-gradient">Fahrzeuge</span>
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
                Alle ({getFilterCount('all')})
              </button>
              <button
                onClick={() => setFilter('new')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'new' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Neu ({getFilterCount('new')})
              </button>
              <button
                onClick={() => setFilter('used')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'used' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Occasion ({getFilterCount('used')})
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
                Erweiterte Filter
                {hasActiveAdvancedFilters && (
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                    Aktiv
                  </span>
                )}
              </button>
              
              {(filter !== 'all' || hasActiveAdvancedFilters) && (
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
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Settings className="w-5 h-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Erweiterte Filter</h3>
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
                      Kraftstoff
                    </label>
                    <select
                      value={advancedFilters.fuelType}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, fuelType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Alle</option>
                      <option value="Benzin">Benzin</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Elektro">Elektro</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  {/* Transmission */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Getriebe
                    </label>
                    <select
                      value={advancedFilters.transmission}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, transmission: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Alle</option>
                      <option value="Schaltgetriebe manuell">Manuell</option>
                      <option value="Automatik">Automatik</option>
                      <option value="Stufenlos">Stufenlos</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

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
                onViewDetails={handleViewDetails}
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
              Zeige {startIndex + 1} - {Math.min(endIndex, filteredVehicles.length)} von {filteredVehicles.length} Fahrzeugen
              {totalPages > 1 && ` (Seite ${currentPage} von ${totalPages})`}
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
              Keine Fahrzeuge gefunden
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

      {/* Vehicle Detail Modal */}
      <VehicleDetailModal
        vehicle={selectedVehicle}
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
      />
    </section>
  );
};

export default CustomVehicleShowcase; 