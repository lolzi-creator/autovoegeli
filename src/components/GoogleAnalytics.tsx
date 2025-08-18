'use client';

import Script from 'next/script';

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: object) => void;
  }
}

interface GoogleAnalyticsProps {
  measurementId: string;
}

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${measurementId}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `,
        }}
      />
    </>
  );
}

// Event tracking functions
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track vehicle views
export const trackVehicleView = (vehicleId: string, brand: string, model: string) => {
  trackEvent('view_vehicle', 'vehicles', `${brand} ${model}`, parseInt(vehicleId));
};

// Track contact form submissions
export const trackContactForm = (formType: string) => {
  trackEvent('form_submit', 'contact', formType);
};

// Track filter usage
export const trackFilterUsage = (filterType: string, filterValue: string) => {
  trackEvent('filter_use', 'vehicles', `${filterType}:${filterValue}`);
};
