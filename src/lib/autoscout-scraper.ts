// AutoScout24 Scraper for Auto Vögeli
// This scrapes car data to use with custom design instead of HCI widget

export interface ScrapedVehicle {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  power: string;
  bodyType: string;
  color: string;
  images: string[];
  description: string;
  features: string[];
  location: string;
  dealer: string;
  url: string;
  condition: 'new' | 'used';
  firstRegistration?: string;
  doors?: number;
  seats?: number;
  co2Emission?: number;
  consumption?: string;
  fahrzeugbeschreibung?: string;
  equipment?: string[];
  warranty?: string;
  warrantyDetails?: string;
  warrantyMonths?: number;
  mfk?: string;
  displacement?: number | null;
  drive?: string;
}

// Mock scraper function - in production you'd use a real scraping service
export async function scrapeAutoScoutVehicles(_dealerId?: string): Promise<ScrapedVehicle[]> {
  // This would be the actual scraping logic
  // For now, return mock data that looks like real AutoScout24 listings
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'as24_001',
          title: 'BMW 320i xDrive Touring Steptronic',
          brand: 'BMW',
          model: '320i xDrive Touring',
          year: 2023,
          price: 48900,
          mileage: 18500,
          fuel: 'Benzin',
          transmission: 'Automatik',
          power: '184 PS (135 kW)',
          bodyType: 'Kombi',
          color: 'Mineralgrau metallic',
          images: [
            'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1573950940509-d924ee3fd345?w=800&h=600&fit=crop'
          ],
          description: 'BMW 320i xDrive Touring in sehr gutem Zustand. Vollständige Servicehistorie vorhanden. Nichtraucherfahrzeug.',
          features: [
            'Navigation Professional',
            'Leder Dakota schwarz',
            'Klimaautomatik',
            'LED Scheinwerfer',
            'Parkhilfe hinten',
            'Tempomat',
            'Sitzheizung vorn',
            'Bluetooth'
          ],
          location: 'Zürich',
          dealer: 'Auto Vögeli',
          url: 'https://autoscout24.ch/de/d/bmw-320i-xdrive-touring',
          condition: 'used',
          firstRegistration: '03/2023',
          doors: 5,
          seats: 5,
          co2Emission: 152,
          consumption: '6.7 l/100km'
        },
        {
          id: 'as24_002',
          title: 'Mercedes-Benz C 220 d AMG Line 4MATIC',
          brand: 'Mercedes-Benz',
          model: 'C 220 d AMG Line',
          year: 2024,
          price: 56900,
          mileage: 8200,
          fuel: 'Diesel',
          transmission: 'Automatik',
          power: '200 PS (147 kW)',
          bodyType: 'Limousine',
          color: 'Obsidianschwarz metallic',
          images: [
            'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop'
          ],
          description: 'Mercedes-Benz C-Klasse AMG Line in Bestzustand. Neuwertig mit Vollausstattung und Herstellergarantie.',
          features: [
            'MBUX Multimedia System',
            'AMG Line Exterieur',
            'Panorama-Schiebedach',
            'Memory Paket',
            'MULTIBEAM LED',
            'Spurwechselassistent',
            'Totwinkel-Assistent',
            'Parktronic'
          ],
          location: 'Zürich',
          dealer: 'Auto Vögeli',
          url: 'https://autoscout24.ch/de/d/mercedes-benz-c-220-d',
          condition: 'used',
          firstRegistration: '01/2024',
          doors: 4,
          seats: 5,
          co2Emission: 128,
          consumption: '4.9 l/100km'
        },
        {
          id: 'as24_003',
          title: 'Audi A4 Avant 45 TFSI e quattro S tronic',
          brand: 'Audi',
          model: 'A4 Avant 45 TFSI e',
          year: 2023,
          price: 52900,
          mileage: 15000,
          fuel: 'Hybrid (Benzin/Elektro)',
          transmission: 'S tronic',
          power: '245 PS (180 kW)',
          bodyType: 'Kombi',
          color: 'Florettsilber metallic',
          images: [
            'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop'
          ],
          description: 'Audi A4 Avant Plug-in Hybrid mit quattro Allradantrieb. Modernste Technologie und höchste Effizienz.',
          features: [
            'Virtual Cockpit plus',
            'Matrix LED Scheinwerfer',
            'Assistenzpaket Stadt',
            'Bang & Olufsen Premium Sound',
            'Ladestation Typ 2',
            'Adaptives Fahrwerk',
            'Elektrische Heckklappe',
            'Wireless Charging'
          ],
          location: 'Zürich',
          dealer: 'Auto Vögeli',
          url: 'https://autoscout24.ch/de/d/audi-a4-avant-45-tfsi-e',
          condition: 'used',
          firstRegistration: '06/2023',
          doors: 5,
          seats: 5,
          co2Emission: 25,
          consumption: '1.1 l/100km'
        },
        {
          id: 'as24_004',
          title: 'Tesla Model 3 Long Range AWD',
          brand: 'Tesla',
          model: 'Model 3 Long Range',
          year: 2024,
          price: 54900,
          mileage: 5200,
          fuel: 'Elektro',
          transmission: 'Automatik',
          power: '513 PS (377 kW)',
          bodyType: 'Limousine',
          color: 'Pearl White Multi-Coat',
          images: [
            'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=600&fit=crop'
          ],
          description: 'Tesla Model 3 Long Range mit Allradantrieb. Autopilot inklusive und Supercharger-Zugang.',
          features: [
            'Autopilot',
            'Premium Connectivity',
            'Glass Roof',
            'Premium Audio',
            'Supercharging included',
            'Over-the-air Updates',
            '15" Touchscreen',
            'Mobile Connector'
          ],
          location: 'Zürich',
          dealer: 'Auto Vögeli',
          url: 'https://autoscout24.ch/de/d/tesla-model-3-long-range',
          condition: 'used',
          firstRegistration: '02/2024',
          doors: 4,
          seats: 5,
          co2Emission: 0,
          consumption: '16.1 kWh/100km'
        },
        {
          id: 'as24_005',
          title: 'Volkswagen Golf GTI Performance DSG',
          brand: 'Volkswagen',
          model: 'Golf GTI Performance',
          year: 2023,
          price: 41900,
          mileage: 12000,
          fuel: 'Benzin',
          transmission: 'DSG',
          power: '245 PS (180 kW)',
          bodyType: 'Schrägheck',
          color: 'Tornado Rot',
          images: [
            'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=600&fit=crop'
          ],
          description: 'Volkswagen Golf GTI Performance mit DSG-Getriebe. Sportlichkeit und Alltagstauglichkeit perfekt vereint.',
          features: [
            'DCC Adaptive Chassis Control',
            'LED Matrix Scheinwerfer',
            'Discover Pro Navigation',
            'Beats Audio System',
            'Wireless App-Connect',
            'Sport Fahrwerk',
            'Performance Paket',
            'Keyless Access'
          ],
          location: 'Zürich',
          dealer: 'Auto Vögeli',
          url: 'https://autoscout24.ch/de/d/volkswagen-golf-gti',
          condition: 'used',
          firstRegistration: '05/2023',
          doors: 5,
          seats: 5,
          co2Emission: 169,
          consumption: '7.4 l/100km'
        }
      ]);
    }, 1000); // Simulate API delay
  });
}

// Real scraping implementation would go here
export async function scrapeRealAutoScoutData(_dealerUrl: string): Promise<ScrapedVehicle[]> {
  // This would use a scraping service like:
  // - Puppeteer/Playwright for browser automation
  // - Cheerio for HTML parsing
  // - ScrapingBee/ScrapingAnt for managed scraping
  // - Proxy rotation to avoid blocking
  
  // Example implementation outline:
  /*
  try {
    const response = await fetch(`/api/scrape?url=${encodeURIComponent(_dealerUrl)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dealerUrl: _dealerUrl })
    });
    
    if (!response.ok) throw new Error('Scraping failed');
    
    const data = await response.json();
    return data.vehicles;
  } catch (error) {
    console.error('Scraping error:', error);
    return [];
  }
  */
  
  // For now, return mock data
  return scrapeAutoScoutVehicles();
}

// Helper function to format price
export function formatPrice(price: number): string {
  return `CHF ${price.toLocaleString('de-CH')}`;
}

// Helper function to format mileage
export function formatMileage(mileage: number): string {
  return `${mileage.toLocaleString('de-CH')} km`;
}

// Helper function to get vehicle age
export function getVehicleAge(year: number): string {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  return age === 0 ? 'Neu' : `${age} Jahr${age > 1 ? 'e' : ''}`;
} 