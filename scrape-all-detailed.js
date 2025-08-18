// Complete Vehicle Scraper - Uses IDs from listing + Detailed scraping
// Combines our successful ID extraction with working detailed scraping

const https = require('https');
const fs = require('fs');
const path = require('path');

// All 70 vehicle IDs found from the listing pages
const VEHICLE_IDS = [
  // Page 1
  '12622035', '12620843', '12613297', '12566736', '12479452', '12454658', 
  '12437959', '12437195', '12426642', '12303507', '12303458', '12210898',
  '12209497', '12209477', '12209312', '11898327', '11887275', '11774662',
  '11765386', '11765356',
  // Page 2  
  '11650200', '11629519', '11627223', '11619716', '11610290', '11610212',
  '11610180', '11610169', '11609633', '11609588', '11609569', '11605976',
  '11605946', '11521490', '11452796', '11413401', '11413395', '11413364',
  '11413296', '11413250',
  // Page 3
  '11412672', '11412539', '10800677', '10800649', '10800481', '10690822',
  '10678733', '10662262', '10466945', '10343789', '10294717', '9794348',
  '9710281', '9710249', '9437948', '9413057', '9413011', '9319444',
  '9247379', '9247341',
  // Page 4
  '9247327', '9243739', '9189345', '9189032', '9154228', '8947391',
  '8884814', '8813985', '8813802', '8813700'
];

console.log(`🚀 Auto Vögeli - Complete Vehicle Scraper`);
console.log(`========================================`);
console.log(`Will scrape detailed data for ${VEHICLE_IDS.length} vehicles`);
console.log(`Including YAMAHA MT09A (ID: 12620843) and all others`);
console.log(``);

// Create directories
const createDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
};

// Make HTTPS request with exact Postman headers
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'de-CH,de;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      
      // Handle compression (gzip, deflate, brotli)
      let stream = res;
      if (res.headers['content-encoding'] === 'gzip') {
        const zlib = require('zlib');
        stream = res.pipe(zlib.createGunzip());
      } else if (res.headers['content-encoding'] === 'deflate') {
        const zlib = require('zlib');
        stream = res.pipe(zlib.createInflate());
      } else if (res.headers['content-encoding'] === 'br') {
        const zlib = require('zlib');
        stream = res.pipe(zlib.createBrotliDecompress());
      }
      
      stream.on('data', (chunk) => {
        data += chunk;
      });
      
      stream.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data
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

// Extract vehicle images (same as working scraper)
function extractVehicleImages(html, vehicleId) {
  const images = [];
  
  const imagePatterns = [
    /https:\/\/[^"'\s]*autoscout24[^"'\s]*\.(?:jpg|jpeg|png|webp)/gi,
    /https:\/\/[^"'\s]*vehicle[^"'\s]*\.(?:jpg|jpeg|png|webp)/gi,
    /https:\/\/[^"'\s]*(?:car|motor|bike|vehicle)[^"'\s]*\.(?:jpg|jpeg|png|webp)/gi,
    /https:\/\/[^"'\s]*images?[^"'\s]*\.(?:jpg|jpeg|png|webp)/gi
  ];
  
  imagePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const imageUrl = match[0];
      if (imageUrl && !images.includes(imageUrl)) {
        if (!imageUrl.includes('logo') && 
            !imageUrl.includes('icon') && 
            !imageUrl.includes('flag') &&
            !imageUrl.includes('background') &&
            !imageUrl.includes('ui') &&
            imageUrl.length > 20) {
          images.push(imageUrl);
        }
      }
    }
  });
  
  const uniqueImages = [...new Set(images)].slice(0, 20); // Increased to 20 images
  return uniqueImages;
}

// Extract all equipment and features from the ACTUAL page content
function extractAllEquipment(html) {
  const equipmentList = [];
  
  // Extract equipment from the specific HTML structure with CSS classes
  // Look for the Ausstattungen section with class css-1k4v462
  const ausstattungenMatch = html.match(/<div class="css-1k4v462">[\s\S]*?<p class="chakra-text css-895drp">Ausstattungen<\/p>[\s\S]*?<\/div><\/div><\/div>/);
  
  if (ausstattungenMatch) {
    const ausstattungenHtml = ausstattungenMatch[0];
    
    // Extract all list items with class css-1f0lcap
    const listItems = ausstattungenHtml.match(/<li class="css-1f0lcap">([^<]+)<\/li>/g);
    
    if (listItems) {
      listItems.forEach(item => {
        const textMatch = item.match(/<li class="css-1f0lcap">([^<]+)<\/li>/);
        if (textMatch && textMatch[1]) {
          equipmentList.push(textMatch[1].trim());
        }
      });
    }
  }
  
  // If no equipment found with CSS classes, fallback to text search
  if (equipmentList.length === 0) {
    const equipmentPatterns = [
      /Beheizbare Griffe/gi,
      /Bluetooth-Schnittstelle/gi, 
      /Aluminiumfelgen/gi,
      /Navigation/gi,
      /LED-Scheinwerfer/gi,
      /ABS/gi,
      /Schlüsselloser Zugang\/Start/gi,
      /Keyless-Go/gi,
      /TFT-Display/gi,
      /Ride-by-Wire/gi,
      /Anti-Hopping-Kupplung/gi,
      /Voll-LED/gi,
      /Windschutz/gi,
      /Hauptständer/gi,
      /Seitenständer/gi,
      /Traktionskontrolle/gi,
      /Cruise Control/gi,
      /USB-Anschluss/gi,
      /Sitzheizung/gi,
      /Gepäckträger/gi,
    /Topcase/gi,
    /Neu bereift/gi
  ];

    // Check each equipment pattern in the HTML
    equipmentPatterns.forEach(pattern => {
      const matches = html.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleanMatch = match.trim();
          if (cleanMatch && !equipmentList.includes(cleanMatch)) {
            equipmentList.push(cleanMatch);
          }
        });
      }
    });
  }

  return equipmentList.length > 0 ? equipmentList : ['Standard-Ausstattung'];
}

// Extract the REAL warranty information from the page
function extractCompleteWarrantyInfo(html) {
  const warrantyInfo = {
    details: 'Keine Angabe',
    months: null,
    type: 'unknown',
    occGarantie: false
  };

  // Look for warranty details
  if (html.includes('WERKSGARANTIE!')) {
    warrantyInfo.details = 'WERKSGARANTIE!';
    warrantyInfo.occGarantie = true;
  } else if (html.includes('Garantie')) {
    const warrantyMatch = html.match(/Garantie[^<]*?([^<]+)/i);
    if (warrantyMatch) {
      warrantyInfo.details = warrantyMatch[1].trim();
    }
  }

  // Look for warranty duration
  const monthsMatch = html.match(/(\d+)\s*Monate?/i) || html.match(/(\d+)\s*Mon\./i);
  if (monthsMatch) {
    warrantyInfo.months = parseInt(monthsMatch[1]);
  }

  // Look for warranty type
  if (html.includes('Ab 1. Inverkehrsetzung')) {
    warrantyInfo.type = 'from-first-registration';
  } else if (html.includes('Ab Übernahme')) {
    warrantyInfo.type = 'from-delivery';
  }

  return warrantyInfo;
}

function extractCompleteDescriptions(html) {
  console.log('🔍 Searching for description in response data...');

  // Try multiple patterns - the JSON is escaped with backslashes in the actual response
  const patterns = [
    /"cylinders":null,"description":"(.*?)","directImport"/s,  // Original pattern
    /\\"cylinders\\":null,\\"description\\":\\"(.*?)\\",\\"directImport\\"/s,  // Escaped pattern (this works!)
    /cylinders\":null,\"description\":\"(.*?)\",\"directImport/s,  // No quotes around field names
    /description\":\"(.*?)\",\"directImport/s  // Just description to directImport
  ];
  
  for (let i = 0; i < patterns.length; i++) {
    const descMatch = html.match(patterns[i]);
    if (descMatch) {
      console.log(`✅ Found description with pattern ${i + 1}!`);
      
      let description = descMatch[1];
      
      // Decode JSON-style escape sequences properly
      try {
        description = JSON.parse(`"${description}"`);
        console.log(`✅ Successfully decoded description (${description.length} characters)`);
      } catch (e) {
        console.log('⚠️ JSON.parse failed, using manual cleanup');
        description = description
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\u0026/g, '&')
          .replace(/\\\\/g, '\\')
          .replace(/\\t/g, '\t')
          .replace(/\\r/g, '\r');
      }

      // Only return if it's substantial (not just a short teaser)
      if (description.length > 100) {
        console.log(`📝 First 150 chars: ${description.substring(0, 150)}...`);
        return description.trim();
      }
    }
  }
  
  // Fallback: try to find any substantial description field
  const fallbackMatches = html.match(/"description":"([^"]*(?:\\.[^"]*)*)"/g);
  if (fallbackMatches) {
    console.log(`✅ Found ${fallbackMatches.length} description fields, checking for substantial content...`);
    
    for (const match of fallbackMatches) {
      const descExtract = match.match(/"description":"(.*?)"/s);
      if (descExtract) {
        let description = descExtract[1];
        try {
          description = JSON.parse(`"${description}"`);
        } catch {
          description = description
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .replace(/\\u0026/g, '&')
            .replace(/\\\\/g, '\\')
            .replace(/\\t/g, '\t')
            .replace(/\\r/g, '\r');
        }
        
        // Only return if it's substantial and not just the teaser
        if (description.length > 100 && !description.includes('Probefahrten, Besichtigungen')) {
          console.log(`✅ Using substantial description (${description.length} characters)`);
          return description.trim();
        }
      }
    }
  }
  
  console.log('❌ No substantial description found');
  return 'Hochwertiges Fahrzeug von Auto Vögeli AG';
}

// Parse vehicle data (enhanced version)
function parseVehicleData(html, vehicleId) {
  const vehicle = {
    id: vehicleId,
    url: `https://www.autoscout24.ch/de/hci/v2/1124/detail/${vehicleId}`,
    scraped_at: new Date().toISOString(),
    dealer: 'Auto Voegeli AG'
  };

  // Extract title
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) || 
                    html.match(/alt="([^"]*YAMAHA[^"]*)"/) ||
                    html.match(/YAMAHA [A-Z0-9\s]+/i);
  
  if (titleMatch) {
    vehicle.title = titleMatch[1] ? titleMatch[1].trim() : titleMatch[0].trim();
    vehicle.title = vehicle.title.replace(/^#\s*/, '');
  } else {
    vehicle.title = 'Unknown Vehicle';
  }

  // Extract price
  const priceMatch = html.match(/<p[^>]*css-qyqqmk[^>]*>([^<]+)<\/p>/i) ||
                    html.match(/CHF\s*([\d']+)\s*\.-?/i) ||
                    html.match(/>CHF\s*([\d']+)\.-?</i);
  
  if (priceMatch) {
    const priceText = priceMatch[1] || priceMatch[0];
    const cleanPrice = priceText.replace('CHF', '').replace('.-', '').trim();
    vehicle.price = `CHF ${cleanPrice}.-`;
    vehicle.priceNumber = parseInt(cleanPrice.replace(/'/g, ''));
  } else {
    vehicle.price = 'Price on request';
    vehicle.priceNumber = 0;
  }

  // Extract year and date
  const dateMatch = html.match(/(\d{2})\.(\d{4})/);
  if (dateMatch) {
    vehicle.month = dateMatch[1];
    vehicle.year = dateMatch[2];
    vehicle.date = `${dateMatch[1]}.${dateMatch[2]}`;
  }

  // Extract mileage
  const mileageMatch = html.match(/>(\d{1,3}(?:'?\d{3})*)\s*km</i) ||
                      html.match(/(\d{1,6})\s*km/i);
  
  if (mileageMatch) {
    const mileageText = mileageMatch[1];
    vehicle.mileage = `${mileageText} km`;
    vehicle.mileageNumber = parseInt(mileageText.replace(/'/g, ''));
  } else {
    vehicle.mileage = 'Unknown';
    vehicle.mileageNumber = 0;
  }

  // Extract ALL vehicle specifications
  vehicle.type = html.match(/(Naked bike|Tourer|Sportler|Enduro|Chopper|Scooter|Supersport)/i)?.[1] || 'Motorcycle';
  vehicle.transmission = html.match(/(Schaltgetriebe manuell|Automatik|Stufenlos)/i)?.[1] || 'Schaltgetriebe manuell';
  vehicle.fuel = html.match(/(Benzin|Elektro|Diesel|Hybrid)/i)?.[1] || 'Benzin';
  vehicle.drive = html.match(/(Kette|Riemen|Kardanwelle)/i)?.[1] || 'Kette';
  
  // Extract power (enhanced)
  const powerMatch = html.match(/Vehicle power icon\\-\s*([^<\n]+)/i) || 
                    html.match(/(\d+\s*kW(?:\s*\([^)]*auch\s*\d+\s*kW[^)]*\))?)/i) ||
                    html.match(/(\d+\s*PS)/i) ||
                    html.match(/(\d+\s*kW)/i);
  vehicle.power = powerMatch ? powerMatch[1].trim() : '-';
  
  // Extract displacement
  const displacementMatch = html.match(/(\d+)\s*cm³/i) || 
                           html.match(/(\d+)\s*ccm/i);
  vehicle.displacement = displacementMatch ? `${displacementMatch[1]} cm³` : null;
  
  // Extract consumption
  const consumptionMatch = html.match(/Consumption icon\\-\s*([^<\n]+)/i) ||
                          html.match(/(\d+[.,]\d+\s*l\/100km)/i);
  vehicle.consumption = consumptionMatch ? consumptionMatch[1].trim() : '-';
  
  // Extract CO2 emissions
  const co2Match = html.match(/CO2.*?(\d+)/i) || html.match(/(\d+)\s*g\/km/i);
  vehicle.co2Emission = co2Match ? parseInt(co2Match[1]) : null;

  // Extract contact information
  const phoneMatches = html.match(/(\d{3}\s\d{3}\s\d{2}\s\d{2})/g) || [];
  vehicle.phones = phoneMatches;
  vehicle.primaryPhone = phoneMatches[0] || '032 652 11 66';
  
  // Extract WhatsApp and business phone
  const whatsappMatch = html.match(/(\d{3}\s\d{3}\s\d{2}\s\d{2})\s*•\s*WhatsApp/i);
  vehicle.whatsappPhone = whatsappMatch ? whatsappMatch[1] : null;
  
  const businessMatch = html.match(/(\d{3}\s\d{3}\s\d{2}\s\d{2})\s*•\s*Geschäft/i);
  vehicle.businessPhone = businessMatch ? businessMatch[1] : null;

  // Extract location
  const locationMatch = html.match(/(Solothurnstrasse\s+\d+,\s*\d{4}\s+Grenchen)/i) ||
                       html.match(/([^<]+,\s*\d{4}\s+[^<\n]+)/i);
  vehicle.location = locationMatch ? locationMatch[1].trim() : 'Solothurnstrasse 129, 2540 Grenchen';

  // Extract ALL equipment and features (comprehensive)
  const allEquipment = extractAllEquipment(html);
  vehicle.equipment = allEquipment;

  // Extract MFK and warranty
  vehicle.mfk = html.includes('Ab MFK') && html.includes('Ja') ? 'Ja' : 'Unbekannt';
  vehicle.warranty = html.includes('Garantie') && html.includes('Ja') ? 'Ja' : 'Nein';
  
  // Extract comprehensive warranty information
  const warrantyInfo = extractCompleteWarrantyInfo(html);
  vehicle.warrantyDetails = warrantyInfo.details;
  vehicle.warrantyMonths = warrantyInfo.months;
  vehicle.warrantyType = warrantyInfo.type;
  vehicle.occGarantie = warrantyInfo.occGarantie;

  // Extract comprehensive vehicle descriptions
  vehicle.fahrzeugbeschreibung = extractCompleteDescriptions(html);

  // Extract brand and model
  const brandMatch = vehicle.title.match(/^(YAMAHA|VOGE|BMW|HARLEY-DAVIDSON|ZONTES|SWM|KOVE|TRIUMPH|DUCATI|KAWASAKI|SUZUKI|HONDA)/i);
  vehicle.brand = brandMatch ? brandMatch[1].toUpperCase() : 'Unknown';
  vehicle.model = vehicle.title.replace(new RegExp(`^${vehicle.brand}\\s*`, 'i'), '').trim();

  // Determine condition
  vehicle.condition = vehicle.year && parseInt(vehicle.year) >= new Date().getFullYear() ? 'Neu' : 'Gebraucht';

  // Extract images
  vehicle.images = extractVehicleImages(html, vehicleId);
  vehicle.imageCount = vehicle.images.length;
  
  return vehicle;
}

// Scrape single vehicle (same as working scraper)
async function scrapeVehicle(vehicleId, index, total) {
  const url = `https://www.autoscout24.ch/de/hci/v2/1124/detail/${vehicleId}`;
  
  console.log(`\n🏍️  [${index}/${total}] Scraping vehicle ID: ${vehicleId}`);
  
  try {
    const response = await makeRequest(url);
    
    if (response.statusCode !== 200) {
      throw new Error(`HTTP ${response.statusCode}`);
    }
    
    const vehicle = parseVehicleData(response.data, vehicleId);
    
    console.log(`   ✅ ${vehicle.title} - ${vehicle.price} (${vehicle.year || 'N/A'}) - ${vehicle.equipment.length} features`);
    
    return vehicle;
    
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    return null;
  }
}

// Generate filename
const generateFilename = (vehicle) => {
  let filename = vehicle.title
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase()
    .substring(0, 50);
  
  if (!filename || filename.length < 3) {
    filename = `vehicle_${vehicle.id}`;
  }
  
  const timestamp = new Date().toISOString().split('T')[0];
  return `${filename}_${vehicle.id}_${timestamp}.json`;
};

// Main scraping function
const scrapeAllVehicles = async () => {
  const outputDir = './scraped_vehicles_complete';
  createDirectory(outputDir);
  
  console.log(`\n🚀 Starting detailed scraping of all ${VEHICLE_IDS.length} vehicles...\n`);
  
  const results = [];
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < VEHICLE_IDS.length; i++) {
    const vehicleId = VEHICLE_IDS[i];
    
    try {
      const vehicle = await scrapeVehicle(vehicleId, i + 1, VEHICLE_IDS.length);
      
      if (vehicle) {
        results.push(vehicle);
        successCount++;
        
        // Save individual file
        const filename = generateFilename(vehicle);
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, JSON.stringify(vehicle, null, 2));
        console.log(`   💾 Saved: ${filename}`);
      } else {
        errorCount++;
      }
      
      // Wait between requests to be respectful
      if (i < VEHICLE_IDS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
    } catch (error) {
      console.log(`   ❌ Error processing ${vehicleId}: ${error.message}`);
      errorCount++;
    }
  }
  
  // Create summary
  const summary = {
    scraping_date: new Date().toISOString(),
    scraping_type: 'Complete detailed vehicle data',
    total_vehicles_processed: VEHICLE_IDS.length,
    successfully_scraped: successCount,
    failed: errorCount,
    output_directory: outputDir,
    vehicles: results.map(v => ({
      id: v.id,
      title: v.title,
      price: v.price,
      year: v.year,
      mileage: v.mileage,
      brand: v.brand,
      imageCount: v.imageCount,
      featuresCount: v.allFeatures ? v.allFeatures.length : 0,
      displacement: v.displacement,
      warrantyDetails: v.warrantyDetails
    }))
  };
  
  // Save files
  fs.writeFileSync(path.join(outputDir, 'all_vehicles_complete.json'), JSON.stringify(results, null, 2));
  fs.writeFileSync(path.join(outputDir, 'scraping_summary.json'), JSON.stringify(summary, null, 2));
  
  // Final summary
  console.log('\n' + '='.repeat(80));
  console.log('🎉 COMPLETE VEHICLE SCRAPING FINISHED!');
  console.log('='.repeat(80));
  console.log(`📊 Total vehicles processed: ${VEHICLE_IDS.length}`);
  console.log(`✅ Successfully scraped: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📁 Files saved in: ${outputDir}`);
  console.log(`📋 Summary: scraping_summary.json`);
  console.log(`📦 All vehicles: all_vehicles_complete.json`);
  
  // Show some examples
  if (results.length > 0) {
    console.log('\n🏍️  Sample vehicles scraped:');
    results.slice(0, 10).forEach((v, i) => {
      console.log(`   ${i + 1}. ${v.title} - ${v.price} (${v.year || 'N/A'}) - ${v.imageCount} images, ${v.allFeatures ? v.allFeatures.length : 0} features`);
    });
    
    if (results.length > 10) {
      console.log(`   ... and ${results.length - 10} more vehicles with complete data!`);
    }
  }
  
  const withImages = results.filter(v => v.imageCount > 0).length;
  const withPrices = results.filter(v => v.price !== 'Price on request').length;
  const withTitles = results.filter(v => v.title !== 'Unknown Vehicle').length;
  const withFeatures = results.filter(v => v.allFeatures && v.allFeatures.length > 0).length;
  const withWarranty = results.filter(v => v.warrantyDetails).length;
  const withDisplacement = results.filter(v => v.displacement).length;
  
  console.log('\n📊 Enhanced Data Completeness:');
  console.log(`   📝 Vehicles with proper titles: ${withTitles}/${results.length}`);
  console.log(`   💰 Vehicles with prices: ${withPrices}/${results.length}`);
  console.log(`   🖼️  Vehicles with images: ${withImages}/${results.length}`);
  console.log(`   🔧 Vehicles with equipment/features: ${withFeatures}/${results.length}`);
  console.log(`   🛡️  Vehicles with warranty info: ${withWarranty}/${results.length}`);
  console.log(`   ⚙️  Vehicles with displacement: ${withDisplacement}/${results.length}`);
  
  console.log('\n🚀 Ready to use in your React website!');
};

// Run the complete scraper
scrapeAllVehicles(); 