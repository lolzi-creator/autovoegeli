'use client';

import { ScrapedVehicle } from '@/lib/autoscout-scraper';

interface StructuredDataProps {
  type: 'organization' | 'vehicle' | 'breadcrumb';
  data?: ScrapedVehicle;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

export default function StructuredData({ type, data, breadcrumbs }: StructuredDataProps) {
  let structuredData = {};

  switch (type) {
    case 'organization':
      structuredData = {
        "@context": "https://schema.org",
        "@type": "AutoDealer",
        "name": "Auto Vögeli",
        "description": "Ihr vertrauensvoller Partner für Premium-Fahrzeuge in der Schweiz. Geprüfte Neu- und Gebrauchtwagen, professionelle Beratung und erstklassiger Service.",
        "url": "https://autovoegeli.ch",
        "logo": "https://autovoegeli.ch/logo.png",
        "image": "https://autovoegeli.ch/homepage.jpg",
        "telephone": "+41 XX XXX XX XX", // Replace with actual phone
        "email": "info@autovoegeli.ch", // Replace with actual email
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "CH",
          "addressLocality": "Schweiz", // Replace with actual city
          "postalCode": "XXXX", // Replace with actual postal code
          "streetAddress": "Musterstrasse XX" // Replace with actual address
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "47.3769", // Replace with actual coordinates
          "longitude": "8.5417"
        },
        "openingHours": [
          "Mo-Fr 08:00-18:00",
          "Sa 08:00-16:00"
        ],
        "priceRange": "€€€",
        "paymentAccepted": ["Cash", "Credit Card", "Bank Transfer"],
        "currenciesAccepted": "CHF",
        "areaServed": {
          "@type": "Country",
          "name": "Switzerland"
        },
        "sameAs": [
          "https://www.facebook.com/autovoegeli", // Add actual social media links
          "https://www.instagram.com/autovoegeli"
        ]
      };
      break;

    case 'vehicle':
      if (data) {
        structuredData = {
          "@context": "https://schema.org",
          "@type": "Vehicle",
          "name": `${data.brand} ${data.model}`,
          "brand": {
            "@type": "Brand",
            "name": data.brand
          },
          "model": data.model,
          "vehicleYear": data.year,
          "mileageFromOdometer": {
            "@type": "QuantitativeValue",
            "value": data.mileage,
            "unitCode": "KMT"
          },
          "fuelType": data.fuel,
          "vehicleTransmission": data.transmission,
          "bodyType": data.bodyType,
          "color": data.color,
          "vehicleCondition": data.condition === 'new' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
          "offers": {
            "@type": "Offer",
            "price": data.price,
            "priceCurrency": "CHF",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "AutoDealer",
              "name": "Auto Vögeli",
              "url": "https://autovoegeli.ch"
            }
          },
          "description": data.description,
          "image": data.images,
          "url": `https://autovoegeli.ch/fahrzeuge/${data.id}`,
          "seller": {
            "@type": "AutoDealer",
            "name": "Auto Vögeli"
          }
        };
      }
      break;

    case 'breadcrumb':
      if (breadcrumbs) {
        structuredData = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.name,
            "item": crumb.url
          }))
        };
      }
      break;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
}
