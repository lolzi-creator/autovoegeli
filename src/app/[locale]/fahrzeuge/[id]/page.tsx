'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Heart, 
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
  Award,
  Mail,
  X
} from 'lucide-react';
import { type MultilingualVehicle } from '@/lib/multilingual-vehicle-data-loader';
import { formatPriceMultilingual, formatMileageMultilingual, loadMultilingualVehicleData, getMultilingualText, getVehicleTitleMultilingual, getVehicleDescriptionMultilingual, getVehicleFeaturesMultilingual } from '@/lib/multilingual-vehicle-data-loader';
import VehicleDetailTabs from '@/components/VehicleDetailTabs';
import { useTranslation } from '@/hooks/useTranslation';

// WhatsApp utility function
const createWhatsAppLink = (vehicle: MultilingualVehicle, t: any, locale: 'de' | 'fr' | 'en') => {
  const phoneNumber = "+41792664262";
  const message = t('vehicle_detail.whatsapp_message', { title: vehicle.title, price: formatPriceMultilingual(vehicle.price, locale) });
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

export default function VehicleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;
  const locale = params.locale as string;
  const { t } = useTranslation();
  
  const [vehicle, setVehicle] = useState<MultilingualVehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        // Load all vehicles and find the one with matching ID
  const vehicles = await loadMultilingualVehicleData();
        const foundVehicle = vehicles.find((v: MultilingualVehicle) => v.id === vehicleId);
        if (foundVehicle) {
          setVehicle(foundVehicle);
        } else {
          // Vehicle not found, redirect to vehicles page
          router.push('/fahrzeuge');
        }
      } catch (error) {
        console.error('Error loading vehicle:', error);
        router.push('/fahrzeuge');
      } finally {
        setLoading(false);
      }
    };

    if (vehicleId) {
      loadVehicle();
    }
  }, [vehicleId, router]);

  const nextImage = () => {
    if (vehicle) {
      setCurrentImageIndex((prev) => 
        prev === vehicle.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (vehicle) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? vehicle.images.length - 1 : prev - 1
      );
    }
  };

  const contactDealer = () => {
    window.open('tel:032 652 11 66', '_self');
  };

  const shareVehicle = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: vehicle?.title,
          text: t('vehicle_detail.share_text', { title: String(vehicle?.title || '') }),
          url: window.location.href
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert(t('vehicle_detail.link_copied'));
    }
  };

  const tabs = [
    { id: 'overview', label: t('vehicle_detail.overview'), icon: Settings },
    { id: 'specs', label: t('vehicle_detail.specifications'), icon: Gauge },
    { id: 'features', label: t('vehicle_detail.features'), icon: Star }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('vehicle_detail.loading')}</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('vehicle_detail.vehicle_not_found')}</h1>
          <button
            onClick={() => router.push(`/${locale}/fahrzeuge`)}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            {t('vehicle_detail.back_to_vehicles')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => {
                // Check for return URL parameter first
                const urlParams = new URLSearchParams(window.location.search);
                const returnUrl = urlParams.get('return');
                
                if (returnUrl) {
                  // Navigate back to the return URL
                  window.location.href = returnUrl;
                } else {
                  // Check if there's saved state to restore
                  const savedState = sessionStorage.getItem('fahrzeuge_return_state');
                  if (savedState) {
                    // Navigate back to vehicles page with saved state
                    const state = JSON.parse(savedState);
                    const url = new URL(`/${locale}/fahrzeuge`, window.location.origin);
                    url.searchParams.set('page', state.page.toString());
                    if (state.filter) url.searchParams.set('filter', state.filter);
                    if (state.showAdvancedFilters) url.searchParams.set('showAdvanced', 'true');
                    
                    // Clear the saved state
                    sessionStorage.removeItem('fahrzeuge_return_state');
                    
                    // Navigate with state
                    window.location.href = url.toString();
                  } else {
                    // Fallback to browser back
                    router.back();
                  }
                }
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('vehicle_detail.back')}
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current text-red-400' : 'text-gray-600'}`} />
              </button>
              <button
                onClick={shareVehicle}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <div className="relative w-full h-96 lg:h-[500px] bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
              {vehicle.images.length > 0 ? (
                <>
                  <img
                    src={vehicle.images[currentImageIndex]}
                    alt={`${vehicle.title} - Bild ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => setIsFullscreen(true)}
                  />
                  
                  {/* Image Navigation */}
                  {vehicle.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                      
                      {/* Image Counter */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                        {currentImageIndex + 1} / {vehicle.images.length}
                      </div>
                    </>
                  )}

                  {/* Fullscreen Button */}
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="absolute top-4 right-4 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <Maximize2 className="w-6 h-6" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-500">Keine Bilder verfügbar</span>
                </div>
              )}
            </div>
            
            {/* Thumbnail Strip */}
            {vehicle.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {vehicle.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
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
            )}

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="flex overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Key Specs Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <Calendar className="w-6 h-6 text-green-500 mx-auto mb-2" />
                        <div className="font-semibold text-lg">{vehicle.year}</div>
                        <div className="text-sm text-gray-500">{t('vehicle_detail.year')}</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <Gauge className="w-6 h-6 text-green-500 mx-auto mb-2" />
                        <div className="font-semibold text-lg">{formatMileageMultilingual(vehicle.mileage, locale as 'de' | 'fr' | 'en')}</div>
                        <div className="text-sm text-gray-500">{t('vehicle_detail.mileage')}</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <Fuel className="w-6 h-6 text-green-500 mx-auto mb-2" />
                        <div className="font-semibold text-lg">{getMultilingualText(vehicle, 'fuel', locale as 'de' | 'fr' | 'en')}</div>
                        <div className="text-sm text-gray-500">{t('vehicle_detail.fuel')}</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <Settings className="w-6 h-6 text-green-500 mx-auto mb-2" />
                        <div className="font-semibold text-lg">{getMultilingualText(vehicle, 'transmission', locale as 'de' | 'fr' | 'en')}</div>
                        <div className="text-sm text-gray-500">{t('vehicle_detail.transmission')}</div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3">{t('vehicle_detail.vehicle_description')}</h3>
                      <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                        {getVehicleDescriptionMultilingual(vehicle, locale as 'de' | 'fr' | 'en')}
                      </div>
                    </div>

                    {/* Condition & Warranty */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="font-medium">{t('vehicle_detail.condition')}</span>
                        </div>
                        <span className="text-green-700 capitalize">
                          {vehicle.condition === 'used' ? t('vehicle_detail.used') : t('vehicle_detail.new')}
                        </span>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">{t('vehicle_detail.warranty')}</span>
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
                                  {vehicle.warrantyMonths} {t('vehicle_detail.months')}
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

                {/* Tab Content */}
                <VehicleDetailTabs 
                  vehicle={vehicle}
                  activeTab={activeTab}
                  contactDealer={contactDealer}
                  createWhatsAppLink={createWhatsAppLink}
                  locale={locale as 'de' | 'fr' | 'en'}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Price & Actions */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{vehicle.title}</h1>
                <div className="flex items-center justify-center gap-4 text-gray-600 mb-4">
                  <span>{vehicle.year}</span>
                  <span>•</span>
                  <span>{formatMileageMultilingual(vehicle.mileage, locale as 'de' | 'fr' | 'en')}</span>
                  <span>•</span>
                  <span>{getMultilingualText(vehicle, 'fuel', locale as 'de' | 'fr' | 'en')}</span>
                </div>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {formatPriceMultilingual(vehicle.price, locale as 'de' | 'fr' | 'en')}
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{vehicle.location}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <button
                  onClick={contactDealer}
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl font-medium transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  {t('contact.call_now')}
                </button>
                <a
                  href={createWhatsAppLink(vehicle, t, locale as 'de' | 'fr' | 'en')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl font-medium transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  {t('vehicle_detail.whatsapp_send')}
                </a>
                <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-colors">
                  <Calendar className="w-5 h-5" />
                  {t('vehicle_detail.test_drive_book')}
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{t('vehicle_detail.verified_vehicle')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span>{t('vehicle_detail.warranty_included')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span>{t('vehicle_detail.trusted_dealer')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dealer Info Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-4">Auto Vögeli AG</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>Solothurnstrasse 129</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4"></span>
                  <span>2540 Grenchen</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>032 652 11 66</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>info@autovoegeli.ch</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors">
                Händlerprofil ansehen
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
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
          </div>
        </div>
      )}
    </div>
  );
}
