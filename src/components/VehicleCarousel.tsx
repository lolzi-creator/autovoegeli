'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  ArrowRight, 
  MapPin,
  Eye,
  Phone,
  MessageCircle
} from 'lucide-react';

// Featured vehicles data - will be selectable from admin panel later
const FEATURED_VEHICLES = [
  {
    id: 1,
    brand: 'VOGE',
    model: 'SR1 ADV',
    year: 2020,
    mileage: '25 km',
    fuel: 'Benzin',
    transmission: 'Stufenlos',
    location: 'Grenchen',
    price: 'CHF 3\'890',
    image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?q=80&w=800&auto=format&fit=crop',
    category: 'OCCASION',
    features: ['ABS', 'Neu bereift']
  },
  {
    id: 2,
    brand: 'Zontes',
    model: '703F ADV',
    year: 2024,
    mileage: '0 km',
    fuel: 'Benzin',
    transmission: 'Manuell',
    location: 'Grenchen',
    price: 'CHF 7\'990',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop',
    category: 'NEU',
    features: ['ABS', 'LED Beleuchtung']
  },
  {
    id: 3,
    brand: 'KOVE',
    model: '800X Pro',
    year: 2024,
    mileage: '0 km',
    fuel: 'Benzin',
    transmission: 'Manuell',
    location: 'Grenchen',
    price: 'CHF 12\'990',
    image: 'https://images.unsplash.com/photo-1558981033-0f0309284409?q=80&w=800&auto=format&fit=crop',
    category: 'NEU',
    features: ['Traktionskontrolle', 'Quickshifter']
  }
];

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  mileage: string;
  fuel: string;
  transmission: string;
  location: string;
  price: string;
  image: string;
  category: string;
  features: string[];
}

const VehicleCard = ({ vehicle, index }: { vehicle: Vehicle, index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
  >
    {/* Image Section with overlay */}
    <div className="relative h-72 overflow-hidden">
      <Image
        src={vehicle.image}
        alt={`${vehicle.brand} ${vehicle.model}`}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-300"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      
      {/* Category Badge */}
      <div className="absolute top-4 left-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
          vehicle.category === 'OCCASION' ? 'bg-gray-700' : 'bg-green-600'
        }`}>
          {vehicle.category}
        </span>
      </div>
      

      {/* Vehicle Title Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <h3 className="text-white text-xl font-bold mb-1">
          {vehicle.brand.toUpperCase()} {vehicle.model.toUpperCase()}
        </h3>
        <p className="text-white/80 text-sm">
          {vehicle.year}
        </p>
      </div>
    </div>

    {/* Content Section */}
    <div className="p-6 space-y-4">
      {/* Specs Grid */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-gray-500">Kilometerstand</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-gray-500">Kraftstoff</span>
        </div>
        
        <div className="text-gray-900 font-semibold">
          {vehicle.mileage}
        </div>
        <div className="text-gray-900 font-semibold">
          {vehicle.fuel}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-gray-500">Getriebe</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-green-500" />
          <span className="text-gray-500">Standort</span>
        </div>
        
        <div className="text-gray-900 font-semibold">
          {vehicle.transmission}
        </div>
        <div className="text-gray-900 font-semibold">
          {vehicle.location}
        </div>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <h4 className="text-gray-500 text-sm font-medium">AUSSTATTUNG HIGHLIGHTS</h4>
        <div className="flex flex-wrap gap-2">
          {vehicle.features.map((feature, idx) => (
            <span 
              key={idx}
              className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="pt-4 border-t border-gray-100">
        <div className="text-3xl font-bold text-green-600 mb-2">
          {vehicle.price}
        </div>
        <div className="text-sm text-gray-500 mb-6">{vehicle.location}</div>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center group">
            <Eye className="mr-2 h-4 w-4" />
            DETAILS ANSEHEN
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="flex space-x-2">
            <a
              href="tel:+41792664262"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center text-sm"
            >
              <Phone className="mr-2 h-4 w-4" />
              Anrufen
            </a>
            <a
              href={createWhatsAppLink(vehicle)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center text-sm"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

// WhatsApp utility function
const createWhatsAppLink = (vehicle: Vehicle) => {
  const phoneNumber = "+41786360619";
  const message = `🚗 *INTERESSE AN FAHRZEUG - Auto Vögeli*

📋 *Fahrzeug:*
${vehicle.brand} ${vehicle.model} (${vehicle.year})
🏷️ Preis: ${vehicle.price}
🛣️ Kilometerstand: ${vehicle.mileage}
⛽ Kraftstoff: ${vehicle.fuel}
⚙️ Getriebe: ${vehicle.transmission}

📍 *Standort:*
${vehicle.location}

💬 *Nachricht:*
Hallo! Ich interessiere mich für dieses Fahrzeug. Können Sie mir weitere Informationen dazu geben? Vielen Dank!

---
Gesendet über autovoegeli.ch`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

const VehicleShowcase = () => {
  return (
    <section className="py-8 md:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              Fahrzeuge mit <span className="text-green-600">Aktionspreisen</span>
            </h2>
            <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto">
              Entdecken Sie unsere handverlesenen Motorräder mit exklusiven Rabatten. 
              Alle Fahrzeuge mit Garantie und professionellem Service.
            </p>
          </motion.div>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {FEATURED_VEHICLES.map((vehicle, index) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} index={index} />
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-100 max-w-lg mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Nicht das Richtige dabei?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Entdecken Sie unser komplettes Sortiment mit über 60 Fahrzeugen.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/fahrzeuge"
                className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Alle Fahrzeuge ansehen
                <ArrowRight className="ml-2 h-3 w-3" />
              </a>
              <a
                href="/kontakt"
                className="inline-flex items-center justify-center border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Beratung vereinbaren
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VehicleShowcase;