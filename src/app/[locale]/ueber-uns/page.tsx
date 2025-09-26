'use client';

import { useState } from 'react';
import { Award, Users, Shield, Clock, MapPin, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTranslation } from '@/hooks/useTranslation';

export default function UeberUns() {
  const { t, locale } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
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
              {t('about.hero_title_prefix')} <span className="text-gradient">{t('about.hero_title_accent')}</span>
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              {t('about.hero_subtitle')}
            </p>
          </motion.div>
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
                {t('about.story_title')}
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: '#475569',
                marginBottom: '24px',
                lineHeight: '1.7'
              }}>
                {t('about.story_p1')}
              </p>
              
              {isExpanded && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    fontSize: '1.1rem',
                    color: '#475569',
                    marginBottom: '24px',
                    lineHeight: '1.7',
                    overflow: 'hidden'
                  }}
                >
                  {t('about.story_p2')}
                </motion.p>
              )}
              
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#8bc442',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '32px',
                  padding: '8px 0',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#6b9c3a'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#8bc442'}
              >
                {isExpanded ? (
                  <>
                    <span>{t('about.read_less')}</span>
                    <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    <span>{t('about.read_more')}</span>
                    <ChevronDown size={16} />
                  </>
                )}
              </button>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                    {t('about.stat_happy_customers')}
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
                    {t('about.stat_years_experience')}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
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
                {t('about.quality_title')}
              </h3>
              <p style={{
                fontSize: '1rem',
                lineHeight: '1.6',
                opacity: 0.9
              }}>
                {t('about.quality_text')}
              </p>
            </motion.div>
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
              {t('about.values_title')}
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              {t('about.values_subtitle')}
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
                <Shield style={{ width: '32px', height: '32px', color: 'white' }} />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '16px'
              }}>
                {t('about.value_trust_title')}
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.6'
              }}>
                {t('about.value_trust_text')}
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
                <Users style={{ width: '32px', height: '32px', color: 'white' }} />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '16px'
              }}>
                {t('about.value_service_title')}
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.6'
              }}>
                {t('about.value_service_text')}
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
                <Award style={{ width: '32px', height: '32px', color: 'white' }} />
              </div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#0f172a',
                marginBottom: '16px'
              }}>
                {t('about.value_quality_title')}
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.6'
              }}>
                {t('about.value_quality_text')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
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
                {t('about.value_loyalty_title')}
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.6'
              }}>
                {t('about.value_loyalty_text')}
              </p>
            </motion.div>
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
                {t('about.cta_title')}
              </h2>
              <p style={{
                fontSize: '1.1rem',
                marginBottom: '40px',
                opacity: 0.9,
                maxWidth: '600px',
                margin: '0 auto 40px'
              }}>
                {t('about.cta_subtitle')}
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
                  <span>{t('about.address')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Phone style={{ width: '20px', height: '20px', color: '#8bc442' }} />
                  <span>032 652 11 66</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clock style={{ width: '20px', height: '20px', color: '#8bc442' }} />
                  <span>{t('about.hours')}</span>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <a 
                  href={`/${locale}/kontakt`} 
                  className="btn-primary"
                  style={{
                    backgroundColor: '#8bc442',
                    borderColor: '#8bc442'
                  }}
                >
                  {t('about.cta_contact')}
                </a>
                <a 
                  href={`/${locale}/fahrzeuge`} 
                  className="btn-outline"
                  style={{
                    borderColor: 'white',
                    color: 'white'
                  }}
                >
                  {t('about.cta_vehicles')}
                </a>
              </div>
            </motion.div>
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