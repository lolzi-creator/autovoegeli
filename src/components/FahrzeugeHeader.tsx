"use client";

import { useTranslation } from '@/hooks/useTranslation';
import { useSearchParams, useRouter } from 'next/navigation';
import { Bike, Car } from 'lucide-react';

export default function FahrzeugeHeader() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentType = (searchParams.get('type') as 'bike' | 'car') || 'bike';

  const setType = (nextType: 'bike' | 'car') => {
    const url = new URL(window.location.href);
    url.searchParams.set('type', nextType);
    router.replace(url.pathname + '?' + url.searchParams.toString());
  };

  return (
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
            {t('vehicles.list_title_prefix')}{' '}
            <span className="text-gradient">{t('vehicles.list_title_accent')}</span>
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: '#64748b',
            lineHeight: '1.7',
            marginBottom: '32px'
          }}>
            {t('vehicles.list_subtitle')}
          </p>

          {/* Category Toggle (Segmented control) */}
          <div
            role="tablist"
            aria-label="Vehicle type"
            className="relative inline-flex w-[280px] h-12 bg-gray-100 rounded-2xl p-1 shadow-inner mb-2"
          >
            <span
              className="absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-xl bg-white shadow transition-transform duration-200"
              style={{ transform: currentType === 'bike' ? 'translateX(0)' : 'translateX(100%)' }}
            />
            <button
              role="tab"
              aria-selected={currentType === 'bike'}
              onClick={() => setType('bike')}
              className={`relative z-10 flex-1 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors ${
                currentType === 'bike' ? 'text-gray-900' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Bike className="w-4 h-4" />
              {t('vehicles.type_bikes')}
            </button>
            <button
              role="tab"
              aria-selected={currentType === 'car'}
              onClick={() => setType('car')}
              className={`relative z-10 flex-1 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors ${
                currentType === 'car' ? 'text-gray-900' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Car className="w-4 h-4" />
              {t('vehicles.type_cars')}
            </button>
          </div>
          
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
                {t('vehicles.metrics_available')}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8bc442' }}>
                {t('vehicles.metrics_realtime')}
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                {t('vehicles.metrics_source')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

