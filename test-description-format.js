const fs = require('fs');

// Read one of the scraped files
const data = JSON.parse(fs.readFileSync('scraped_vehicles_complete/voge_sr1_adv_12622035_2025-08-14.json', 'utf8'));

console.log('Raw description from file:');
console.log(data.fahrzeugbeschreibung);

console.log('\n\nAfter JSON.parse decode:');
try {
  const decoded = JSON.parse('"' + data.fahrzeugbeschreibung + '"');
  console.log(decoded);
} catch (e) {
  console.log('JSON.parse failed:', e.message);
  
  console.log('\n\nManual cleanup:');
  const manual = data.fahrzeugbeschreibung
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\u0026/g, '&')
    .replace(/\\\\/g, '\\')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r');
  console.log(manual);
}

