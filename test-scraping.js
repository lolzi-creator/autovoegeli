// AutoScout24 Scraping Test Script
// Run with: node test-scraping.js

const https = require('https');
const fs = require('fs');

console.log('🔍 Testing AutoScout24 Scraping...');
console.log('=====================================\n');

// Test URLs based on your HCI config 1124
const testUrls = [
  // General AutoScout24 search to understand structure
  'https://www.autoscout24.ch/de/autos/suchen?sort=standard',
  
  // Try to find your dealer page (we'll need to determine your dealer ID)
  'https://www.autoscout24.ch/de/haendler/',
  
  // Sample vehicle listing
  'https://www.autoscout24.ch/de/d/bmw-320i-xdrive-touring'
];

// Function to make HTTP request and save response
function testRequest(url, filename) {
  return new Promise((resolve, reject) => {
    console.log(`📡 Testing: ${url}`);
    
    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'de-CH,de;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    };

    const req = https.request(url, options, (res) => {
      console.log(`📊 Status: ${res.statusCode} - ${res.statusMessage}`);
      console.log(`🔒 Headers:`, Object.keys(res.headers).join(', '));
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Save response to file
        const cleanFilename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const outputFile = `autoscout24_${cleanFilename}_${res.statusCode}.html`;
        
        fs.writeFileSync(outputFile, data);
        console.log(`💾 Saved response to: ${outputFile}`);
        console.log(`📏 Content length: ${data.length} characters\n`);
        
        // Quick analysis of the content
        const analysis = analyzeContent(data, res.statusCode);
        
        resolve({
          url,
          statusCode: res.statusCode,
          contentLength: data.length,
          filename: outputFile,
          analysis
        });
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Error: ${error.message}\n`);
      reject(error);
    });

    req.setTimeout(10000, () => {
      console.error(`⏰ Timeout for ${url}\n`);
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Analyze the response content
function analyzeContent(html, statusCode) {
  const analysis = {
    isBlocked: false,
    hasVehicleData: false,
    protectionType: null,
    vehicleCount: 0,
    findings: []
  };

  const content = html.toLowerCase();

  // Check for blocking/protection
  if (statusCode === 403 || statusCode === 429) {
    analysis.isBlocked = true;
    analysis.findings.push(`❌ HTTP ${statusCode} - Request blocked`);
  }

  if (content.includes('captcha') || content.includes('bot protection')) {
    analysis.isBlocked = true;
    analysis.protectionType = 'Captcha/Bot Protection';
    analysis.findings.push('🤖 Bot protection detected');
  }

  if (content.includes('akamai') || content.includes('security')) {
    analysis.protectionType = 'Akamai Security';
    analysis.findings.push('🛡️ Akamai protection detected');
  }

  if (content.includes('cloudflare')) {
    analysis.protectionType = 'Cloudflare';
    analysis.findings.push('☁️ Cloudflare protection detected');
  }

  // Check for vehicle data
  if (content.includes('autoscout24')) {
    analysis.findings.push('✅ AutoScout24 content detected');
  }

  if (content.includes('fahrzeug') || content.includes('auto') || content.includes('chf')) {
    analysis.hasVehicleData = true;
    analysis.findings.push('🚗 Vehicle data found');
  }

  // Count potential vehicle listings
  const priceMatches = html.match(/chf\s*[\d\.,'\s]+/gi);
  if (priceMatches) {
    analysis.vehicleCount = priceMatches.length;
    analysis.findings.push(`💰 Found ${priceMatches.length} price mentions`);
  }

  // Look for HCI widget
  if (content.includes('hci-container') || content.includes('hci.current.js')) {
    analysis.findings.push('🎯 HCI widget detected!');
  }

  return analysis;
}

// Main test function
async function runScrapingTest() {
  const results = [];
  
  console.log('🎯 Your HCI Configuration:');
  console.log('- Config ID: 1124');
  console.log('- Language: German (de)');
  console.log('- Entry Point: search');
  console.log('- Widget: <div class="hci-container" data-config-id="1124" data-language="de" data-entry-point="search"></div>\n');

  for (let i = 0; i < testUrls.length; i++) {
    try {
      const url = testUrls[i];
      const filename = `test_${i + 1}`;
      
      const result = await testRequest(url, filename);
      results.push(result);
      
      // Wait between requests to avoid rate limiting
      if (i < testUrls.length - 1) {
        console.log('⏳ Waiting 2 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`Failed to test ${testUrls[i]}: ${error.message}\n`);
    }
  }

  // Generate summary report
  const report = generateReport(results);
  
  // Save report to file
  fs.writeFileSync('autoscout24_scraping_report.json', JSON.stringify(report, null, 2));
  
  console.log('📋 SCRAPING TEST SUMMARY');
  console.log('========================');
  console.log(`✅ Successful requests: ${results.filter(r => r.statusCode === 200).length}`);
  console.log(`❌ Blocked requests: ${results.filter(r => r.analysis.isBlocked).length}`);
  console.log(`🚗 Pages with vehicle data: ${results.filter(r => r.analysis.hasVehicleData).length}`);
  console.log(`💾 Report saved to: autoscout24_scraping_report.json\n`);

  // Next steps recommendations
  console.log('🚀 RECOMMENDED NEXT STEPS:');
  console.log('==========================');
  
  const hasBlocking = results.some(r => r.analysis.isBlocked);
  
  if (hasBlocking) {
    console.log('❗ Anti-bot protection detected. Consider:');
    console.log('1. Using a scraping service like ScrapingBee or Apify');
    console.log('2. Browser automation with Puppeteer + proxies');
    console.log('3. Sticking with the HCI widget for now');
  } else {
    console.log('✅ No major blocking detected. You can:');
    console.log('1. Build a simple scraper with proper headers');
    console.log('2. Use cheerio to parse the HTML');
    console.log('3. Set up scheduled scraping every 24 hours');
  }
  
  console.log('\n💡 To find your dealer URL:');
  console.log('1. Check your AutoScout24 dealer dashboard');
  console.log('2. Look for your dealer profile link');
  console.log('3. It should be like: autoscout24.ch/de/haendler/[YOUR-ID]');
  console.log('4. Contact AutoScout24 support with HCI config 1124');
  
  return report;
}

function generateReport(results) {
  return {
    timestamp: new Date().toISOString(),
    testResults: results,
    summary: {
      totalRequests: results.length,
      successfulRequests: results.filter(r => r.statusCode === 200).length,
      blockedRequests: results.filter(r => r.analysis.isBlocked).length,
      pagesWithVehicleData: results.filter(r => r.analysis.hasVehicleData).length
    },
    recommendations: {
      canScrapeDirectly: !results.some(r => r.analysis.isBlocked),
      needsAntiBot: results.some(r => r.analysis.protectionType),
      suggestedTools: results.some(r => r.analysis.isBlocked) 
        ? ['ScrapingBee', 'Apify', 'Puppeteer with proxies']
        : ['Cheerio', 'Axios', 'Simple HTTP requests']
    }
  };
}

// Run the test
runScrapingTest().catch(console.error); 