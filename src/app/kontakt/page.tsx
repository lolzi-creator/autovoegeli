'use client';

import { MapPin, Phone, Clock, Send, Car } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Kontakt() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Vielen Dank für Ihre Nachricht! Wir melden uns bald bei Ihnen.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '24px',
              lineHeight: '1.1'
            }}>
              <span className="text-gradient">Kontakt</span> & Beratung
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Wir sind für Sie da! Kontaktieren Sie uns für eine persönliche Beratung 
              oder besuchen Sie uns direkt in unserem Showroom.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section style={{ paddingTop: '0px', paddingBottom: '80px' }}>
        <div className="container-width section-padding">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            marginBottom: '80px'
          }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
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
                <MapPin style={{ width: '32px', height: '32px', color: 'white' }} />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '16px'
              }}>
                Unser Standort
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.6',
                marginBottom: '16px'
              }}>
                Solothurnstrasse 129<br />
                2540 Grenchen<br />
                Schweiz
              </p>
              <a 
                href="https://maps.google.com/maps?q=Solothurnstrasse+129,+2540+Grenchen"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#8bc442',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
              >
                Route anzeigen →
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
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
                <Phone style={{ width: '32px', height: '32px', color: 'white' }} />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '16px'
              }}>
                Telefon & WhatsApp
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.6',
                marginBottom: '16px'
              }}>
                <a href="tel:+41326521166" style={{ color: '#64748b', textDecoration: 'none' }}>
                  032 652 11 66
                </a><br />
                <a href="tel:+41786360619" style={{ color: '#64748b', textDecoration: 'none' }}>
                  078 636 06 19 (WhatsApp)
                </a>
              </p>
              <a 
                href="tel:+41326521166"
                style={{
                  color: '#8bc442',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
              >
                Jetzt anrufen →
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
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
                <Clock style={{ width: '32px', height: '32px', color: 'white' }} />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '16px'
              }}>
                Öffnungszeiten
              </h3>
              <div style={{
                color: '#64748b',
                lineHeight: '1.6',
                textAlign: 'left'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Montag - Freitag:</strong><br />
                  08:00 - 12:00 Uhr<br />
                  13:30 - 18:00 Uhr
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Samstag:</strong><br />
                  08:00 - 16:00 Uhr
                </div>
                <div>
                  <strong>Sonntag:</strong><br />
                  Geschlossen
                </div>
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'start'
          }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 style={{
                fontSize: '2.25rem',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '24px',
                lineHeight: '1.2'
              }}>
                Schreiben Sie uns
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: '#475569',
                marginBottom: '32px',
                lineHeight: '1.7'
              }}>
                Haben Sie Fragen zu einem Fahrzeug oder möchten Sie einen Beratungstermin 
                vereinbaren? Füllen Sie einfach das Kontaktformular aus, und wir melden 
                uns schnellstmöglich bei Ihnen.
              </p>
              
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <Car style={{ width: '20px', height: '20px', color: '#8bc442' }} />
                  <strong style={{ color: '#0f172a' }}>Probefahrt gewünscht?</strong>
                </div>
                <p style={{
                  color: '#64748b',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  Geben Sie einfach im Betreff &quot;Probefahrt&quot; und das gewünschte Fahrzeug an. 
                  Wir vereinbaren gerne einen Termin mit Ihnen.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '16px',
                boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
              }}
            >
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#8bc442'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      E-Mail *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#8bc442'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Telefon
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#8bc442'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Betreff
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      backgroundColor: 'white',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#8bc442'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  >
                    <option value="">Bitte wählen...</option>
                    <option value="allgemeine-anfrage">Allgemeine Anfrage</option>
                    <option value="probefahrt">Probefahrt vereinbaren</option>
                    <option value="beratung">Beratungstermin</option>
                    <option value="finanzierung">Finanzierung</option>
                    <option value="eintausch">Fahrzeug-Eintausch</option>
                    <option value="wartung">Wartung & Service</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Nachricht *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Teilen Sie uns mit, wie wir Ihnen helfen können..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#8bc442'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: '#8bc442',
                    borderColor: '#8bc442',
                    fontSize: '16px',
                    fontWeight: '600',
                    padding: '16px 32px'
                  }}
                >
                  <Send style={{ width: '18px', height: '18px' }} />
                  Nachricht senden
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mobile Responsive */}
      <style jsx>{`
        @media (max-width: 1024px) {
          /* Contact form grid mobile */
          div[style*="grid-template-columns: 1fr 1fr"][style*="gap: 80px"] {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
        
        @media (max-width: 768px) {
          /* Hero section mobile - very compact */
          section[style*="paddingTop: '120px'"] {
            padding-top: 80px !important;
            padding-bottom: 30px !important;
          }
          
          /* Contact section mobile - much less padding */
          section[style*="paddingBottom: '80px'"] {
            padding-bottom: 40px !important;
          }
          
          /* Contact info cards mobile - compact */
          div[style*="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))"] {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
            margin-bottom: 40px !important;
          }
          
          /* Contact info cards padding mobile - very compact */
          div[style*="backgroundColor: white"][style*="padding: 32px"] {
            padding: 16px !important;
          }
          
          /* Contact form padding mobile - compact */
          div[style*="backgroundColor: white"][style*="padding: 40px"] {
            padding: 16px !important;
          }
          
          /* Text margins - much smaller */
          div[style*="marginBottom: '60px'"] {
            margin-bottom: 30px !important;
          }
          
          div[style*="marginBottom: '80px'"] {
            margin-bottom: 40px !important;
          }
          
          div[style*="marginBottom: '40px'"] {
            margin-bottom: 20px !important;
          }
          
          div[style*="marginBottom: '32px'"] {
            margin-bottom: 16px !important;
          }
          
          div[style*="marginBottom: '24px'"] {
            margin-bottom: 12px !important;
          }
          
          div[style*="marginBottom: '16px'"] {
            margin-bottom: 8px !important;
          }
          
          /* Grid gaps - smaller */
          div[style*="gap: '80px'"] {
            gap: 30px !important;
          }
          
          div[style*="gap: '32px'"] {
            gap: 16px !important;
          }
          
          div[style*="gap: '24px'"] {
            gap: 12px !important;
          }
          
          /* Form grid mobile - email/phone */
          div[style*="grid-template-columns: 1fr 1fr"][style*="gap: 16px"] {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          
          /* Form spacing - much more compact */
          form[style*="gap: '24px'"] {
            gap: 16px !important;
          }
          
          /* Opening hours text alignment */
          div[style*="textAlign: 'left'"] {
            text-align: center !important;
          }
        }
        
        @media (max-width: 480px) {
          /* Extra small screens - use more screen space */
          .container-width {
            max-width: calc(100% - 16px) !important;
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
          
          /* Section padding - use more width */
          .section-padding {
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
        }
        
        @media (max-width: 768px) {
          /* Use more screen width on mobile */
          .container-width {
            max-width: calc(100% - 24px) !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
          
          .section-padding {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
        }
          
          /* Smaller fonts on mobile */
          h1 {
            font-size: 2rem !important;
          }
          
          h2 {
            font-size: 1.75rem !important;
          }
          
          h3 {
            font-size: 1.1rem !important;
          }
          
          /* Smaller icons on mobile */
          div[style*="width: 64px"][style*="height: 64px"] {
            width: 48px !important;
            height: 48px !important;
          }
          
          /* Contact info cards - even more compact */
          div[style*="backgroundColor: white"][style*="padding: 24px"] {
            padding: 20px !important;
          }
          
          /* Form inputs mobile */
          input, select, textarea {
            font-size: 16px !important;
          }
          
          /* Button mobile */
          .btn-primary {
            width: 100% !important;
            padding: 14px 24px !important;
          }
          
          /* Opening hours mobile styling */
          div[style*="textAlign: center"] div {
            margin-bottom: 12px !important;
          }
          
          div[style*="textAlign: center"] strong {
            font-size: 14px !important;
          }
        }
      `}</style>
      </main>
      <Footer />
    </>
  );
} 