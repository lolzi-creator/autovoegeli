// Test the fixed scraper functions
const https = require('https');

// Test specific vehicle ID
const vehicleId = '12613297';
const url = `https://www.autoscout24.ch/de/hci/v2/1124/detail/${vehicleId}`;

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
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    });

    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

async function testScraper() {
  console.log('🧪 Testing Fixed Scraper for ZONTES 703 RR');
  console.log('==========================================');
  
  try {
    const response = await makeRequest(url);
    
    if (response.statusCode !== 200) {
      throw new Error(`HTTP ${response.statusCode}`);
    }
    
    const html = response.data;
    
    // Test Equipment Extraction
    console.log('\n🔧 Equipment Detection:');
    const equipment = [
      'Beheizbare Griffe',
      'Bluetooth-Schnittstelle', 
      'Aluminiumfelgen',
      'Navigation',
      'LED-Scheinwerfer',
      'ABS',
      'Schlüsselloser Zugang'
    ];
    
    equipment.forEach(item => {
      const found = html.toLowerCase().includes(item.toLowerCase());
      console.log(`   ${found ? '✅' : '❌'} ${item}: ${found}`);
    });
    
    // Test Description Patterns
    console.log('\n📝 Description Patterns:');
    const descPatterns = [
      { pattern: '699 cm³, 70 kW', test: html.includes('699 cm³, 70 kW') },
      { pattern: 'Zontes 703RR', test: html.includes('Zontes 703RR') },
      { pattern: 'kraftvollem', test: html.includes('kraftvollem') },
      { pattern: 'Dreizylinder', test: html.includes('Dreizylinder') },
      { pattern: 'Ride-by-Wire', test: html.includes('Ride-by-Wire') },
      { pattern: 'TFT-Display', test: html.includes('TFT-Display') }
    ];
    
    descPatterns.forEach(({ pattern, test }) => {
      console.log(`   ${test ? '✅' : '❌'} ${pattern}: ${test}`);
    });
    
    // Test Warranty Patterns
    console.log('\n🛡️  Warranty Patterns:');
    const warrantyPatterns = [
      { pattern: '36 Monate', test: html.includes('36 Monate') },
      { pattern: 'WERKSGARANTIE', test: html.includes('WERKSGARANTIE') },
      { pattern: 'Ab 1. Inverkehrsetzung', test: html.includes('Ab 1. Inverkehrsetzung') }
    ];
    
    warrantyPatterns.forEach(({ pattern, test }) => {
      console.log(`   ${test ? '✅' : '❌'} ${pattern}: ${test}`);
    });
    
    console.log('\n🎯 Pattern Analysis Complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testScraper();



