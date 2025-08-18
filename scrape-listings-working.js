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

// Make HTTPS request (using same method as working single scraper)
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

// Extract pagination info (simplified)
const extractPagination = (html) => {
  console.log('📄 Analyzing pagination...');
  
  // Look for "1234" pattern which indicates 4 pages (0,1,2,3)
  if (html.includes('1234')) {
    console.log(`   📊 Found pagination "1234" - 4 pages total`);
    return 4;
  }
  
  // Look for "70 Fahrzeuge" and estimate pages (assuming ~20 per page)
  const vehicleCountMatch = html.match(/(\d+)\s+Fahrzeuge/);
  if (vehicleCountMatch) {
    const totalVehicles = parseInt(vehicleCountMatch[1]);
    const estimatedPages = Math.ceil(totalVehicles / 20);
    console.log(`   📊 Found ${totalVehicles} vehicles, estimating ${estimatedPages} pages`);
    return Math.min(estimatedPages, 5); // Cap at 5 pages for safety
  }
  
  console.log(`   📊 No pagination found, assuming 1 page`);
  return 1;
};

// Extract vehicle IDs from page (look for detail links)
const extractVehicleIds = (html) => {
  console.log('🔗 Extracting vehicle IDs...');
  
  const vehicleIds = [];
  
  // Look for detail links pattern: /de/hci/v2/1124/detail/12345678
  const detailLinkPattern = /\/de\/hci\/v2\/1124\/detail\/(\d+)/g;
  let match;
  
  while ((match = detailLinkPattern.exec(html)) !== null) {
    const vehicleId = match[1];
    if (!vehicleIds.includes(vehicleId)) {
      vehicleIds.push(vehicleId);
    }
  }
  
  console.log(`   🎯 Found ${vehicleIds.length} unique vehicle IDs`);
  return vehicleIds;
};

// Simple vehicle data extraction from listing content
const extractBasicVehicleInfo = (html, vehicleId) => {
  console.log(`📋 Extracting basic info for vehicle ${vehicleId}...`);
  
  // Create a section around this vehicle ID for context-specific extraction
  const vehiclePattern = new RegExp(`([\\s\\S]*?)\/detail\/${vehicleId}([\\s\\S]{0,500})`, 'i');
  const vehicleMatch = html.match(vehiclePattern);
  
  let context = vehicleMatch ? vehicleMatch[0] + vehicleMatch[2] : html;
  
  const vehicle = {
    id: vehicleId,
    detailUrl: `https://www.autoscout24.ch/de/hci/v2/1124/detail/${vehicleId}`,
    dealer: 'Auto Voegeli AG',
    location: 'Grenchen, SO',
    phone: '032 652 11 66',
    scraped_at: new Date().toISOString(),
    scraped_from: 'listing_page'
  };
  
  // Extract title - look for brand names near the vehicle ID
  const titlePatterns = [
    new RegExp(`(VOGE[^\\n]*?)(?=.*${vehicleId})`, 'i'),
    new RegExp(`(YAMAHA[^\\n]*?)(?=.*${vehicleId})`, 'i'),
    new RegExp(`(ZONTES[^\\n]*?)(?=.*${vehicleId})`, 'i'),
    new RegExp(`(BMW[^\\n]*?)(?=.*${vehicleId})`, 'i'),
    new RegExp(`(HARLEY-DAVIDSON[^\\n]*?)(?=.*${vehicleId})`, 'i'),
    new RegExp(`(SWM[^\\n]*?)(?=.*${vehicleId})`, 'i'),
    new RegExp(`(KOVE[^\\n]*?)(?=.*${vehicleId})`, 'i'),
    new RegExp(`(WOTTAN[^\\n]*?)(?=.*${vehicleId})`, 'i'),
    new RegExp(`(COLOVE[^\\n]*?)(?=.*${vehicleId})`, 'i')
  ];
  
  for (const pattern of titlePatterns) {
    const match = context.match(pattern);
    if (match && match[1]) {
      vehicle.title = match[1].trim().replace(/\s+/g, ' ');
      break;
    }
  }
  
  if (!vehicle.title) {
    vehicle.title = `Vehicle ${vehicleId}`;
  }
  
  // Extract price - look for CHF pattern near vehicle ID
  const pricePattern = new RegExp(`CHF\\s*([\\d']+)\\.-?(?=[\\s\\S]{0,200}${vehicleId}|${vehicleId}[\\s\\S]{0,200})`, 'i');
  const priceMatch = context.match(pricePattern) || html.match(/CHF\s*([\d']+)\.-?/);
  
  if (priceMatch) {
    vehicle.price = `CHF ${priceMatch[1]}.-`;
    vehicle.priceNumber = parseInt(priceMatch[1].replace(/'/g, ''));
  } else {
    vehicle.price = 'Price on request';
    vehicle.priceNumber = 0;
  }
  
  // Extract year
  const yearPatterns = [
    /(\d{2}\.\d{4})/,  // 05.2016
    /(Neues Fahrzeug)/,  // New vehicle
  ];
  
  for (const pattern of yearPatterns) {
    const match = context.match(pattern);
    if (match) {
      if (match[1] === 'Neues Fahrzeug') {
        vehicle.year = '2024';
      } else {
        vehicle.year = match[1];
      }
      break;
    }
  }
  
  if (!vehicle.year) {
    vehicle.year = 'Unknown';
  }
  
  // Extract mileage
  const mileageMatch = context.match(/([\d']+)\s*km/) || html.match(/([\d']+)\s*km/);
  if (mileageMatch) {
    vehicle.mileage = `${mileageMatch[1]} km`;
    vehicle.mileageNumber = parseInt(mileageMatch[1].replace(/'/g, ''));
  } else {
    vehicle.mileage = 'Unknown';
    vehicle.mileageNumber = 0;
  }
  
  // Basic extraction for other fields
  vehicle.fuel = context.match(/(Benzin|Elektro|Diesel)/)?.[1] || 'Benzin';
  vehicle.transmission = context.match(/(Schaltgetriebe manuell|Automat|Stufenlos)/)?.[1] || 'Unknown';
  vehicle.power = context.match(/(\d+\s*PS\s*\([^)]+\))/)?.[1] || 'Unknown';
  vehicle.type = 'Motorcycle';
  vehicle.fahrzeugbeschreibung = 'Probefahrten, Besichtigungen, Finanzierung und Eintausch sind möglich, wir beraten Sie gerne!';
  
  console.log(`   ✅ ${vehicle.title} - ${vehicle.price} (${vehicle.year})`);
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
const scrapeListings = async () => {
  console.log('🚀 Starting Auto Vögeli listing scraping (WORKING VERSION)...\n');
  
  const baseUrl = 'https://www.autoscout24.ch/de/hci/v2/1124/search';
  const outputDir = './scraped_vehicles_working';
  
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
        
        // Extract vehicle IDs from this page
        const vehicleIds = extractVehicleIds(pageResponse.data);
        console.log(`   🎯 Found ${vehicleIds.length} vehicles on page ${page + 1}`);
        
        // Extract basic info for each vehicle
        const pageVehicles = [];
        for (const vehicleId of vehicleIds) {
          const vehicle = extractBasicVehicleInfo(pageResponse.data, vehicleId);
          vehicle.scraped_from_page = page;
          pageVehicles.push(vehicle);
          
          // Save individual file
          const filename = generateFilename(vehicle);
          const filepath = path.join(outputDir, filename);
          fs.writeFileSync(filepath, JSON.stringify(vehicle, null, 2));
          console.log(`   💾 Saved: ${filename}`);
        }
        
        allVehicles = allVehicles.concat(pageVehicles);
        console.log(`   📋 Page ${page + 1}: ${pageVehicles.length} vehicles processed`);
        
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
      scraping_type: 'Basic listing extraction',
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
    console.log('🎉 LISTING SCRAPING COMPLETE!');
    console.log('='.repeat(60));
    console.log(`📊 Total pages scraped: ${totalPages}`);
    console.log(`✅ Total vehicles found: ${allVehicles.length}`);
    console.log(`📁 Individual files: ${outputDir}/`);
    console.log(`📋 Summary: scraping_summary.json`);
    console.log(`📦 All vehicles: all_vehicles.json`);
    console.log(`⏱️  Completed: ${new Date().toLocaleString()}`);
    
    // Show examples
    if (allVehicles.length > 0) {
      console.log('\n🏍️  Sample vehicles found:');
      allVehicles.slice(0, 5).forEach((v, i) => {
        console.log(`   ${i + 1}. ${v.title} - ${v.price} (${v.year})`);
      });
      
      if (allVehicles.length > 5) {
        console.log(`   ... and ${allVehicles.length - 5} more vehicles`);
      }
    }
    
  } catch (error) {
    console.log(`\n❌ Scraping failed: ${error.message}`);
    console.log(error.stack);
  }
};

// Run the scraper
scrapeListings(); 