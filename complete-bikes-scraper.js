const fs = require('fs');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lmrxsurriyfhrzntljhk.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtcnhzdXJyaXlmaHJ6bnRsamhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0MTAzNCwiZXhwIjoyMDcyOTE3MDM0fQ.DPdWeoyrPAfHiYUpjlY4Pq4yw1qeuOEkskE7K7Fkjc8';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Helper function to make HTTP requests
async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
        'Connection': 'keep-alive'
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Extract year from various date formats
function extractYear(rawDate) {
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
      // For patterns with 2 groups, take the year (second group)
      // For patterns with 3 groups, take the year (first group for YYYY-MM-DD, second for MM.YYYY)
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
      
      if (year >= 1990 && year <= currentYear + 1) {
        return year;
      }
    }
  }
  
  return currentYear;
}

// Extract price from various formats with HTML entity handling
function extractPrice(rawPrice) {
  if (!rawPrice || typeof rawPrice !== 'string') return 0;
  
  // First decode HTML entities
  let cleanPrice = rawPrice
    .replace(/&#x27;/g, "'")         // Decode &#x27; to apostrophe
    .replace(/&[a-zA-Z0-9#]+;/g, '') // Remove other HTML entities
    .replace(/[^\d\.\,\s']/g, '')    // Keep only digits, dots, commas, spaces, apostrophes
    .replace(/\s+/g, '');            // Remove spaces
  
  // Handle Swiss number formatting (15'555 -> 15555)
  if (cleanPrice.includes("'")) {
    cleanPrice = cleanPrice.replace(/'/g, '');
  }
  
  const priceMatch = cleanPrice.match(/(\d+)/);
  return priceMatch ? parseInt(priceMatch[1]) : 0;
}

// Extract mileage from various formats with HTML entity handling
function extractMileage(rawMileage) {
  if (!rawMileage || typeof rawMileage !== 'string') return 0;
  
  // First decode HTML entities
  let cleanMileage = rawMileage
    .replace(/&#x27;/g, "'")      // Decode &#x27; to apostrophe
    .replace(/&[a-zA-Z0-9#]+;/g, '') // Remove other HTML entities
    .replace(/[^\d\.\,\s']/g, '') // Keep only digits, dots, commas, spaces, apostrophes
    .replace(/\s+/g, '');         // Remove spaces
  
  // Handle Swiss number formatting (16'500 -> 16500)
  if (cleanMileage.includes("'")) {
    cleanMileage = cleanMileage.replace(/'/g, '');
  }
  
  const mileageMatch = cleanMileage.match(/(\d+)/);
  const mileage = mileageMatch ? parseInt(mileageMatch[1]) : 0;
  
  return (mileage >= 0 && mileage <= 999999) ? mileage : 0;
}

// Scrape all pages of the main listing to get bike URLs
async function scrapeAllBikeUrls() {
  console.log('🔍 Scraping all bike URLs from all pages...');
  
  const baseUrl = 'https://www.autoscout24.ch/de/hci/v2/1124/search';
  let allBikeUrls = [];
  let page = 0;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const pageUrl = page === 0 ? baseUrl : `${baseUrl}?page=${page}`;
      console.log(`📄 Scraping page ${page + 1}: ${pageUrl}`);
      
      const html = await fetchPage(pageUrl);
      
      // Extract bike URLs from the page
      // Look for patterns like: /de/hci/v2/1124/detail/12682378
      const urlMatches = html.match(/\/de\/hci\/v2\/1124\/detail\/\d+/g);
      
      if (urlMatches && urlMatches.length > 0) {
        const pageUrls = urlMatches.map(url => `https://www.autoscout24.ch${url}`);
        allBikeUrls = allBikeUrls.concat(pageUrls);
        console.log(`✅ Found ${pageUrls.length} bikes on page ${page + 1}`);
        page++;
      } else {
        hasMorePages = false;
        console.log(`🏁 No more bikes found, stopping at page ${page + 1}`);
      }
      
      // Safety limit to prevent infinite loops
      if (page > 10) {
        console.log('⚠️ Reached page limit, stopping');
        hasMorePages = false;
      }
      
      // Add delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error scraping page ${page + 1}:`, error.message);
      hasMorePages = false;
    }
  }
  
  // Remove duplicates
  const uniqueUrls = [...new Set(allBikeUrls)];
  console.log(`🎯 Found ${uniqueUrls.length} unique bike URLs across ${page} pages`);
  
  return uniqueUrls;
}

// Scrape detailed information from a single bike's detail page
async function scrapeBikeDetail(detailUrl) {
  try {
    console.log(`🔎 Scraping detail: ${detailUrl}`);
    
    const html = await fetchPage(detailUrl);
    
    // Extract bike ID from URL
    const idMatch = detailUrl.match(/detail\/(\d+)/);
    const bikeId = idMatch ? idMatch[1] : Date.now().toString();
    
    // Extract title
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const title = titleMatch ? titleMatch[1].trim() : 'Unknown';
    
    // Extract price - handle HTML entities like &#x27;
    const pricePatterns = [
      /CHF\s*([0-9&#x';]+)\.-/,      // "CHF 15&#x27;555.-"
      /CHF\s*([0-9&#x';]+)/,         // "CHF 15&#x27;555"
      /([0-9&#x';]+)\s*\.-/          // "15&#x27;555.-"
    ];
    
    let price = 0;
    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        price = extractPrice(match[1]);
        if (price > 0) break;
      }
    }
    
    // Extract basic vehicle data - handle new vehicles vs used vehicles
    const yearSpanMatch = html.match(/Calendar icon[^>]*>.*?<span class="chakra-text[^"]*">([^<]+)<\/span>/);
    let year = new Date().getFullYear();
    if (yearSpanMatch) {
      const yearText = yearSpanMatch[1].trim();
      if (yearText === 'Neues Fahrzeug') {
        // New vehicle - use current year
        year = new Date().getFullYear();
      } else {
        // Try to extract year from the text
        year = extractYear(yearText);
      }
    } else {
      // Fallback to old pattern
      const yearMatch = html.match(/Calendar icon(\d{2})\.(\d{4})/);
      year = yearMatch ? parseInt(yearMatch[2]) : extractYear('');
    }
    
    // Extract mileage - first try the span pattern, then fallback
    const mileageSpanMatch = html.match(/Road icon[^>]*>.*?<span class="chakra-text[^"]*">([^<]+)<\/span>/);
    let mileage = 0;
    if (mileageSpanMatch) {
      mileage = extractMileage(mileageSpanMatch[1]);
    }
    
    // Fallback patterns if span pattern doesn't work
    if (mileage === 0) {
      const mileagePatterns = [
        /Road icon([0-9&#x';]+)\s*km/,      // "Road icon16&#x27;500 km"
        /([0-9&#x';]+)\s*km/,               // "16&#x27;500 km"
        /(\d{1,2}&#x27;\d{3})\s*km/,       // "16&#x27;500 km" specifically
        /([\d''\s]+)\s*km/                  // Fallback
      ];
      
      for (const pattern of mileagePatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          mileage = extractMileage(match[1]);
          if (mileage > 0) break;
        }
      }
    }
    
    // Extract transmission - look for the span after transmission icon
    const transmissionMatch = html.match(/Transmission icon[^>]*>.*?<span class="chakra-text[^"]*">([^<]+)<\/span>/);
    const transmission = transmissionMatch ? transmissionMatch[1].trim() : 'Schaltgetriebe manuell';
    
    // Extract fuel type - look for the span after gas station icon
    const fuelMatch = html.match(/Gas station icon[^>]*>.*?<span class="chakra-text[^"]*">([^<]+)<\/span>/);
    const fuel = fuelMatch ? fuelMatch[1].trim() : 'Benzin';
    
    // Extract power - look for "93 PS (69 kW)" format
    const powerPatterns = [
      /Vehicle power icon([^<\n]+)/,      // "Vehicle power icon93 PS (69 kW)"
      /(\d+\s*PS\s*\(\d+\s*kW\))/,       // "93 PS (69 kW)"
      /(\d+\s*PS)/                        // "93 PS"
    ];
    
    let power = '-';
    for (const pattern of powerPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        power = match[1].trim();
        break;
      }
    }
    
    // Extract body type - look for the span after motorcycle icon
    const bodyTypeMatch = html.match(/Motorcycle icon[^>]*>.*?<span class="chakra-text[^"]*">([^<]+)<\/span>/);
    const bodyType = bodyTypeMatch ? bodyTypeMatch[1].trim() : 'Motorrad';
    
    // Extract description - robust extraction that only gets real vehicle descriptions
    function extractDescription(html) {
      // Only look for known good description patterns
      const knownGoodPatterns = [
        /Sehr schöne und dezente FatBOB aus 1 Hand![^]*?muss man sehen und Hören!/,
        /Sehr schöne[^!.]*[!.]/,
        /Wunderschöne[^!.]*[!.]/,
        /Gepflegte[^!.]*[!.]/,
        /Tolle[^!.]*[!.]/,
        /Verkaufe[^!.]*[!.]/,
        /Biete[^!.]*[!.]/
      ];
      
      for (const pattern of knownGoodPatterns) {
        const match = html.match(pattern);
        if (match) {
          let description = match[0]
            .replace(/<[^>]*>/g, '')      // Remove HTML tags
            .replace(/&#x27;/g, "'")      // Decode HTML entities
            .replace(/&[a-zA-Z0-9#]+;/g, '') // Remove other HTML entities
            .replace(/\s+/g, ' ')         // Normalize whitespace
            .trim();
          
          // Validate - must be real vehicle description
          const invalidTerms = [
            'css-', 'color:var', 'DOCTYPE', 'html>', 'link rel', 'href=',
            'Fahrzeugdaten', 'Calendar icon', 'Road icon', 'Gas station'
          ];
          
          const isValid = 
            description.length >= 15 &&
            description.length <= 500 &&
            !invalidTerms.some(term => description.includes(term)) &&
            /[a-zA-ZäöüÄÖÜ]/.test(description) &&
            !description.includes('http') &&
            description.split(' ').length >= 3;
          
          if (isValid) {
            return description;
          }
        }
      }
      
      return null; // No valid description found
    }
    
    const description = extractDescription(html);
    
    // Extract equipment list
    const equipmentMatches = html.match(/Serienmässige Ausstattung[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/);
    let features = [];
    if (equipmentMatches) {
      const equipmentHtml = equipmentMatches[1];
      const equipmentItems = equipmentHtml.match(/<li[^>]*>([^<]+)<\/li>/g);
      if (equipmentItems) {
        features = equipmentItems.map(item => item.replace(/<[^>]*>/g, '').trim());
      }
    }
    
    // Extract images (look for all image URLs)
    const imageMatches = html.match(/https:\/\/images\.autoscout24\.ch\/[^"'\s]+\.(jpg|jpeg|png)/g);
    const images = imageMatches ? [...new Set(imageMatches)] : [];
    
    // Extract MFK info
    const mfkMatch = html.match(/Letzte MFK[\s\S]*?(\d{2}\.\d{2}\.\d{4})/);
    const mfk = mfkMatch ? mfkMatch[1] : null;
    
    // Extract guarantee info
    const guaranteeMatch = html.match(/Ab Übernahme,\s*([^<]+)/);
    const guarantee = guaranteeMatch ? guaranteeMatch[1].trim() : '12 Monate';
    
    // Extract brand and model from title with smart model parsing
    const titleParts = title.split(' ');
    const brand = titleParts[0] || 'Unknown';
    
    // Smart model extraction - only take the first few meaningful parts
    const extractModel = (parts, brandName) => {
      if (parts.length <= 1) return 'Unknown';
      
      const modelParts = parts.slice(1); // Remove brand
      const smartModel = [];
      
      for (let part of modelParts) {
        // Stop at common specification indicators
        if (part.includes('kW') || part.includes('PS') || part.includes('ABS') || 
            part.includes('LED') || part.includes('TFT') || part.includes('mit') ||
            part.includes('Display') || part.includes('35kW') || part.includes('47kW')) {
          break;
        }
        
        smartModel.push(part);
        
        // Stop after 3-4 meaningful parts for most bikes
        if (smartModel.length >= 3) break;
      }
      
      return smartModel.length > 0 ? smartModel.join(' ') : modelParts[0] || 'Unknown';
    };
    
    const model = extractModel(titleParts, brand);
    
    // Determine condition
    const condition = year >= 2024 && mileage < 100 ? 'new' : 'used';
    
    return {
      id: bikeId,
      title,
      brand,
      model,
      year,
      price,
      mileage,
      fuel,
      transmission,
      power,
      bodyType,
      condition,
      description,
      features,
      images,
      mfk,
      guarantee,
      detailUrl
    };
    
  } catch (error) {
    console.error(`❌ Error scraping detail ${detailUrl}:`, error.message);
    return null;
  }
}

// Main scraping function
async function scrapeAllBikes() {
  console.log('🚀 Starting complete bike scraping...');
  
  try {
    // Step 1: Get all bike URLs from all pages
    const bikeUrls = await scrapeAllBikeUrls();
    
    if (bikeUrls.length === 0) {
      console.log('❌ No bike URLs found');
      return [];
    }
    
    // Step 2: Scrape each bike's detail page
    const vehicles = [];
    
    for (let i = 0; i < bikeUrls.length; i++) {
      const url = bikeUrls[i];
      console.log(`🔄 Processing bike ${i + 1}/${bikeUrls.length}`);
      
      const bikeDetail = await scrapeBikeDetail(url);
      
      if (bikeDetail) {
        // Convert to your desired format
        const vehicle = formatVehicleData(bikeDetail);
        vehicles.push(vehicle);
        console.log(`✅ Processed: ${vehicle.title} - ${vehicle.price} CHF`);
      }
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`📊 Successfully scraped ${vehicles.length} bikes`);
    return vehicles;
    
  } catch (error) {
    console.error('❌ Error in scrapeAllBikes:', error.message);
    return [];
  }
}

// Format vehicle data to match your desired structure
function formatVehicleData(bikeDetail) {
  // Map transmission types to German
  const getGermanTransmission = (transmission) => {
    const transmissionMap = {
      'manual': 'Schaltgetriebe manuell',
      'automatic': 'Automat',
      'automatic-stepless': 'Stufenlos',
      'Schaltgetriebe manuell': 'Schaltgetriebe manuell',
      'Automat': 'Automat',
      'Stufenlos': 'Stufenlos'
    };
    return transmissionMap[transmission] || transmission || 'Schaltgetriebe manuell';
  };

  // Create multilingual object
  const multilingual = {
    fuel: {
      de: "Benzin",
      en: "Petrol", 
      fr: "Essence"
    },
    brand: {
      de: bikeDetail.brand,
      en: bikeDetail.brand,
      fr: bikeDetail.brand
    },
    color: {
      de: "Metallic",
      en: "Metallic",
      fr: "Métallique"
    },
    bodyType: {
      de: "Motorrad",
      en: "Motorcycle",
      fr: "Moto"
    },
    features: {
      de: bikeDetail.features || ["ABS", "LED", "Digital"],
      en: bikeDetail.features || ["ABS", "LED", "Digital"],
      fr: bikeDetail.features || ["ABS", "LED", "Numérique"]
    },
    warranty: {
      de: bikeDetail.guarantee || "12 Monate",
      en: bikeDetail.guarantee || "12 Monate",
      fr: bikeDetail.guarantee || "12 Monate"
    },
    condition: {
      de: bikeDetail.condition === 'new' ? "Neu" : "Gebraucht",
      en: bikeDetail.condition === 'new' ? "New" : "Used",
      fr: bikeDetail.condition === 'new' ? "Neuf" : "Occasion"
    },
    description: {
      de: bikeDetail.description || `Hochwertiges ${bikeDetail.brand} ${bikeDetail.model} Baujahr ${bikeDetail.year} von Auto Vögeli AG.`,
      en: `High-quality ${bikeDetail.brand} ${bikeDetail.model} from ${bikeDetail.year} by Auto Vögeli AG.`,
      fr: `Véhicule de qualité ${bikeDetail.brand} ${bikeDetail.model} de ${bikeDetail.year} d'Auto Vögeli AG.`
    },
    transmission: {
      de: getGermanTransmission(bikeDetail.transmission),
      en: bikeDetail.transmission === 'manual' ? "Manual transmission" : 
          bikeDetail.transmission === 'automatic' ? "Automatic transmission" :
          bikeDetail.transmission === 'automatic-stepless' ? "Stepless automatic" : "Manual transmission",
      fr: bikeDetail.transmission === 'manual' ? "Transmission manuelle" :
          bikeDetail.transmission === 'automatic' ? "Transmission automatique" :
          bikeDetail.transmission === 'automatic-stepless' ? "Automatique sans étages" : "Transmission manuelle"
    }
  };

  // Generate ID
  const cleanId = `${bikeDetail.brand?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'unknown'}-${bikeDetail.model?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'model'}-${bikeDetail.year}-${Math.floor(Math.random() * 100)}`;

  return {
    id: cleanId,
    title: bikeDetail.title,
    brand: bikeDetail.brand,
    model: bikeDetail.model,
    year: bikeDetail.year,
    price: bikeDetail.price,
    mileage: bikeDetail.mileage,
    fuel: "Benzin",
    transmission: getGermanTransmission(bikeDetail.transmission),
    power: bikeDetail.power,
    body_type: "Motorrad",
    color: "Metallic",
    images: JSON.stringify(bikeDetail.images || []),
    description: bikeDetail.description,
    features: JSON.stringify(bikeDetail.features || []),
    location: "Grenchen",
    dealer: "Auto Vögeli AG",
    url: bikeDetail.detailUrl,
    condition: bikeDetail.condition,
    category: 'bike',
    first_registration: null,
    doors: null,
    seats: null,
    co2_emission: null,
    consumption: null,
    warranty: bikeDetail.guarantee || "12 Monate",
    warranty_details: "Gewerbliche Garantie",
    warranty_months: 12,
    mfk: bikeDetail.mfk,
    displacement: "0",
    drive: "Kette",
    vehicle_age: null,
    price_per_year: null,
    multilingual: JSON.stringify(multilingual)
  };
}

// Clear existing bikes and insert new ones to prevent duplicates
async function replaceAllBikesInSupabase(vehicles) {
  if (vehicles.length === 0) {
    console.log('❌ No vehicles to insert');
    return;
  }
  
  console.log(`🧹 Clearing existing bikes from Supabase...`);
  
  try {
    // Step 1: Delete all existing bikes
    const { error: deleteError } = await supabase
      .from('vehicles')
      .delete()
      .eq('category', 'bike');
    
    if (deleteError) {
      console.error('❌ Error deleting existing bikes:', deleteError.message);
      return;
    }
    
    console.log('✅ Cleared all existing bikes');
    
    // Step 2: Insert all new bikes
    console.log(`🔄 Inserting ${vehicles.length} fresh bikes to Supabase...`);
    
    const { data, error: insertError } = await supabase
      .from('vehicles')
      .insert(vehicles);
    
    if (insertError) {
      console.error('❌ Supabase insert error:', insertError.message);
      console.error('Error details:', insertError);
    } else {
      console.log(`✅ Successfully inserted ${vehicles.length} fresh bikes to Supabase`);
    }
  } catch (error) {
    console.error('❌ Replace bikes error:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🌍 Starting complete bike scraper...');
  
  const vehicles = await scrapeAllBikes();
  
  if (vehicles.length > 0) {
    await replaceAllBikesInSupabase(vehicles);
    console.log('✅ Complete scraping finished successfully!');
  } else {
    console.log('❌ No vehicles scraped');
  }
}

// Run the scraper
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { scrapeAllBikes, main };
