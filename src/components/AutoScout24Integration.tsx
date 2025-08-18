'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

const AutoScout24Integration = () => {
  useEffect(() => {
    // Load AutoScout24 HCI script dynamically
    const script = document.createElement('script');
    script.src = 'https://www.autoscout24.ch/assets/hci/v2/hci.current.js';
    script.async = true;
    
    // Add script to document head
    document.head.appendChild(script);
    
    // Cleanup function to remove script when component unmounts
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <section style={{ 
      backgroundColor: '#f8fafc',
      paddingTop: '60px',
      paddingBottom: '80px'
    }}>
      <div className="container-width section-padding">
        {/* Integration Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            textAlign: 'center',
            marginBottom: '48px'
          }}
        >
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#0f172a',
            marginBottom: '12px'
          }}>
            Aktuelle Fahrzeuge von Auto Vögeli
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#64748b',
            lineHeight: '1.6'
          }}>
            Entdecken Sie unsere komplette Fahrzeugauswahl direkt von AutoScout24. 
            Alle Preise und Verfügbarkeiten sind in Echtzeit aktualisiert.
          </p>
        </motion.div>

        {/* AutoScout24 HCI Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}
        >
          {/* AutoScout24 HCI Widget */}
          <div 
            className="hci-container" 
            data-config-id="1124" 
            data-language="de" 
            data-entry-point="search"
            style={{
              minHeight: '600px',
              width: '100%'
            }}
          />
          
          {/* Loading State / Fallback */}
          <div 
            id="autoscout24-loading" 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              color: '#64748b'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #e2e8f0',
              borderTop: '3px solid #8bc442',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '16px'
            }} />
            <p style={{ fontSize: '16px', fontWeight: '500' }}>
              Fahrzeuge werden geladen...
            </p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              Unsere aktuellen Fahrzeuge von AutoScout24
            </p>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            marginTop: '40px',
            textAlign: 'center'
          }}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '8px'
              }}>
                Echtzeitdaten
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                lineHeight: '1.5',
                margin: '0'
              }}>
                Alle Fahrzeugdaten werden direkt von AutoScout24 geladen und sind immer aktuell.
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '8px'
              }}>
                Keine Doppelpflege
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                lineHeight: '1.5',
                margin: '0'
              }}>
                Fahrzeuge müssen nur einmal auf AutoScout24 eingestellt werden.
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#0f172a',
                marginBottom: '8px'
              }}>
                Professionelle Darstellung
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                lineHeight: '1.5',
                margin: '0'
              }}>
                Hochwertige Bilder und detaillierte Fahrzeuginformationen.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CSS for loading animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Hide loading state once HCI loads */
        .hci-container:not(:empty) + #autoscout24-loading {
          display: none !important;
        }
        
        /* Ensure HCI widget is responsive */
        .hci-container {
          max-width: 100%;
          overflow-x: auto;
        }
        
        /* Style the HCI container for better integration */
        .hci-container > * {
          border-radius: 8px;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default AutoScout24Integration; 