// Single Vehicle Scraper for Auto Voegeli
// Interactive script: Enter vehicle ID → Get complete vehicle data + images
// Usage: node scrape-single-vehicle.js

const https = require('https');
const fs = require('fs');
const readline = require('readline');

console.log('🏍️ Auto Vögeli - Single Vehicle Scraper');
console.log('========================================');
console.log('Enter a vehicle ID from your AutoScout24 HCI system');
console.log('Example: 12620843 (from URL: .../detail/12620843)');
console.log('');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'de-CH,de;q=0.9,en;q=0.8',
        'Referer': 'https://www.autoscout24.ch/de/hci/v2/1124/search',
        'Cache-Control': 'no-cache'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
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

function extractVehicleImages(html, vehicleId) {
  console.log('🖼️  Extracting vehicle images...');
  
  const images = [];
  
  // Look for image patterns that are specifically vehicle photos
  // AutoScout24 usually stores images with specific patterns
  const imagePatterns = [
    // AutoScout24 image CDN patterns
    /https:\/\/[^"'\s]*autoscout24[^"'\s]*\.(?:jpg|jpeg|png|webp)/gi,
    // Vehicle gallery images
    /https:\/\/[^"'\s]*vehicle[^"'\s]*\.(?:jpg|jpeg|png|webp)/gi,
    // Car/motorcycle specific image URLs
    /https:\/\/[^"'\s]*(?:car|motor|bike|vehicle)[^"'\s]*\.(?:jpg|jpeg|png|webp)/gi,
    // Generic high-quality image URLs (likely vehicle photos)
    /https:\/\/[^"'\s]*images?[^"'\s]*\.(?:jpg|jpeg|png|webp)/gi
  ];
  
  // Extract images using patterns
  imagePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const imageUrl = match[0];
      if (imageUrl && !images.includes(imageUrl)) {
        // Filter out obvious non-vehicle images
        if (!imageUrl.includes('logo') && 
            !imageUrl.includes('icon') && 
            !imageUrl.includes('flag') &&
            !imageUrl.includes('background') &&
            !imageUrl.includes('ui') &&
            imageUrl.length > 20) { // Reasonable URL length
          images.push(imageUrl);
        }
      }
    }
  });
  
  // Look for image filenames that might contain the vehicle ID
  const vehicleSpecificImages = images.filter(url => 
    url.includes(vehicleId) || 
    url.includes('vehicle') || 
    url.includes('autoscout24')
  );
  
  // If we found vehicle-specific images, use those; otherwise use all filtered images
  const finalImages = vehicleSpecificImages.length > 0 ? vehicleSpecificImages : images;
  
  // Limit to reasonable number and remove duplicates
  const uniqueImages = [...new Set(finalImages)].slice(0, 10);
  
  console.log(`   Found ${uniqueImages.length} vehicle images`);
  
  return uniqueImages;
}

function parseVehicleData(html, vehicleId) {
  console.log('🔍 Parsing vehicle data...');
  
  const vehicle = {
    id: vehicleId,
    url: `https://www.autoscout24.ch/de/hci/v2/1124/detail/${vehicleId}`,
    scraped_at: new Date().toISOString(),
    dealer: 'Auto Voegeli AG'
  };

  // Extract title - look for the main heading
  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) || 
                    html.match(/alt="([^"]*YAMAHA[^"]*)"/) ||
                    html.match(/YAMAHA [A-Z0-9\s]+/i);
  
  if (titleMatch) {
    vehicle.title = titleMatch[1] ? titleMatch[1].trim() : titleMatch[0].trim();
    vehicle.title = vehicle.title.replace(/^#\s*/, ''); // Remove markdown header
  } else {
    vehicle.title = 'Unknown Vehicle';
  }

  // Extract price - simple and direct
  console.log('🔍 Looking for price...');
  let priceText = '';
  
  // Look for price in the right sidebar where it appears
  const priceMatch = html.match(/<p[^>]*css-qyqqmk[^>]*>([^<]+)<\/p>/i) ||
                    html.match(/CHF\s*([\d']+)\s*\.-?/i) ||
                    html.match(/>CHF\s*([\d']+)\.-?</i);
  
  if (priceMatch) {
    priceText = priceMatch[1] || priceMatch[0];
    priceText = priceText.replace('CHF', '').replace('.-', '').trim();
    vehicle.price = `CHF ${priceText}.-`;
    vehicle.priceNumber = parseInt(priceText.replace(/'/g, ''));
    console.log(`   ✅ Found price: ${vehicle.price}`);
  } else {
    vehicle.price = 'Price on request';
    vehicle.priceNumber = 0;
    console.log('   ❌ No price found');
  }

  // Extract year and month - look for date pattern
  const dateMatch = html.match(/(\d{2})\.(\d{4})/);
  if (dateMatch) {
    vehicle.month = dateMatch[1];
    vehicle.year = dateMatch[2];
    vehicle.date = `${dateMatch[1]}.${dateMatch[2]}`;
  }

  // Extract mileage - simple and direct
  console.log('🔍 Looking for mileage...');
  const mileageMatch = html.match(/>(\d{1,3}(?:'?\d{3})*)\s*km</i) ||
                      html.match(/(\d{1,6})\s*km/i);
  
  if (mileageMatch) {
    const mileageText = mileageMatch[1];
    vehicle.mileage = `${mileageText} km`;
    vehicle.mileageNumber = parseInt(mileageText.replace(/'/g, ''));
    console.log(`   ✅ Found mileage: ${vehicle.mileage}`);
  } else {
    vehicle.mileage = 'Unknown';
    vehicle.mileageNumber = 0;
    console.log('   ❌ No mileage found');
  }

  // Extract ALL vehicle specifications from Fahrzeugdaten section
  vehicle.type = html.match(/(Naked bike|Tourer|Sportler|Enduro|Chopper|Scooter|Supersport)/i)?.[1] || 'Motorcycle';
  vehicle.transmission = html.match(/(Schaltgetriebe manuell|Automatik|Stufenlos)/i)?.[1] || 'Schaltgetriebe manuell';
  vehicle.fuel = html.match(/(Benzin|Elektro|Diesel|Hybrid)/i)?.[1] || 'Benzin';
  vehicle.drive = html.match(/(Kette|Riemen|Kardanwelle)/i)?.[1] || 'Kette';
  
  // Extract Vehicle power (if available)
  const powerMatch = html.match(/Vehicle power icon\\-\s*([^<\n]+)/i) || 
                    html.match(/(\d+\s*kW)/i) ||
                    html.match(/(\d+\s*PS)/i);
  vehicle.power = powerMatch ? powerMatch[1].trim() : '-';
  
  // Extract Consumption (if available)
  const consumptionMatch = html.match(/Consumption icon\\-\s*([^<\n]+)/i) ||
                          html.match(/(\d+[.,]\d+\s*l\/100km)/i);
  vehicle.consumption = consumptionMatch ? consumptionMatch[1].trim() : '-';

  // Extract contact information
  const phoneMatches = html.match(/(\d{3}\s\d{3}\s\d{2}\s\d{2})/g) || [];
  vehicle.phones = phoneMatches;
  vehicle.primaryPhone = phoneMatches[0] || '032 652 11 66';
  
  // Extract WhatsApp number specifically
  const whatsappMatch = html.match(/(\d{3}\s\d{3}\s\d{2}\s\d{2})\s*•\s*WhatsApp/i);
  vehicle.whatsappPhone = whatsappMatch ? whatsappMatch[1] : null;
  
  // Extract business phone specifically
  const businessMatch = html.match(/(\d{3}\s\d{3}\s\d{2}\s\d{2})\s*•\s*Geschäft/i);
  vehicle.businessPhone = businessMatch ? businessMatch[1] : null;

  // Extract location
  const locationMatch = html.match(/(Solothurnstrasse\s+\d+,\s*\d{4}\s+Grenchen)/i) ||
                       html.match(/([^<]+,\s*\d{4}\s+[^<\n]+)/i);
  vehicle.location = locationMatch ? locationMatch[1].trim() : 'Solothurnstrasse 129, 2540 Grenchen';

  // Extract extras/features
  const extrasList = [];
  if (html.includes('Neu bereift')) extrasList.push('Neu bereift');
  if (html.includes('ABS')) extrasList.push('ABS');
  if (html.includes('Windschutz')) extrasList.push('Windschutz');
  if (html.includes('LED')) extrasList.push('LED');
  vehicle.extras = extrasList;

  // Extract MFK (Motorfahrzeugkontrolle)
  vehicle.mfk = html.includes('Ab MFK') && html.includes('Ja') ? 'Ja' : 'Unbekannt';

  // Extract Garantie (Warranty) - more detailed
  vehicle.warranty = html.includes('Garantie') && html.includes('Ja') ? 'Ja' : 'Nein';
  
  // Extract warranty details (Ab Übernahme, X Monate)
  const warrantyDetailsMatch = html.match(/Ab Übernahme,\s*(\d+\s*Monate)/i);
  if (warrantyDetailsMatch) {
    vehicle.warrantyDetails = `Ab Übernahme, ${warrantyDetailsMatch[1]}`;
    vehicle.warrantyMonths = warrantyDetailsMatch[1];
  }
  
  // Extract Occ.Garantie if mentioned
  vehicle.occGarantie = html.includes('Occ.Garantie') ? 'Ja' : 'Nein';

  // Extract Fahrzeugbeschreibung (Vehicle Description) - COMPLETE EXTRACTION
  let fahrzeugbeschreibung = '';
  let headline = '';
  let description = '';
  
  // Extract the headline (Yamaha MT-09A – Der kompromisslose Streetfighter mit Charakter)
  const headlinePatterns = [
    /Yamaha\s+MT-09A\s*–\s*Der\s+kompromisslose\s+Streetfighter\s+mit\s+Charakter/i,
    /([A-Z][^–]*–[^<\n]*Streetfighter[^<\n]*)/i,
    /(Yamaha\s+MT-\d+[A-Z]*[^–]*–[^<\n]+)/i
  ];
  
  for (const pattern of headlinePatterns) {
    const match = html.match(pattern);
    if (match) {
      headline = match[0] || match[1];
      break;
    }
  }
  
  // Extract the full description paragraph
  const fullDescPatterns = [
    /Die\s+Yamaha\s+MT-09A\s+überzeugt\s+mit\s+purer\s+Fahrfreude[^<]+/i,
    /Die\s+Yamaha\s+MT-\d+[A-Z]*[^<]+agiler\s+Performance[^<]+/i,
    /purer\s+Fahrfreude,\s*agiler\s+Performance[^<]+/i
  ];
  
  for (const pattern of fullDescPatterns) {
    const match = html.match(pattern);
    if (match) {
      description = match[0];
      break;
    }
  }
  
  // Also get the basic description we had before as fallback
  const basicDescPatterns = [
    /<p[^>]*>([^<]*Probefahrten[^<]*)<\/p>/i,
    />(Probefahrten,\s*Besichtigungen,\s*Finanzierung\s*und\s*Eintausch\s*sind\s*möglich[^<]*)</,
    /Probefahrten,\s*Besichtigungen,\s*Finanzierung\s*und\s*Eintausch\s*sind\s*möglich,\s*wir\s*beraten\s*Sie\s*gerne!?/i
  ];
  
  let basicDesc = '';
  for (const pattern of basicDescPatterns) {
    const match = html.match(pattern);
    if (match && match[1] && match[1].trim().length > 10) {
      basicDesc = match[1].trim();
      break;
    }
  }
  
  if (!basicDesc && html.includes('Probefahrten')) {
    basicDesc = 'Probefahrten, Besichtigungen, Finanzierung und Eintausch sind möglich, wir beraten Sie gerne!';
  }
  
  // Combine all descriptions
  if (headline && description) {
    fahrzeugbeschreibung = `${headline}\n\n${description}\n\n${basicDesc}`;
  } else if (headline) {
    fahrzeugbeschreibung = `${headline}\n\n${basicDesc}`;
  } else if (description) {
    fahrzeugbeschreibung = `${description}\n\n${basicDesc}`;
  } else {
    fahrzeugbeschreibung = basicDesc || 'Keine Beschreibung verfügbar';
  }
  
  vehicle.fahrzeugbeschreibung = fahrzeugbeschreibung;
  vehicle.headline = headline;
  vehicle.description = description;

  // Extract brand and model from title
  const brandMatch = vehicle.title.match(/^(YAMAHA|VOGE|BMW|HARLEY-DAVIDSON|ZONTES|SWM|KOVE|TRIUMPH|DUCATI|KAWASAKI|SUZUKI|HONDA)/i);
  vehicle.brand = brandMatch ? brandMatch[1].toUpperCase() : 'Unknown';
  vehicle.model = vehicle.title.replace(new RegExp(`^${vehicle.brand}\\s*`, 'i'), '').trim();

  // Determine condition
  vehicle.condition = vehicle.year && parseInt(vehicle.year) >= new Date().getFullYear() ? 'Neu' : 'Gebraucht';

  // Extract images
  vehicle.images = extractVehicleImages(html, vehicleId);
  vehicle.imageCount = vehicle.images.length;
  
  // Extract total image count from page (e.g. "1 / 10" or "+4 Bilder")
  const totalImagesMatch = html.match(/1\s*\/\s*(\d+)/i) || html.match(/\+(\d+)\s+Bilder/i);
  if (totalImagesMatch) {
    vehicle.totalImagesOnPage = parseInt(totalImagesMatch[1]) + (html.match(/\+(\d+)/) ? 1 : 0);
  }

  console.log(`   ✅ ${vehicle.title} - ${vehicle.price} (${vehicle.year})`);
  
  return vehicle;
}

async function scrapeVehicle(vehicleId) {
  const url = `https://www.autoscout24.ch/de/hci/v2/1124/detail/${vehicleId}`;
  
  console.log(`\n📡 Scraping vehicle ID: ${vehicleId}`);
  console.log(`🔗 URL: ${url}\n`);
  
  try {
    const response = await makeRequest(url);
    
    if (response.statusCode !== 200) {
      throw new Error(`HTTP ${response.statusCode}: Vehicle not found or access denied`);
    }
    
    // Parse the vehicle data
    const vehicle = parseVehicleData(response.data, vehicleId);
    
    // Save the results with motorcycle name
    const safeName = vehicle.title
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .toLowerCase(); // Make lowercase
    
    const timestamp = new Date().toISOString().split('T')[0]; // Just date
    const filename = `${safeName}_${vehicleId}_${timestamp}.json`;
    
    // Save JSON data
    fs.writeFileSync(filename, JSON.stringify(vehicle, null, 2));
    
    console.log(`💾 Saved to: ${filename}\n`);
    
    // Display clean JSON output
    console.log('📋 EXTRACTED VEHICLE DATA (JSON):');
    console.log('=================================');
    console.log(JSON.stringify(vehicle, null, 2));
    
    console.log('\n🚀 SUCCESS! Ready to use in your React components!');
    
    return vehicle;
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    
    if (error.message.includes('404')) {
      console.log('💡 TIP: Check if the vehicle ID is correct');
    } else if (error.message.includes('403')) {
      console.log('💡 TIP: AutoScout24 might be blocking requests');
    } else if (error.message.includes('timeout')) {
      console.log('💡 TIP: Try again - network might be slow');
    }
    
    return null;
  }
}

// Interactive input
function askForVehicleId() {
  rl.question('🔢 Enter vehicle ID (or "quit" to exit): ', async (input) => {
    const vehicleId = input.trim();
    
    if (vehicleId.toLowerCase() === 'quit' || vehicleId.toLowerCase() === 'exit') {
      console.log('\n👋 Goodbye!');
      rl.close();
      return;
    }
    
    if (!/^\d+$/.test(vehicleId)) {
      console.log('❌ Please enter a valid numeric vehicle ID (e.g., 12620843)');
      askForVehicleId();
      return;
    }
    
    // Scrape the vehicle
    await scrapeVehicle(vehicleId);
    
    console.log('\n' + '='.repeat(60));
    askForVehicleId();
  });
}

// Start the interactive session
askForVehicleId(); 