'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Heart, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings, 
  Shield, 
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  Maximize2,
  Download,
  Share2
} from 'lucide-react';
import Link from 'next/link';
import { type ScrapedVehicle } from '@/lib/autoscout-scraper';
import { formatPrice, formatMileage } from '@/lib/vehicle-data-loader';

interface VehicleDetailModalProps {
  vehicle: ScrapedVehicle | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function VehicleDetailModal({ vehicle, isOpen, onClose }: VehicleDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentImageIndex(0);
      setActiveTab('overview');
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!vehicle) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === vehicle.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? vehicle.images.length - 1 : prev - 1
    );
  };

  const contactDealer = () => {
    window.open('tel:032 652 11 66', '_self');
  };

  const sendEmail = () => {
    const subject = `Anfrage: ${vehicle.brand} ${vehicle.model}`;
    const body = `Hallo,\n\nich interessiere mich für das Fahrzeug:\n${vehicle.title}\nPreis: ${formatPrice(vehicle.price)}\n\nBitte kontaktieren Sie mich für weitere Informationen.\n\nMit freundlichen Grüssen`;
    window.open(`mailto:info@autovoegeli.ch?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
  };

  const shareVehicle = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: vehicle.title,
          text: `Schauen Sie sich dieses Fahrzeug bei Auto Vögeli an: ${vehicle.title}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link kopiert!');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Übersicht', icon: Settings },
    { id: 'specs', label: 'Technische Daten', icon: Gauge },
    { id: 'features', label: 'Ausstattung', icon: Star },
    { id: 'contact', label: 'Kontakt', icon: Phone }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-4 md:inset-8 bg-white rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="pr-16">
                <h2 className="text-2xl font-bold mb-2">{vehicle.title}</h2>
                <div className="flex items-center gap-4 text-white/90">
                  <span>{vehicle.year}</span>
                  <span>•</span>
                  <span>{formatMileage(vehicle.mileage)}</span>
                  <span>•</span>
                  <span>{vehicle.fuel}</span>
                </div>
              </div>
              
              <div className="absolute top-4 right-16 flex gap-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current text-red-400' : ''}`} />
                </button>
                <button
                  onClick={shareVehicle}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row h-full">
              {/* Image Gallery */}
              <div className="lg:w-1/2 bg-gray-100 relative">
                {vehicle.images.length > 0 ? (
                  <>
                    <div className="relative w-full h-64 lg:h-full bg-gray-50 flex items-center justify-center">
                      <img
                        src={vehicle.images[currentImageIndex]}
                        alt={`${vehicle.title} - Bild ${currentImageIndex + 1}`}
                        className="max-w-full max-h-full object-contain cursor-pointer hover:scale-105 transition-transform duration-300"
                        onClick={() => setIsFullscreen(true)}
                      />
                      
                      {/* Fullscreen Button */}
                      <button
                        onClick={() => setIsFullscreen(true)}
                        className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                      >
                        <Maximize2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {/* Image Navigation */}
                    {vehicle.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {vehicle.images.length}
                        </div>
                        
                        {/* Thumbnail Strip */}
                        <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto scrollbar-hide">
                          {vehicle.images.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                index === currentImageIndex 
                                  ? 'border-white shadow-lg scale-110' 
                                  : 'border-white/30 hover:border-white/60'
                              }`}
                            >
                              <img
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-64 lg:h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Keine Bilder verfügbar</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="lg:w-1/2 flex flex-col">
                {/* Price & Quick Actions */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl font-bold text-green-600">
                      {formatPrice(vehicle.price)}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{vehicle.location}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={contactDealer}
                      className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      Anrufen
                    </button>
                    <button
                      onClick={sendEmail}
                      className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      E-Mail
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <div className="flex overflow-x-auto">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'text-green-600 border-b-2 border-green-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Key Specs */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                          <Calendar className="w-5 h-5 text-green-500 mx-auto mb-2" />
                          <div className="font-semibold">{vehicle.year}</div>
                          <div className="text-sm text-gray-500">Baujahr</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                          <Gauge className="w-5 h-5 text-green-500 mx-auto mb-2" />
                          <div className="font-semibold">{formatMileage(vehicle.mileage)}</div>
                          <div className="text-sm text-gray-500">Kilometerstand</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                          <Fuel className="w-5 h-5 text-green-500 mx-auto mb-2" />
                          <div className="font-semibold">{vehicle.fuel}</div>
                          <div className="text-sm text-gray-500">Kraftstoff</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                          <Settings className="w-5 h-5 text-green-500 mx-auto mb-2" />
                          <div className="font-semibold">{vehicle.transmission}</div>
                          <div className="text-sm text-gray-500">Getriebe</div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <h3 className="font-semibold mb-3">Fahrzeugbeschreibung</h3>
                        <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                          {vehicle.description || `Hochwertiges ${vehicle.brand} ${vehicle.model} von Auto Vögeli AG. Dieses Fahrzeug wurde sorgfältig geprüft und wartet auf einen neuen Besitzer. Kontaktieren Sie uns für weitere Informationen und eine Probefahrt.`}
                        </div>
                      </div>

                      {/* Condition & Warranty */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="font-medium">Zustand</span>
                          </div>
                          <span className="text-green-700 capitalize">{vehicle.condition}</span>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">Garantie</span>
                          </div>
                          <div className="text-blue-700">
                            {vehicle.warranty === 'Ja' ? (
                              <div>
                                <div className="font-medium">
                                  {vehicle.warrantyDetails && vehicle.warrantyDetails !== 'Keine Angabe' 
                                    ? vehicle.warrantyDetails 
                                    : 'Ja, inklusive'}
                                </div>
                                {vehicle.warrantyMonths && (
                                  <div className="text-sm mt-1">
                                    {vehicle.warrantyMonths} Monate
                                  </div>
                                )}
                              </div>
                            ) : (
                              'Keine Angabe'
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'specs' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold mb-4">Technische Daten</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Marke</span>
                          <span className="font-medium">{vehicle.brand}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Modell</span>
                          <span className="font-medium">{vehicle.model}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Baujahr</span>
                          <span className="font-medium">{vehicle.year}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Kilometerstand</span>
                          <span className="font-medium">{formatMileage(vehicle.mileage)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Leistung</span>
                          <span className="font-medium">{vehicle.power || '-'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Kraftstoff</span>
                          <span className="font-medium">{vehicle.fuel}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Getriebe</span>
                          <span className="font-medium">{vehicle.transmission}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Karosserieform</span>
                          <span className="font-medium">{vehicle.bodyType || 'Motorrad'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Farbe</span>
                          <span className="font-medium">{vehicle.color || 'Metallic'}</span>
                        </div>
                        {vehicle.displacement && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Hubraum</span>
                            <span className="font-medium">{vehicle.displacement} cm³</span>
                          </div>
                        )}
                        {vehicle.co2Emission && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">CO2-Emission</span>
                            <span className="font-medium">{vehicle.co2Emission} g/km</span>
                          </div>
                        )}
                        {vehicle.drive && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Antrieb</span>
                            <span className="font-medium">{vehicle.drive}</span>
                          </div>
                        )}
                        {vehicle.mfk && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">MFK</span>
                            <span className="font-medium">{vehicle.mfk}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'features' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold mb-4">Ausstattung & Features</h3>
                      {vehicle.equipment && vehicle.equipment.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                          {vehicle.equipment.map((feature, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      ) : vehicle.equipment && vehicle.equipment.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                          {vehicle.equipment.map((extra, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-gray-700">{extra}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>Ausstattungsdetails werden nachgeliefert.</p>
                          <p className="text-sm mt-2">Kontaktieren Sie uns für weitere Informationen.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'contact' && (
                    <div className="space-y-6">
                      <h3 className="font-semibold mb-4">Kontakt</h3>
                      
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h4 className="font-semibold mb-4">{vehicle.dealer}</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <span>Solothurnstrasse 129, 2540 Grenchen</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <span>032 652 11 66</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <span>info@autovoegeli.ch</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <button
                          onClick={contactDealer}
                          className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl font-medium transition-colors"
                        >
                          <Phone className="w-5 h-5" />
                          Jetzt anrufen
                        </button>
                        <button
                          onClick={sendEmail}
                          className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-6 rounded-xl font-medium transition-colors"
                        >
                          <Mail className="w-5 h-5" />
                          E-Mail senden
                        </button>
                      </div>

                      <div className="text-center text-sm text-gray-500">
                        <p>Öffnungszeiten:</p>
                        <p>Mo-Fr: 08:00-18:00 Uhr</p>
                        <p>Sa: 08:00-16:00 Uhr</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Fullscreen Image Viewer */}
      <AnimatePresence>
        {isFullscreen && vehicle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[60] flex items-center justify-center"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img
                src={vehicle.images[currentImageIndex]}
                alt={`${vehicle.title} - Bild ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              
              {/* Fullscreen Navigation */}
              {vehicle.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  
                  {/* Fullscreen Image Counter */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
                    {currentImageIndex + 1} / {vehicle.images.length}
                  </div>
                </>
              )}
              
              {/* Fullscreen Thumbnail Strip */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-screen-lg">
                {vehicle.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === currentImageIndex 
                        ? 'border-white shadow-lg' 
                        : 'border-white/30 hover:border-white/60'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

