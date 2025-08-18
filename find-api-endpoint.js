const https = require('https');

// Test with vehicle ID 12613297 (ZONTES)
const vehicleId = '12613297';

console.log(`Looking for AutoScout24 API endpoints for vehicle: ${vehicleId}\n`);

// Try potential API endpoints
const apiUrls = [
  `https://www.autoscout24.ch/api/hci/v2/1124/detail/${vehicleId}`,
  `https://api.autoscout24.ch/hci/v2/1124/detail/${vehicleId}`,
  `https://www.autoscout24.ch/hci/v2/1124/api/detail/${vehicleId}`,
  `https://www.autoscout24.ch/de/hci/v2/1124/api/detail/${vehicleId}`,
  `https://api.autoscout24.ch/detail/${vehicleId}`,
  `https://api.autoscout24.ch/v2/detail/${vehicleId}`,
  `https://backend.autoscout24.ch/api/detail/${vehicleId}`
];

async function testApiEndpoint(url) {
  return new Promise((resolve) => {
    console.log(`Testing: ${url}`);
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          console.log('✅ SUCCESS! Found working API endpoint');
          console.log('Response preview:', data.substring(0, 300) + '...\n');
          
          // Check if it contains the description
          if (data.includes('699 cm³, 70 kW')) {
            console.log('🎉 FOUND DESCRIPTION DATA IN API RESPONSE!');
          }
        } else {
          console.log(`❌ Failed: ${res.statusCode}`);
        }
        console.log('-'.repeat(50));
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Error: ${err.message}`);
      console.log('-'.repeat(50));
      resolve();
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Timeout');
      console.log('-'.repeat(50));
      req.destroy();
      resolve();
    });
  });
}

async function testAllEndpoints() {
  for (const url of apiUrls) {
    await testApiEndpoint(url);
  }
  
  console.log('\nAPI endpoint testing complete.');
  console.log('If no API endpoints work, we can try extracting from Next.js data chunks.');
}

testAllEndpoints();

