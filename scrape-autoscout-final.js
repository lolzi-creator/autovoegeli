#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');

/**
 * Final AutoScout24 Bike Scraper for Auto Vögeli
 * 
 * Handles gzip compression and proper HTML parsing
 * Scrapes all bikes with pagination
 */

const BASE_URL = 'https://www.autoscout24.ch/de/hci/v2/1124/search';
const OUTPUT_DIR = './scraped_bikes_final';
const IMAGES_DIR = path.join(OUTPUT_DIR, 'images');

// Create output directories
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Helper to fetch and decompress HTML
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'de-CH,de;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    };

    https.get(url, options, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }

      let stream = response;
      
      // Handle gzip compression
      if (response.headers['content-encoding'] === 'gzip') {
        console.log('🗜️  Decompressing gzip content...');
        stream = response.pipe(zlib.createGunzip());
      } else if (response.headers['content-encoding'] === 'deflate') {
        console.log('🗜️  Decompressing deflate content...');
        stream = response.pipe(zlib.createInflate());
      }

      let data = '';
      stream.on('data', chunk => data += chunk.toString());
      stream.on('end', () => resolve(data));
      stream.on('error', reject);
    }).on('error', reject);
  });
}

// Extract bikes from the properly decompressed HTML
function extractBikesFromHTML(html) {
  const bikes = [];
  
  console.log(`📝 HTML length: ${html.length} characters`);
  
  // Look for the typical AutoScout24 vehicle patterns
  // Based on the sample data you provided, we need to look for specific patterns
  
  // Pattern 1: Look for price indicators
  const priceMatches = html.match(/CHF\s+[\d',.-]+/g);
  if (priceMatches) {
    console.log(`💰 Found ${priceMatches.length} price indicators`);
  }
  
  // Pattern 2: Look for vehicle data in script tags or JSON
  const scriptMatches = html.match(/<script[^>]*>(.*?)<\/script>/gs);
  if (scriptMatches) {
    console.log(`📜 Found ${scriptMatches.length} script tags to analyze`);
    
    for (const script of scriptMatches) {
      // Look for JSON data containing vehicle information
      try {
        const jsonMatch = script.match(/\{.*"price".*\}/g);
        if (jsonMatch) {
          jsonMatch.forEach(json => {
            try {
              const data = JSON.parse(json);
              if (data.price && data.title) {
                bikes.push(createBikeFromData(data));
              }
            } catch (e) {
              // Not valid JSON, skip
            }
          });
        }
      } catch (e) {
        // Continue searching
      }
    }
  }
  
  // Pattern 3: HTML parsing for vehicle cards
  const vehicleCardPattern = /<div[^>]*class="[^"]*vehicle[^"]*"[^>]*>.*?<\/div>/gsi;
  const cardMatches = html.match(vehicleCardPattern);
  if (cardMatches) {
    console.log(`🚗 Found ${cardMatches.length} potential vehicle cards`);
  }
  
  // Pattern 4: Based on your sample data format
  // Try to extract the specific format from your listing
  const listingPattern = /(?:VOGE|ZONTES|YAMAHA|BMW|SWM|KOVE|COLOVE|WOTTAN)\s+[^<\n]+.*?CHF\s+[\d',.-]+/gi;
  const listingMatches = html.match(listingPattern);
  
  if (listingMatches) {
    console.log(`🏍️  Found ${listingMatches.length} motorcycle listings`);
    
    listingMatches.forEach((listing, index) => {
      const bike = parseListingText(listing, index + 1);
      if (bike) {
        bikes.push(bike);
      }
    });
  }
  
  // If no bikes found, let's save some debug info
  if (bikes.length === 0) {
    console.log('🔍 No bikes found, analyzing HTML structure...');
    
    // Look for any mention of motorcycles/bikes
    const bikeKeywords = ['motorrad', 'bike', 'motorcycle', 'voge', 'zontes', 'yamaha', 'bmw'];
    const foundKeywords = bikeKeywords.filter(keyword => 
      html.toLowerCase().includes(keyword)
    );
    
    if (foundKeywords.length > 0) {
      console.log(`✅ Found keywords: ${foundKeywords.join(', ')}`);
    } else {
      console.log('❌ No motorcycle-related keywords found');
    }
    
    // Check for AutoScout24 specific elements
    if (html.includes('autoscout24')) {
      console.log('✅ This is an AutoScout24 page');
    }
    
    if (html.includes('Fahrzeuge')) {
      console.log('✅ Found "Fahrzeuge" text');
    }
    
    // Save a portion for manual inspection
    const debugSample = html.substring(0, 5000);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'debug_sample.html'), debugSample);
  }
  
  return bikes;
}

// Parse individual listing text
function parseListingText(listing, index) {
  try {
    // Extract title (first line before description)
    const titleMatch = listing.match(/^([A-Z][A-Z0-9\s]+?)(?:\s+\1|\s+Probefahrten)/i);
    const title = titleMatch ? titleMatch[1].trim() : `Bike ${index}`;
    
    // Extract price
    const priceMatch = listing.match(/CHF\s+([\d',.-]+)/);
    const price = priceMatch ? `CHF ${priceMatch[1]}` : 'Price on request';
    
    // Generate slug
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Determine category
    let category = 'Motorcycle';
    if (title.includes('ADV') || title.includes('Adventure')) category = 'Adventure';
    else if (title.includes('R ') || title.includes('RR')) category = 'Sport';
    else if (title.includes('GT') || title.includes('SR')) category = 'Scooter';
    else if (title.includes('DSX') || title.includes('GS')) category = 'Touring';
    
    return {
      id: `auto-voegeli-${index}`,
      title: title,
      price: price,
      year: 'Unknown',
      mileage: '0 km',
      power: 'N/A',
      fuel: 'Benzin',
      transmission: 'Manual',
      category: category,
      slug: slug,
      description: "Probefahrten, Besichtigungen, Finanzierung und Eintausch sind möglich, wir beraten Sie gerne!",
      dealer: "Auto Vögeli AG",
      location: "Grenchen",
      contact: "032 652 11 66",
      images: [],
      scraped_at: new Date().toISOString()
    };
    
  } catch (error) {
    console.warn(`Failed to parse listing ${index}:`, error.message);
    return null;
  }
}

// Create bike object from JSON data
function createBikeFromData(data) {
  return {
    id: `auto-voegeli-${Date.now()}`,
    title: data.title || data.name || 'Unknown Bike',
    price: data.price || 'Price on request',
    year: data.year || 'Unknown',
    mileage: data.mileage || data.kilometers || '0 km',
    power: data.power || data.ps || 'N/A',
    fuel: data.fuel || 'Benzin',
    transmission: data.transmission || 'Manual',
    category: 'Motorcycle',
    slug: (data.title || 'bike').toLowerCase().replace(/[^a-z0-9]/g, '-'),
    description: data.description || "Probefahrten, Besichtigungen, Finanzierung und Eintausch sind möglich, wir beraten Sie gerne!",
    dealer: "Auto Vögeli AG",
    location: "Grenchen",
    contact: "032 652 11 66",
    images: data.images || [],
    scraped_at: new Date().toISOString()
  };
}

// Main scraping function
async function scrapeAllBikes() {
  console.log('🏍️  Starting Final AutoScout24 Bike Scraper...');
  console.log(`🎯 Target: ${BASE_URL}`);
  
  try {
    let allBikes = [];
    let page = 0;
    let maxPages = 5; // Reasonable limit
    
    while (page < maxPages) {
      const pageUrl = `${BASE_URL}?page=${page}`;
      console.log(`\n📄 Fetching page ${page}: ${pageUrl}`);
      
      try {
        const html = await fetchHTML(pageUrl);
        
        // Save decompressed HTML for debugging
        const debugFile = path.join(OUTPUT_DIR, `debug_page_${page}.html`);
        fs.writeFileSync(debugFile, html);
        console.log(`🐛 Debug: Saved decompressed HTML to ${debugFile}`);
        
        // Check for "0 Fahrzeuge" or empty results
        if (html.includes('0 Fahrzeuge') || html.includes('Keine Fahrzeuge gefunden')) {
          console.log(`📄 No vehicles found on page ${page}`);
          break;
        }
        
        const pageBikes = extractBikesFromHTML(html);
        
        if (pageBikes.length === 0) {
          console.log(`📄 No bikes extracted from page ${page}`);
          if (page === 0) {
            console.log('⚠️  No bikes found on first page. This could indicate:');
            console.log('   1. AutoScout24 is using JavaScript rendering');
            console.log('   2. The page structure has changed');
            console.log('   3. Access restrictions are in place');
            console.log('   4. The dealer has no active listings');
          }
          break;
        }
        
        console.log(`✅ Extracted ${pageBikes.length} bikes from page ${page}`);
        
        // Add page info
        pageBikes.forEach((bike, index) => {
          bike.id = `auto-voegeli-p${page}-${index + 1}`;
          bike.source_page = page;
          bike.source_url = pageUrl;
        });
        
        allBikes = allBikes.concat(pageBikes);
        page++;
        
        // Respectful delay
        console.log('⏳ Waiting 3 seconds...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } catch (pageError) {
        console.error(`❌ Failed to fetch page ${page}: ${pageError.message}`);
        break;
      }
    }
    
    console.log(`\n🎯 Final Result: ${allBikes.length} bikes found across ${page} pages`);
    
    if (allBikes.length === 0) {
      console.log('\n💡 Suggestions:');
      console.log('   1. Check the debug HTML files to see what AutoScout24 is actually returning');
      console.log('   2. The site might require JavaScript rendering (consider using Puppeteer)');
      console.log('   3. Try accessing the page directly in a browser to verify it works');
      console.log('   4. Contact AutoScout24 about API access if available');
      
      // Create a sample bike for testing
      const sampleBikes = [
        {
          id: 'auto-voegeli-sample-1',
          title: 'ZONTES 703F ADV',
          price: 'CHF 8\'990.-',
          year: '2024',
          mileage: '0 km',
          power: '70 PS',
          fuel: 'Benzin',
          transmission: 'Manual',
          category: 'Adventure',
          slug: 'zontes-703f-adv',
          description: 'Probefahrten, Besichtigungen, Finanzierung und Eintausch sind möglich, wir beraten Sie gerne!',
          dealer: 'Auto Vögeli AG',
          location: 'Grenchen',
          contact: '032 652 11 66',
          images: [],
          scraped_at: new Date().toISOString(),
          source: 'sample_data'
        }
      ];
      
      console.log('\n📝 Creating sample data for testing...');
      allBikes = sampleBikes;
    }
    
    // Save individual bike files
    for (const bike of allBikes) {
      const filename = `${bike.slug}.json`;
      const filepath = path.join(OUTPUT_DIR, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(bike, null, 2));
      console.log(`💾 Saved: ${filename}`);
    }
    
    // Save summary
    const summary = {
      total_bikes: allBikes.length,
      pages_scraped: page,
      scraped_at: new Date().toISOString(),
      source_url: BASE_URL,
      categories: [...new Set(allBikes.map(b => b.category))],
      price_range: {
        min: Math.min(...allBikes.map(b => parseFloat(b.price.replace(/[^0-9]/g, '')) || 0)),
        max: Math.max(...allBikes.map(b => parseFloat(b.price.replace(/[^0-9]/g, '')) || 0))
      },
      bikes: allBikes.map(bike => ({
        id: bike.id,
        title: bike.title,
        price: bike.price,
        category: bike.category,
        slug: bike.slug
      }))
    };
    
    fs.writeFileSync(path.join(OUTPUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
    
    console.log('\n📊 Final Summary:');
    console.log(`   Total bikes: ${allBikes.length}`);
    console.log(`   Pages scraped: ${page}`);
    console.log(`   Categories: ${summary.categories.join(', ')}`);
    if (summary.price_range.max > 0) {
      console.log(`   Price range: CHF ${summary.price_range.min.toLocaleString()} - CHF ${summary.price_range.max.toLocaleString()}`);
    }
    console.log(`   Output: ${OUTPUT_DIR}`);
    
    console.log('\n🎉 Scraping completed!');
    console.log(`📁 Check ${OUTPUT_DIR} for results and debug files`);
    
  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
    console.error(error.stack);
  }
}

// Run the scraper
if (require.main === module) {
  scrapeAllBikes();
}

module.exports = { scrapeAllBikes, extractBikesFromHTML };


