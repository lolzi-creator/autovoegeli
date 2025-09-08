import { Metadata } from 'next';
import nextDynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StructuredData from '@/components/StructuredData';
import FahrzeugeHeader from '@/components/FahrzeugeHeader';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

// Dynamically import heavy vehicle showcase component
const CustomVehicleShowcase = nextDynamic(() => import('@/components/CustomVehicleShowcase'), {
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Fahrzeuge werden geladen...</p>
      </div>
    </div>
  )
});

export const metadata: Metadata = {
  title: "Fahrzeuge - Auto Vögeli | Premium Motorräder & Autos in der Schweiz",
  description: "Entdecken Sie unsere exklusive Auswahl an Premium-Motorrädern und Autos bei Auto Vögeli. YAMAHA, VOGE, BMW, ZONTES, SWM, KOVE - Geprüfte Qualität, transparente Preise, professionelle Beratung. Jetzt Probefahrt vereinbaren!",
  keywords: "Auto Vögeli Fahrzeuge, Premium Motorräder Schweiz, YAMAHA Motorräder, VOGE Bikes, BMW Motorrad, ZONTES, SWM, KOVE, Gebrauchtwagen, Neuwagen, Motorrad kaufen Schweiz, Probefahrt, Finanzierung",
  openGraph: {
    title: "Premium Fahrzeuge bei Auto Vögeli | Motorräder & Autos",
    description: "Exklusive Auswahl an Premium-Motorrädern und Autos. YAMAHA, VOGE, BMW, ZONTES, SWM, KOVE - Geprüfte Qualität und transparente Preise.",
    type: "website",
    url: "https://autovoegeli.ch/fahrzeuge",
    images: [
      {
        url: "/homepage.jpg",
        width: 1200,
        height: 630,
        alt: "Auto Vögeli Fahrzeuge - Premium Motorräder und Autos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Fahrzeuge bei Auto Vögeli",
    description: "Exklusive Auswahl an Premium-Motorrädern und Autos in der Schweiz.",
    images: ["/homepage.jpg"],
  },
  alternates: {
    canonical: "https://autovoegeli.ch/fahrzeuge",
  },
};

export default function FahrzeugePage() {
  const breadcrumbs = [
    { name: "Home", url: "https://autovoegeli.ch" },
    { name: "Fahrzeuge", url: "https://autovoegeli.ch/fahrzeuge" }
  ];

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <StructuredData type="breadcrumb" breadcrumbs={breadcrumbs} />
      <Header />
      
      {/* Page Header with category toggle (controls URL ?type=...) */}
      <FahrzeugeHeader />

      {/* Custom Vehicle Showcase with scraped data */}
      <Suspense fallback={<div className="py-16 bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" /></div>}>
        <CustomVehicleShowcase />
      </Suspense>
      
      <Footer />
    </main>
  );
} 