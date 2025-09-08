// Real AutoScout24 Data Loader for Auto Vögeli
// Loads and transforms scraped vehicle data from JSON files

import { ScrapedVehicle } from './autoscout-scraper';

// Interface for raw scraped data structure
interface RawScrapedVehicle {
  id: string;
  url: string;
  scraped_at: string;
  dealer: string;
  title: string;
  price: string; // "CHF 4&#x27;990.-"
  priceNumber: number;
  month: string;
  year: string;
  date: string;
  mileage: string; // "22000 km" or "000 km"
  mileageNumber: number;
  type: string; // "Naked bike", "chopper", etc.
  transmission: string;
  fuel: string;
  drive: string;
  power: string;
  consumption: string;
  phones: string[];
  primaryPhone: string;
  whatsappPhone: string;
  businessPhone: string;
  location: string;
  extras: string[];
  equipment: string[];
  mfk: string;
  warranty: string;
  warrantyDetails: string;
  warrantyMonths: number;
  warrantyType: string;
  occGarantie: boolean;
  fahrzeugbeschreibung: string;
  displacement: number | null;
  co2Emission: number;
  brand: string;
  model: string;
  condition: string;
  images: string[];
  imageCount: number;
  totalImagesOnPage: number;
  vehicleAge?: number;
  pricePerYear?: number;
}

// Load vehicle data from scraped JSON files
export async function loadRealVehicleData(): Promise<ScrapedVehicle[]> {
  try {
    // In production, this would load from the JSON file
    // For now, we'll fetch it from the public directory or API
    
    // Try to load from the improved scraped data file
    const response = await fetch('/scraped_vehicles_improved/all_vehicles_improved.json');
    
    if (!response.ok) {
      console.warn('Could not load real vehicle data, using fallback');
      return getFallbackVehicleData();
    }
    
    const rawVehicles: RawScrapedVehicle[] = await response.json();
    
    // Transform raw data to our interface
    return rawVehicles.map(transformVehicleData);
    
  } catch (error) {
    console.error('Error loading vehicle data:', error);
    return getFallbackVehicleData();
  }
}

// Transform raw scraped data to our ScrapedVehicle interface
function transformVehicleData(raw: RawScrapedVehicle): ScrapedVehicle {
  // Extract brand from title if not available
  const brand = raw.brand || extractBrandFromTitle(raw.title);
  const model = raw.model || extractModelFromTitle(raw.title, brand);
  
  // Use the already cleaned price from improved data
  const price = raw.priceNumber || 0;
  
  // Use the already fixed year from improved data
  const year = parseInt(raw.year) || 2025;
  
  // Use the already cleaned mileage from improved data
  const mileage = raw.mileageNumber || 0;
  
  // Determine condition based on mileage and age
  let condition: 'new' | 'used' = 'used';
  if (mileage < 100 && year >= 2024) {
    condition = 'new';
  }
  
  // Use the already cleaned power from improved data
  const power = raw.power || '-';
  
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
    description: cleanDescription(raw.fahrzeugbeschreibung),
    features: raw.equipment || raw.extras || [],
    location: cleanLocation(raw.location),
    dealer: raw.dealer || 'Auto Vögeli AG',
    url: raw.url,
    condition: condition,
    firstRegistration: `${raw.month}/${year}`,
    doors: getDoorsFromType(raw.type),
    seats: getSeatsFromType(raw.type),
    co2Emission: raw.co2Emission || undefined,
    consumption: raw.consumption !== '-' ? raw.consumption : undefined,
    fahrzeugbeschreibung: raw.fahrzeugbeschreibung,
    equipment: raw.equipment || raw.extras || [],
    warranty: raw.warranty,
    warrantyDetails: raw.warrantyDetails,
    warrantyMonths: raw.warrantyMonths,
    mfk: raw.mfk,
    displacement: raw.displacement,
    drive: raw.drive,
    vehicleAge: raw.vehicleAge,
    pricePerYear: raw.pricePerYear
  };
}

// Extract brand from title
function extractBrandFromTitle(title: string): string {
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
function extractModelFromTitle(title: string, brand: string): string {
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
function mapVehicleType(type: string): string {
  const typeMap: Record<string, string> = {
    'Naked bike': 'Motorrad',
    'chopper': 'Chopper',
    'Sporttourer': 'Sporttourer',
    'Adventure': 'Adventure',
    'Scooter': 'Roller',
    'Supermoto': 'Supermoto',
    'Touring': 'Touring',
    'Supersport': 'Supersport'
  };
  
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
  
  // Don't truncate - return the full cleaned description
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

// Fallback data if real data can't be loaded
function getFallbackVehicleData(): ScrapedVehicle[] {
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
      seats: 2
    }
  ];
}

// Helper functions (re-exported from autoscout-scraper)
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

