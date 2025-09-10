import { supabaseService } from './supabase';

// Working bikes scraper logic ported from smart-bikes-scraper.js

interface BikeVehicle {
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

interface Brand {
  key: string;
  name: string;
}

interface Model {
  key: string;
  name: string;
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

// Step 1: Get all available brands from AutoScout24
async function getAllBrands(): Promise<Brand[]> {
  console.log('🏷️ Getting all available motorcycle brands...');
  
  try {
    const html = await fetchPage('https://www.autoscout24.ch/de/hci/v2/1124/search');
    
    // Extract brand options from the makeKey select dropdown
    const brandSelectMatch = html.match(/<select[^>]*name=["']makeKey["'][^>]*>([\s\S]*?)<\/select>/);
    
    if (!brandSelectMatch) {
      console.log('❌ Could not find brand selector');
      return [];
    }
    
    const brandOptions = brandSelectMatch[1].match(/<option[^>]*value=["']([^"']+)["'][^>]*>([^<]+)<\/option>/g);
    
    if (!brandOptions) {
      console.log('❌ Could not find brand options');
      return [];
    }
    
    const brands: Brand[] = [];
    for (const option of brandOptions) {
      const match = option.match(/value=["']([^"']+)["'][^>]*>([^<]+)/);
      if (match && match[1] && match[2] && match[1] !== '') {
        brands.push({
          key: match[1].toLowerCase(),
          name: match[2].trim().toUpperCase()
        });
      }
    }
    
    console.log(`✅ Found ${brands.length} brands:`, brands.map(b => b.name).join(', '));
    return brands;
    
  } catch (error: any) {
    console.error('❌ Error getting brands:', error.message);
    return [];
  }
}

// Step 2: Get all models for a specific brand
async function getModelsForBrand(brandKey: string, brandName: string): Promise<Model[]> {
  console.log(`🏍️ Getting models for ${brandName}...`);
  
  try {
    const html = await fetchPage(`https://www.autoscout24.ch/de/hci/v2/1124/search?makeKey=${brandKey}`);
    
    // Extract model options from the modelKey select dropdown
    const modelSelectMatch = html.match(/<select[^>]*name=["']modelKey["'][^>]*>([\s\S]*?)<\/select>/);
    
    if (!modelSelectMatch) {
      console.log(`❌ No model selector found for ${brandName}`);
      return [];
    }
    
    const modelOptions = modelSelectMatch[1].match(/<option[^>]*value=["']([^"']+)["'][^>]*>([^<]+)<\/option>/g);
    
    if (!modelOptions) {
      console.log(`❌ No model options found for ${brandName}`);
      return [];
    }
    
    const models: Model[] = [];
    for (const option of modelOptions) {
      const match = option.match(/value=["']([^"']+)["'][^>]*>([^<]+)/);
      if (match && match[1] && match[2] && match[1] !== '' && 
          match[2].trim().toLowerCase() !== 'alle' && match[2].trim().toLowerCase() !== 'all') {
        models.push({
          key: match[1].toLowerCase(),
          name: match[2].trim()
        });
      }
    }
    
    console.log(`✅ Found ${models.length} models for ${brandName}:`, models.map(m => m.name).join(', '));
    return models;
    
  } catch (error: any) {
    console.error(`❌ Error getting models for ${brandName}:`, error.message);
    return [];
  }
}

// Step 3: Scrape bike detail
async function scrapeBikeDetail(listingUrl: string, brandName: string, modelName?: string): Promise<BikeVehicle | null> {
  try {
    console.log(`📄 Scraping bike detail: ${listingUrl}`);
    const html = await fetchPage(listingUrl);
    
    // Extract data using the working patterns from the Node.js scraper
    const titleMatch = html.match(/<h1[^>]*class="[^"]*"[^>]*>([^<]+)<\/h1>/) || 
                      html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const title = titleMatch ? titleMatch[1].trim() : `${brandName} Bike`;
    
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
    
    // Extract transmission
    let transmission = 'Schaltgetriebe manuell';
    const transmissionMatches = html.match(/<span[^>]*class="[^"]*chakra-text[^"]*"[^>]*>([^<]*)<\/span>/g);
    if (transmissionMatches) {
      for (const match of transmissionMatches) {
        const transmissionText = match.replace(/<[^>]*>/g, '').trim();
        if (transmissionText.includes('Stufenlos') || transmissionText.includes('Automat') || 
            transmissionText.includes('manuell')) {
          transmission = transmissionText;
          break;
        }
      }
    }
    
    // Extract model from title if not provided
    let finalModel = modelName;
    if (!finalModel) {
      const modelPart = title.replace(brandName, '').trim();
      const stopWords = ['kW', 'PS', 'ABS', 'LED', 'TFT', 'Euro', 'ccm', 'Zylinder'];
      const words = modelPart.split(' ');
      const modelWords = [];
      
      for (const word of words) {
        if (stopWords.some(stop => word.includes(stop))) {
          break;
        }
        modelWords.push(word);
        if (modelWords.length >= 2) break;
      }
      
      finalModel = modelWords.join(' ') || 'Unknown';
    }
    
    // Generate ID
    const autoscoutId = listingUrl.match(/\/(\d+)$/)?.[1] || Math.random().toString(36).substr(2, 9);
    const id = `${brandName.toLowerCase()}-${finalModel.toLowerCase().replace(/\s+/g, '-')}-${autoscoutId}`;
    
    // Get German transmission
    const getGermanTransmission = (trans: string): string => {
      if (trans.includes('Stufenlos')) return 'Stufenlos';
      if (trans.includes('Automat')) return 'Automat';
      return 'Schaltgetriebe manuell';
    };
    
    // Generate multilingual data
    const multilingual = {
      fuel: {
        de: 'Benzin',
        en: 'Petrol',
        fr: 'Essence'
      },
      brand: { de: brandName, en: brandName, fr: brandName },
      color: { de: 'Metallic', en: 'Metallic', fr: 'Métallique' },
      bodyType: { de: 'Motorrad', en: 'Motorcycle', fr: 'Moto' },
      features: { 
        de: ['ABS', 'LED', 'Digital'], 
        en: ['ABS', 'LED', 'Digital'], 
        fr: ['ABS', 'LED', 'Numérique'] 
      },
      warranty: { de: '12 Monate', en: '12 Months', fr: '12 Mois' },
      condition: { 
        de: (year >= 2024 && mileage < 100) ? 'Neu' : 'Gebraucht', 
        en: (year >= 2024 && mileage < 100) ? 'New' : 'Used', 
        fr: (year >= 2024 && mileage < 100) ? 'Neuf' : 'Occasion' 
      },
      description: {
        de: `Hochwertiges ${brandName} ${finalModel} Baujahr ${year} von Auto Vögeli AG.`,
        en: `High-quality ${brandName} ${finalModel} from ${year} by Auto Vögeli AG.`,
        fr: `Véhicule de qualité ${brandName} ${finalModel} de ${year} d'Auto Vögeli AG.`
      },
      transmission: {
        de: getGermanTransmission(transmission),
        en: transmission === 'Stufenlos' ? 'Stepless automatic' :
            transmission === 'Automat' ? 'Automatic transmission' :
            transmission === 'Schaltgetriebe manuell' ? 'Manual transmission' : 'Manual transmission',
        fr: transmission === 'Stufenlos' ? 'Automatique sans étages' :
            transmission === 'Automat' ? 'Transmission automatique' :
            transmission === 'Schaltgetriebe manuell' ? 'Transmission manuelle' : 'Transmission manuelle'
      }
    };

    console.log(`✅ Scraped: ${title} - ${price} CHF - ${year} - ${mileage}km - ${transmission}`);

    return {
      id,
      title,
      brand: brandName,
      model: finalModel,
      year,
      price,
      mileage,
      fuel: 'Benzin',
      transmission,
      power: '25 PS (18 kW)',
      body_type: 'Motorrad',
      color: 'Metallic',
      images: [`https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop`],
      description: `Hochwertiges ${brandName} ${finalModel} Baujahr ${year}`,
      features: ['ABS', 'LED', 'Digital'],
      location: 'Grenchen',
      dealer: 'Auto Vögeli AG',
      url: listingUrl,
      condition: (year >= 2024 && mileage < 100) ? 'new' : 'used',
      category: 'bike',
      multilingual: JSON.stringify(multilingual)
    };
    
  } catch (error: any) {
    console.error(`❌ Error scraping bike detail from ${listingUrl}:`, error.message);
    return null;
  }
}

// Step 4: Scrape bikes for a brand-model combination
async function scrapeBikesForBrandModel(brandKey: string, brandName: string, modelKey: string, modelName: string): Promise<BikeVehicle[]> {
  console.log(`🔍 Scraping ${brandName} ${modelName} bikes...`);
  
  const vehicles: BikeVehicle[] = [];
  
  try {
    const searchUrl = `https://www.autoscout24.ch/de/hci/v2/1124/search?makeKey=${brandKey}&modelKey=${modelKey}&pageSize=20`;
    
    console.log(`📋 Fetching from: ${searchUrl}`);
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.listings && data.listings.length > 0) {
      console.log(`Found ${data.listings.length} listings for ${brandName} ${modelName}`);
      
      // Process up to 10 vehicles per model
      for (let i = 0; i < Math.min(data.listings.length, 10); i++) {
        const listing = data.listings[i];
        if (listing.url) {
          const vehicle = await scrapeBikeDetail(listing.url, brandName, modelName);
          if (vehicle) {
            vehicles.push(vehicle);
          }
        }
      }
    } else {
      console.log(`No listings found for ${brandName} ${modelName}`);
    }
  } catch (error: any) {
    console.error(`Error scraping ${brandName} ${modelName}:`, error.message);
  }
  
  console.log(`✅ Scraped ${vehicles.length} vehicles for ${brandName} ${modelName}`);
  return vehicles;
}

// Step 5: Scrape all bikes for a brand
async function scrapeAllBikesForBrand(brand: Brand): Promise<BikeVehicle[]> {
  console.log(`\n🏍️ Processing brand: ${brand.name}`);
  
  const vehicles: BikeVehicle[] = [];
  
  // Get models for this brand
  const models = await getModelsForBrand(brand.key, brand.name);
  
  if (models.length === 0) {
    console.log(`⚠️ No models found for ${brand.name}, skipping...`);
    return vehicles;
  }
  
  // Scrape each model
  for (const model of models) {
    const modelVehicles = await scrapeBikesForBrandModel(brand.key, brand.name, model.key, model.name);
    vehicles.push(...modelVehicles);
  }
  
  console.log(`✅ Total vehicles scraped for ${brand.name}: ${vehicles.length}`);
  return vehicles;
}

export async function smartScrapeAllBikes(): Promise<{ success: boolean; message: string; count: number }> {
  try {
    console.log('🚀 Starting smart bikes scraper with multilingual support...');
    
    // Get all bike brands
    const brands = await getAllBrands();
    
    if (brands.length === 0) {
      return {
        success: false,
        message: 'No bike brands found',
        count: 0
      };
    }
    
    console.log(`Found ${brands.length} bike brands`);
    
    // Delete existing bike records
    console.log('🗑️ Clearing existing bike records from Supabase...');
    const { error: deleteError } = await supabaseService
      .from('vehicles')
      .delete()
      .eq('category', 'bike');
    
    if (deleteError) {
      console.error('Error deleting existing bikes:', deleteError);
    }
    
    let totalVehicles = 0;
    
    // Scrape each brand
    for (const brand of brands) {
      const vehicles = await scrapeAllBikesForBrand(brand);
      
      if (vehicles.length > 0) {
        console.log(`📊 Scraped ${vehicles.length} vehicles for ${brand.name}`);
        
        // Insert into Supabase
        const { error } = await supabaseService
          .from('vehicles')
          .insert(vehicles);
        
        if (error) {
          console.error(`Error inserting ${brand.name} vehicles:`, error);
        } else {
          totalVehicles += vehicles.length;
          console.log(`✅ Successfully inserted ${vehicles.length} ${brand.name} vehicles`);
        }
      }
    }
    
    console.log(`\n🎉 Smart bikes scraper completed. Total vehicles processed: ${totalVehicles}`);
    
    return {
      success: true,
      message: `Successfully scraped and stored ${totalVehicles} bikes with multilingual support from ${brands.length} brands`,
      count: totalVehicles
    };
    
  } catch (error: any) {
    console.error('❌ Smart bikes scraper failed:', error);
    return {
      success: false,
      message: `Bikes scraper failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      count: 0
    };
  }
}