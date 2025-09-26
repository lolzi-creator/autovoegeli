'use client';
import { Award, Users, Shield, Clock, MapPin, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
export default function UeberUns() {
  return (
    <>
      <Header />
      <main>
      {/* Hero Section */}
      <section style={{
        paddingTop: '120px',
        paddingBottom: '80px',
        backgroundColor: '#f8fafc'
      }}>
        <div className="container-width section-padding">
          <div
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '24px',
              lineHeight: '1.1'
            }}>
              Über <span className="text-gradient">Auto Vögeli</span>
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Seit über 25 Jahren Ihr vertrauensvoller Partner für professionell geprüfte Premium-Fahrzeuge
              in der Region Grenchen und darüber hinaus.
            </p>
          </div>
        </div>
      </section>
      {/* Story Section */}
      <section style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        <div className="container-width section-padding">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center'
          }}>
            <div
            >
              <h2 style={{
                fontSize: '2.25rem',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '24px',
                lineHeight: '1.2'
              }}>
                Unsere Geschichte
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: '#475569',
                marginBottom: '24px',
                lineHeight: '1.7'
              }}>
                Auto Vögeli wurde 2008 mit der Vision gegründet, den Fahrzeugkauf zu einem
                transparenten und vertrauensvollen Erlebnis zu machen. Was als kleines
                Familienunternehmen begann, hat sich zu einem der führenden Autohäuser
                in der Region entwickelt.
              </p>
              <p style={{
                fontSize: '1.1rem',
                color: '#475569',
                marginBottom: '32px',
                lineHeight: '1.7'
              }}>
                Unser Erfolg basiert auf drei Säulen: Qualität, Vertrauen und persönlicher
                Service. Jedes Fahrzeug durchläuft unsere strenge Qualitätsprüfung, und
                unsere Kunden profitieren von einer ehrlichen, kompetenten Beratung.
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '24px'
              }}>
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#8bc442',
                    marginBottom: '8px'
                  }}>
                    500+
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#64748b',
                    fontWeight: '500'
                  }}>
                    Zufriedene Kunden
                  </div>
                </div>
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#8bc442',
                    marginBottom: '8px'
                  }}>
                    25+
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#64748b',
                    fontWeight: '500'
                  }}>
                    Jahre Erfahrung
                  </div>
                </div>
              </div>
            </div>
            <div
              style={{
                backgroundColor: '#8bc442',
                borderRadius: '20px',
                padding: '40px',
                color: 'white',
                textAlign: 'center'
              }}
            >
              <Award style={{ width: '48px', height: '48px', margin: '0 auto 24px' }} />
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '16px'
              }}>
                Ausgezeichnete Qualität
              </h3>
              <p style={{
                fontSize: '1rem',
                lineHeight: '1.6',
                opacity: 0.9
              }}>
                Alle unsere Fahrzeuge werden von zertifizierten Technikern geprüft
                und kommen mit umfassender Garantie.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Values Section */}
      <section style={{
        paddingTop: '80px',
        paddingBottom: '80px',
        backgroundColor: '#f8fafc'
      }}>
        <div className="container-width section-padding">
          <div
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >
            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '16px'
            }}>
              Unsere Werte
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Diese Prinzipien leiten uns bei allem, was wir tun
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            <div
              style={{
                backgroundColor: 'white',
                padding: '32px',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
              }}
            >
              <div style={{
                backgroundColor: '#8bc442',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <Shield style={{ width: '32px', height: '32px', color: 'white' }} />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '16px'
              }}>
                Vertrauen & Transparenz
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.6'
              }}>
                Ehrliche Beratung ohne versteckte Kosten. Was wir versprechen,
                das halten wir auch.
              </p>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                padding: '32px',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
              }}
            >
              <div style={{
                backgroundColor: '#8bc442',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <Users style={{ width: '32px', height: '32px', color: 'white' }} />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '16px'
              }}>
                Persönlicher Service
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.6'
              }}>
                Individuelle Beratung und persönliche Betreuung von der ersten
                Anfrage bis nach dem Kauf.
              </p>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                padding: '32px',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
              }}
            >
              <div style={{
                backgroundColor: '#8bc442',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <Award style={{ width: '32px', height: '32px', color: 'white' }} />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '16px'
              }}>
                Premium Qualität
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.6'
              }}>
                Nur sorgfältig ausgewählte und geprüfte Fahrzeuge finden den
                Weg in unser Sortiment.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section style={{ paddingTop: '80px', paddingBottom: '100px' }}>
        <div className="container-width section-padding">
          <div style={{
            backgroundColor: '#0f172a',
            borderRadius: '24px',
            padding: '60px 40px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div
            >
              <h2 style={{
                fontSize: '2.25rem',
                fontWeight: '700',
                marginBottom: '24px'
              }}>
                Bereit für Ihr nächstes Fahrzeug?
              </h2>
              <p style={{
                fontSize: '1.1rem',
                marginBottom: '40px',
                opacity: 0.9,
                maxWidth: '600px',
                margin: '0 auto 40px'
              }}>
                Besuchen Sie uns in unserem Showroom oder vereinbaren Sie einen
                persönlichen Beratungstermin.
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '40px',
                marginBottom: '40px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MapPin style={{ width: '20px', height: '20px', color: '#8bc442' }} />
                  <span>Solothurnstrasse 129, 2540 Grenchen</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Phone style={{ width: '20px', height: '20px', color: '#8bc442' }} />
                  <span>032 652 11 66</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clock style={{ width: '20px', height: '20px', color: '#8bc442' }} />
                  <span>Mo. - Fr. / 07:30 - 12:00 / 13:30 - 17:30</span>
                </div>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <a
                  href="/kontakt"
                  className="btn-primary"
                  style={{
                    backgroundColor: '#8bc442',
                    borderColor: '#8bc442'
                  }}
                >
                  Beratung vereinbaren
                </a>
                <a
                  href="/fahrzeuge"
                  className="btn-outline"
                  style={{
                    borderColor: 'white',
                    color: 'white'
                  }}
                >
                  Fahrzeuge ansehen
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Mobile Responsive */}
      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          div[style*="grid-template-columns: repeat(2, 1fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
             `}</style>
      </main>
      <Footer />
    </>
  );
} 