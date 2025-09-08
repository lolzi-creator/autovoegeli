const fs = require('fs');
const path = require('path');

// Multilingual vehicle data mappings
const multilingualData = {
  brands: {
    'Zontes': { de: 'Zontes', fr: 'Zontes', en: 'Zontes' },
    'Voge': { de: 'Voge', fr: 'Voge', en: 'Voge' },
    'Aversus': { de: 'Aversus', fr: 'Aversus', en: 'Aversus' },
    'SWM': { de: 'SWM', fr: 'SWM', en: 'SWM' },
    'Colove': { de: 'Colove', fr: 'Colove', en: 'Colove' },
    'Kove': { de: 'Kove', fr: 'Kove', en: 'Kove' },
    'Wottan': { de: 'Wottan', fr: 'Wottan', en: 'Wottan' },
    'BMW': { de: 'BMW', fr: 'BMW', en: 'BMW' },
    'Triumph': { de: 'Triumph', fr: 'Triumph', en: 'Triumph' },
    'Ariic': { de: 'Ariic', fr: 'Ariic', en: 'Ariic' }
  },
  fuelTypes: {
    'Benzin': { de: 'Benzin', fr: 'Essence', en: 'Petrol' },
    'Diesel': { de: 'Diesel', fr: 'Diesel', en: 'Diesel' },
    'Elektro': { de: 'Elektro', fr: 'Électrique', en: 'Electric' },
    'Hybrid': { de: 'Hybrid', fr: 'Hybride', en: 'Hybrid' }
  },
  transmissions: {
    'Automatik': { de: 'Automatik', fr: 'Automatique', en: 'Automatic' },
    'Manuell': { de: 'Manuell', fr: 'Manuel', en: 'Manual' },
    'Semi-Automatik': { de: 'Semi-Automatik', fr: 'Semi-automatique', en: 'Semi-automatic' }
  },
  bodyTypes: {
    'Motorrad': { de: 'Motorrad', fr: 'Moto', en: 'Motorcycle' },
    'Scooter': { de: 'Scooter', fr: 'Scooter', en: 'Scooter' },
    'Roller': { de: 'Roller', fr: 'Scooter', en: 'Scooter' },
    'Quad': { de: 'Quad', fr: 'Quad', en: 'Quad' }
  },
  colors: {
    'Schwarz': { de: 'Schwarz', fr: 'Noir', en: 'Black' },
    'Weiß': { de: 'Weiß', fr: 'Blanc', en: 'White' },
    'Rot': { de: 'Rot', fr: 'Rouge', en: 'Red' },
    'Blau': { de: 'Blau', fr: 'Bleu', en: 'Blue' },
    'Grün': { de: 'Grün', fr: 'Vert', en: 'Green' },
    'Gelb': { de: 'Gelb', fr: 'Jaune', en: 'Yellow' },
    'Grau': { de: 'Grau', fr: 'Gris', en: 'Grey' },
    'Silber': { de: 'Silber', fr: 'Argent', en: 'Silver' },
    'Metallic': { de: 'Metallic', fr: 'Métallique', en: 'Metallic' }
  },
  conditions: {
    'new': { de: 'Neu', fr: 'Neuf', en: 'New' },
    'used': { de: 'Gebraucht', fr: 'Occasion', en: 'Used' }
  },
  warranty: {
    'Ja': { de: 'Ja', fr: 'Oui', en: 'Yes' },
    'Nein': { de: 'Nein', fr: 'Non', en: 'No' }
  }
};

// Generate multilingual descriptions
function generateMultilingualDescription(vehicle) {
  const brand = multilingualData.brands[vehicle.brand] || { de: vehicle.brand, fr: vehicle.brand, en: vehicle.brand };
  const model = vehicle.model;
  const year = vehicle.year;
  const condition = multilingualData.conditions[vehicle.condition] || { de: vehicle.condition, fr: vehicle.condition, en: vehicle.condition };
  
  return {
    de: `Hochwertiges ${brand.de} ${model} Baujahr ${year} von Auto Vögeli AG. Dieses ${condition.de.toLowerCase()} Fahrzeug wurde sorgfältig geprüft und wartet auf einen neuen Besitzer. Kontaktieren Sie uns für weitere Informationen und eine Probefahrt.`,
    fr: `Véhicule de qualité ${brand.fr} ${model} de ${year} d'Auto Vögeli AG. Ce véhicule d'${condition.fr.toLowerCase()} a été soigneusement inspecté et attend un nouveau propriétaire. Contactez-nous pour plus d'informations et un essai.`,
    en: `High-quality ${brand.en} ${model} from ${year} by Auto Vögeli AG. This ${condition.en.toLowerCase()} vehicle has been carefully inspected and is waiting for a new owner. Contact us for more information and a test drive.`
  };
}

// Generate multilingual features
function generateMultilingualFeatures(vehicle) {
  const features = vehicle.features || [];
  const multilingualFeatures = {
    de: features,
    fr: features.map(feature => {
      // Simple feature translations
      const translations = {
        'ABS': 'ABS',
        'LED': 'LED',
        'Digital': 'Numérique',
        'Navigation': 'Navigation',
        'Bluetooth': 'Bluetooth',
        'USB': 'USB',
        'Klimaanlage': 'Climatisation',
        'Sitzheizung': 'Siège chauffant',
        'Alufelgen': 'Jantes en aluminium',
        'Metalllack': 'Peinture métallisée'
      };
      return translations[feature] || feature;
    }),
    en: features.map(feature => {
      const translations = {
        'ABS': 'ABS',
        'LED': 'LED',
        'Digital': 'Digital',
        'Navigation': 'Navigation',
        'Bluetooth': 'Bluetooth',
        'USB': 'USB',
        'Klimaanlage': 'Air conditioning',
        'Sitzheizung': 'Seat heating',
        'Alufelgen': 'Alloy wheels',
        'Metalllack': 'Metallic paint'
      };
      return translations[feature] || feature;
    })
  };
  
  return multilingualFeatures;
}

// Process and improve vehicle data with multilingual support
function improveVehicleData(vehicle) {
  const improved = { ...vehicle };
  
  // Clean and validate basic data
  if (improved.price && typeof improved.price === 'string') {
    const priceMatch = improved.price.match(/(\d+(?:\.\d+)?)/);
    if (priceMatch) {
      improved.price = parseFloat(priceMatch[1]);
    }
  }
  
  if (improved.year && typeof improved.year === 'string') {
    const yearMatch = improved.year.match(/(\d{4})/);
    if (yearMatch) {
      improved.year = parseInt(yearMatch[1]);
    }
  }
  
  if (improved.mileage && typeof improved.mileage === 'string') {
    const mileageMatch = improved.mileage.match(/(\d+(?:\.\d+)?)/);
    if (mileageMatch) {
      improved.mileage = parseFloat(mileageMatch[1]);
    }
  }
  
  // Add calculated fields
  if (improved.year) {
    improved.vehicleAge = new Date().getFullYear() - improved.year;
  }
  
  if (improved.price && improved.vehicleAge) {
    improved.pricePerYear = Math.round(improved.price / improved.vehicleAge);
  }
  
  // Generate multilingual data
  improved.multilingual = {
    brand: multilingualData.brands[improved.brand] || { de: improved.brand, fr: improved.brand, en: improved.brand },
    fuel: multilingualData.fuelTypes[improved.fuel] || { de: improved.fuel, fr: improved.fuel, en: improved.fuel },
    transmission: multilingualData.transmissions[improved.transmission] || { de: improved.transmission, fr: improved.transmission, en: improved.transmission },
    bodyType: multilingualData.bodyTypes[improved.bodyType] || { de: improved.bodyType, fr: improved.bodyType, en: improved.bodyType },
    color: multilingualData.colors[improved.color] || { de: improved.color, fr: improved.color, en: improved.color },
    condition: multilingualData.conditions[improved.condition] || { de: improved.condition, fr: improved.condition, en: improved.condition },
    warranty: multilingualData.warranty[improved.warranty] || { de: improved.warranty, fr: improved.warranty, en: improved.warranty },
    description: generateMultilingualDescription(improved),
    features: generateMultilingualFeatures(improved)
  };
  
  return improved;
}

// Main processing function
async function processMultilingualData() {
  console.log('🌍 Starting multilingual data improvement process...');
  
  const inputDir = './public/scraped_vehicles_complete';
  const outputDir = './public/scraped_vehicles_multilingual';
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  try {
    const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.json'));
    console.log(`📁 Found ${files.length} vehicle files to process`);
    
    let processedCount = 0;
    let errorCount = 0;
    const brandStats = {};
    const yearStats = {};
    let minPrice = Infinity;
    let maxPrice = 0;
    
    for (const file of files) {
      try {
        const filePath = path.join(inputDir, file);
        const vehicleData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Skip if it's the summary file
        if (file === 'all_vehicles_complete.json') {
          continue;
        }
        
        const improvedVehicle = improveVehicleData(vehicleData);
        
        // Save improved vehicle
        const outputPath = path.join(outputDir, file);
        fs.writeFileSync(outputPath, JSON.stringify(improvedVehicle, null, 2));
        
        // Update statistics
        processedCount++;
        if (processedCount % 10 === 0) {
          console.log(`✅ Processed ${processedCount}/${files.length} vehicles`);
        }
        
        // Collect stats
        const brand = improvedVehicle.brand;
        brandStats[brand] = (brandStats[brand] || 0) + 1;
        
        const year = improvedVehicle.year;
        yearStats[year] = (yearStats[year] || 0) + 1;
        
        if (improvedVehicle.price) {
          minPrice = Math.min(minPrice, improvedVehicle.price);
          maxPrice = Math.max(maxPrice, improvedVehicle.price);
        }
        
      } catch (error) {
        console.log(`❌ Error processing ${file}: ${error.message}`);
        errorCount++;
      }
    }
    
    // Generate summary
    const summary = {
      timestamp: new Date().toISOString(),
      totalFiles: files.length,
      processedSuccessfully: processedCount,
      errors: errorCount,
      brandDistribution: brandStats,
      yearDistribution: yearStats,
      priceRange: {
        min: minPrice === Infinity ? 0 : minPrice,
        max: maxPrice
      },
      multilingualSupport: {
        languages: ['de', 'fr', 'en'],
        features: ['brand', 'fuel', 'transmission', 'bodyType', 'color', 'condition', 'warranty', 'description', 'features']
      }
    };
    
    fs.writeFileSync(path.join(outputDir, 'multilingual_summary.json'), JSON.stringify(summary, null, 2));
    
    console.log('\n🎉 Multilingual data improvement completed!');
    console.log(`✅ Successfully processed: ${processedCount} vehicles`);
    console.log(`❌ Errors: ${errorCount} vehicles`);
    console.log(`📊 Total multilingual vehicles: ${processedCount}`);
    console.log(`📁 Output directory: ${outputDir}`);
    
    console.log('\n📈 Brand Distribution:');
    Object.entries(brandStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([brand, count]) => {
        console.log(`  ${brand}: ${count} vehicles`);
      });
    
    console.log('\n📅 Year Distribution:');
    Object.entries(yearStats)
      .sort(([a], [b]) => b - a)
      .forEach(([year, count]) => {
        console.log(`  ${year}: ${count} vehicles`);
      });
    
    console.log(`\n💰 Price Range: CHF ${minPrice} - CHF ${maxPrice}`);
    console.log('\n🌍 Multilingual Features:');
    console.log('  - Brand names in DE/FR/EN');
    console.log('  - Fuel types in DE/FR/EN');
    console.log('  - Transmission types in DE/FR/EN');
    console.log('  - Body types in DE/FR/EN');
    console.log('  - Colors in DE/FR/EN');
    console.log('  - Conditions in DE/FR/EN');
    console.log('  - Warranty status in DE/FR/EN');
    console.log('  - Descriptions in DE/FR/EN');
    console.log('  - Features in DE/FR/EN');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the process
processMultilingualData();

