'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const VehicleShowcase = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const featuredVehicles = [
    {
      id: 1,
      title: "Zontes 703F ADV",
      price: "ab CHF 7'990",
      year: "2024",
      mileage: "0 km",
      power: "70 PS",
      fuel: "Benzin",
      category: "Adventure",
      gradient: "from-emerald-500 to-green-700"
    },
    {
      id: 2,
      title: "KOVE 800X Pro",
      price: "ab CHF 12'990",
      year: "2024",
      mileage: "0 km",
      power: "95 PS",
      fuel: "Benzin",
      category: "Adventure",
      gradient: "from-cyan-500 to-blue-600"
    },
    {
      id: 3,
      title: "VOGE 900 DSX",
      price: "ab CHF 10'990",
      year: "2024",
      mileage: "0 km",
      power: "94 PS",
      fuel: "Benzin",
      category: "Touring",
      gradient: "from-indigo-500 to-purple-600"
    },
    {
      id: 4,
      title: "SWM Hoku 125 ABS",
      price: "ab CHF 3'990",
      year: "2024",
      mileage: "0 km",
      power: "15 PS",
      fuel: "Benzin",
      category: "Naked",
      gradient: "from-orange-500 to-red-600"
    }
  ];

  const nextVehicle = () => {
    setSelectedVehicle((prev) => (prev + 1) % featuredVehicles.length);
  };

  const prevVehicle = () => {
    setSelectedVehicle((prev) => (prev - 1 + featuredVehicles.length) % featuredVehicles.length);
  };

  return (
    <section className={`${isMobile ? 'py-12' : 'py-20'} bg-gray-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header removed per request */}

        {isMobile ? (
          /* Mobile Design - Compact Cards */
          <div className="space-y-6">
            {/* Main Display */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedVehicle}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                {/* Image Placeholder */}
                <div className={`h-48 bg-gradient-to-br ${featuredVehicles[selectedVehicle].gradient} flex items-center justify-center relative`}>
                  <div className="text-white text-lg font-bold text-center px-4">
                    {featuredVehicles[selectedVehicle].title}
                  </div>
                  
                  {/* Navigation Arrows */}
                  <button
                    onClick={prevVehicle}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-white" />
                  </button>
                  <button
                    onClick={nextVehicle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-white" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      {featuredVehicles[selectedVehicle].category}
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      {featuredVehicles[selectedVehicle].price}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {featuredVehicles[selectedVehicle].title}
                  </h3>
                  
                  {/* Specs - 2x2 Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { label: "Jahr", value: featuredVehicles[selectedVehicle].year },
                      { label: "KM", value: featuredVehicles[selectedVehicle].mileage },
                      { label: "Leistung", value: featuredVehicles[selectedVehicle].power },
                      { label: "Kraftstoff", value: featuredVehicles[selectedVehicle].fuel }
                    ].map((spec) => (
                      <div key={spec.label} className="bg-gray-50 rounded-lg p-2">
                        <div className="text-xs text-gray-500">{spec.label}</div>
                        <div className="text-sm font-semibold text-gray-900">{spec.value}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Buttons */}
                  <div className="space-y-2">
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors">
                      Details ansehen
                    </button>
                    <button className="w-full border-2 border-gray-300 hover:border-green-600 text-gray-700 hover:text-green-600 font-medium py-2.5 rounded-lg transition-colors">
                      Probefahrt
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots Indicator */}
            <div className="flex justify-center space-x-2">
              {featuredVehicles.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedVehicle(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === selectedVehicle ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Desktop Design */
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            
            {/* Large Display */}
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedVehicle}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className={`aspect-[4/3] rounded-3xl bg-gradient-to-br ${featuredVehicles[selectedVehicle].gradient} flex items-center justify-center relative overflow-hidden shadow-2xl`}
                >
                  <div className="text-white text-3xl font-bold text-center px-8">
                    {featuredVehicles[selectedVehicle].title}
                  </div>
                  
                  {/* Navigation */}
                  <button
                    onClick={prevVehicle}
                    className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6 text-white" />
                  </button>
                  <button
                    onClick={nextVehicle}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="h-6 w-6 text-white" />
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Details */}
            <div className="space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedVehicle}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-full mb-4">
                    {featuredVehicles[selectedVehicle].category}
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {featuredVehicles[selectedVehicle].title}
                  </h3>
                  <p className="text-4xl font-bold text-green-600 mb-8">
                    {featuredVehicles[selectedVehicle].price}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Specs Grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`specs-${selectedVehicle}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 gap-6"
                >
                  {[
                    { label: "Baujahr", value: featuredVehicles[selectedVehicle].year },
                    { label: "Kilometerstand", value: featuredVehicles[selectedVehicle].mileage },
                    { label: "Leistung", value: featuredVehicles[selectedVehicle].power },
                    { label: "Kraftstoff", value: featuredVehicles[selectedVehicle].fuel }
                  ].map((spec) => (
                    <div key={spec.label} className="bg-gray-50 rounded-xl p-4 hover:bg-green-50 transition-colors">
                      <div className="text-sm text-gray-500 mb-1">{spec.label}</div>
                      <div className="text-xl font-semibold text-gray-900">{spec.value}</div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-6 rounded-xl transition-colors">
                  Details ansehen
                </button>
                <button className="flex-1 border-2 border-gray-300 hover:border-green-600 text-gray-700 hover:text-green-600 font-medium py-4 px-6 rounded-xl transition-colors">
                  Probefahrt vereinbaren
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Vehicle Selector */}
        {!isMobile && (
          <div className="grid grid-cols-4 gap-4 mb-12">
            {featuredVehicles.map((vehicle, index) => (
              <button
                key={vehicle.id}
                onClick={() => setSelectedVehicle(index)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedVehicle === index
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    selectedVehicle === index ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {vehicle.category}
                  </span>
                  {selectedVehicle === index && (
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                  {vehicle.title}
                </h4>
                <p className="text-green-600 font-bold text-sm">
                  {vehicle.price}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center">
          <button className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-8 py-4 rounded-xl transition-colors inline-flex items-center gap-2 hover:scale-105 transform duration-200">
            Alle Fahrzeuge ansehen
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default VehicleShowcase;