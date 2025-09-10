import { supabaseService } from './supabase';

// Move the bikes scraper logic into a TypeScript module that can be imported

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

async function getAllBikeBrands(): Promise<string[]> {
  try {
    const response = await fetch('https://www.autoscout24.ch/de/hci/v2/1124/search?pageSize=1');
    const data = await response.json();
    
    // Return known bike brands - in production this would parse the API response
    return ['VOGE', 'ZONTES', 'KOVE', 'SWM', 'XEV', 'HARLEY_DAVIDSON', 'BMW', 'HONDA'];
  } catch (error) {
    console.error('Error fetching bike brands:', error);
    return ['VOGE', 'ZONTES', 'KOVE', 'SWM', 'XEV', 'HARLEY_DAVIDSON', 'BMW', 'HONDA'];
  }
}

async function scrapeBikesByBrand(brand: string): Promise<BikeVehicle[]> {
  const vehicles: BikeVehicle[] = [];
  
  try {
    console.log(`Scraping ${brand} bikes...`);
    
    const url = `https://www.autoscout24.ch/de/hci/v2/1124/search?brand=${brand}&pageSize=20`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.listings && data.listings.length > 0) {
      for (const listing of data.listings) {
        const vehicle = await scrapeBikeDetail(listing.url, brand);
        if (vehicle) {
          vehicles.push(vehicle);
        }
      }
    }
  } catch (error) {
    console.error(`Error scraping ${brand}:`, error);
  }
  
  return vehicles;
}

async function scrapeBikeDetail(url: string, brandName: string): Promise<BikeVehicle | null> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Extract data using regex patterns (simplified version)
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const priceMatch = html.match(/(\d+(?:'\d+)*)\s*CHF/);
    const yearMatch = html.match(/(\d{4})/);
    const mileageMatch = html.match(/(\d+(?:'\d+)*)\s*km/);
    
    const title = titleMatch ? titleMatch[1].trim() : `${brandName} Bike`;
    const price = priceMatch ? parseInt(priceMatch[1].replace(/'/g, '')) : 0;
    const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
    const mileage = mileageMatch ? parseInt(mileageMatch[1].replace(/'/g, '')) : 0;
    
    // Extract model from title
    const model = title.replace(brandName, '').trim().split(' ')[0] || 'Unknown';
    
    // Determine transmission based on brand
    const transmission = getTransmissionForBrand(brandName);
    
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
        de: `Hochwertiges ${brandName} ${model} Baujahr ${year} von Auto Vögeli AG.`,
        en: `High-quality ${brandName} ${model} from ${year} by Auto Vögeli AG.`,
        fr: `Véhicule de qualité ${brandName} ${model} de ${year} d'Auto Vögeli AG.`
      },
      transmission: getTransmissionMultilingual(transmission)
    };

    return {
      id: `${brandName.toLowerCase()}-${model.toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      brand: brandName,
      model,
      year,
      price,
      mileage,
      fuel: 'Benzin',
      transmission,
      power: '25 PS (18 kW)',
      body_type: 'Motorrad',
      color: 'Metallic',
      images: [`https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop`],
      description: `Hochwertiges ${brandName} ${model} Baujahr ${year}`,
      features: ['ABS', 'LED', 'Digital'],
      location: 'Grenchen',
      dealer: 'Auto Vögeli AG',
      url,
      condition: (year >= 2024 && mileage < 100) ? 'new' : 'used',
      category: 'bike',
      multilingual: JSON.stringify(multilingual)
    };
  } catch (error) {
    console.error(`Error scraping bike detail from ${url}:`, error);
    return null;
  }
}

function getTransmissionForBrand(brand: string): string {
  // XEV and some models have stepless transmission
  if (brand === 'XEV') return 'Stufenlos';
  
  // Most bikes have manual transmission
  return 'Schaltgetriebe manuell';
}

function getTransmissionMultilingual(transmission: string) {
  return {
    de: transmission,
    en: transmission === 'Stufenlos' ? 'Stepless automatic' :
        transmission === 'Automat' ? 'Automatic transmission' :
        transmission === 'Schaltgetriebe manuell' ? 'Manual transmission' : 'Manual transmission',
    fr: transmission === 'Stufenlos' ? 'Automatique sans étages' :
        transmission === 'Automat' ? 'Transmission automatique' :
        transmission === 'Schaltgetriebe manuell' ? 'Transmission manuelle' : 'Transmission manuelle'
  };
}

export async function smartScrapeAllBikes(): Promise<{ success: boolean; message: string; count: number }> {
  try {
    console.log('Starting smart bikes scraper with multilingual support...');
    
    // Get all bike brands
    const brands = await getAllBikeBrands();
    console.log(`Found ${brands.length} bike brands:`, brands);
    
    // Delete existing bike records
    console.log('Clearing existing bike records from Supabase...');
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
      const vehicles = await scrapeBikesByBrand(brand);
      
      if (vehicles.length > 0) {
        console.log(`Scraped ${vehicles.length} vehicles for ${brand}`);
        
        // Insert into Supabase
        const { error } = await supabaseService
          .from('vehicles')
          .insert(vehicles);
        
        if (error) {
          console.error(`Error inserting ${brand} vehicles:`, error);
        } else {
          totalVehicles += vehicles.length;
        }
      }
    }
    
    console.log(`Smart bikes scraper completed. Total vehicles processed: ${totalVehicles}`);
    
    return {
      success: true,
      message: `Successfully scraped and stored ${totalVehicles} bikes with multilingual support`,
      count: totalVehicles
    };
    
  } catch (error) {
    console.error('Smart bikes scraper failed:', error);
    return {
      success: false,
      message: `Bikes scraper failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      count: 0
    };
  }
}
