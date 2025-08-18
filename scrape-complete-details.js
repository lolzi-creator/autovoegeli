// Complete Vehicle Detail Scraper for Auto Voegeli
// Extracts ALL detailed information including equipment, specs, warranty, descriptions
// Usage: node scrape-complete-details.js [vehicleId]

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.autoscout24.ch/de/hci/v2/1124/detail/';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'de-CH,de;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.autoscout24.ch/de/hci/v2/1124/search',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    };

    const req = https.request(url, options, (res) => {
      let chunks = [];
      
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      res.on('end', () => {
        let data = Buffer.concat(chunks);
        
        // Handle gzip compression
        if (res.headers['content-encoding'] === 'gzip') {
          const zlib = require('zlib');
          try {
            data = zlib.gunzipSync(data);
          } catch (err) {
            console.log('⚠️  Gzip decompression failed, using raw data');
          }
        }
        
        resolve({
          statusCode: res.statusCode,
          data: data.toString('utf8')
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

function extractCompleteVehicleData(html, vehicleId) {
  console.log('🔍 Extracting complete vehicle data...');
  
  // Try to extract structured JSON data first
  let structuredData = null;
  const jsonMatches = html.match(/"vehicleDetail":\s*({.*?}),?\s*"(?:seller|brand|qualiLogo)"/);
  
  if (jsonMatches && jsonMatches[1]) {
    try {
      structuredData = JSON.parse(jsonMatches[1]);
      console.log('✅ Found structured vehicle data');
    } catch (err) {
      console.log('⚠️  Failed to parse vehicle JSON, using HTML extraction');
    }
  }

  // Extract complete vehicle information
  const vehicle = {
    id: vehicleId,
    url: `${BASE_URL}${vehicleId}`,
    scraped_at: new Date().toISOString(),
    
    // Basic Information
    title: extractTitle(html, structuredData),
    brand: extractBrand(html, structuredData),
    model: extractModel(html, structuredData),
    
    // Pricing
    price: extractPrice(html, structuredData),
    priceFormatted: extractPriceFormatted(html),
    
    // Technical Specifications
    year: extractYear(html, structuredData),
    mileage: extractMileage(html, structuredData),
    power: extractPower(html, structuredData),
    displacement: extractDisplacement(html),
    fuelType: extractFuelType(html, structuredData),
    transmission: extractTransmission(html, structuredData),
    driveType: extractDriveType(html, structuredData),
    bodyType: extractBodyType(html, structuredData),
    
    // Condition & Registration
    condition: extractCondition(html, structuredData),
    firstRegistration: extractFirstRegistration(html, structuredData),
    
    // Complete Equipment Lists
    standardEquipment: extractStandardEquipment(html),
    additionalEquipment: extractAdditionalEquipment(html),
    allFeatures: extractAllFeatures(html),
    
    // Detailed Descriptions
    fullDescription: extractFullDescription(html),
    technicalDescription: extractTechnicalDescription(html),
    dealerNotes: extractDealerNotes(html),
    
    // Warranty & Inspection
    warranty: extractCompleteWarranty(html),
    inspection: extractInspection(html),
    
    // Images
    images: extractAllImages(html, vehicleId),
    
    // Contact & Location
    dealer: extractDealer(html),
    location: extractLocation(html),
    phones: extractPhones(html),
    
    // Additional Technical Data
    consumption: extractConsumption(html, structuredData),
    co2Emission: extractCO2(html, structuredData),
    doors: extractDoors(html, structuredData),
    seats: extractSeats(html, structuredData),
    
    // Metadata
    lastUpdated: new Date().toISOString(),
    dataQuality: 'complete',
    scrapingMethod: 'full_extraction'
  };

  return vehicle;
}

function extractTitle(html, data) {
  if (data?.versionFullName) return data.versionFullName;
  
  // Look for title in multiple places
  const patterns = [
    /<h1[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/h1>/i,
    /<h1[^>]*>([^<]+)<\/h1>/,
    /<title>([^<|]+)/
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1].trim();
  }
  
  return 'Unknown Vehicle';
}

function extractBrand(html, data) {
  if (data?.make?.name) return data.make.name;
  
  const brandPatterns = [
    /"brand":"([^"]+)"/,
    /data-make="([^"]+)"/,
    /"make":\s*{\s*"name":\s*"([^"]+)"/
  ];
  
  for (const pattern of brandPatterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  
  return 'Unknown';
}

function extractModel(html, data) {
  if (data?.model?.name) return data.model.name;
  
  const modelPatterns = [
    /"model":"([^"]+)"/,
    /data-model="([^"]+)"/,
    /"model":\s*{\s*"name":\s*"([^"]+)"/
  ];
  
  for (const pattern of modelPatterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  
  return 'Unknown';
}

function extractPrice(html, data) {
  if (data?.price) return data.price;
  
  const pricePatterns = [
    /CHF\s*([\d']+)/,
    /"price":(\d+)/,
    /"listPrice":(\d+)/
  ];
  
  for (const pattern of pricePatterns) {
    const match = html.match(pattern);
    if (match) {
      return parseInt(match[1].replace(/'/g, ''));
    }
  }
  
  return 0;
}

function extractPriceFormatted(html) {
  const match = html.match(/CHF\s*([\d']+[.-]*)/);
  return match ? match[0] : 'CHF 0';
}

function extractYear(html, data) {
  if (data?.firstRegistrationYear) return data.firstRegistrationYear;
  
  const yearPatterns = [
    /"firstRegistrationYear":(\d{4})/,
    /Baujahr.*?(\d{4})/,
    /(\d{4})/g
  ];
  
  for (const pattern of yearPatterns) {
    const match = html.match(pattern);
    if (match && parseInt(match[1]) >= 1990 && parseInt(match[1]) <= new Date().getFullYear() + 1) {
      return parseInt(match[1]);
    }
  }
  
  return new Date().getFullYear();
}

function extractMileage(html, data) {
  if (data?.mileage) return data.mileage;
  
  const mileagePatterns = [
    /"mileage":(\d+)/,
    /(\d+)\s*km/i
  ];
  
  for (const pattern of mileagePatterns) {
    const match = html.match(pattern);
    if (match) return parseInt(match[1]);
  }
  
  return 0;
}

function extractPower(html, data) {
  if (data?.power) return `${data.power} PS`;
  
  const powerPatterns = [
    /(\d+)\s*kW(?:\s*\([^)]*auch\s*(\d+)\s*kW[^)]*\))?/i,
    /(\d+)\s*PS/i,
    /(\d+)\s*kW/i
  ];
  
  for (const pattern of powerPatterns) {
    const match = html.match(pattern);
    if (match) {
      if (match[2]) {
        return `${match[1]} kW (auch ${match[2]} kW möglich)`;
      }
      return match[0];
    }
  }
  
  return '-';
}

function extractDisplacement(html) {
  const patterns = [
    /(\d+)\s*cm³/i,
    /(\d+)\s*ccm/i,
    /(\d{3,4})\s*(?:cm³|ccm)/i
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return `${match[1]} cm³`;
  }
  
  return null;
}

function extractFuelType(html, data) {
  if (data?.fuelType) return data.fuelType;
  
  const fuelPatterns = [
    /"fuelType":"([^"]+)"/,
    /Kraftstoff.*?([A-Za-z]+)/,
    /(Benzin|Diesel|Elektro|Hybrid)/i
  ];
  
  for (const pattern of fuelPatterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  
  return 'Benzin';
}

function extractTransmission(html, data) {
  if (data?.transmissionType) return data.transmissionType;
  
  const transPatterns = [
    /"transmissionType":"([^"]+)"/,
    /Getriebe.*?([^<]+)/,
    /(Schaltgetriebe|Automatik|manuell)/i
  ];
  
  for (const pattern of transPatterns) {
    const match = html.match(pattern);
    if (match) return match[1].trim();
  }
  
  return 'Manuell';
}

function extractDriveType(html, data) {
  if (data?.driveSystem) return data.driveSystem;
  
  const drivePatterns = [
    /(Kette|Riemen|Kardanantrieb)/i,
    /"driveSystem":"([^"]+)"/
  ];
  
  for (const pattern of drivePatterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  
  return 'Kette';
}

function extractBodyType(html, data) {
  if (data?.bodyType) return data.bodyType;
  
  const bodyPatterns = [
    /(Strasse|Sport|Touring|Adventure|Naked|Chopper|Scooter)/i,
    /"vehicleCategory":"([^"]+)"/
  ];
  
  for (const pattern of bodyPatterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  
  return 'Strasse';
}

function extractCondition(html, data) {
  if (data?.condition) return data.condition;
  
  const conditionPatterns = [
    /(Neues Fahrzeug|Neu)/i,
    /(Gebraucht|Occasion)/i,
    /"condition":"([^"]+)"/
  ];
  
  for (const pattern of conditionPatterns) {
    const match = html.match(pattern);
    if (match) {
      return match[1].includes('Neu') ? 'Neu' : 'Gebraucht';
    }
  }
  
  return 'Gebraucht';
}

function extractFirstRegistration(html, data) {
  if (data?.firstRegistrationDate) return data.firstRegistrationDate;
  
  const regPatterns = [
    /"firstRegistrationDate":"([^"]+)"/,
    /Erstzulassung.*?(\d{2}\/\d{4})/,
    /(\d{2}\/\d{4})/
  ];
  
  for (const pattern of regPatterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

function extractStandardEquipment(html) {
  const equipment = [];
  
  // Look for standard equipment section
  const standardSection = html.match(/Serienausstattung[^<]*<\/[^>]*>(.*?)(?:Zusätzliche|Extras|$)/is);
  if (standardSection) {
    const items = standardSection[1].match(/>([^<]+)</g);
    if (items) {
      items.forEach(item => {
        const clean = item.replace(/[<>]/g, '').trim();
        if (clean.length > 2 && clean.length < 50) {
          equipment.push(clean);
        }
      });
    }
  }
  
  return equipment;
}

function extractAdditionalEquipment(html) {
  const equipment = [];
  
  // Look for additional equipment section - more comprehensive patterns
  const patterns = [
    /Zusätzliche\s+Ausstattung[^<]*<\/[^>]*>(.*?)(?:Extras|Motorfahrzeug|Garantie|Fahrzeugbeschreibung|$)/is,
    /Additional\s+Equipment[^<]*<\/[^>]*>(.*?)(?:Extras|$)/is,
    /Ausstattung[^<]*<\/[^>]*>(.*?)(?:Extras|$)/is
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      // Extract equipment items from the matched section
      const equipmentItems = [
        'Beheizbare Griffe',
        'Bluetooth-Schnittstelle', 
        'Aluminiumfelgen',
        'Navigation',
        'LED-Scheinwerfer',
        'ABS',
        'Schlüsselloser Zugang/Start',
        'Keyless-Go',
        'TFT-Display',
        'Ride-by-Wire',
        'Anti-Hopping-Kupplung',
        'Voll-LED',
        'Windschutz',
        'Hauptständer',
        'Seitenständer'
      ];
      
      equipmentItems.forEach(item => {
        if (match[1].includes(item)) {
          equipment.push(item);
        }
      });
      
      // Also extract any other equipment items found
      const items = match[1].match(/>([^<]+)</g);
      if (items) {
        items.forEach(item => {
          const clean = item.replace(/[<>]/g, '').trim();
          if (clean.length > 2 && clean.length < 50 && !equipment.includes(clean)) {
            equipment.push(clean);
          }
        });
      }
      break;
    }
  }
  
  return equipment;
}

function extractAllFeatures(html) {
  const features = [];
  
  // Combine standard and additional equipment
  const standardEq = extractStandardEquipment(html);
  const additionalEq = extractAdditionalEquipment(html);
  
  features.push(...standardEq, ...additionalEq);
  
  // Look for extras section
  const extrasMatch = html.match(/Extras[^<]*<\/[^>]*>(.*?)(?:Motorfahrzeug|Garantie|$)/is);
  if (extrasMatch) {
    const extraItems = extrasMatch[1].match(/>([^<]+)</g);
    if (extraItems) {
      extraItems.forEach(item => {
        const clean = item.replace(/[<>]/g, '').trim();
        if (clean.length > 2 && clean.length < 50 && !features.includes(clean)) {
          features.push(clean);
        }
      });
    }
  }
  
  return [...new Set(features)]; // Remove duplicates
}

function extractFullDescription(html) {
  const patterns = [
    /Fahrzeugbeschreibung[^<]*<\/[^>]*>(.*?)(?:<\/div>|<div|$)/is,
    /Description[^<]*<\/[^>]*>(.*?)(?:<\/div>|<div|$)/is
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      let description = match[1]
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (description.length > 50) {
        return description;
      }
    }
  }
  
  return 'Hochwertige Fahrzeuge von Auto Vögeli AG. Probefahrten und Besichtigungen möglich.';
}

function extractTechnicalDescription(html) {
  // Look for technical details in the description
  const techPatterns = [
    /(\d+\s*cm³.*?(?:kW|PS))/i,
    /(Ride-by-Wire)/i,
    /(TFT-Display)/i,
    /(Keyless-Go)/i,
    /(Anti-Hopping-Kupplung)/i,
    /(\d+-Gang-Getriebe)/i
  ];
  
  const techDetails = [];
  
  techPatterns.forEach(pattern => {
    const match = html.match(pattern);
    if (match) techDetails.push(match[1]);
  });
  
  return techDetails.join(', ');
}

function extractDealerNotes(html) {
  const patterns = [
    /Probefahrten[^.]*\./i,
    /Besichtigungen[^.]*\./i,
    /Finanzierung[^.]*\./i
  ];
  
  const notes = [];
  
  patterns.forEach(pattern => {
    const match = html.match(pattern);
    if (match) notes.push(match[0]);
  });
  
  return notes.join(' ');
}

function extractCompleteWarranty(html) {
  const warranty = {
    available: false,
    duration: null,
    details: null,
    type: null,
    startDate: null
  };
  
  // Look for warranty information
  const warrantySection = html.match(/Garantie[^<]*<\/[^>]*>(.*?)(?:Fahrzeugbeschreibung|$)/is);
  if (warrantySection) {
    warranty.available = true;
    
    // Extract duration
    const durationMatch = warrantySection[1].match(/(\d+)\s*(Monat|Jahr)/i);
    if (durationMatch) {
      warranty.duration = `${durationMatch[1]} ${durationMatch[2]}e`;
    }
    
    // Extract details
    const detailsMatch = warrantySection[1].match(/(Ab\s+[^<]+)/i);
    if (detailsMatch) {
      warranty.details = detailsMatch[1].trim();
    }
    
    // Check for warranty type
    if (warrantySection[1].includes('WERKSGARANTIE')) {
      warranty.type = 'Herstellergarantie';
    }
  }
  
  return warranty;
}

function extractInspection(html) {
  const inspection = {
    mfk: 'Ja',
    details: null
  };
  
  const mfkMatch = html.match(/MFK[^<]*<\/[^>]*>(.*?)(?:Garantie|$)/is);
  if (mfkMatch) {
    if (mfkMatch[1].includes('Ja')) {
      inspection.mfk = 'Ja';
    } else if (mfkMatch[1].includes('Nein')) {
      inspection.mfk = 'Nein';
    }
    
    const detailsMatch = mfkMatch[1].match(/(Ab\s+[^<]+)/i);
    if (detailsMatch) {
      inspection.details = detailsMatch[1].trim();
    }
  }
  
  return inspection;
}

function extractAllImages(html, vehicleId) {
  const images = [];
  
  // Enhanced image extraction patterns
  const imagePatterns = [
    /https:\/\/images\.autoscout24\.ch\/public\/listing\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi,
    /"url":"(https:\/\/[^"]+\.(?:jpg|jpeg|png|webp))"/gi,
    /https:\/\/[^"'\s]*autoscout24[^"'\s]*\/[^"'\s]*\.(?:jpg|jpeg|png|webp)/gi
  ];
  
  imagePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const imageUrl = match[1] || match[0];
      if (imageUrl && !images.includes(imageUrl)) {
        // Filter out UI elements and ensure reasonable URL length
        if (!imageUrl.includes('logo') && 
            !imageUrl.includes('icon') && 
            !imageUrl.includes('flag') &&
            !imageUrl.includes('ui') &&
            imageUrl.length > 30) {
          images.push(imageUrl);
        }
      }
    }
  });
  
  return images.slice(0, 20); // Limit to 20 images
}

function extractDealer(html) {
  const dealerPatterns = [
    /Auto\s+Vögeli\s+AG/i,
    /class="dealer-name"[^>]*>([^<]+)/,
    /"name":"([^"]*Auto[^"]*Vögeli[^"]*)"/i
  ];
  
  for (const pattern of dealerPatterns) {
    const match = html.match(pattern);
    if (match) return match[1] || match[0];
  }
  
  return 'Auto Vögeli AG';
}

function extractLocation(html) {
  const locationPatterns = [
    /Solothurnstrasse\s+129,\s*2540\s+Grenchen/i,
    /"address":"([^"]+)"/,
    /class="dealer-location"[^>]*>([^<]+)/
  ];
  
  for (const pattern of locationPatterns) {
    const match = html.match(pattern);
    if (match) return match[1] || match[0];
  }
  
  return 'Solothurnstrasse 129, 2540 Grenchen';
}

function extractPhones(html) {
  const phones = [];
  
  // Look for Swiss phone numbers
  const phonePattern = /(\+?41\s*\d{2}\s*\d{3}\s*\d{2}\s*\d{2}|\d{3}\s*\d{3}\s*\d{2}\s*\d{2})/g;
  
  let match;
  while ((match = phonePattern.exec(html)) !== null) {
    const phone = match[1].replace(/\s/g, ' ').trim();
    if (!phones.includes(phone)) {
      phones.push(phone);
    }
  }
  
  // Default phones if none found
  if (phones.length === 0) {
    phones.push('032 652 11 66', '078 636 06 19');
  }
  
  return phones;
}

function extractConsumption(html, data) {
  if (data?.consumption) return data.consumption;
  
  const consumptionPatterns = [
    /(\d+[,.]?\d*\s*l\/100km)/i,
    /"consumption":"([^"]+)"/
  ];
  
  for (const pattern of consumptionPatterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

function extractCO2(html, data) {
  if (data?.co2Emission) return data.co2Emission;
  
  const co2Patterns = [
    /CO2.*?(\d+)/i,
    /"co2":(\d+)/
  ];
  
  for (const pattern of co2Patterns) {
    const match = html.match(pattern);
    if (match) return parseInt(match[1]);
  }
  
  return null;
}

function extractDoors(html, data) {
  if (data?.doors) return data.doors;
  return null; // Motorcycles don't have doors
}

function extractSeats(html, data) {
  if (data?.seats) return data.seats;
  return 2; // Most motorcycles have 2 seats
}

async function scrapeCompleteVehicleDetails(vehicleId) {
  try {
    console.log(`🏍️  Scraping COMPLETE details for vehicle ID: ${vehicleId}`);
    
    const url = `${BASE_URL}${vehicleId}`;
    const response = await makeRequest(url);
    
    if (response.statusCode !== 200) {
      throw new Error(`HTTP ${response.statusCode}`);
    }
    
    const vehicle = extractCompleteVehicleData(response.data, vehicleId);
    
    // Create output directory
    const outputDir = './scraped_vehicles_complete_enhanced';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save complete vehicle data
    const filename = `${vehicle.title?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'vehicle'}_${vehicleId}_complete.json`;
    const filepath = path.join(outputDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(vehicle, null, 2));
    console.log(`💾 Saved complete data: ${filename}`);
    
    // Show what we extracted
    console.log(`\n📋 EXTRACTED DATA SUMMARY:`);
    console.log(`   Title: ${vehicle.title}`);
    console.log(`   Price: ${vehicle.priceFormatted}`);
    console.log(`   Power: ${vehicle.power}`);
    console.log(`   Displacement: ${vehicle.displacement || 'N/A'}`);
    console.log(`   Equipment: ${vehicle.allFeatures.length} items`);
    console.log(`   Images: ${vehicle.images.length} photos`);
    console.log(`   Description length: ${vehicle.fullDescription.length} chars`);
    console.log(`   Warranty: ${vehicle.warranty.available ? 'Yes' : 'No'} - ${vehicle.warranty.details || 'N/A'}`);
    
    return vehicle;
    
  } catch (error) {
    console.error(`❌ Failed to scrape vehicle ${vehicleId}:`, error.message);
    return null;
  }
}

// Main execution
if (require.main === module) {
  const vehicleId = process.argv[2] || '12613297';
  
  console.log('🚀 Auto Vögeli - COMPLETE Vehicle Detail Scraper');
  console.log('===============================================');
  console.log('Extracting ALL data: specs, equipment, warranty, descriptions, images');
  console.log('');
  
  scrapeCompleteVehicleDetails(vehicleId);
}

module.exports = { scrapeCompleteVehicleDetails };



