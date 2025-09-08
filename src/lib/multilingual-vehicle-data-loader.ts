// Multilingual Vehicle Data Loader for Auto Vögeli
// Loads and transforms multilingual scraped vehicle data from JSON files

import { ScrapedVehicle } from './autoscout-scraper';
import { supabaseClient } from './supabase';

// Enhanced interface for multilingual vehicle data
export interface MultilingualVehicle extends ScrapedVehicle {
  // High-level category to distinguish between motorcycles and cars
  category?: 'bike' | 'car';
  multilingual: {
    brand: { de: string; fr: string; en: string };
    fuel: { de: string; fr: string; en: string };
    transmission: { de: string; fr: string; en: string };
    bodyType: { de: string; fr: string; en: string };
    color: { de: string; fr: string; en: string };
    condition: { de: string; fr: string; en: string };
    warranty: { de: string; fr: string; en: string };
    description: { de: string; fr: string; en: string };
    features: { de: string[]; fr: string[]; en: string[] };
  };
}

// Interface for raw multilingual scraped data structure
interface RawMultilingualVehicle {
  id: string;
  url: string;
  scraped_at: string;
  dealer: string;
  title: string;
  price: string | number;
  priceNumber?: number;
  month?: string;
  year: string | number;
  date?: string;
  mileage: string | number;
  mileageNumber?: number;
  type?: string;
  transmission?: string;
  fuel?: string;
  drive?: string;
  power?: string;
  displacement?: string | number;
  consumption?: string;
  co2Emission?: number;
  phones?: string[];
  primaryPhone?: string;
  whatsappPhone?: string;
  businessPhone?: string;
  location?: string;
  equipment?: string[];
  mfk?: string;
  warranty?: string;
  warrantyDetails?: string;
  warrantyMonths?: number;
  warrantyType?: string;
  occGarantie?: boolean;
  fahrzeugbeschreibung?: string;
  brand?: string;
  model?: string;
  condition?: string;
  images?: string[];
  imageCount?: number;
  vehicleAge?: number;
  pricePerYear?: number;
  multilingual?: {
    brand: { de: string; fr: string; en: string };
    fuel: { de: string; fr: string; en: string };
    transmission: { de: string; fr: string; en: string };
    bodyType: { de: string; fr: string; en: string };
    color: { de: string; fr: string; en: string };
    condition: { de: string; fr: string; en: string };
    warranty: { de: string; fr: string; en: string };
    description: { de: string; fr: string; en: string };
    features: { de: string[]; fr: string[]; en: string[] };
  };
}

// Load multilingual vehicle data from consolidated JSON file
export async function loadMultilingualVehicleData(): Promise<MultilingualVehicle[]> {
  try {
    // If Supabase is configured and flag is on, load from DB
    if (process.env.NEXT_PUBLIC_USE_SUPABASE === '1' && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('vehicles')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(500);
      if (!error && data) {
        const vehicles: MultilingualVehicle[] = data.map((row: any) => {
          const multilingual = typeof row.multilingual === 'string' ? JSON.parse(row.multilingual) : row.multilingual;
          return transformMultilingualVehicleData({
            id: row.id,
            title: row.title,
            brand: row.brand,
            model: row.model,
            price: row.price,
            year: row.year,
            mileage: row.mileage,
            fuel: row.fuel,
            transmission: row.transmission,
            power: row.power,
            type: row.body_type,
            color: row.color,
            images: Array.isArray(row.images) ? row.images : (typeof row.images === 'string' ? JSON.parse(row.images) : []),
            fahrzeugbeschreibung: multilingual?.description?.de ?? '',
            equipment: multilingual?.features?.de ?? [],
            location: row.location,
            dealer: row.dealer,
            url: row.url,
            condition: row.condition,
            warranty: row.warranty,
            warrantyDetails: row.warranty_details,
            warrantyMonths: row.warranty_months,
            mfk: row.mfk,
            displacement: row.displacement,
            drive: row.drive,
            multilingual,
          } as any);
        });
        return vehicles;
      }
    }

    // Load from the consolidated multilingual data file
    const response = await fetch('/all_vehicles_multilingual.json');
    
    if (!response.ok) {
      console.warn('Could not load consolidated multilingual vehicle data, using fallback');
      return getFallbackMultilingualVehicleData();
    }
    
    const rawVehicles: RawMultilingualVehicle[] = await response.json();
    
    // Transform all vehicles
    const vehicles: MultilingualVehicle[] = rawVehicles.map(transformMultilingualVehicleData);
    
    console.log(`✅ Loaded ${vehicles.length} multilingual vehicles from consolidated file`);
    
    return vehicles;
    
  } catch (error) {
    console.error('Error loading multilingual vehicle data:', error);
    return getFallbackMultilingualVehicleData();
  }
}

// Transform raw multilingual scraped data to our MultilingualVehicle interface
function transformMultilingualVehicleData(raw: RawMultilingualVehicle): MultilingualVehicle {
  // Extract brand from title if not available
  const brand = raw.brand || extractBrandFromTitle(raw.title);
  const model = raw.model || extractModelFromTitle(raw.title, brand);
  
  // Use the already cleaned price from improved data
  const price = typeof raw.price === 'number' ? raw.price : (raw.priceNumber || 0);
  
  // Use the already fixed year from improved data (guard undefined/null)
  const year = typeof raw.year === 'number'
    ? raw.year
    : (parseInt(String(raw.year ?? '')) || new Date().getFullYear());
  
  // Use the already cleaned mileage from improved data (guard undefined)
  const mileage = typeof raw.mileage === 'number' ? raw.mileage : (raw.mileageNumber ?? 0);
  
  // Determine condition based on mileage and age
  let condition: 'new' | 'used' = 'used';
  if (mileage < 100 && year >= 2024) {
    condition = 'new';
  }
  
  // Use the already cleaned power from improved data
  const power = raw.power || '-';
  
  // Determine high-level category
  const carTypeSet = new Set(['Limousine', 'Kombi', 'SUV', 'Coupe', 'Cabrio', 'Pickup', 'Van']);
  const isCarByType = raw.type ? carTypeSet.has(raw.type) : false;
  const carBrands = new Set(['TESLA', 'AUDI', 'VOLKSWAGEN', 'MERCEDES', 'MERCEDES-BENZ', 'PORSCHE', 'FERRARI', 'LAMBORGHINI', 'BMW']);
  // Note: BMW makes bikes too, so only use brand as a weak signal if type missing
  const isCarByBrand = carBrands.has((brand || '').toUpperCase()) && isCarByType;
  const category: 'bike' | 'car' = (isCarByType || isCarByBrand) ? 'car' : 'bike';

  return {
    id: raw.id,
    title: raw.title,
    brand: brand,
    model: model,
    year: year,
    price: price,
    mileage: mileage,
    fuel: raw.fuel || 'Benzin',
    transmission: raw.transmission || 'Manuell',
    power: power,
    bodyType: mapVehicleType(raw.type),
    color: 'Metallic', // Default as not available in scraped data
    images: raw.images || [],
    description: cleanDescription((raw.fahrzeugbeschreibung as string) || ''),
    features: raw.equipment || [],
    location: cleanLocation((raw.location as string) || ''),
    dealer: raw.dealer || 'Auto Vögeli AG',
    url: raw.url,
    condition: condition,
    category,
    firstRegistration: `${raw.month}/${year}`,
    doors: getDoorsFromType((raw.type as string) || ''),
    seats: getSeatsFromType((raw.type as string) || ''),
    co2Emission: raw.co2Emission || undefined,
    consumption: raw.consumption !== '-' ? raw.consumption : undefined,
    fahrzeugbeschreibung: raw.fahrzeugbeschreibung,
    equipment: raw.equipment || [],
    warranty: raw.warranty,
    warrantyDetails: raw.warrantyDetails,
    warrantyMonths: raw.warrantyMonths,
    mfk: raw.mfk,
    displacement: (typeof raw.displacement === 'number' ? raw.displacement : null),
    drive: raw.drive,
    vehicleAge: raw.vehicleAge,
    pricePerYear: raw.pricePerYear,
    multilingual: raw.multilingual || {
      brand: { de: brand, fr: brand, en: brand },
      fuel: { de: raw.fuel || 'Benzin', fr: raw.fuel || 'Essence', en: raw.fuel || 'Petrol' },
      transmission: { de: raw.transmission || 'Manuell', fr: raw.transmission || 'Manuel', en: raw.transmission || 'Manual' },
      bodyType: { de: raw.type || 'Motorrad', fr: raw.type || 'Moto', en: raw.type || 'Motorcycle' },
      color: { de: 'Nicht angegeben', fr: 'Non spécifié', en: 'Not specified' },
      condition: { de: condition === 'new' ? 'Neu' : 'Gebraucht', fr: condition === 'new' ? 'Neuf' : 'Occasion', en: condition === 'new' ? 'New' : 'Used' },
      warranty: { de: raw.warranty || 'Ja', fr: raw.warranty || 'Oui', en: raw.warranty || 'Yes' },
      description: { 
        de: raw.fahrzeugbeschreibung || 'Hochwertiges Fahrzeug von Auto Vögeli AG',
        fr: raw.fahrzeugbeschreibung || 'Véhicule de qualité d\'Auto Vögeli AG',
        en: raw.fahrzeugbeschreibung || 'High-quality vehicle from Auto Vögeli AG'
      },
      features: { de: raw.equipment || [], fr: raw.equipment || [], en: raw.equipment || [] }
    }
  };
}

// Extract brand from title
function extractBrandFromTitle(title: string | undefined | null): string {
  if (!title || typeof title !== 'string') {
    return 'DIVERSE';
  }
  const titleUpper = title.toUpperCase();
  
  const knownBrands = [
    'YAMAHA', 'BMW', 'MERCEDES', 'AUDI', 'VOLKSWAGEN', 'TESLA', 'PORSCHE',
    'FERRARI', 'LAMBORGHINI', 'ZONTES', 'KOVE', 'VOGE', 'SWM', 'HARLEY-DAVIDSON',
    'TRIUMPH', 'DUCATI', 'KAWASAKI', 'HONDA', 'SUZUKI', 'KTM', 'APRILIA',
    'COLOVE', 'AVERSUS', 'WOTTAN', 'BUELL', 'ARIIC'
  ];
  
  for (const brand of knownBrands) {
    if (titleUpper.includes(brand)) {
      return brand;
    }
  }
  
  // Fallback: use first word, but avoid "unknown"
  const firstWord = title.split(' ')[0];
  return firstWord === 'unknown' || firstWord === 'Unknown' ? 'DIVERSE' : firstWord;
}

// Extract model from title (everything after brand)
function extractModelFromTitle(title: string | undefined | null, brand: string): string {
  if (!title || typeof title !== 'string') return '';
  const titleParts = title.split(' ');
  const brandIndex = titleParts.findIndex(part => 
    part.toUpperCase() === brand.toUpperCase()
  );
  
  if (brandIndex !== -1 && brandIndex < titleParts.length - 1) {
    return titleParts.slice(brandIndex + 1).join(' ');
  }
  
  return title.replace(brand, '').trim();
}

// Map vehicle type to body type
function mapVehicleType(type: string | undefined | null): string {
  const typeMap: Record<string, string> = {
    'Naked bike': 'Motorrad',
    'chopper': 'Chopper',
    'Sporttourer': 'Sporttourer',
    'Adventure': 'Adventure',
    'Scooter': 'Roller',
    'Supermoto': 'Supermoto',
    'Touring': 'Touring',
    'Supersport': 'Supersport',
    'Enduro': 'Enduro'
  };
  if (!type) return 'Motorrad';
  return typeMap[type] || 'Motorrad';
}

// Clean description text
function cleanDescription(description: string): string {
  if (!description) return '';
  
  // Handle both single and double escaped sequences
  const cleaned = description
    .replace(/\\\\n/g, '\n')      // Double escaped newlines \\n
    .replace(/\\n/g, '\n')        // Single escaped newlines \n
    .replace(/\\\\"/g, '"')       // Double escaped quotes \\"
    .replace(/\\"/g, '"')         // Single escaped quotes \"
    .replace(/\\\\t/g, '\t')      // Double escaped tabs \\t
    .replace(/\\t/g, '\t')        // Single escaped tabs \t
    .replace(/\\\\r/g, '\r')      // Double escaped carriage returns \\r
    .replace(/\\r/g, '\r')        // Single escaped carriage returns \r
    .replace(/\\u0026/g, '&')     // Unicode ampersand
    .replace(/\\\\u0026/g, '&')   // Double escaped unicode ampersand
    .replace(/\\\\\\\\/g, '\\')   // Quadruple backslash to single
    .replace(/\\\\/g, '\\')       // Double backslash to single
    .replace(/<br\s*\/?>/gi, '\n') // Convert <br> tags to newlines
    .replace(/<[^>]*>/g, '')      // Remove any remaining HTML tags
    .trim();
  
  return cleaned;
}

// Clean location string
function cleanLocation(location: string): string {
  if (!location || location.toLowerCase().includes('unknown')) return 'Grenchen';
  
  // Extract city from full address
  const parts = location.split(',');
  if (parts.length > 1) {
    // Return the city part (usually last part with postal code)
    const cityPart = parts[parts.length - 1].trim();
    const cityMatch = cityPart.match(/\d+\s+(.+)/);
    if (cityMatch) {
      return cityMatch[1];
    }
  }
  
  return location;
}

// Estimate doors from vehicle type
function getDoorsFromType(type: string): number {
  // Motorcycles typically don't have doors, but for cars:
  const typeMap: Record<string, number> = {
    'Limousine': 4,
    'Kombi': 5,
    'SUV': 5,
    'Coupe': 2,
    'Cabrio': 2
  };
  
  return typeMap[type] || 2; // Default for motorcycles
}

// Estimate seats from vehicle type
function getSeatsFromType(type: string): number {
  // Most motorcycles have 2 seats
  const typeMap: Record<string, number> = {
    'Limousine': 5,
    'Kombi': 5,
    'SUV': 5,
    'Coupe': 4,
    'Cabrio': 4
  };
  
  return typeMap[type] || 2; // Default for motorcycles
}

// Fallback data if multilingual data can't be loaded
function getFallbackMultilingualVehicleData(): MultilingualVehicle[] {
  return [
    {
      id: 'fallback_001',
      title: 'YAMAHA MT-09A 35kW',
      brand: 'YAMAHA',
      model: 'MT-09A',
      year: 2023,
      price: 4990,
      mileage: 22000,
      fuel: 'Benzin',
      transmission: 'Manuell',
      power: '35 kW',
      bodyType: 'Naked Bike',
      color: 'Schwarz',
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
      ],
      description: 'Yamaha MT-09A mit 35kW für A2-Führerschein. Perfekt für Einsteiger mit sportlichem Anspruch.',
      features: ['ABS', 'LED Beleuchtung', 'Digitales Display'],
      location: 'Grenchen',
      dealer: 'Auto Vögeli AG',
      url: 'https://autoscout24.ch',
      condition: 'used',
      firstRegistration: '05/2023',
      doors: 0,
      seats: 2,
      multilingual: {
        brand: { de: 'Yamaha', fr: 'Yamaha', en: 'Yamaha' },
        fuel: { de: 'Benzin', fr: 'Essence', en: 'Petrol' },
        transmission: { de: 'Manuell', fr: 'Manuel', en: 'Manual' },
        bodyType: { de: 'Naked Bike', fr: 'Naked Bike', en: 'Naked Bike' },
        color: { de: 'Schwarz', fr: 'Noir', en: 'Black' },
        condition: { de: 'Gebraucht', fr: 'Occasion', en: 'Used' },
        warranty: { de: 'Ja', fr: 'Oui', en: 'Yes' },
        description: { 
          de: 'Yamaha MT-09A mit 35kW für A2-Führerschein. Perfekt für Einsteiger mit sportlichem Anspruch.',
          fr: 'Yamaha MT-09A avec 35kW pour permis A2. Parfait pour les débutants avec des prétentions sportives.',
          en: 'Yamaha MT-09A with 35kW for A2 license. Perfect for beginners with sporting ambitions.'
        },
        features: { 
          de: ['ABS', 'LED Beleuchtung', 'Digitales Display'],
          fr: ['ABS', 'Éclairage LED', 'Affichage numérique'],
          en: ['ABS', 'LED lighting', 'Digital display']
        }
      }
    }
  ];
}

// Helper functions for multilingual formatting
export function formatPriceMultilingual(price: number, locale: 'de' | 'fr' | 'en'): string {
  const formatters = {
    de: new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }),
    fr: new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }),
    en: new Intl.NumberFormat('en-CH', { style: 'currency', currency: 'CHF' })
  };
  
  return formatters[locale].format(price);
}

export function formatMileageMultilingual(mileage: number, locale: 'de' | 'fr' | 'en'): string {
  const formatters = {
    de: new Intl.NumberFormat('de-CH'),
    fr: new Intl.NumberFormat('fr-CH'),
    en: new Intl.NumberFormat('en-CH')
  };
  
  return `${formatters[locale].format(mileage)} km`;
}

// Get multilingual text for a specific locale
export function getMultilingualText(
  vehicle: MultilingualVehicle,
  field: keyof MultilingualVehicle['multilingual'],
  locale: 'de' | 'fr' | 'en'
): string | string[] {
  const multilingualField = vehicle.multilingual[field];
  
  if (typeof multilingualField === 'object' && multilingualField !== null) {
    if (Array.isArray(multilingualField)) {
      return multilingualField;
    }
    
    if ('de' in multilingualField && 'fr' in multilingualField && 'en' in multilingualField) {
      return multilingualField[locale] || multilingualField.de;
    }
  }
  
  // Fallback to original field if multilingual not available
  return (vehicle as any)[field] || '';
}

// Get vehicle title in specific locale
export function getVehicleTitleMultilingual(vehicle: MultilingualVehicle, locale: 'de' | 'fr' | 'en'): string {
  const brand = getMultilingualText(vehicle, 'brand', locale) as string;
  return `${brand} ${vehicle.model}`;
}

// Get vehicle description in specific locale
export function getVehicleDescriptionMultilingual(vehicle: MultilingualVehicle, locale: 'de' | 'fr' | 'en'): string {
  return getMultilingualText(vehicle, 'description', locale) as string;
}

// Get vehicle features in specific locale
export function getVehicleFeaturesMultilingual(vehicle: MultilingualVehicle, locale: 'de' | 'fr' | 'en'): string[] {
  return getMultilingualText(vehicle, 'features', locale) as string[];
}

// Re-export original helper functions for compatibility
export function formatPrice(price: number): string {
  return `CHF ${price.toLocaleString('de-CH')}`;
}

export function formatMileage(mileage: number): string {
  return `${mileage.toLocaleString('de-CH')} km`;
}

export function getVehicleAge(year: number): string {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  return age === 0 ? 'Neu' : `${age} Jahr${age > 1 ? 'e' : ''}`;
}