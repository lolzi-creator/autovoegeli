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
    /(\d{4})/,           // Just year
    /(\d{2})\.(\d{4})/,  // MM.YYYY
    /(\d{1,2})\/(\d{4})/, // M/YYYY or MM/YYYY
    /(\d{4})-(\d{2})-(\d{2})/ // YYYY-MM-DD
  ];
  
  for (const pattern of patterns) {
    const match = cleanDate.match(pattern);
    if (match) {
      const year = parseInt(match[match.length - 1]);
      if (year >= 1900 && year <= currentYear + 1) {
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

// Scrape all pages of the main listing to get car URLs
async function scrapeAllCarUrls() {
  console.log('🔍 Scraping all car URLs from all pages...');
  
  const baseUrl = 'https://www.autoscout24.ch/de/hci/v2/5571/search';
  let allCarUrls = [];
  let page = 0;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const pageUrl = page === 0 ? baseUrl : `${baseUrl}?page=${page}`;
      console.log(`📄 Scraping page ${page + 1}: ${pageUrl}`);
      
      const html = await fetchPage(pageUrl);
      
      // Extract car URLs from the page
      // Look for patterns like: /de/hci/v2/5571/detail/12345678
      const urlMatches = html.match(/\/de\/hci\/v2\/5571\/detail\/\d+/g);
      
      if (urlMatches && urlMatches.length > 0) {
        const pageUrls = urlMatches.map(url => `https://www.autoscout24.ch${url}`);
        allCarUrls = allCarUrls.concat(pageUrls);
        console.log(`✅ Found ${pageUrls.length} cars on page ${page + 1}`);
        page++;
      } else {
        hasMorePages = false;
        console.log(`🏁 No more cars found, stopping at page ${page + 1}`);
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
  const uniqueUrls = [...new Set(allCarUrls)];
  console.log(`🎯 Found ${uniqueUrls.length} unique car URLs across ${page} pages`);
  
  return uniqueUrls;
}

// Scrape detailed information from a single car's detail page
async function scrapeCarDetail(detailUrl) {
  try {
    console.log(`🔎 Scraping detail: ${detailUrl}`);
    
    const html = await fetchPage(detailUrl);
    
    // Extract car ID from URL
    const idMatch = detailUrl.match(/detail\/(\d+)/);
    const carId = idMatch ? idMatch[1] : Date.now().toString();
    
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
    
    // Extract year from date - look for "06.2021" format
    const yearPatterns = [
      /Calendar icon(\d{2})\.(\d{4})/,    // "Calendar icon06.2021"
      /(\d{2})\.(\d{4})/,                 // "06.2021"
      /20(\d{2})/,                        // "2021"
      /(\d{4})/                           // "2021"
    ];
    
    let year = new Date().getFullYear();
    for (const pattern of yearPatterns) {
      const match = html.match(pattern);
      if (match) {
        if (match[2]) {
          const foundYear = parseInt(match[2]);
          if (foundYear >= 1990 && foundYear <= 2025) {
            year = foundYear;
            break;
          }
        } else if (match[1]) {
          const foundYear = parseInt(match[1]);
          if (foundYear >= 1990 && foundYear <= 2025) {
            year = foundYear;
            break;
          }
        }
      }
    }
    
    // Extract mileage - handle HTML entities like &#x27;
    const mileagePatterns = [
      /Road icon([0-9&#x';]+)\s*km/,      // "Road icon16&#x27;500 km"
      /([0-9&#x';]+)\s*km/,               // "16&#x27;500 km"
      /(\d{1,2}&#x27;\d{3})\s*km/,       // "16&#x27;500 km" specifically
      /([\d''\s]+)\s*km/                  // Fallback
    ];
    
    let mileage = 0;
    for (const pattern of mileagePatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        mileage = extractMileage(match[1]);
        if (mileage > 0) break;
      }
    }
    
    // Extract transmission
    const transmissionMatch = html.match(/Transmission icon([^<\n]+)/);
    const transmission = transmissionMatch ? transmissionMatch[1].trim() : 'Schaltgetriebe manuell';
    
    // Extract fuel type
    const fuelMatch = html.match(/Gas station icon([^<\n]+)/);
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
    
    // Extract body type - for cars it might be different
    const bodyTypeMatch = html.match(/Car icon([^<\n]+)/) || html.match(/Vehicle icon([^<\n]+)/);
    const bodyType = bodyTypeMatch ? bodyTypeMatch[1].trim() : 'Auto';
    
    // Extract description - robust extraction that only gets real vehicle descriptions
    function extractDescription(html) {
      // ONLY look for very specific, known good car description patterns
      const strictCarPatterns = [
        /Sehr schöne[^!.]{10,}[!.]/,     // Must be at least 10 chars after "Sehr schöne"
        /Wunderschöne[^!.]{10,}[!.]/,    // Must be at least 10 chars after "Wunderschöne"
        /Gepflegte[^!.]{10,}[!.]/,       // Must be at least 10 chars after "Gepflegte"
        /Tolle[^!.]{15,}[!.]/,           // Must be at least 15 chars after "Tolle"
        /Verkaufe[^!.]{10,}[!.]/,        // Must be at least 10 chars after "Verkaufe"
        /Biete[^!.]{10,}[!.]/,           // Must be at least 10 chars after "Biete"
        /Perfekte[^!.]{10,}[!.]/,        // Must be at least 10 chars after "Perfekte"
        /Traumhafte[^!.]{10,}[!.]/       // Must be at least 10 chars after "Traumhafte"
      ];
      
      for (const pattern of strictCarPatterns) {
        const match = html.match(pattern);
        if (match) {
          let description = match[0]
            .replace(/<[^>]*>/g, '')      // Remove HTML tags
            .replace(/&#x27;/g, "'")      // Decode HTML entities
            .replace(/&[a-zA-Z0-9#]+;/g, '') // Remove other HTML entities
            .replace(/\s+/g, ' ')         // Normalize whitespace
            .trim();
          
          // STRICT validation for cars - must be real vehicle description
          const invalidTerms = [
            'css-', 'color:var', 'DOCTYPE', 'html>', 'link rel', 'href=',
            'Fahrzeugdaten', 'Calendar icon', 'Road icon', 'Gas station',
            'chakra-', 'rgba(', 'px', 'var(--', 'shadow', 'outline',
            'fontSizes', 'fontWeights', 'colors-', 'Alpha-'
          ];
          
          const isValidCarDescription = 
            description.length >= 20 &&                                    // At least 20 characters
            description.length <= 300 &&                                   // Not too long
            !invalidTerms.some(term => description.includes(term)) &&      // No technical terms
            /[a-zA-ZäöüÄÖÜ]/.test(description) &&                         // Contains letters
            !description.includes('http') &&                              // No URLs
            !description.includes('www.') &&                              // No websites
            !description.includes('(') &&                                 // No parentheses (CSS)
            !description.includes(';') &&                                 // No semicolons (CSS)
            !description.includes('#') &&                                 // No hash (CSS colors)
            description.split(' ').length >= 5 &&                         // At least 5 words
            !/^\d/.test(description);                                      // Doesn't start with number
          
          if (isValidCarDescription) {
            return description;
          }
        }
      }
      
      // For cars, if no custom description found, return null
      // Most cars on AutoScout24 don't have custom descriptions
      return null;
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
    const guaranteeMatch = html.match(/Ab Übernahme,\s*([^<\n]+)/);
    const guarantee = guaranteeMatch ? guaranteeMatch[1].trim() : '12 Monate';
    
    // Extract brand and model from title
    const titleParts = title.split(' ');
    const brand = titleParts[0] || 'Unknown';
    const model = titleParts.slice(1).join(' ') || 'Unknown';
    
    // Determine condition
    const condition = year >= 2024 && mileage < 100 ? 'new' : 'used';
    
    return {
      id: carId,
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
async function scrapeAllCars() {
  console.log('🚀 Starting complete car scraping...');
  
  try {
    // Step 1: Get all car URLs from all pages
    const carUrls = await scrapeAllCarUrls();
    
    if (carUrls.length === 0) {
      console.log('❌ No car URLs found');
      return [];
    }
    
    // Step 2: Scrape each car's detail page
    const vehicles = [];
    
    for (let i = 0; i < carUrls.length; i++) {
      const url = carUrls[i];
      console.log(`🔄 Processing car ${i + 1}/${carUrls.length}`);
      
      const carDetail = await scrapeCarDetail(url);
      
      if (carDetail) {
        // Convert to your desired format
        const vehicle = formatVehicleData(carDetail);
        vehicles.push(vehicle);
        console.log(`✅ Processed: ${vehicle.title} - ${vehicle.price} CHF`);
      }
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`📊 Successfully scraped ${vehicles.length} cars`);
    return vehicles;
    
  } catch (error) {
    console.error('❌ Error in scrapeAllCars:', error.message);
    return [];
  }
}

// Format vehicle data to match your desired structure
function formatVehicleData(carDetail) {
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
      de: carDetail.brand,
      en: carDetail.brand,
      fr: carDetail.brand
    },
    color: {
      de: "Metallic",
      en: "Metallic",
      fr: "Métallique"
    },
    bodyType: {
      de: "Auto",
      en: "Car",
      fr: "Voiture"
    },
    features: {
      de: carDetail.features || ["ABS", "Klimaanlage", "Radio"],
      en: carDetail.features || ["ABS", "Air Conditioning", "Radio"],
      fr: carDetail.features || ["ABS", "Climatisation", "Radio"]
    },
    warranty: {
      de: carDetail.guarantee || "12 Monate",
      en: carDetail.guarantee || "12 Months",
      fr: carDetail.guarantee || "12 Mois"
    },
    condition: {
      de: carDetail.condition === 'new' ? "Neu" : "Gebraucht",
      en: carDetail.condition === 'new' ? "New" : "Used",
      fr: carDetail.condition === 'new' ? "Neuf" : "Occasion"
    },
    description: {
      de: carDetail.description || `Hochwertiges ${carDetail.brand} ${carDetail.model} Baujahr ${carDetail.year} von Auto Vögeli AG.`,
      en: `High-quality ${carDetail.brand} ${carDetail.model} from ${carDetail.year} by Auto Vögeli AG.`,
      fr: `Véhicule de qualité ${carDetail.brand} ${carDetail.model} de ${carDetail.year} d'Auto Vögeli AG.`
    },
    transmission: {
      de: getGermanTransmission(carDetail.transmission),
      en: carDetail.transmission === 'manual' ? "Manual transmission" : 
          carDetail.transmission === 'automatic' ? "Automatic transmission" :
          carDetail.transmission === 'automatic-stepless' ? "Stepless automatic" : "Manual transmission",
      fr: carDetail.transmission === 'manual' ? "Transmission manuelle" :
          carDetail.transmission === 'automatic' ? "Transmission automatique" :
          carDetail.transmission === 'automatic-stepless' ? "Automatique sans étages" : "Transmission manuelle"
    }
  };

  // Generate unique ID using car ID from URL
  const cleanId = `car-${carDetail.id}-${carDetail.brand?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'unknown'}`;

  return {
    id: cleanId,
    title: carDetail.title,
    brand: carDetail.brand,
    model: carDetail.model,
    year: carDetail.year,
    price: carDetail.price,
    mileage: carDetail.mileage,
    fuel: "Benzin",
    transmission: getGermanTransmission(carDetail.transmission),
    power: carDetail.power,
    body_type: "Auto",
    color: "Metallic",
    images: JSON.stringify(carDetail.images || []),
    description: carDetail.description,
    features: JSON.stringify(carDetail.features || []),
    location: "Grenchen",
    dealer: "Auto Vögeli AG",
    url: carDetail.detailUrl,
    condition: carDetail.condition,
    category: 'car',
    first_registration: null,
    doors: null,
    seats: null,
    co2_emission: null,
    consumption: null,
    warranty: carDetail.guarantee || "12 Monate",
    warranty_details: "Gewerbliche Garantie",
    warranty_months: 12,
    mfk: carDetail.mfk,
    displacement: "0",
    drive: "Vorderradantrieb",
    vehicle_age: null,
    price_per_year: null,
    multilingual: JSON.stringify(multilingual)
  };
}

// Clear existing cars and insert new ones to prevent duplicates
async function replaceAllCarsInSupabase(vehicles) {
  if (vehicles.length === 0) {
    console.log('❌ No vehicles to insert');
    return;
  }
  
  console.log(`🧹 Clearing existing cars from Supabase...`);
  
  try {
    // Step 1: Delete all existing cars
    const { error: deleteError } = await supabase
      .from('vehicles')
      .delete()
      .eq('category', 'car');
    
    if (deleteError) {
      console.error('❌ Error deleting existing cars:', deleteError.message);
      return;
    }
    
    console.log('✅ Cleared all existing cars');
    
    // Step 2: Insert all new cars
    console.log(`🔄 Inserting ${vehicles.length} fresh cars to Supabase...`);
    
    const { data, error: insertError } = await supabase
      .from('vehicles')
      .insert(vehicles);
    
    if (insertError) {
      console.error('❌ Supabase insert error:', insertError.message);
      console.error('Error details:', insertError);
    } else {
      console.log(`✅ Successfully inserted ${vehicles.length} fresh cars to Supabase`);
    }
  } catch (error) {
    console.error('❌ Replace cars error:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🌍 Starting complete car scraper...');
  
  const vehicles = await scrapeAllCars();
  
  if (vehicles.length > 0) {
    await replaceAllCarsInSupabase(vehicles);
    console.log('✅ Complete car scraping finished successfully!');
  } else {
    console.log('❌ No vehicles scraped');
  }
}

// Run the scraper
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { scrapeAllCars, main };
