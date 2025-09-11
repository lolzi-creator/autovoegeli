"use client";

import { useState, useEffect } from 'react';
import { 
  loadMultilingualVehicleData,
  getVehicleTitleMultilingual,
  getVehicleDescriptionMultilingual,
  getVehicleFeaturesMultilingual,
  formatPriceMultilingual,
  formatMileageMultilingual,
  getMultilingualText,
  type MultilingualVehicle
} from '@/lib/multilingual-vehicle-data-loader';
import { useTranslation } from '@/hooks/useTranslation';

export default function MultilingualVehicleCard() {
  const { locale } = useTranslation();
  const [vehicles, setVehicles] = useState<MultilingualVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadMultilingualVehicleData();
        setVehicles(data.slice(0, 3)); // Show first 3 vehicles
        setLoading(false);
      } catch (error) {
        console.error('Error loading multilingual vehicles:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p>Loading multilingual vehicles...</p>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="p-8 text-center">
        <p>No multilingual vehicles found.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">
        Multilingual Vehicle Data Demo ({locale.toUpperCase()})
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-lg shadow-lg p-6 border">
            <h3 className="text-xl font-bold mb-2">
              {vehicle.title}
            </h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-semibold text-green-600">
                  {formatPriceMultilingual(vehicle.price, locale as 'de' | 'fr' | 'en')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Mileage:</span>
                <span>{formatMileageMultilingual(vehicle.mileage, locale as 'de' | 'fr' | 'en')}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Fuel:</span>
                <span>{getMultilingualText(vehicle, 'fuel', locale as 'de' | 'fr' | 'en')}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Transmission:</span>
                <span>{getMultilingualText(vehicle, 'transmission', locale as 'de' | 'fr' | 'en')}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Condition:</span>
                <span>{getMultilingualText(vehicle, 'condition', locale as 'de' | 'fr' | 'en')}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Description:</h4>
              <p className="text-sm text-gray-700">
                {getVehicleDescriptionMultilingual(vehicle, locale as 'de' | 'fr' | 'en')}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Features:</h4>
              <div className="flex flex-wrap gap-2">
                {getVehicleFeaturesMultilingual(vehicle, locale as 'de' | 'fr' | 'en').map((feature, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Multilingual Data Structure:</h3>
        <pre className="text-xs bg-white p-3 rounded border overflow-auto">
          {JSON.stringify(vehicles[0]?.multilingual, null, 2)}
        </pre>
      </div>
    </div>
  );
}

