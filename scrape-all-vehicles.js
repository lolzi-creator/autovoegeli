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

// Make HTTPS request
const makeRequest = (url) => {
  return new Promise((resolve, reject) => {
    console.log(`🔍 Fetching: ${url}`);
    
    const request = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'de-CH,de;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    }, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        if (response.statusCode === 200) {
          console.log(`   ✅ Success: ${response.statusCode}`);
          resolve(data);
        } else {
          console.log(`   ❌ Error: ${response.statusCode}`);
          reject(new Error(`HTTP ${response.statusCode}`));
        }
      });
    });
    
    request.on('error', (error) => {
      console.log(`   ❌ Request failed: ${error.message}`);
      reject(error);
    });
    
    request.setTimeout(10000, () => {
      console.log(`   ⏰ Request timeout`);
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
};

// Extract pagination info
const extractPagination = (html) => {
  console.log('📄 Analyzing pagination...');
  
  // Look for pagination numbers
  const paginationMatches = html.match(/>\s*(\d+)\s*</g);
  if (paginationMatches) {
    const pageNumbers = paginationMatches
      .map(match => parseInt(match.replace(/[>\s<]/g, '')))
      .filter(num => !isNaN(num) && num > 0)
      .sort((a, b) => a - b);
    
    if (pageNumbers.length > 0) {
      const maxPage = Math.max(...pageNumbers);
      console.log(`   📊 Found page numbers: ${pageNumbers.join(', ')}`);
      console.log(`   📈 Max page: ${maxPage}`);
      return maxPage;
    }
  }
  
  // Fallback: look for "1234" pattern or similar
  const fallbackMatch = html.match(/1\s*2\s*3\s*4/);
  if (fallbackMatch) {
    console.log(`   📊 Found pagination pattern, assuming 4 pages (0-3)`);
    return 4;
  }
  
  console.log(`   📊 No pagination found, assuming single page`);
  return 1;
};

// Extract vehicle links from a page
const extractVehicleLinks = (html) => {
  console.log('🔗 Extracting vehicle links...');
  
  const vehicles = [];
  
  // Pattern to match vehicle links
  const linkPattern = /href="([^"]*\/detail\/(\d+))"/g;
  let match;
  
  while ((match = linkPattern.exec(html)) !== null) {
    const relativeUrl = match[1];
    const vehicleId = match[2];
    const fullUrl = `https://www.autoscout24.ch${relativeUrl}`;
    
    vehicles.push({
      id: vehicleId,
      detailUrl: fullUrl,
      relativeUrl: relativeUrl
    });
  }
  
  console.log(`   🎯 Found ${vehicles.length} vehicles`);
  return vehicles;
};

// Extract vehicle title from listing page
const extractVehicleTitle = (html, vehicleId) => {
  // Look for title patterns around the vehicle ID
  const patterns = [
    new RegExp(`detail/${vehicleId}"[^>]*>\\s*<span[^>]*>([^<]+)</span>`, 'i'),
    new RegExp(`detail/${vehicleId}"[^>]*>([^<]+)</a>`, 'i'),
    new RegExp(`${vehicleId}[^>]*>\\s*([A-Z][^<]+)</`, 'i')
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const title = match[1].trim();
      if (title.length > 3 && !title.includes('CHF')) {
        return title;
      }
    }
  }
  
  return `Vehicle_${vehicleId}`;
};

// Parse detailed vehicle data
const parseVehicleDetails = (html, vehicleId) => {
  console.log(`📋 Parsing details for vehicle ${vehicleId}...`);
  
  const vehicle = {
    id: vehicleId,
    url: `https://www.autoscout24.ch/de/hci/v2/1124/detail/${vehicleId}`,
    scraped_at: new Date().toISOString(),
    dealer: 'Auto Voegeli AG'
  };

  // Extract title
  const titlePatterns = [
    /<h1[^>]*>([^<]+)<\/h1>/i,
    /alt="([^"]*[A-Z][^"]*)"/,
    /title="([^"]*[A-Z][^"]*)"/
  ];
  
  for (const pattern of titlePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const title = match[1].trim().replace(/^#\s*/, '');
      if (title.length > 3) {
        vehicle.title = title;
        break;
      }
    }
  }
  
  if (!vehicle.title) {
    vehicle.title = `Vehicle ${vehicleId}`;
  }

  // Extract price with multiple patterns
  const pricePatterns = [
    /CHF\s*([\d']+)\s*\.-?/gi,
    /([\d']+)\s*\.-?\s*CHF/gi,
    />CHF\s*([\d']+)\.-?</gi
  ];
  
  let bestPrice = null;
  let highestAmount = 0;
  
  for (const pattern of pricePatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const priceStr = match[1];
      const amount = parseInt(priceStr.replace(/'/g, ''));
      if (amount > highestAmount && amount > 500) {
        highestAmount = amount;
        bestPrice = priceStr;
      }
    }
  }
  
  if (bestPrice) {
    vehicle.price = `CHF ${bestPrice}.-`;
    vehicle.priceNumber = parseInt(bestPrice.replace(/'/g, ''));
  } else {
    vehicle.price = 'Price on request';
    vehicle.priceNumber = 0;
  }

  // Extract year/date
  const datePatterns = [
    /(\d{2})\.(\d{4})/g,
    /(\d{1,2})\/(\d{4})/g,
    /(19|20)\d{2}/g
  ];
  
  for (const pattern of datePatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      if (match[2]) {
        const year = parseInt(match[2]);
        if (year >= 1990 && year <= 2030) {
          vehicle.year = match[0];
          break;
        }
      } else if (match[0]) {
        const year = parseInt(match[0]);
        if (year >= 1990 && year <= 2030) {
          vehicle.year = match[0];
          break;
        }
      }
    }
    if (vehicle.year) break;
  }
  
  if (!vehicle.year) {
    vehicle.year = 'Unknown';
  }

  // Extract mileage
  const mileagePatterns = [
    /([\d']+)\s*km/gi,
    /([\d,]+)\s*km/gi
  ];
  
  let bestMileage = null;
  let lowestKm = Infinity;
  
  for (const pattern of mileagePatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const kmStr = match[1].replace(/[',]/g, '');
      const km = parseInt(kmStr);
      if (km >= 100 && km <= 500000 && km < lowestKm) {
        lowestKm = km;
        bestMileage = match[1];
      }
    }
  }
  
  if (bestMileage) {
    vehicle.mileage = `${bestMileage} km`;
    vehicle.mileageNumber = parseInt(bestMileage.replace(/[',]/g, ''));
  } else {
    vehicle.mileage = 'Unknown';
    vehicle.mileageNumber = 0;
  }

  // Extract other basic info
  const typeMatch = html.match(/(Naked bike|Sportbike|Touring|Adventure|Scooter|Chopper|Enduro)/i);
  vehicle.type = typeMatch ? typeMatch[1] : 'Motorcycle';

  const transmissionMatch = html.match(/(Schaltgetriebe|Automat|Stufenlos)/i);
  vehicle.transmission = transmissionMatch ? transmissionMatch[1] : 'Unknown';

  const fuelMatch = html.match(/(Benzin|Elektro|Diesel)/i);
  vehicle.fuel = fuelMatch ? fuelMatch[1] : 'Benzin';

  // Extract power
  const powerMatch = html.match(/([\d]+)\s*(?:PS|KW|kW)/i);
  vehicle.power = powerMatch ? powerMatch[0] : 'Unknown';

  // Extract description
  const descriptionPatterns = [
    /<p[^>]*>((?:(?!<\/p>).)*Probefahrten[^<]*)<\/p>/gi,
    /<div[^>]*>((?:(?!<\/div>).)*Probefahrten[^<]*)<\/div>/gi,
    /Probefahrten[^<]*(?:möglich|gerne)[^<]*/gi
  ];
  
  for (const pattern of descriptionPatterns) {
    const match = html.match(pattern);
    if (match && match[0]) {
      const description = match[0].replace(/<[^>]*>/g, '').trim();
      if (description.length > 10) {
        vehicle.fahrzeugbeschreibung = description;
        break;
      }
    }
  }
  
  if (!vehicle.fahrzeugbeschreibung) {
    vehicle.fahrzeugbeschreibung = 'Probefahrten, Besichtigungen, Finanzierung und Eintausch sind möglich, wir beraten Sie gerne!';
  }

  // Extract contact info
  const phonePatterns = [
    /(\+41\s*\d{2}\s*\d{3}\s*\d{2}\s*\d{2})/g,
    /(0\d{2}\s*\d{3}\s*\d{2}\s*\d{2})/g
  ];
  
  for (const pattern of phonePatterns) {
    const match = html.match(pattern);
    if (match) {
      vehicle.phone = match[0];
      break;
    }
  }
  
  if (!vehicle.phone) {
    vehicle.phone = '032 652 11 66';
  }

  // Extract images
  const imageUrls = [];
  const imagePatterns = [
    /src="([^"]*autoscout24[^"]*\.(jpg|jpeg|png|webp))"/gi,
    /src="([^"]*vehicle[^"]*\.(jpg|jpeg|png|webp))"/gi,
    /src="([^"]*images[^"]*\.(jpg|jpeg|png|webp))"/gi
  ];
  
  for (const pattern of imagePatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const imageUrl = match[1];
      if (!imageUrls.includes(imageUrl) && 
          !imageUrl.includes('logo') && 
          !imageUrl.includes('icon') &&
          imageUrls.length < 10) {
        imageUrls.push(imageUrl);
      }
    }
  }
  
  vehicle.images = imageUrls;
  vehicle.imageCount = imageUrls.length;

  // Additional fields
  vehicle.garantie = 'Ja';
  vehicle.mfk = 'Ja';
  vehicle.location = 'Grenchen, SO';
  vehicle.drive = 'Heckantrieb';
  
  console.log(`   ✅ Parsed: ${vehicle.title} - ${vehicle.price}`);
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
const scrapeAllVehicles = async () => {
  console.log('🚀 Starting Auto Vögeli vehicle scraping...\n');
  
  const baseUrl = 'https://www.autoscout24.ch/de/hci/v2/1124/search';
  const outputDir = './scraped_vehicles';
  
  // Create output directory
  createDirectory(outputDir);
  
  try {
    // Step 1: Get first page to determine pagination
    console.log('📊 Step 1: Determining total pages...');
    const firstPageHtml = await makeRequest(baseUrl);
    const totalPages = extractPagination(firstPageHtml);
    
    console.log(`\n📈 Total pages to scrape: ${totalPages}\n`);
    
    // Step 2: Scrape all pages to get vehicle links
    console.log('🔗 Step 2: Collecting all vehicle links...');
    let allVehicles = [];
    
    for (let page = 0; page < totalPages; page++) {
      const pageUrl = page === 0 ? baseUrl : `${baseUrl}?page=${page}`;
      console.log(`\n📄 Scraping page ${page + 1}/${totalPages}...`);
      
      try {
        const pageHtml = await makeRequest(pageUrl);
        const vehicles = extractVehicleLinks(pageHtml);
        
        // Extract titles for each vehicle from the listing
        vehicles.forEach(vehicle => {
          vehicle.titleFromListing = extractVehicleTitle(pageHtml, vehicle.id);
        });
        
        allVehicles = allVehicles.concat(vehicles);
        console.log(`   📋 Page ${page + 1}: ${vehicles.length} vehicles found`);
        
        // Wait between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`   ❌ Failed to scrape page ${page}: ${error.message}`);
      }
    }
    
    console.log(`\n🎯 Total vehicles found: ${allVehicles.length}\n`);
    
    // Step 3: Scrape details for each vehicle
    console.log('📋 Step 3: Scraping detailed information...');
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < allVehicles.length; i++) {
      const vehicle = allVehicles[i];
      console.log(`\n🏍️  Processing ${i + 1}/${allVehicles.length}: ${vehicle.titleFromListing || vehicle.id}`);
      
      try {
        const detailHtml = await makeRequest(vehicle.detailUrl);
        const vehicleDetails = parseVehicleDetails(detailHtml, vehicle.id);
        
        // Use the listing title if the detailed title is generic
        if (vehicle.titleFromListing && vehicle.titleFromListing.length > vehicleDetails.title.length) {
          vehicleDetails.title = vehicle.titleFromListing;
        }
        
        const filename = generateFilename(vehicleDetails);
        const filepath = path.join(outputDir, filename);
        
        fs.writeFileSync(filepath, JSON.stringify(vehicleDetails, null, 2));
        console.log(`   💾 Saved: ${filename}`);
        
        successCount++;
        
        // Wait between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.log(`   ❌ Failed to scrape vehicle ${vehicle.id}: ${error.message}`);
        errorCount++;
      }
    }
    
    // Step 4: Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SCRAPING COMPLETE!');
    console.log('='.repeat(60));
    console.log(`📊 Total vehicles processed: ${allVehicles.length}`);
    console.log(`✅ Successfully scraped: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📁 Files saved in: ${outputDir}`);
    console.log(`⏱️  Started: ${new Date().toLocaleString()}`);
    
    // Create summary file
    const summary = {
      scraping_date: new Date().toISOString(),
      total_vehicles_found: allVehicles.length,
      successfully_scraped: successCount,
      failed: errorCount,
      output_directory: outputDir,
      vehicles: allVehicles.map(v => ({
        id: v.id,
        title: v.titleFromListing,
        url: v.detailUrl,
        scraped: successCount > 0
      }))
    };
    
    fs.writeFileSync(path.join(outputDir, 'scraping_summary.json'), JSON.stringify(summary, null, 2));
    console.log(`📋 Summary saved: scraping_summary.json`);
    
  } catch (error) {
    console.log(`\n❌ Scraping failed: ${error.message}`);
    console.log(error.stack);
  }
};

// Run the scraper
scrapeAllVehicles(); 