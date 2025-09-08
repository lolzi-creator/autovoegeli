#!/usr/bin/env node

/**
 * AutoScout24 Scraper Improvement Script
 * Fixes data quality issues in scraped vehicle data
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SCRAPED_DIR = './public/scraped_vehicles_complete';
const OUTPUT_DIR = './public/scraped_vehicles_improved';

// Brand mapping for better detection
const BRAND_MAPPING = {
  'YAMAHA': 'Yamaha',
  'BMW': 'BMW',
  'MERCEDES': 'Mercedes-Benz',
  'AUDI': 'Audi',
  'VOLKSWAGEN': 'Volkswagen',
  'TESLA': 'Tesla',
  'PORSCHE': 'Porsche',
  'FERRARI': 'Ferrari',
  'LAMBORGHINI': 'Lamborghini',
  'ZONTES': 'Zontes',
  'KOVE': 'Kove',
  'VOGE': 'Voge',
  'SWM': 'SWM',
  'HARLEY-DAVIDSON': 'Harley-Davidson',
  'TRIUMPH': 'Triumph',
  'DUCATI': 'Ducati',
  'KAWASAKI': 'Kawasaki',
  'HONDA': 'Honda',
  'SUZUKI': 'Suzuki',
  'KTM': 'KTM',
  'APRILIA': 'Aprilia',
  'COLOVE': 'Colove',
  'AVERSUS': 'Aversus',
  'WOTTAN': 'Wottan',
  'BUELL': 'Buell',
  'ARIIC': 'Ariic'
};

// Vehicle type mapping
const TYPE_MAPPING = {
  'Naked bike': 'Naked Bike',
  'chopper': 'Chopper',
  'Sporttourer': 'Sport Tourer',
  'Adventure': 'Adventure',
  'Scooter': 'Scooter',
  'Supermoto': 'Supermoto',
  'Touring': 'Touring',
  'Supersport': 'Supersport'
};

/**
 * Clean and fix vehicle data
 */
function improveVehicleData(rawVehicle) {
  const improved = { ...rawVehicle };

  // Fix year data
  improved.year = fixYear(improved.year, improved.title);
  
  // Fix price formatting
  improved.price = cleanPrice(improved.price);
  improved.priceNumber = extractPriceNumber(improved.price);
  
  // Fix brand detection
  improved.brand = fixBrand(improved.brand, improved.title);
  
  // Fix model extraction
  improved.model = extractModel(improved.title, improved.brand);
  
  // Fix vehicle type
  improved.type = TYPE_MAPPING[improved.type] || improved.type;
  
  // Clean warranty details
  improved.warrantyDetails = cleanWarrantyDetails(improved.warrantyDetails);
  
  // Extract features from description
  improved.equipment = extractFeatures(improved.fahrzeugbeschreibung, improved.equipment);
  
  // Fix power formatting
  improved.power = cleanPower(improved.power);
  
  // Fix mileage
  improved.mileage = cleanMileage(improved.mileage);
  improved.mileageNumber = extractMileageNumber(improved.mileage);
  
  // Fix displacement
  improved.displacement = cleanDisplacement(improved.displacement);
  
  // Add calculated fields
  improved.vehicleAge = calculateAge(improved.year);
  improved.pricePerYear = improved.priceNumber / Math.max(improved.vehicleAge, 1);
  
  return improved;
}

/**
 * Fix year data - extract from title if invalid
 */
function fixYear(year, title) {
  // If year is invalid (like 1217, 1873), try to extract from title
  if (!year || year === '1217' || year === '1873' || year < 1990 || year > 2025) {
    const yearMatch = title.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      return yearMatch[0];
    }
    
    // Try to extract from other patterns
    const altYearMatch = title.match(/\b(2[0-9]{3})\b/);
    if (altYearMatch) {
      return altYearMatch[0];
    }
    
    // Default to current year if nothing found
    return new Date().getFullYear().toString();
  }
  
  return year.toString();
}

/**
 * Clean price string
 */
function cleanPrice(price) {
  if (!price) return 'CHF 0.-';
  
  return price
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .trim();
}

/**
 * Extract numeric price
 */
function extractPriceNumber(price) {
  const cleanPrice = price.replace(/[^\d]/g, '');
  return parseInt(cleanPrice) || 0;
}

/**
 * Fix brand detection
 */
function fixBrand(brand, title) {
  if (brand && brand !== 'Unknown' && BRAND_MAPPING[brand.toUpperCase()]) {
    return BRAND_MAPPING[brand.toUpperCase()];
  }
  
  // Try to extract brand from title
  const titleUpper = title.toUpperCase();
  for (const [key, value] of Object.entries(BRAND_MAPPING)) {
    if (titleUpper.includes(key)) {
      return value;
    }
  }
  
  // Fallback: use first word of title
  const firstWord = title.split(' ')[0];
  return firstWord || 'Unknown';
}

/**
 * Extract model from title
 */
function extractModel(title, brand) {
  if (!brand || brand === 'Unknown') {
    return title;
  }
  
  const titleParts = title.split(' ');
  const brandIndex = titleParts.findIndex(part => 
    part.toUpperCase() === brand.toUpperCase()
  );
  
  if (brandIndex !== -1 && brandIndex < titleParts.length - 1) {
    return titleParts.slice(brandIndex + 1).join(' ');
  }
  
  return title.replace(brand, '').trim();
}

/**
 * Clean warranty details
 */
function cleanWarrantyDetails(warrantyDetails) {
  if (!warrantyDetails) return '';
  
  // Remove corrupted JSON data
  if (warrantyDetails.includes('\\",\\"inspectedOnly\\"')) {
    return 'Werkstattgarantie verfügbar';
  }
  
  // Clean up the string
  return warrantyDetails
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\n/g, '\n')
    .trim();
}

/**
 * Extract features from description
 */
function extractFeatures(description, existingFeatures = []) {
  if (!description) return existingFeatures;
  
  const features = [...(existingFeatures || [])];
  const descLower = description.toLowerCase();
  
  // Common features to look for
  const featureKeywords = {
    'ABS': ['abs', 'antiblockiersystem'],
    'LED Beleuchtung': ['led', 'led-beleuchtung', 'led scheinwerfer'],
    'Navigation': ['navigation', 'navi', 'gps'],
    'Klimaautomatik': ['klima', 'klimaanlage', 'klimaautomatik'],
    'Sitzheizung': ['sitzheizung', 'heizung'],
    'Bluetooth': ['bluetooth', 'bluetooth-verbindung'],
    'Tempomat': ['tempomat', 'cruise control'],
    'Parkhilfe': ['parkhilfe', 'parkassistent', 'parking'],
    'Leder': ['leder', 'lederausstattung'],
    'Panoramadach': ['panorama', 'panoramadach', 'schiebedach'],
    'Xenon': ['xenon', 'xenon-scheinwerfer'],
    'Alufelgen': ['alufelgen', 'aluminium felgen'],
    'Sportfahrwerk': ['sportfahrwerk', 'sport suspension'],
    'Turbolader': ['turbo', 'turbolader'],
    'Allradantrieb': ['allrad', '4wd', 'quattro', 'xdrive']
  };
  
  // Check for features in description
  for (const [feature, keywords] of Object.entries(featureKeywords)) {
    if (keywords.some(keyword => descLower.includes(keyword))) {
      if (!features.includes(feature)) {
        features.push(feature);
      }
    }
  }
  
  return features;
}

/**
 * Clean power string
 */
function cleanPower(power) {
  if (!power || power === '-' || power.toLowerCase().includes('unknown')) {
    return '-';
  }
  
  return power
    .replace(/KW/g, ' kW')
    .replace(/PS/g, ' PS')
    .trim();
}

/**
 * Clean mileage string
 */
function cleanMileage(mileage) {
  if (!mileage) return '0 km';
  
  return mileage
    .replace(/000 km/g, '0 km')
    .replace(/km/g, ' km')
    .trim();
}

/**
 * Extract numeric mileage
 */
function extractMileageNumber(mileage) {
  const cleanMileage = mileage.replace(/[^\d]/g, '');
  return parseInt(cleanMileage) || 0;
}

/**
 * Clean displacement
 */
function cleanDisplacement(displacement) {
  if (!displacement) return null;
  
  if (typeof displacement === 'string') {
    const match = displacement.match(/(\d+)\s*cm³/);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  return displacement;
}

/**
 * Calculate vehicle age
 */
function calculateAge(year) {
  const currentYear = new Date().getFullYear();
  const vehicleYear = parseInt(year);
  return Math.max(currentYear - vehicleYear, 0);
}

/**
 * Main improvement function
 */
async function improveScrapedData() {
  console.log('🚀 Starting data improvement process...');
  
  try {
    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    // Read all vehicle files
    const files = fs.readdirSync(SCRAPED_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json') && f !== 'scraping_summary.json');
    
    console.log(`📁 Found ${jsonFiles.length} vehicle files to improve`);
    
    const improvedVehicles = [];
    let processedCount = 0;
    let errorCount = 0;
    
    // Process each vehicle file
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(SCRAPED_DIR, file);
        const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        const improvedData = improveVehicleData(rawData);
        improvedVehicles.push(improvedData);
        
        // Save improved individual file
        const outputFile = path.join(OUTPUT_DIR, file);
        fs.writeFileSync(outputFile, JSON.stringify(improvedData, null, 2));
        
        processedCount++;
        
        if (processedCount % 10 === 0) {
          console.log(`✅ Processed ${processedCount}/${jsonFiles.length} vehicles`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
        errorCount++;
      }
    }
    
    // Create improved summary
    const summary = {
      improvement_date: new Date().toISOString(),
      total_vehicles: improvedVehicles.length,
      processed_successfully: processedCount,
      errors: errorCount,
      improvements_made: [
        'Fixed invalid year data',
        'Cleaned price formatting',
        'Improved brand detection',
        'Extracted features from descriptions',
        'Cleaned warranty details',
        'Fixed power and mileage formatting',
        'Added calculated fields (age, price per year)'
      ],
      brand_distribution: getBrandDistribution(improvedVehicles),
      year_distribution: getYearDistribution(improvedVehicles),
      price_range: getPriceRange(improvedVehicles)
    };
    
    // Save improved summary
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'improvement_summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    // Save combined improved data
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'all_vehicles_improved.json'),
      JSON.stringify(improvedVehicles, null, 2)
    );
    
    console.log('\n🎉 Data improvement completed!');
    console.log(`✅ Successfully processed: ${processedCount} vehicles`);
    console.log(`❌ Errors: ${errorCount} vehicles`);
    console.log(`📊 Total improved vehicles: ${improvedVehicles.length}`);
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);
    
    // Show some statistics
    console.log('\n📈 Brand Distribution:');
    Object.entries(summary.brand_distribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([brand, count]) => {
        console.log(`  ${brand}: ${count} vehicles`);
      });
    
    console.log('\n📅 Year Distribution:');
    Object.entries(summary.year_distribution)
      .sort(([a], [b]) => b - a)
      .slice(0, 5)
      .forEach(([year, count]) => {
        console.log(`  ${year}: ${count} vehicles`);
      });
    
    console.log(`\n💰 Price Range: CHF ${summary.price_range.min.toLocaleString()} - CHF ${summary.price_range.max.toLocaleString()}`);
    
  } catch (error) {
    console.error('❌ Fatal error during improvement process:', error);
    process.exit(1);
  }
}

/**
 * Get brand distribution
 */
function getBrandDistribution(vehicles) {
  const distribution = {};
  vehicles.forEach(vehicle => {
    const brand = vehicle.brand || 'Unknown';
    distribution[brand] = (distribution[brand] || 0) + 1;
  });
  return distribution;
}

/**
 * Get year distribution
 */
function getYearDistribution(vehicles) {
  const distribution = {};
  vehicles.forEach(vehicle => {
    const year = vehicle.year || 'Unknown';
    distribution[year] = (distribution[year] || 0) + 1;
  });
  return distribution;
}

/**
 * Get price range
 */
function getPriceRange(vehicles) {
  const prices = vehicles.map(v => v.priceNumber).filter(p => p > 0);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    average: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
  };
}

// Run the improvement process
if (require.main === module) {
  improveScrapedData().catch(console.error);
}

module.exports = { improveScrapedData, improveVehicleData };

