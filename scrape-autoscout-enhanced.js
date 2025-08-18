#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Enhanced AutoScout24 Bike Scraper for Auto Vögeli
 * 
 * Scrapes all bike listings with pagination support
 * Enhanced HTML parsing and error handling
 */

const BASE_URL = 'https://www.autoscout24.ch/de/hci/v2/1124/search';
const OUTPUT_DIR = './scraped_bikes_enhanced';
const IMAGES_DIR = path.join(OUTPUT_DIR, 'images');

// Create output directories
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Helper to fetch HTML with proper headers
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
      }
    };

    https.get(url, options, (response) => {
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

// Enhanced bike data extraction
function extractBikesFromHTML(html) {
  const bikes = [];
  
  console.log(`📝 HTML length: ${html.length} characters`);
  
  // Debug: Check if we have the expected content
  if (html.includes('CHF')) {
    console.log('✅ Found CHF prices in HTML');
  } else {
    console.log('❌ No CHF prices found in HTML');
  }
  
  // Look for bike listings with different patterns
  const patterns = [
    // Pattern 1: Standard listing format
    /\* ([A-Z][^*]+?)\s+\1\s+.*?CHF ([0-9',.-]+).*?Calendar icon([^Gas]*?)Gas station icon([^Road]*?)Road icon([^Vehicle]*?)Vehicle power icon([^Transmission]*?)Transmission icon([^Consumption]*?)Consumption icon/gs,
    
    // Pattern 2: Simpler pattern for titles and prices
    /([A-Z][A-Z0-9\s]+?)\s+CHF\s+([0-9',.-]+)/g,
    
    // Pattern 3: Look for structured data
    /"title":\s*"([^"]+)".*?"price":\s*"([^"]+)"/g
  ];
  
  // Try different extraction methods
  for (let i = 0; i < patterns.length; i++) {
    console.log(`🔍 Trying extraction pattern ${i + 1}...`);
    
    const pattern = patterns[i];
    let match;
    let found = 0;
    
    while ((match = pattern.exec(html)) !== null) {
      found++;
      
      let title, price, year, mileage, power, fuel, transmission;
      
      if (i === 0) {
        // Full pattern match
        [, title, price, year, fuel, mileage, power, transmission] = match;
      } else if (i === 1) {
        // Simple title/price pattern
        [, title, price] = match;
        year = 'Unknown';
        mileage = '0 km';
        power = 'N/A';
        fuel = 'Benzin';
        transmission = 'Manual';
      } else {
        // JSON pattern
        [, title, price] = match;
        year = 'Unknown';
        mileage = '0 km';
        power = 'N/A';
        fuel = 'Benzin';
        transmission = 'Manual';
      }
      
      // Clean up extracted data
      title = title.trim().replace(/\s+/g, ' ');
      price = price.includes('CHF') ? price : `CHF ${price}`;
      
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
      
      const bike = {
        id: `auto-voegeli-${bikes.length + 1}`,
        title: title,
        price: price,
        year: year || 'Unknown',
        mileage: mileage || '0 km',
        power: power || 'N/A',
        fuel: fuel || 'Benzin',
        transmission: transmission || 'Manual',
        category: category,
        slug: slug,
        description: "Probefahrten, Besichtigungen, Finanzierung und Eintausch sind möglich, wir beraten Sie gerne!",
        dealer: "Auto Vögeli AG",
        location: "Grenchen",
        contact: "032 652 11 66",
        images: [],
        scraped_at: new Date().toISOString(),
        extraction_method: i + 1
      };
      
      bikes.push(bike);
    }
    
    console.log(`   Found ${found} matches with pattern ${i + 1}`);
    
    if (bikes.length > 0) break; // Use first successful pattern
  }
  
  // Remove duplicates based on title
  const uniqueBikes = bikes.filter((bike, index, self) => 
    index === self.findIndex(b => b.title === bike.title)
  );
  
  return uniqueBikes;
}

// Main scraping function
async function scrapeAllBikes() {
  console.log('🏍️  Starting Enhanced AutoScout24 bike scraping...');
  
  try {
    let allBikes = [];
    let page = 0;
    let maxPages = 10; // Safety limit
    
    while (page < maxPages) {
      const pageUrl = `${BASE_URL}?page=${page}`;
      console.log(`\n📄 Fetching page ${page}: ${pageUrl}`);
      
      try {
        const html = await fetchHTML(pageUrl);
        
        // Save raw HTML for debugging
        const debugFile = path.join(OUTPUT_DIR, `debug_page_${page}.html`);
        fs.writeFileSync(debugFile, html);
        console.log(`🐛 Debug: Saved HTML to ${debugFile}`);
        
        // Check for "0 Fahrzeuge" or empty results
        if (html.includes('0 Fahrzeuge') || html.includes('Keine Fahrzeuge gefunden')) {
          console.log(`📄 No vehicles found on page ${page}`);
          break;
        }
        
        const pageBikes = extractBikesFromHTML(html);
        
        if (pageBikes.length === 0) {
          console.log(`📄 No bikes extracted from page ${page}, stopping...`);
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
        console.log('⏳ Waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (pageError) {
        console.error(`❌ Failed to fetch page ${page}: ${pageError.message}`);
        break;
      }
    }
    
    console.log(`\n🎯 Total bikes found: ${allBikes.length} across ${page} pages`);
    
    if (allBikes.length === 0) {
      console.log('⚠️  No bikes found from live scraping. This might be due to:');
      console.log('   - AutoScout24 blocking requests');
      console.log('   - Changed page structure');
      console.log('   - Network issues');
      return;
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
        slug: bike.slug,
        source_page: bike.source_page
      }))
    };
    
    fs.writeFileSync(path.join(OUTPUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
    
    console.log('\n📊 Final Summary:');
    console.log(`   Total bikes: ${allBikes.length}`);
    console.log(`   Pages scraped: ${page}`);
    console.log(`   Categories: ${summary.categories.join(', ')}`);
    console.log(`   Price range: CHF ${summary.price_range.min.toLocaleString()} - CHF ${summary.price_range.max.toLocaleString()}`);
    console.log(`   Output: ${OUTPUT_DIR}`);
    
    console.log('\n🎉 Scraping completed successfully!');
    
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


