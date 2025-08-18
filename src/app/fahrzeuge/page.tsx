import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CustomVehicleShowcase from '@/components/CustomVehicleShowcase';
import StructuredData from '@/components/StructuredData';

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
      
      {/* Page Header */}
      <section style={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        paddingTop: '40px',
        paddingBottom: '40px'
      }}>
        <div className="container-width section-padding">
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '16px',
              letterSpacing: '-0.02em'
            }}>
              Unsere{' '}
              <span className="text-gradient">Fahrzeuge</span>
            </h1>
            <p style={{
              fontSize: '1.125rem',
              color: '#64748b',
              lineHeight: '1.7',
              marginBottom: '32px'
            }}>
              Entdecken Sie unsere aktuelle Auswahl an geprüften Premium-Fahrzeugen 
              direkt von AutoScout24 mit allen Details und aktuellen Preisen.
            </p>
            
            {/* Trust Indicators */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '32px',
              flexWrap: 'wrap',
              paddingTop: '24px',
              borderTop: '1px solid #e2e8f0'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8bc442' }}>
                  60+
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  Fahrzeuge verfügbar
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8bc442' }}>
                  Echtzeit
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  AutoScout24 Daten
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Vehicle Showcase with scraped data */}
      <CustomVehicleShowcase />
      
      <Footer />
    </main>
  );
} 