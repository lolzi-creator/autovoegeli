import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StructuredData from '@/components/StructuredData';
import ActionHero from '@/components/ActionHero';

// Dynamically import vehicle showcase for better performance
const VehicleShowcase = dynamic(() => import('@/components/VehicleCarousel'), {
  loading: () => (
    <div className="py-16 bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Fahrzeuge werden geladen...</p>
      </div>
    </div>
  )
});

export const metadata: Metadata = {
  title: "🎉 Frühjahrs-Aktion - Auto Vögeli | Bis zu 15% Rabatt auf alle Motorräder",
  description: "Profitieren Sie jetzt von unserer exklusiven Frühjahrs-Aktion! Bis zu 15% Rabatt auf alle Motorräder bei Auto Vögeli. Nur noch bis Ende März - Jetzt zuschlagen!",
  keywords: "Auto Vögeli Aktion, Motorrad Rabatt, Frühjahrs-Angebot, YAMAHA Aktion, VOGE Angebot, BMW Motorrad Sale, Schweiz Motorrad Aktion, Grenchen Angebot",
  openGraph: {
    title: "🎉 Frühjahrs-Aktion - Bis zu 15% Rabatt | Auto Vögeli",
    description: "Exklusive Frühjahrs-Aktion! Bis zu 15% Rabatt auf alle Motorräder. Nur noch bis Ende März bei Auto Vögeli.",
    type: "website",
    url: "https://autovoegeli.ch/aktion",
    images: [
      {
        url: "/homepage.jpg",
        width: 1200,
        height: 630,
        alt: "Auto Vögeli Frühjahrs-Aktion - Motorrad Rabatte",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "🎉 Frühjahrs-Aktion - Bis zu 15% Rabatt",
    description: "Exklusive Frühjahrs-Aktion! Bis zu 15% Rabatt auf alle Motorräder bei Auto Vögeli.",
    images: ["/homepage.jpg"],
  },
  alternates: {
    canonical: "https://autovoegeli.ch/aktion",
  },
};

export default function AktionPage() {
  const breadcrumbs = [
    { name: "Home", url: "https://autovoegeli.ch" },
    { name: "Aktuelle Aktion", url: "https://autovoegeli.ch/aktion" }
  ];

  return (
    <main className="min-h-screen bg-white">
      <StructuredData type="breadcrumb" breadcrumbs={breadcrumbs} />
      <Header />
      
      {/* Action Hero Section */}
      <ActionHero />
      
      {/* Vehicle Showcase */}
      <VehicleShowcase />
      
      <Footer />
    </main>
  );
}
