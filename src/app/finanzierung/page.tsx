'use client';

import { Calculator, CreditCard, Shield, CheckCircle, ArrowRight, Percent, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Finanzierung() {
  const [loanAmount, setLoanAmount] = useState(25000);
  const [loanTerm, setLoanTerm] = useState(60);
  const [interestRate, setInterestRate] = useState(4.9);

  const calculateMonthlyPayment = () => {
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm;
    const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    return monthlyPayment;
  };

  const monthlyPayment = calculateMonthlyPayment();

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
                <span className="text-gradient">Finanzierung</span> leicht gemacht
              </h1>
              <p style={{
                fontSize: '1.25rem',
                color: '#64748b',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: '1.6'
              }}>
                Verwirklichen Sie Ihren Traum vom neuen Fahrzeug mit unseren 
                flexiblen und günstigen Finanzierungslösungen.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Calculator Section */}
        <section style={{ paddingTop: '0px', paddingBottom: '80px' }}>
          <div className="container-width section-padding">
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '60px',
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
                  Finanzierungsrechner
                </h2>
                <p style={{
                  fontSize: '1.1rem',
                  color: '#475569',
                  marginBottom: '32px',
                  lineHeight: '1.7'
                }}>
                  Berechnen Sie schnell und einfach Ihre monatliche Rate. 
                  Passen Sie die Parameter an Ihre Bedürfnisse an.
                </p>

                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '32px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <Shield style={{ width: '20px', height: '20px', color: '#8bc442' }} />
                    <strong style={{ color: '#0f172a' }}>Faire Konditionen</strong>
                  </div>
                  <ul style={{
                    color: '#64748b',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    margin: 0,
                    paddingLeft: '20px'
                  }}>
                    <li>Zinssätze ab 3.9% effektiv</li>
                    <li>Laufzeiten von 12 bis 84 Monaten</li>
                    <li>Keine versteckten Gebühren</li>
                    <li>Vorzeitige Rückzahlung möglich</li>
                  </ul>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px'
                }}>
                  <div style={{
                    textAlign: 'center',
                    padding: '16px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <Percent style={{ width: '24px', height: '24px', color: '#8bc442', margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Ab</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8bc442' }}>3.9%</div>
                  </div>
                  
                  <div style={{
                    textAlign: 'center',
                    padding: '16px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <Clock style={{ width: '24px', height: '24px', color: '#8bc442', margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Bis zu</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8bc442' }}>84 Mon.</div>
                  </div>
                  
                  <div style={{
                    textAlign: 'center',
                    padding: '16px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <Users style={{ width: '24px', height: '24px', color: '#8bc442', margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Über</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8bc442' }}>500+</div>
                  </div>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                  <Calculator style={{ width: '24px', height: '24px', color: '#8bc442' }} />
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#0f172a',
                    margin: 0
                  }}>
                    Ihre monatliche Rate
                  </h3>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Fahrzeugpreis: CHF {loanAmount.toLocaleString('de-CH')}
                  </label>
                  <input
                    type="range"
                    min="5000"
                    max="100000"
                    step="1000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '3px',
                      background: '#e2e8f0',
                      outline: 'none',
                      appearance: 'none'
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#64748b',
                    marginTop: '4px'
                  }}>
                    <span>CHF 5&apos;000</span>
                    <span>CHF 100&apos;000</span>
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Laufzeit: {loanTerm} Monate
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="84"
                    step="6"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '3px',
                      background: '#e2e8f0',
                      outline: 'none',
                      appearance: 'none'
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#64748b',
                    marginTop: '4px'
                  }}>
                    <span>12 Mon.</span>
                    <span>84 Mon.</span>
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Zinssatz: {interestRate}% p.a.
                  </label>
                  <input
                    type="range"
                    min="3.9"
                    max="9.9"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '3px',
                      background: '#e2e8f0',
                      outline: 'none',
                      appearance: 'none'
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#64748b',
                    marginTop: '4px'
                  }}>
                    <span>3.9%</span>
                    <span>9.9%</span>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#8bc442',
                  padding: '24px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  color: 'white',
                  marginBottom: '24px'
                }}>
                  <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                    Ihre monatliche Rate
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                    CHF {monthlyPayment.toFixed(0)}.-
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
                    Bei {loanTerm} Monaten Laufzeit
                  </div>
                </div>

                <button
                  className="btn-primary"
                  style={{
                    width: '100%',
                    backgroundColor: '#0f172a',
                    borderColor: '#0f172a',
                    fontSize: '16px',
                    fontWeight: '600',
                    padding: '16px 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  Finanzierung anfragen
                  <ArrowRight style={{ width: '18px', height: '18px' }} />
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section style={{ 
          paddingTop: '80px', 
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
              <h2 style={{
                fontSize: '2.25rem',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '16px'
              }}>
                Warum Auto Vögeli Finanzierung?
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: '#64748b',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                Profitieren Sie von unseren fairen Konditionen und dem persönlichen Service
              </p>
            </motion.div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '32px'
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
                  <CheckCircle style={{ width: '32px', height: '32px', color: 'white' }} />
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  Schnelle Zusage
                </h3>
                <p style={{
                  color: '#64748b',
                  lineHeight: '1.6'
                }}>
                  Finanzierungszusage innerhalb von 24 Stunden. 
                  Unkompliziert und ohne lange Wartezeiten.
                </p>
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
                  <Percent style={{ width: '32px', height: '32px', color: 'white' }} />
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  Günstige Zinsen
                </h3>
                <p style={{
                  color: '#64748b',
                  lineHeight: '1.6'
                }}>
                  Profitieren Sie von attraktiven Zinssätzen ab 3.9% effektiv. 
                  Faire Konditionen ohne versteckte Kosten.
                </p>
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
                  <CreditCard style={{ width: '32px', height: '32px', color: 'white' }} />
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  Flexible Raten
                </h3>
                <p style={{
                  color: '#64748b',
                  lineHeight: '1.6'
                }}>
                  Wählen Sie Ihre Wunschlaufzeit zwischen 12 und 84 Monaten. 
                  Angepasst an Ihr Budget.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section style={{ paddingTop: '80px', paddingBottom: '80px' }}>
          <div className="container-width section-padding">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{ textAlign: 'center', marginBottom: '60px' }}
            >
              <h2 style={{
                fontSize: '2.25rem',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '16px'
              }}>
                So einfach geht&apos;s
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: '#64748b',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                In nur 3 Schritten zu Ihrer Finanzierung
              </p>
            </motion.div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '40px'
            }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{
                  backgroundColor: '#8bc442',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: 'white'
                }}>
                  1
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  Fahrzeug wählen
                </h3>
                <p style={{
                  color: '#64748b',
                  lineHeight: '1.6'
                }}>
                  Finden Sie Ihr Wunschfahrzeug in unserem Sortiment oder 
                  lassen Sie sich von uns beraten.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{
                  backgroundColor: '#8bc442',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: 'white'
                }}>
                  2
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  Finanzierung beantragen
                </h3>
                <p style={{
                  color: '#64748b',
                  lineHeight: '1.6'
                }}>
                  Füllen Sie unseren einfachen Antrag aus. 
                  Wir prüfen Ihre Angaben diskret und schnell.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{
                  backgroundColor: '#8bc442',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: 'white'
                }}>
                  3
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#0f172a',
                  marginBottom: '16px'
                }}>
                  Fahrzeug übernehmen
                </h3>
                <p style={{
                  color: '#64748b',
                  lineHeight: '1.6'
                }}>
                  Nach der Zusage können Sie Ihr neues Fahrzeug 
                  sofort übernehmen und losfahren.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ paddingTop: '80px', paddingBottom: '100px' }}>
          <div className="container-width section-padding">
            <div style={{
              backgroundColor: '#0f172a',
              borderRadius: '24px',
              padding: '60px 40px',
              textAlign: 'center',
              color: 'white'
            }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 style={{
                  fontSize: '2.25rem',
                  fontWeight: '700',
                  marginBottom: '24px'
                }}>
                  Bereit für Ihre Finanzierung?
                </h2>
                <p style={{
                  fontSize: '1.1rem',
                  marginBottom: '40px',
                  opacity: 0.9,
                  maxWidth: '600px',
                  margin: '0 auto 40px'
                }}>
                  Kontaktieren Sie uns für ein unverbindliches Beratungsgespräch. 
                  Wir finden die optimale Finanzierungslösung für Sie.
                </p>
                
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
                    Jetzt beraten lassen
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
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mobile Responsive */}
        <style jsx>{`
          @media (max-width: 1024px) {
            div[style*="grid-template-columns: 1fr 1fr"] {
              grid-template-columns: 1fr !important;
              gap: 40px !important;
            }
            div[style*="grid-template-columns: repeat(3, 1fr)"] {
              grid-template-columns: 1fr !important;
            }
          }
          
          @media (max-width: 768px) {
            /* Hero section mobile - very compact */
            section:first-of-type {
              padding-top: 80px !important;
              padding-bottom: 30px !important;
            }
            
            /* All sections mobile - much less padding */
            section[style*="paddingTop: '80px'"] {
              padding-top: 40px !important;
              padding-bottom: 40px !important;
            }
            
            section[style*="paddingBottom: '80px'"] {
              padding-bottom: 40px !important;
            }
            
            section[style*="paddingBottom: '100px'"] {
              padding-bottom: 50px !important;
            }
            
            /* Calculator section mobile - very compact */
            div[style*="backgroundColor: white"][style*="padding: 40px"] {
              padding: 16px !important;
            }
            
            /* Benefits section mobile - compact */
            div[style*="backgroundColor: white"][style*="padding: 32px"] {
              padding: 16px !important;
            }
            
            /* CTA section mobile - compact */
            div[style*="backgroundColor: #0f172a"][style*="padding: 60px 40px"] {
              padding: 24px 16px !important;
            }
            
            /* Text margins - much smaller */
            div[style*="marginBottom: '60px'"] {
              margin-bottom: 30px !important;
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
            
            /* Grid gaps - smaller */
            div[style*="gap: '32px'"] {
              gap: 16px !important;
            }
            
            div[style*="gap: '40px'"] {
              gap: 20px !important;
            }
            
            /* Responsive buttons */
            div[style*="display: flex"][style*="gap: 16px"] {
              flex-direction: column !important;
              align-items: center !important;
              gap: 12px !important;
            }
            
            .btn-primary, .btn-outline {
              width: 100% !important;
              max-width: 280px !important;
              padding: 12px 24px !important;
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
            
            /* Compact stats grid */
            div[style*="grid-template-columns: repeat(3, 1fr)"] {
              grid-template-columns: 1fr !important;
              gap: 12px !important;
            }
            
            /* Smaller icons and padding on mobile */
            div[style*="width: 64px"][style*="height: 64px"] {
              width: 48px !important;
              height: 48px !important;
            }
            
            div[style*="width: 80px"][style*="height: 80px"] {
              width: 64px !important;
              height: 64px !important;
            }
          }
          
          input[type="range"] {
            -webkit-appearance: none;
            background: transparent;
          }
          
          input[type="range"]::-webkit-slider-track {
            background: #e2e8f0;
            height: 6px;
            border-radius: 3px;
          }
          
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #8bc442;
            cursor: pointer;
            margin-top: -7px;
          }
          
          input[type="range"]::-moz-range-track {
            background: #e2e8f0;
            height: 6px;
            border-radius: 3px;
            border: none;
          }
          
          input[type="range"]::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #8bc442;
            cursor: pointer;
            border: none;
          }
        `}</style>
      </main>
      <Footer />
    </>
  );
} 