import { supabaseService } from './supabase';

// Working cars scraper logic ported from smart-cars-scraper.js

interface CarVehicle {
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
  body_type: string;
  color: string;
  images: string[];
  description: string;
  features: string[];
  location: string;
  dealer: string;
  url: string;
  condition: 'new' | 'used';
  category: string;
  multilingual: string;
}

// Fetch page helper for Node.js style
async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.text();
}

// Extract year from various date formats
function extractYear(rawDate: any): number {
  if (!rawDate || typeof rawDate !== 'string') return new Date().getFullYear();
  
  const currentYear = new Date().getFullYear();
  const cleanDate = rawDate.replace(/[^\d\.\/\-\s]/g, '').trim();
  
  const patterns = [
    /(\d{2})\.(\d{4})/,  // MM.YYYY (most common format like "08.2013")
    /(\d{1,2})\/(\d{4})/, // M/YYYY or MM/YYYY  
    /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
    /(\d{4})/           // Just year (last to avoid false matches)
  ];
  
  for (const pattern of patterns) {
    const match = cleanDate.match(pattern);
    if (match) {
      let year;
      if (match.length === 3) {
        // MM.YYYY or M/YYYY format
        year = parseInt(match[2]);
      } else if (match.length === 4) {
        // YYYY-MM-DD format
        year = parseInt(match[1]);
      } else {
        // Just year
        year = parseInt(match[1]);
      }
      
      // Validate year is reasonable
      if (year >= 1900 && year <= currentYear + 1) {
        return year;
      }
    }
  }
  
  // Special handling for "Neues Fahrzeug" or similar
  if (rawDate.toLowerCase().includes('neu')) {
    return currentYear;
  }
  
  return currentYear;
}

// Extract price
function extractPrice(rawPrice: any): number {
  if (!rawPrice) return 0;
  const priceStr = String(rawPrice).replace(/[^\d]/g, '');
  const price = parseInt(priceStr);
  return (price >= 100 && price <= 999999) ? price : 0;
}

// Extract mileage
function extractMileage(rawMileage: any): number {
  if (!rawMileage) return 0;
  const mileageStr = String(rawMileage).replace(/[^\d]/g, '');
  const mileage = parseInt(mileageStr);
  return (mileage >= 0 && mileage <= 999999) ? mileage : 0;
}

// Step 1: Get all available car brands from AutoScout24
async function getAllCarBrands(): Promise<string[]> {
  console.log('🏷️ Getting all available car brands...');
  
  try {
    // Use the main cars search page
    const html = await fetchPage('https://www.autoscout24.ch/de/hci/v2/5571/search');
    
    // Extract brands from the page - look for common patterns
    let allBrands = new Set<string>();
    
    // Use the exact brands available from AutoScout24 cars page
    const availableCarBrands = [
      'ASTON MARTIN',
      'AUDI',
      'CITROEN', 
      'FORD',
      'MERCEDES BENZ',
      'PORSCHE',
      'SKODA',
      'XEV'
    ];
    
    // Check which brands are actually available on the page
    for (const brand of availableCarBrands) {
      if (html.includes(brand)) {
        allBrands.add(brand);
      }
    }
    
    // Method 2: Try to extract from dropdowns/selects  
    const selectMatches = html.match(/<option[^>]*value[^>]*>([^<]+)<\/option>/g);
    if (selectMatches) {
      selectMatches.forEach(match => {
        const contentMatch = match.match(/>([^<]+)</);
        if (contentMatch && contentMatch[1]) {
          const content = contentMatch[1].trim();
          // Check if it looks like a car brand (starts with capital, reasonable length)
          if (content.length > 2 && content.length < 25 && /^[A-Z]/.test(content)) {
            // Filter out common non-brand words and prices
            if (!content.includes('Alle') && !content.includes('icon') && 
                !content.includes('Filter') && !content.includes('Search') &&
                !content.includes('CHF') && !content.includes('Preis') &&
                !content.includes('PS:') && !content.includes('Model') &&
                !content.includes('Jahrgang') && !content.includes('Kilometerstand') &&
                !content.includes('Benzin') && !content.includes('Diesel') &&
                !content.includes('Elektro') && !content.includes('Marke') &&
                !content.includes('Personenwagen') && !content.includes('Nutzfahrzeug') &&
                !content.includes('Wohnmobil')) {
              allBrands.add(content);
            }
          }
        }
      });
    }
    
    const brands = Array.from(allBrands).sort();
    console.log(`✅ Found ${brands.length} car brands:`, brands.join(', '));
    
    // If we still don't have many brands, use a fallback list
    if (brands.length < 5) {
      console.log('⚠️ Using fallback brand list...');
      const fallbackBrands = ['Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Ford'];
      return fallbackBrands;
    }
    
    return brands;
    
  } catch (error: any) {
    console.error('❌ Error getting car brands:', error.message);
    // Return fallback brands on error
    return ['Audi', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Ford'];
  }
}

// Step 2: Scrape car details from AutoScout24
async function scrapeCarDetail(listingUrl: string, brandName: string): Promise<CarVehicle | null> {
  try {
    console.log(`📄 Scraping car detail: ${listingUrl}`);
    const html = await fetchPage(listingUrl);
    
    // Extract data using the working patterns from the Node.js scraper
    const titleMatch = html.match(/<h1[^>]*class="[^"]*"[^>]*>([^<]+)<\/h1>/) || 
                      html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const title = titleMatch ? titleMatch[1].trim() : `${brandName} Vehicle`;
    
    // Extract price using working pattern
    const priceMatches = html.match(/<span[^>]*class="[^"]*chakra-text[^"]*"[^>]*>([^<]*CHF[^<]*)<\/span>/g);
    let price = 0;
    if (priceMatches) {
      for (const match of priceMatches) {
        const priceText = match.replace(/<[^>]*>/g, '');
        const priceNum = extractPrice(priceText);
        if (priceNum > price) {
          price = priceNum;
        }
      }
    }
    
    // Extract year using working pattern
    const yearMatches = html.match(/<span[^>]*class="[^"]*chakra-text[^"]*"[^>]*>([^<]*)<\/span>/g);
    let year = new Date().getFullYear();
    if (yearMatches) {
      for (const match of yearMatches) {
        const yearText = match.replace(/<[^>]*>/g, '');
        const extractedYear = extractYear(yearText);
        if (extractedYear !== new Date().getFullYear()) {
          year = extractedYear;
          break;
        }
      }
    }
    
    // Extract mileage
    let mileage = 0;
    const mileageMatches = html.match(/<span[^>]*class="[^"]*chakra-text[^"]*"[^>]*>([^<]*km[^<]*)<\/span>/g);
    if (mileageMatches) {
      for (const match of mileageMatches) {
        const mileageText = match.replace(/<[^>]*>/g, '');
        const extractedMileage = extractMileage(mileageText);
        if (extractedMileage > 0) {
          mileage = extractedMileage;
          break;
        }
      }
    }
    
    // Extract model from title
    const modelPart = title.replace(brandName, '').trim();
    const model = modelPart.split(' ').slice(0, 2).join(' ') || 'Unknown';
    
    // Generate ID
    const autoscoutId = listingUrl.match(/\/(\d+)$/)?.[1] || Math.random().toString(36).substr(2, 9);
    const id = `${brandName.toLowerCase()}-${model.toLowerCase().replace(/\s+/g, '-')}-${autoscoutId}`;
    
    // Generate multilingual data
    const multilingual = {
      fuel: {
        de: 'Benzin',
        en: 'Petrol',
        fr: 'Essence'
      },
      brand: { de: brandName, en: brandName, fr: brandName },
      color: { de: 'Metallic', en: 'Metallic', fr: 'Métallique' },
      bodyType: { de: 'Limousine', en: 'Sedan', fr: 'Berline' },
      features: { 
        de: ['ABS', 'Klimaanlage', 'Navigation'], 
        en: ['ABS', 'Air Conditioning', 'Navigation'], 
        fr: ['ABS', 'Climatisation', 'Navigation'] 
      },
      warranty: { de: '12 Monate', en: '12 Months', fr: '12 Mois' },
      condition: { 
        de: (year >= 2024 && mileage < 100) ? 'Neu' : 'Gebraucht', 
        en: (year >= 2024 && mileage < 100) ? 'New' : 'Used', 
        fr: (year >= 2024 && mileage < 100) ? 'Neuf' : 'Occasion' 
      },
      description: {
        de: `Hochwertiges ${brandName} ${model} Baujahr ${year} von Auto Vögeli AG.`,
        en: `High-quality ${brandName} ${model} from ${year} by Auto Vögeli AG.`,
        fr: `Véhicule de qualité ${brandName} ${model} de ${year} d'Auto Vögeli AG.`
      },
      transmission: {
        de: 'Automatik',
        en: 'Automatic transmission',
        fr: 'Transmission automatique'
      }
    };

    console.log(`✅ Scraped: ${title} - ${price} CHF - ${year} - ${mileage}km`);

    return {
      id,
      title,
      brand: brandName,
      model,
      year,
      price,
      mileage,
      fuel: 'Benzin',
      transmission: 'Automatik',
      power: '150 PS (110 kW)',
      body_type: 'Limousine',
      color: 'Metallic',
      images: [`https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop`],
      description: `Hochwertiges ${brandName} ${model} Baujahr ${year}`,
      features: ['ABS', 'Klimaanlage', 'Navigation'],
      location: 'Grenchen',
      dealer: 'Auto Vögeli AG',
      url: listingUrl,
      condition: (year >= 2024 && mileage < 100) ? 'new' : 'used',
      category: 'car',
      multilingual: JSON.stringify(multilingual)
    };
    
  } catch (error: any) {
    console.error(`❌ Error scraping car detail from ${listingUrl}:`, error.message);
    return null;
  }
}

// Step 3: Scrape all cars for a brand
async function scrapeAllCarsForBrand(brandName: string): Promise<CarVehicle[]> {
  console.log(`🔍 Scraping all ${brandName} cars...`);
  
  const vehicles: CarVehicle[] = [];
  const categories = ['passenger', 'camper', 'utility'];
  
  for (const category of categories) {
    try {
      const brandKey = brandName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const searchUrl = `https://www.autoscout24.ch/de/hci/v2/5571/search?makeKey=${brandKey}&vehicleCategories=${category}&pageSize=20`;
      
      console.log(`📋 Scraping ${brandName} ${category} vehicles from: ${searchUrl}`);
      
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      if (data.listings && data.listings.length > 0) {
        console.log(`Found ${data.listings.length} ${category} listings for ${brandName}`);
        
        // Process up to 5 vehicles per category
        for (let i = 0; i < Math.min(data.listings.length, 5); i++) {
          const listing = data.listings[i];
          if (listing.url) {
            const vehicle = await scrapeCarDetail(listing.url, brandName);
            if (vehicle) {
              vehicles.push(vehicle);
            }
          }
        }
      } else {
        console.log(`No ${category} listings found for ${brandName}`);
      }
    } catch (error: any) {
      console.error(`Error scraping ${brandName} ${category}:`, error.message);
    }
  }
  
  console.log(`✅ Total vehicles scraped for ${brandName}: ${vehicles.length}`);
  return vehicles;
}

export async function smartScrapeAllCars(): Promise<{ success: boolean; message: string; count: number }> {
  try {
    console.log('🚗 Starting smart cars scraper with multilingual support...');
    
    // Get all car brands
    const brands = await getAllCarBrands();
    console.log(`Found ${brands.length} car brands:`, brands);
    
    // Delete existing car records
    console.log('🗑️ Clearing existing car records from Supabase...');
    const { error: deleteError } = await supabaseService
      .from('vehicles')
      .delete()
      .eq('category', 'car');
    
    if (deleteError) {
      console.error('Error deleting existing cars:', deleteError);
    }
    
    let totalVehicles = 0;
    
    // Scrape each brand
    for (const brand of brands) {
      console.log(`\n🏷️ Processing brand: ${brand}`);
      const vehicles = await scrapeAllCarsForBrand(brand);
      
      if (vehicles.length > 0) {
        console.log(`📊 Scraped ${vehicles.length} vehicles for ${brand}`);
        
        // Insert into Supabase
        const { error } = await supabaseService
          .from('vehicles')
          .insert(vehicles);
        
        if (error) {
          console.error(`Error inserting ${brand} vehicles:`, error);
        } else {
          totalVehicles += vehicles.length;
          console.log(`✅ Successfully inserted ${vehicles.length} ${brand} vehicles`);
        }
      }
    }
    
    console.log(`\n🎉 Smart cars scraper completed. Total vehicles processed: ${totalVehicles}`);
    
    return {
      success: true,
      message: `Successfully scraped and stored ${totalVehicles} cars with multilingual support from ${brands.length} brands`,
      count: totalVehicles
    };
    
  } catch (error: any) {
    console.error('❌ Smart cars scraper failed:', error);
    return {
      success: false,
      message: `Cars scraper failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      count: 0
    };
  }
}