import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CustomVehicleShowcase from '@/components/CustomVehicleShowcase';

export const metadata: Metadata = {
  title: "Fahrzeuge - Auto Vögeli | Geprüfte Premium-Fahrzeuge",
  description: "Entdecken Sie unsere aktuellen Fahrzeuge bei Auto Vögeli. Geprüfte Premium-Autos, transparente Preise und professionelle Beratung in der Schweiz.",
  keywords: "Auto Vögeli, Fahrzeuge, Gebrauchtwagen, Neuwagen, AutoScout24, Premium Autos, Schweiz",
};

export default function FahrzeugePage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
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