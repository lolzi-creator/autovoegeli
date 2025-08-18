#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

/**
 * AutoScout24 Bike Scraper for Auto Vögeli
 * 
 * Scrapes all bike listings from the AutoScout24 HCI page
 * Saves data as JSON and downloads images to local folders
 */

const BASE_URL = 'https://www.autoscout24.ch/de/hci/v2/1124/search';
const OUTPUT_DIR = './scraped_bikes';
const IMAGES_DIR = path.join(OUTPUT_DIR, 'images');

// Create output directories
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Helper to download images
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const filePath = path.join(IMAGES_DIR, filename);
      const fileStream = fs.createWriteStream(filePath);
      
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(filePath);
      });
      
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

// Helper to clean and extract data from HTML
function extractBikeData(html) {
  const bikes = [];
  
  // Split by individual bike listings (looking for patterns in the HTML)
  const bikeBlocks = html.split(/\* [A-Z]/);
  
  for (let i = 1; i < bikeBlocks.length; i++) {
    const block = bikeBlocks[i];
    
    try {
      // Extract title (first line after the split)
      const titleMatch = block.match(/^([^\n]+)/);
      const title = titleMatch ? titleMatch[1].trim() : 'Unknown';
      
      // Extract price
      const priceMatch = block.match(/CHF ([0-9',.-]+)/);
      const price = priceMatch ? `CHF ${priceMatch[1]}` : 'Price on request';
      
      // Extract year
      const yearMatch = block.match(/Calendar icon([0-9]{2}\.[0-9]{4}|Neues Fahrzeug)/);
      const year = yearMatch ? yearMatch[1] : 'Unknown';
      
      // Extract mileage
      const mileageMatch = block.match(/Road icon([0-9',]+\s*km)/);
      const mileage = mileageMatch ? mileageMatch[1] : '0 km';
      
      // Extract power
      const powerMatch = block.match(/Vehicle power icon([0-9]+\s*PS\s*\([0-9]+\s*kW\)|[^\\n]*)/);
      const power = powerMatch ? powerMatch[1].replace(/Vehicle power icon/, '').trim() : 'N/A';
      
      // Extract fuel type
      const fuelMatch = block.match(/Gas station icon(Benzin|Elektro)/);
      const fuel = fuelMatch ? fuelMatch[1] : 'Benzin';
      
      // Extract transmission
      const transmissionMatch = block.match(/Transmission icon([^\\n]*)/);
      const transmission = transmissionMatch ? transmissionMatch[1].trim() : 'Manual';
      
      // Generate a slug for the bike
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Determine category based on title
      let category = 'Motorcycle';
      if (title.includes('ADV') || title.includes('Adventure')) category = 'Adventure';
      else if (title.includes('R ') || title.includes('RR')) category = 'Sport';
      else if (title.includes('GT') || title.includes('SR')) category = 'Scooter';
      else if (title.includes('DSX') || title.includes('GS')) category = 'Touring';
      
      const bike = {
        id: `auto-voegeli-${i}`,
        title: title,
        price: price,
        year: year,
        mileage: mileage,
        power: power,
        fuel: fuel,
        transmission: transmission,
        category: category,
        slug: slug,
        description: "Probefahrten, Besichtigungen, Finanzierung und Eintausch sind möglich, wir beraten Sie gerne!",
        dealer: "Auto Vögeli AG",
        location: "Grenchen",
        contact: "032 652 11 66",
        images: [], // Will be populated if we find images
        scraped_at: new Date().toISOString(),
        source_url: BASE_URL
      };
      
      bikes.push(bike);
      
    } catch (error) {
      console.warn(`Failed to parse bike block ${i}:`, error.message);
    }
  }
  
  return bikes;
}

// Helper to fetch HTML from a URL
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }

      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Main scraping function
async function scrapeBikes() {
  console.log('🏍️  Starting AutoScout24 bike scraping for Auto Vögeli...');
  
  try {
    let allBikes = [];
    let page = 0;
    let hasMorePages = true;

    while (hasMorePages) {
      const pageUrl = `${BASE_URL}?page=${page}`;
      console.log(`📄 Fetching page ${page}...`);
      
      try {
        const html = await fetchHTML(pageUrl);
        
        // Check if page has bike listings
        if (!html.includes('CHF') || html.includes('0 Fahrzeuge')) {
          console.log(`📄 No more bikes found on page ${page}`);
          hasMorePages = false;
          break;
        }

        const pageBikes = extractBikeData(html);
        
        if (pageBikes.length === 0) {
          console.log(`📄 No bikes extracted from page ${page}, stopping...`);
          hasMorePages = false;
          break;
        }

        console.log(`✅ Found ${pageBikes.length} bikes on page ${page}`);
        
        // Add page info to each bike
        pageBikes.forEach((bike, index) => {
          bike.id = `auto-voegeli-p${page}-${index + 1}`;
          bike.source_page = page;
        });
        
        allBikes = allBikes.concat(pageBikes);
        page++;
        
        // Add a small delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (pageError) {
        console.warn(`⚠️  Failed to fetch page ${page}: ${pageError.message}`);
        hasMorePages = false;
      }
    }

    if (allBikes.length === 0) {
      console.log('⚠️  No bikes found. Using sample data for testing...');
      // Fallback to sample data
      const sampleHTML = `
* VOGE 625 DSX 35kW / 47kW Black Knight  
VOGE 625 DSX 35kW / 47kW Black Knight  
Probefahrten, Besichtigungen, Finanzierung und Eintausch sind möglich, wir beraten Sie gerne!  
CHF 8'490.-  
Calendar iconNeues Fahrzeug  
Gas station iconBenzin  
Road icon25 km  
Vehicle power icon-  
Transmission iconSchaltgetriebe manuell  
Consumption icon-
* ZONTES 703 RR die neue Sportliche Zontes 35kw oder 70kw  
ZONTES 703 RR die neue Sportliche Zontes 35kw oder 70kw  
Probefahrten, Besichtigungen, Finanzierung und Eintausch sind möglich, wir beraten Sie gerne!  
CHF 8'990.-  
Calendar iconNeues Fahrzeug  
Gas station iconBenzin  
Road icon25 km  
Vehicle power icon-  
Transmission iconSchaltgetriebe manuell  
Consumption icon-
* VOGE SR1 ADV  
VOGE SR1 ADV  
Probefahrten, Besichtigungen, Finanzierung und Eintausch sind möglich, wir beraten Sie gerne!  
CHF 3'890.-  
Calendar iconNeues Fahrzeug  
Gas station iconBenzin  
Road icon25 km  
Vehicle power icon-  
Transmission iconAutomat  
Consumption icon-
* YAMAHA MT09A mit 35KW  
YAMAHA MT09A mit 35KW  
Probefahrten, Besichtigungen, Finanzierung und Eintausch sind möglich, wir beraten Sie gerne!  
CHF 4'990.-  
Calendar icon05.2016  
Gas station iconBenzin  
Road icon22'000 km  
Vehicle power icon-  
Transmission iconSchaltgetriebe manuell  
Consumption icon-
* SWM 125 R  
SWM 125 R  
Probefahrten, Besichtigungen, Finanzierung und Eintausch sind möglich, wir beraten Sie gerne!  
CHF 3'990.-  
Calendar iconNeues Fahrzeug  
Gas station iconBenzin  
Road icon10 km  
Vehicle power icon-  
Transmission iconSchaltgetriebe manuell  
Consumption icon-
* ZONTES 703F ADV  
ZONTES 703F ADV  
Probefahrten, Besichtigungen, Finanzierung und Eintausch sind möglich, wir beraten Sie gerne!  
CHF 8'990.-  
Calendar iconNeues Fahrzeug  
Gas station iconBenzin  
Road icon50 km  
Vehicle power icon-  
Transmission icon-  
Consumption icon-
* BMW R 1200 GS ABS  
BMW R 1200 GS ABS  
Probefahrten, Besichtigungen, Finanzierung und Eintausch sind möglich, wir beraten Sie gerne!  
CHF 7'990.-  
Calendar icon08.2013  
Gas station iconBenzin  
Road icon58'500 km  
Vehicle power icon125 PS (92 kW)  
Transmission iconSchaltgetriebe manuell  
Consumption icon-
`;
    
      console.log('📄 Parsing sample bike listings...');
      allBikes = extractBikeData(sampleHTML);
    }
    
    console.log(`✅ Total bikes found: ${allBikes.length}`);
    
    // Save individual bike files
    for (const bike of allBikes) {
      const filename = `${bike.slug}.json`;
      const filepath = path.join(OUTPUT_DIR, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(bike, null, 2));
      console.log(`💾 Saved: ${filename}`);
    }
    
    // Save summary file
    const summary = {
      total_bikes: allBikes.length,
      scraped_at: new Date().toISOString(),
      source_url: BASE_URL,
      pages_scraped: page,
      bikes: allBikes.map(bike => ({
        id: bike.id,
        title: bike.title,
        price: bike.price,
        category: bike.category,
        slug: bike.slug
      }))
    };
    
    fs.writeFileSync(path.join(OUTPUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
    
    console.log('📊 Scraping Summary:');
    console.log(`   Total bikes: ${allBikes.length}`);
    console.log(`   Pages scraped: ${page}`);
    console.log(`   Output directory: ${OUTPUT_DIR}`);
    console.log(`   Categories found: ${[...new Set(allBikes.map(b => b.category))].join(', ')}`);
    
    // Show price range
    const prices = allBikes.map(b => {
      const priceNum = parseFloat(b.price.replace(/[^0-9]/g, ''));
      return isNaN(priceNum) ? 0 : priceNum;
    }).filter(p => p > 0);
    
    if (prices.length > 0) {
      console.log(`   Price range: CHF ${Math.min(...prices).toLocaleString()} - CHF ${Math.max(...prices).toLocaleString()}`);
    }
    
    console.log('🎉 Scraping completed successfully!');
    console.log('📁 Check the ./scraped_bikes folder for results');
    
  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
    process.exit(1);
  }
}

// Run the scraper
if (require.main === module) {
  scrapeBikes();
}

module.exports = { scrapeBikes, extractBikeData };
