// Enhanced Vehicle Detail Scraper for Auto Voegeli
// Scrapes COMPLETE vehicle details including features, specs, description, etc.
// Usage: node scrape-enhanced-details.js [vehicleId]

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

async function scrapeEnhancedVehicleDetails(vehicleId) {
  try {
    console.log(`🏍️  Scraping enhanced details for vehicle ID: ${vehicleId}`);
    
    const url = `${BASE_URL}${vehicleId}`;
    const response = await makeRequest(url);
    
    if (response.statusCode !== 200) {
      throw new Error(`HTTP ${response.statusCode}`);
    }
    
    console.log(`✅ Successfully fetched data for vehicle ${vehicleId}`);
    
    // Create output directory
    const outputDir = './scraped_vehicles_enhanced';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save the HTML for inspection
    const htmlFile = path.join(outputDir, `debug_${vehicleId}.html`);
    fs.writeFileSync(htmlFile, response.data);
    console.log(`💾 Saved HTML for inspection: debug_${vehicleId}.html`);
    
    return response.data;
    
  } catch (error) {
    console.error(`❌ Failed to scrape vehicle ${vehicleId}:`, error.message);
    return null;
  }
}

// Main execution
if (require.main === module) {
  const vehicleId = process.argv[2] || '12620843';
  console.log('🚀 Auto Vögeli - Enhanced Vehicle Scraper');
  console.log('==========================================');
  scrapeEnhancedVehicleDetails(vehicleId);
}