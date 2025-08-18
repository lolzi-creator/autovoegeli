const https = require('https');
const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
const createDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
};

// Make HTTPS request (same as working single scraper)
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    console.log(`🔍 Fetching: ${url}`);
    
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
        console.log(`   ✅ Success: ${res.statusCode}`);
        resolve({
          statusCode: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ Request failed: ${error.message}`);
      reject(error);
    });
    
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Extract pagination info
const extractPagination = (html) => {
  console.log('📄 Analyzing pagination...');
  
  if (html.includes('1234')) {
    console.log(`   📊 Found pagination "1234" - 4 pages total`);
    return 4;
  }
  
  const vehicleCountMatch = html.match(/(\d+)\s+Fahrzeuge/);
  if (vehicleCountMatch) {
    const totalVehicles = parseInt(vehicleCountMatch[1]);
    const estimatedPages = Math.ceil(totalVehicles / 20);
    console.log(`   📊 Found ${totalVehicles} vehicles, estimating ${estimatedPages} pages`);
    return Math.min(estimatedPages, 5);
  }
  
  console.log(`   📊 No pagination found, assuming 1 page`);
  return 1;
};

// Extract vehicle data using text patterns (since the visible data from your search is in plain text)
const extractVehiclesFromText = (html) => {
  console.log('🏍️  Extracting vehicles from text patterns...');
  
  const vehicles = [];
  
  // Based on your search results, the pattern is:
  // * BRAND MODEL
  // Description text
  // CHF price.-
  // Calendar iconDate/New
  // Gas station iconFuel
  // Road iconMileage
  // etc.
  
  // Look for vehicle blocks that start with * and have detail links
  const vehicleBlocks = [];
  
  // First get all vehicle IDs
  const detailPattern = /\/de\/hci\/v2\/1124\/detail\/(\d+)/g;
  const vehicleIds = [];
  let match;
  
  while ((match = detailPattern.exec(html)) !== null) {
    const vehicleId = match[1];
    if (!vehicleIds.includes(vehicleId)) {
      vehicleIds.push(vehicleId);
    }
  }
  
  console.log(`   🎯 Found ${vehicleIds.length} vehicle IDs`);
  
  // Now extract data for each vehicle using the known patterns from your search results
  vehicleIds.forEach((vehicleId, index) => {
    console.log(`\n   🔧 Processing vehicle ${index + 1}/${vehicleIds.length}: ID ${vehicleId}`);
    
    // Find the section of HTML around this vehicle ID
    const vehicleSection = extractVehicleSection(html, vehicleId);
    
    if (vehicleSection) {
      const vehicle = parseVehicleFromSection(vehicleSection, vehicleId);
      vehicles.push(vehicle);
      console.log(`   ✅ ${vehicle.title} - ${vehicle.price} (${vehicle.year})`);
    } else {
      console.log(`   ❌ Could not find section for vehicle ${vehicleId}`);
    }
  });
  
  console.log(`\n   🎯 Successfully extracted ${vehicles.length} vehicles`);
  return vehicles;
};

// Extract the HTML section around a specific vehicle ID
const extractVehicleSection = (html, vehicleId) => {
  // Find the position of this vehicle ID
  const detailLink = `/de/hci/v2/1124/detail/${vehicleId}`;
  const linkIndex = html.indexOf(detailLink);
  
  if (linkIndex === -1) return null;
  
  // Get a reasonable section around this link (before and after)
  const sectionStart = Math.max(0, linkIndex - 1000);
  const sectionEnd = Math.min(html.length, linkIndex + 1000);
  
  return html.substring(sectionStart, sectionEnd);
};

// Parse vehicle data from a section
const parseVehicleFromSection = (section, vehicleId) => {
  const vehicle = {
    id: vehicleId,
    detailUrl: `https://www.autoscout24.ch/de/hci/v2/1124/detail/${vehicleId}`,
    dealer: 'Auto Voegeli AG',
    location: 'Grenchen, SO',
    phone: '032 652 11 66',
    scraped_at: new Date().toISOString(),
    scraped_from: 'listing_page'
  };
  
  // Extract title - look for brand names in capital letters
  const titlePatterns = [
    // Look for the main brand names from your examples
    /\*\s*(VOGE[^\n\r*]+)/i,
    /\*\s*(YAMAHA[^\n\r*]+)/i,
    /\*\s*(ZONTES[^\n\r*]+)/i,
    /\*\s*(BMW[^\n\r*]+)/i,
    /\*\s*(HARLEY-DAVIDSON[^\n\r*]+)/i,
    /\*\s*(SWM[^\n\r*]+)/i,
    /\*\s*(KOVE[^\n\r*]+)/i,
    /\*\s*(WOTTAN[^\n\r*]+)/i,
    /\*\s*(COLOVE[^\n\r*]+)/i,
    // Also try without the * if needed
    /(VOGE\s+[A-Z0-9\s]+(?=\s+VOGE|CHF|\n))/i,
    /(YAMAHA\s+[A-Z0-9\s]+(?=\s+Probefahrten|CHF|\n))/i,
    /(ZONTES\s+[^CHF\n]+(?=\s+Probefahrten|CHF|\n))/i,
    /(BMW\s+[A-Z0-9\s]+(?=\s+Probefahrten|CHF|\n))/i,
    /(HARLEY-DAVIDSON\s+[A-Z0-9\s]+(?=\s+Probefahrten|CHF|\n))/i,
    /(SWM\s+[A-Z0-9\s]+(?=\s+Probefahrten|CHF|\n))/i,
    /(KOVE\s+[A-Z0-9\s]+(?=\s+Probefahrten|CHF|\n))/i,
    /(WOTTAN\s+[A-Z0-9\s]+(?=\s+Probefahrten|CHF|\n))/i,
    /(COLOVE\s+[A-Z0-9\s]+(?=\s+Probefahrten|CHF|\n))/i
  ];
  
  let titleFound = false;
  for (const pattern of titlePatterns) {
    const match = section.match(pattern);
    if (match && match[1]) {
      vehicle.title = match[1].trim().replace(/\s+/g, ' ');
      titleFound = true;
      break;
    }
  }
  
  if (!titleFound) {
    vehicle.title = `Vehicle ${vehicleId}`;
  }
  
  // Extract price - look for CHF patterns
  const pricePatterns = [
    /CHF\s*([\d']+)\.-?/,
    /CHF\s*([\d,]+)\.-?/
  ];
  
  let priceFound = false;
  for (const pattern of pricePatterns) {
    const match = section.match(pattern);
    if (match && match[1]) {
      vehicle.price = `CHF ${match[1]}.-`;
      vehicle.priceNumber = parseInt(match[1].replace(/[',]/g, ''));
      priceFound = true;
      break;
    }
  }
  
  if (!priceFound) {
    vehicle.price = 'Price on request';
    vehicle.priceNumber = 0;
  }
  
  // Extract year/date - look for date patterns and "Neues Fahrzeug"
  const yearPatterns = [
    /(Neues Fahrzeug)/,
    /(\d{2}\.\d{4})/,  // 05.2016
    /(\d{4})/          // Just year
  ];
  
  let yearFound = false;
  for (const pattern of yearPatterns) {
    const match = section.match(pattern);
    if (match) {
      if (match[1] === 'Neues Fahrzeug') {
        vehicle.year = '2024';
      } else {
        vehicle.year = match[1];
      }
      yearFound = true;
      break;
    }
  }
  
  if (!yearFound) {
    vehicle.year = 'Unknown';
  }
  
  // Extract mileage - look for km patterns
  const mileagePatterns = [
    /([\d']+)\s*km(?!\w)/,  // Make sure it's not part of another word
    /([\d,]+)\s*km(?!\w)/
  ];
  
  let mileageFound = false;
  for (const pattern of mileagePatterns) {
    const matches = section.match(new RegExp(pattern.source, 'g'));
    if (matches) {
      // Get the most reasonable mileage (not too small, not coordinates)
      for (const match of matches) {
        const mileageMatch = match.match(pattern);
        if (mileageMatch && mileageMatch[1]) {
          const kmValue = parseInt(mileageMatch[1].replace(/[',]/g, ''));
          // Filter out unreasonable values (coordinates, small numbers)
          if (kmValue >= 10 && kmValue <= 500000) {
            vehicle.mileage = `${mileageMatch[1]} km`;
            vehicle.mileageNumber = kmValue;
            mileageFound = true;
            break;
          }
        }
      }
      if (mileageFound) break;
    }
  }
  
  if (!mileageFound) {
    vehicle.mileage = 'Unknown';
    vehicle.mileageNumber = 0;
  }
  
  // Extract other basic information
  vehicle.fuel = section.match(/(Benzin|Elektro|Diesel)/)?.[1] || 'Benzin';
  vehicle.transmission = section.match(/(Schaltgetriebe manuell|Automat|Stufenlos)/)?.[1] || 'Unknown';
  
  // Extract power if available
  const powerMatch = section.match(/(\d+\s*PS\s*\([^)]+\))/);
  vehicle.power = powerMatch ? powerMatch[1] : 'Unknown';
  
  vehicle.type = 'Motorcycle';
  vehicle.fahrzeugbeschreibung = 'Probefahrten, Besichtigungen, Finanzierung und Eintausch sind möglich, wir beraten Sie gerne!';
  
  return vehicle;
};

// Generate filename from vehicle data
const generateFilename = (vehicle) => {
  let filename = vehicle.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
  
  if (!filename || filename.length < 3) {
    filename = `vehicle_${vehicle.id}`;
  }
  
  const date = new Date().toISOString().split('T')[0];
  return `${filename}_${vehicle.id}_${date}.json`;
};

// Main scraping function
const scrapeListingsImproved = async () => {
  console.log('🚀 Starting Auto Vögeli listing scraping (IMPROVED VERSION)...\n');
  
  const baseUrl = 'https://www.autoscout24.ch/de/hci/v2/1124/search';
  const outputDir = './scraped_vehicles_improved';
  
  // Create output directory
  createDirectory(outputDir);
  
  let allVehicles = [];
  
  try {
    // Step 1: Get first page to determine pagination
    console.log('📊 Step 1: Analyzing first page...');
    const firstPageResponse = await makeRequest(baseUrl);
    
    if (firstPageResponse.statusCode !== 200) {
      throw new Error(`Failed to access listing page: HTTP ${firstPageResponse.statusCode}`);
    }
    
    const totalPages = extractPagination(firstPageResponse.data);
    console.log(`\n📈 Total pages to scrape: ${totalPages}\n`);
    
    // Step 2: Scrape all pages
    for (let page = 0; page < totalPages; page++) {
      const pageUrl = `${baseUrl}?page=${page}`;
      console.log(`\n📄 Scraping page ${page + 1}/${totalPages}...`);
      console.log(`🔗 URL: ${pageUrl}`);
      
      try {
        const pageResponse = await makeRequest(pageUrl);
        
        if (pageResponse.statusCode !== 200) {
          console.log(`   ❌ Failed to load page ${page + 1}: HTTP ${pageResponse.statusCode}`);
          continue;
        }
        
        // Extract vehicles using improved text parsing
        const pageVehicles = extractVehiclesFromText(pageResponse.data);
        
        // Add page info and save files
        pageVehicles.forEach(vehicle => {
          vehicle.scraped_from_page = page;
          
          // Save individual file
          const filename = generateFilename(vehicle);
          const filepath = path.join(outputDir, filename);
          fs.writeFileSync(filepath, JSON.stringify(vehicle, null, 2));
          console.log(`   💾 Saved: ${filename}`);
        });
        
        allVehicles = allVehicles.concat(pageVehicles);
        console.log(`\n   📋 Page ${page + 1}: ${pageVehicles.length} vehicles processed`);
        
        // Wait between pages
        if (page < totalPages - 1) {
          console.log('   ⏳ Waiting 2 seconds...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.log(`   ❌ Error processing page ${page + 1}: ${error.message}`);
      }
    }
    
    // Step 3: Create summary files
    console.log('\n📋 Creating summary files...');
    
    const summary = {
      scraping_date: new Date().toISOString(),
      scraping_type: 'Improved listing extraction with correct titles and prices',
      total_pages_scraped: totalPages,
      total_vehicles_found: allVehicles.length,
      output_directory: outputDir,
      vehicles: allVehicles.map(v => ({
        id: v.id,
        title: v.title,
        price: v.price,
        year: v.year,
        mileage: v.mileage,
        page: (v.scraped_from_page || 0) + 1
      }))
    };
    
    // Save files
    fs.writeFileSync(path.join(outputDir, 'scraping_summary.json'), JSON.stringify(summary, null, 2));
    fs.writeFileSync(path.join(outputDir, 'all_vehicles.json'), JSON.stringify(allVehicles, null, 2));
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 IMPROVED LISTING SCRAPING COMPLETE!');
    console.log('='.repeat(60));
    console.log(`📊 Total pages scraped: ${totalPages}`);
    console.log(`✅ Total vehicles found: ${allVehicles.length}`);
    console.log(`📁 Individual files: ${outputDir}/`);
    console.log(`📋 Summary: scraping_summary.json`);
    console.log(`📦 All vehicles: all_vehicles.json`);
    console.log(`⏱️  Completed: ${new Date().toLocaleString()}`);
    
    // Show examples with better info
    if (allVehicles.length > 0) {
      console.log('\n🏍️  Sample vehicles found:');
      allVehicles.slice(0, 10).forEach((v, i) => {
        console.log(`   ${i + 1}. ${v.title} - ${v.price} (${v.year}) - ${v.mileage}`);
      });
      
      if (allVehicles.length > 10) {
        console.log(`   ... and ${allVehicles.length - 10} more vehicles`);
      }
    }
    
    // Show some stats
    const withPrices = allVehicles.filter(v => v.price !== 'Price on request').length;
    const withTitles = allVehicles.filter(v => !v.title.startsWith('Vehicle ')).length;
    const withMileage = allVehicles.filter(v => v.mileage !== 'Unknown').length;
    
    console.log('\n📊 Data quality stats:');
    console.log(`   💰 Vehicles with prices: ${withPrices}/${allVehicles.length}`);
    console.log(`   📝 Vehicles with titles: ${withTitles}/${allVehicles.length}`);
    console.log(`   🛣️  Vehicles with mileage: ${withMileage}/${allVehicles.length}`);
    
  } catch (error) {
    console.log(`\n❌ Scraping failed: ${error.message}`);
    console.log(error.stack);
  }
};

// Run the scraper
scrapeListingsImproved(); 