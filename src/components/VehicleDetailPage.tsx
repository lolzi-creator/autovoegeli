'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft,
  Phone, 
  MessageCircle, 
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
  Share2,
  Mail
} from 'lucide-react';
import { type ScrapedVehicle } from '@/lib/autoscout-scraper';
import { formatPrice, formatMileage } from '@/lib/vehicle-data-loader';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// WhatsApp utility function
const createWhatsAppLink = (vehicleTitle: string, vehiclePrice: string) => {
  const phoneNumber = "+41792664262";
  const message = `Hallo! Ich interessiere mich für das Fahrzeug ${vehicleTitle} für ${vehiclePrice}. Können Sie mir weitere Informationen dazu geben? Vielen Dank!`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

interface VehicleDetailPageProps {
  vehicle: ScrapedVehicle;
}

export default function VehicleDetailPage({ vehicle }: VehicleDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const handleBackClick = () => {
    // Simply navigate back to fahrzeuge - state restoration is handled by sessionStorage
    router.push('/fahrzeuge');
  };

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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Back Button & Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Zurück zu den Fahrzeugen
          </button>
        </div>
      </div>

      {/* Vehicle Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-500 to-green-600 text-white"
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{vehicle.title}</h1>
              <div className="flex items-center gap-4 text-white/90 text-lg">
                <span>{vehicle.year}</span>
                <span>•</span>
                <span>{formatMileage(vehicle.mileage)}</span>
                <span>•</span>
                <span>{vehicle.fuel}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={shareVehicle}
                className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl overflow-hidden shadow-lg"
          >
            {vehicle.images.length > 0 ? (
              <div className="relative">
                <div className="relative aspect-video bg-gray-50 flex items-center justify-center">
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
                  </>
                )}

                {/* Thumbnail Strip */}
                {vehicle.images.length > 1 && (
                  <div className="p-4 bg-gray-50">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                      {vehicle.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            index === currentImageIndex 
                              ? 'border-green-500 shadow-lg scale-110' 
                              : 'border-gray-200 hover:border-gray-300'
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
                )}
              </div>
            ) : (
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Keine Bilder verfügbar</span>
              </div>
            )}
          </motion.div>

          {/* Vehicle Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Price & Location */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="text-4xl font-bold text-green-600">
                  {formatPrice(vehicle.price)}
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="w-5 h-5" />
                  <span>{vehicle.location}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={contactDealer}
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl font-medium transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Jetzt anrufen
                </button>
                <a
                  href={createWhatsAppLink(vehicle.title, formatPrice(vehicle.price))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl font-medium transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp senden
                </a>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Fahrzeugdaten</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Calendar className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <div className="font-semibold">{vehicle.year}</div>
                  <div className="text-sm text-gray-500">Baujahr</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Gauge className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <div className="font-semibold">{formatMileage(vehicle.mileage)}</div>
                  <div className="text-sm text-gray-500">Kilometerstand</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Fuel className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <div className="font-semibold">{vehicle.fuel}</div>
                  <div className="text-sm text-gray-500">Kraftstoff</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Settings className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <div className="font-semibold">{vehicle.transmission}</div>
                  <div className="text-sm text-gray-500">Getriebe</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Detailed Information Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-green-600 border-b-2 border-green-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Description */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Fahrzeugbeschreibung</h3>
                  <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {vehicle.description || `Hochwertiges ${vehicle.brand} ${vehicle.model} von Auto Vögeli AG. Dieses Fahrzeug wurde sorgfältig geprüft und wartet auf einen neuen Besitzer. Kontaktieren Sie uns für weitere Informationen und eine Probefahrt.`}
                  </div>
                </div>

                {/* Condition & Warranty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <span className="text-lg font-medium">Zustand</span>
                    </div>
                    <span className="text-green-700 capitalize text-lg">{vehicle.condition}</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-6 h-6 text-blue-500" />
                      <span className="text-lg font-medium">Garantie</span>
                    </div>
                    <div className="text-blue-700">
                      {vehicle.warranty === 'Ja' ? (
                        <div>
                          <div className="font-medium text-lg">
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
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Technische Daten</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Marke', value: vehicle.brand },
                    { label: 'Modell', value: vehicle.model },
                    { label: 'Baujahr', value: vehicle.year },
                    { label: 'Kilometerstand', value: formatMileage(vehicle.mileage) },
                    { label: 'Leistung', value: vehicle.power || '-' },
                    { label: 'Kraftstoff', value: vehicle.fuel },
                    { label: 'Getriebe', value: vehicle.transmission },
                    { label: 'Karosserieform', value: vehicle.bodyType || 'Motorrad' },
                    { label: 'Farbe', value: vehicle.color || 'Metallic' },
                    ...(vehicle.displacement ? [{ label: 'Hubraum', value: `${vehicle.displacement} cm³` }] : []),
                    ...(vehicle.co2Emission ? [{ label: 'CO2-Emission', value: `${vehicle.co2Emission} g/km` }] : []),
                    ...(vehicle.drive ? [{ label: 'Antrieb', value: vehicle.drive }] : []),
                    ...(vehicle.mfk ? [{ label: 'MFK', value: vehicle.mfk }] : []),
                  ].map((spec, index) => (
                    <div key={index} className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">{spec.label}</span>
                      <span className="font-semibold">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Ausstattung & Features</h3>
                {vehicle.equipment && vehicle.equipment.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {vehicle.equipment.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">Ausstattungsdetails werden nachgeliefert.</p>
                    <p className="mt-2">Kontaktieren Sie uns für weitere Informationen.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-8">
                <h3 className="text-xl font-semibold">Kontakt</h3>
                
                <div className="bg-gray-50 rounded-xl p-8">
                  <h4 className="text-lg font-semibold mb-6">{vehicle.dealer}</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <MapPin className="w-6 h-6 text-gray-400" />
                      <span className="text-lg">Solothurnstrasse 129, 2540 Grenchen</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Phone className="w-6 h-6 text-gray-400" />
                      <span className="text-lg">032 652 11 66</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Mail className="w-6 h-6 text-gray-400" />
                      <span className="text-lg">info@autovoegeli.ch</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={contactDealer}
                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl font-medium transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    Jetzt anrufen
                  </button>
                  <a
                    href={createWhatsAppLink(vehicle.title, formatPrice(vehicle.price))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl font-medium transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp senden
                  </a>
                </div>

                <div className="text-center text-gray-500">
                  <p className="text-lg font-medium mb-2">Öffnungszeiten:</p>
                  <p>Mo-Fr: 08:00-18:00 Uhr</p>
                  <p>Sa: 08:00-16:00 Uhr</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <Footer />

      {/* Fullscreen Image Viewer */}
      {isFullscreen && (
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
            <ArrowLeft className="w-6 h-6" />
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
          </div>
        </motion.div>
      )}
    </div>
  );
}
