import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StructuredData from '@/components/StructuredData';
import ActionHero from '@/components/ActionHero';
import FeaturedShowcase from '@/components/FeaturedShowcase';

// Replace previous carousel with the same featured selection used on the homepage

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
      
      {/* Featured vehicles from admin selection */}
      <FeaturedShowcase />
      
      <Footer />
    </main>
  );
}
