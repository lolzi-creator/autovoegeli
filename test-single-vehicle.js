// Import the updated scraper
const fs = require('fs');

// Load the enhanced scraper
const scriptContent = fs.readFileSync('./scrape-all-detailed.js', 'utf8');

// Extract just the parse function and test it
eval(scriptContent);

// Test with ZONTES vehicle
console.log('🧪 Testing single vehicle extraction...');

// Load some test HTML from the existing file 
const testHtml = `
<html>
<body>
ZONTES 703 RR die neue Sportliche Zontes 35kw oder 70kw

Zusätzliche Ausstattung
Beheizbare Griffe
Bluetooth-Schnittstelle
Aluminiumfelgen
Navigation
LED-Scheinwerfer
ABS
Schlüsselloser Zugang/Start

Extras
Neu bereift

Garantie
Ab 1. Inverkehrsetzung, 36 Monate
WERKSGARANTIE!

Fahrzeugbeschreibung
Zontes 703RR – 699 cm³, 70 kW (auch 35 kW möglich)

Die neue Zontes 703RR überzeugt mit kraftvollem 699 cm³ Dreizylinder, 70 kW Leistung (auch mit 35 kW Drosselkit erhältlich für A2).sportliches Fahrwerk, modernes Design und Top-Technik:
Ride-by-Wire
TFT-Display mit Bluetooth
Keyless-Go
ABS & Voll-LED
6-Gang-Getriebe mit Anti-Hopping-Kupplung

Neufahrzeug ab Lager – Besichtigung & Probefahrt in Grenchen möglich.
Auto Voegeli AG – Offizielle Zontes-Vertretung Schweiz
</body>
</html>
`;

// Test the equipment extraction
const equipment = extractAllEquipment(testHtml);
console.log('\n🔧 Equipment Extraction:');
console.log('Additional Equipment:', equipment.additional);
console.log('Extras:', equipment.extras);
console.log('All Features:', equipment.all);

// Test the warranty extraction
const warranty = extractCompleteWarrantyInfo(testHtml);
console.log('\n🛡️  Warranty Extraction:');
console.log('Details:', warranty.details);
console.log('Months:', warranty.months);
console.log('Type:', warranty.type);

// Test the description extraction
const descriptions = extractCompleteDescriptions(testHtml);
console.log('\n📝 Description Extraction:');
console.log('Main Description:', descriptions.main.substring(0, 200) + '...');
console.log('Technical:', descriptions.technical);
console.log('Dealer:', descriptions.dealer);



