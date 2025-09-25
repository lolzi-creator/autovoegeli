"use client";

import { 
  Gauge, 
  Star, 
  CheckCircle,
  Calendar,
  Car,
  Wrench,
  Zap,
  Fuel,
  Settings,
  Droplets,
  Wind,
  FileText
} from 'lucide-react';
import { type MultilingualVehicle, formatPriceMultilingual, formatMileageMultilingual, getMultilingualText } from '@/lib/multilingual-vehicle-data-loader';
import { useTranslation } from '@/hooks/useTranslation';

interface VehicleDetailTabsProps {
  vehicle: MultilingualVehicle;
  activeTab: string;
  contactDealer: () => void;
  createWhatsAppLink: (vehicle: MultilingualVehicle, locale: 'de' | 'fr' | 'en') => string;
  locale: 'de' | 'fr' | 'en';
}

export default function VehicleDetailTabs({ vehicle, activeTab, contactDealer, createWhatsAppLink, locale }: VehicleDetailTabsProps) {
  const { t } = useTranslation();
  if (activeTab === 'specs') {
    return (
      <div className="space-y-6">
        <h3 className="font-semibold text-lg mb-4">{t('vehicle_detail.specifications')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: t('vehicle_detail.brand'), value: getMultilingualText(vehicle, 'brand', locale), icon: Car },
            { label: t('vehicle_detail.model'), value: vehicle.model, icon: Car },
            { label: t('vehicle_detail.year'), value: vehicle.year, icon: Calendar },
            { label: t('vehicle_detail.mileage'), value: formatMileageMultilingual(vehicle.mileage, locale), icon: Gauge },
            { label: t('vehicle_detail.power'), value: vehicle.power || '-', icon: Zap },
            { label: t('vehicle_detail.fuel'), value: getMultilingualText(vehicle, 'fuel', locale), icon: Fuel },
            { label: t('vehicle_detail.transmission'), value: getMultilingualText(vehicle, 'transmission', locale), icon: Settings },
            { label: t('vehicle_detail.body_type'), value: getMultilingualText(vehicle, 'bodyType', locale), icon: Car },
            { label: t('vehicle_detail.color'), value: getMultilingualText(vehicle, 'color', locale), icon: Droplets },
            ...(vehicle.displacement ? [{ label: t('vehicle_detail.displacement'), value: `${vehicle.displacement} cm³`, icon: Wrench }] : []),
            ...(vehicle.co2Emission ? [{ label: t('vehicle_detail.co2_emission'), value: `${vehicle.co2Emission} g/km`, icon: Wind }] : []),
            ...(vehicle.drive ? [{ label: t('vehicle_detail.drive'), value: vehicle.drive, icon: Car }] : []),
            ...(vehicle.mfk ? [{ label: t('vehicle_detail.mfk'), value: vehicle.mfk, icon: FileText }] : []),
          ].map((spec, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <spec.icon className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-600 flex-1">{spec.label}</span>
              <span className="font-medium">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'features') {
    return (
      <div className="space-y-6">
        <h3 className="font-semibold text-lg mb-4">{t('vehicle_detail.equipment_features')}</h3>
        {vehicle.multilingual.features[locale] && vehicle.multilingual.features[locale].length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vehicle.multilingual.features[locale].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">{t('vehicle_detail.equipment_details_pending')}</p>
            <p className="text-sm mt-2">{t('vehicle_detail.contact_for_info')}</p>
          </div>
        )}
      </div>
    );
  }


  return null;
}
