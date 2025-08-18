// Test the simple, direct description extraction
const https = require('https');

function extractCompleteDescriptions(html) {
  console.log('🔍 Searching for description in Next.js script data...');

  // Look for the exact pattern from the example: self.__next_f.push([1,"...
  const scriptMatch = html.match(/self\.__next_f\.push\(\[1,"(.*?)"\]\)/s);
  if (!scriptMatch) {
    console.log('❌ No __next_f script found');
    return 'Hochwertiges Fahrzeug von Auto Vögeli AG';
  }

  let scriptContent = scriptMatch[1];
  
  // Find the description field specifically between "cylinders":null and "directImport"
  const descMatch = scriptContent.match(/"cylinders":null,"description":"(.*?)","directImport"/s);
  if (!descMatch) {
    console.log('❌ Description not found between cylinders and directImport');
    // Fallback: try to find any description field
    const fallbackMatch = scriptContent.match(/"description":"(.*?)"/s);
    if (fallbackMatch) {
      console.log('✅ Found fallback description');
      let description = fallbackMatch[1];
      try {
        description = JSON.parse(`"${description}"`);
      } catch {
        description = description
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\u0026/g, '&')
          .replace(/\\\\/g, '\\')
          .replace(/\\t/g, '\t')
          .replace(/\\r/g, '\r');
      }
      return description.trim();
    }
    return 'Hochwertiges Fahrzeug von Auto Vögeli AG';
  }

  console.log('✅ Found description between cylinders and directImport!');
  
  let description = descMatch[1];
  
  // Decode JSON-style escape sequences properly
  try {
    description = JSON.parse(`"${description}"`);
    console.log(`✅ Successfully decoded description (${description.length} characters)`);
  } catch (e) {
    console.log('⚠️ JSON.parse failed, using manual cleanup');
    description = description
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\u0026/g, '&')
      .replace(/\\\\/g, '\\')
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '\r');
  }

  console.log(`📝 First 150 chars: ${description.substring(0, 150)}...`);
  return description.trim();
}

// Test with ZONTES vehicle
const vehicleId = '12613297';
const url = `https://www.autoscout24.ch/de/hci/v2/1124/detail/${vehicleId}`;

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

console.log(`Testing SIMPLE description extraction for ZONTES vehicle: ${vehicleId}`);
console.log(`URL: ${url}\n`);

const req = https.request(url, options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('='.repeat(60));
    console.log('TESTING SIMPLE DESCRIPTION EXTRACTION');
    console.log('='.repeat(60));
    
    // DEBUG: Check what we actually received
    console.log(`Response length: ${data.length} characters`);
    console.log(`Contains "description":`, data.includes('"description"'));
    console.log(`Contains "Zontes":`, data.includes('Zontes'));
    console.log(`Contains "703RR":`, data.includes('703RR'));
    
    // Find all occurrences of "description" to see what's there
    let searchIndex = 0;
    const descriptionPositions = [];
    while (true) {
      const index = data.indexOf('"description"', searchIndex);
      if (index === -1) break;
      descriptionPositions.push(index);
      searchIndex = index + 1;
    }
    
    console.log(`Found ${descriptionPositions.length} "description" fields at positions:`, descriptionPositions);
    
    if (descriptionPositions.length > 0) {
      console.log('\nFirst few description contexts:');
      for (let i = 0; i < Math.min(3, descriptionPositions.length); i++) {
        const pos = descriptionPositions[i];
        const start = Math.max(0, pos - 50);
        const end = Math.min(data.length, pos + 300);
        const context = data.substring(start, end);
        console.log(`\nDescription ${i + 1} at position ${pos}:`);
        console.log(context);
        console.log('-'.repeat(40));
      }
    }
    
    const description = extractCompleteDescriptions(data);
    
    console.log('\n' + '='.repeat(60));
    console.log('FINAL RESULT:');
    console.log('='.repeat(60));
    console.log(description);
    console.log('='.repeat(60));
    
    // Check success
    if (description.includes('Zontes 703RR') || description.includes('699 cm³')) {
      console.log('\n🎉 SUCCESS: Found the expected Zontes description!');
    } else {
      console.log('\n❌ FAILED: Could not extract the expected description');
    }
  });
});

req.on('error', (err) => {
  console.log('Error:', err.message);
});

req.end();
