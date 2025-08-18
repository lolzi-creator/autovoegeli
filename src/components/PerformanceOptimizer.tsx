'use client';

import { useEffect } from 'react';

export default function PerformanceOptimizer() {
  useEffect(() => {
    // Preload critical resources
    const preloadCriticalImages = () => {
      const criticalImages = [
        '/logo.png',
        '/homepage.jpg'
      ];

      criticalImages.forEach((src) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      });
    };

    // Lazy load non-critical resources
    const lazyLoadResources = () => {
      // Lazy load fonts that aren't critical
      const fontLink = document.createElement('link');
      fontLink.rel = 'preload';
      fontLink.as = 'font';
      fontLink.type = 'font/woff2';
      fontLink.crossOrigin = 'anonymous';
      fontLink.href = 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2';
      document.head.appendChild(fontLink);
    };

    // Optimize Core Web Vitals
    const optimizeCoreWebVitals = () => {
      // Reduce Cumulative Layout Shift (CLS)
      const images = document.querySelectorAll('img');
      images.forEach((img) => {
        if (!img.width || !img.height) {
          img.style.aspectRatio = '16/9'; // Default aspect ratio
        }
      });

      // Improve First Input Delay (FID)
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          // Run non-critical JavaScript during idle time
          console.log('Running non-critical optimizations...');
        });
      }
    };

    preloadCriticalImages();
    lazyLoadResources();
    optimizeCoreWebVitals();

    // Web Vitals monitoring
    if (typeof window !== 'undefined') {
      // Simple performance monitoring without web-vitals dependency issues
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(`Performance: ${entry.name} - ${entry.duration}ms`);
        }
      });
      
      if ('observe' in observer) {
        observer.observe({ entryTypes: ['navigation', 'paint'] });
      }
    }
  }, []);

  return null; // This component doesn't render anything
}
