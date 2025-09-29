// Banner Configuration
// This file makes it easy to update banner content for different promotions/announcements

export interface BannerConfig {
  isActive: boolean;
  type: 'promotion' | 'announcement' | 'event' | 'urgent';
  title: string;
  message: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundColor: string; // Tailwind gradient classes
  textColor: string;
  icon: 'gift' | 'star' | 'clock' | 'zap' | 'tag' | 'sparkles';
  dismissible: boolean;
  autoHide: boolean;
  hideAfterDays?: number;
  createdAt: string; // YYYY-MM-DD format
  startDate?: string; // YYYY-MM-DD format
  endDate?: string; // YYYY-MM-DD format
}

// Current active banner configuration
// Simply update these values to change the banner content
export const CURRENT_BANNER: BannerConfig = {
  isActive: true, // Set to false to completely hide the banner
  type: 'promotion',
  title: '🎉 Frühjahrs-Aktion',
  message: 'Bis zu 15% Rabatt auf alle Motorräder - Nur noch bis Ende März!',
  ctaText: 'Jetzt sparen',
  ctaLink: '/aktion',
  backgroundColor: 'from-emerald-500 to-green-600',
  textColor: 'text-white',
  icon: 'gift',
  dismissible: true,
  autoHide: false,
  hideAfterDays: 7,
  createdAt: '2024-01-18',
};

// Preset banner templates for common use cases
export const BANNER_TEMPLATES = {
  // Spring Promotion
  springPromo: {
    isActive: true,
    type: 'promotion' as const,
    title: '🌸 Frühlings-Angebot',
    message: 'Sonderkonditionen auf alle Fahrzeuge - Jetzt Probefahrt vereinbaren!',
    ctaText: 'Probefahrt',
    ctaLink: '/kontakt',
    backgroundColor: 'from-pink-500 to-rose-600',
    textColor: 'text-white',
    icon: 'gift' as const,
    dismissible: true,
    autoHide: false,
    hideAfterDays: 14,
    createdAt: '2024-03-01',
  },

  // Summer Sale
  summerSale: {
    isActive: true,
    type: 'promotion' as const,
    title: '☀️ Sommer-Sale',
    message: 'Bis zu 20% Rabatt auf ausgewählte Modelle - Begrenzte Zeit!',
    ctaText: 'Angebote ansehen',
    ctaLink: '/fahrzeuge',
    backgroundColor: 'from-orange-500 to-yellow-500',
    textColor: 'text-white',
    icon: 'tag' as const,
    dismissible: true,
    autoHide: true,
    hideAfterDays: 30,
    createdAt: '2024-06-01',
  },

  // New Arrival
  newArrival: {
    isActive: true,
    type: 'announcement' as const,
    title: '🆕 Neu eingetroffen',
    message: 'Die neuesten 2024er Modelle sind da! Jetzt entdecken.',
    ctaText: 'Entdecken',
    ctaLink: '/fahrzeuge',
    backgroundColor: 'from-blue-600 to-indigo-700',
    textColor: 'text-white',
    icon: 'star' as const,
    dismissible: true,
    autoHide: false,
    hideAfterDays: 21,
    createdAt: '2024-01-15',
  },

  // Event Announcement
  eventAnnouncement: {
    isActive: true,
    type: 'event' as const,
    title: '📅 Tag der offenen Tür',
    message: 'Am 15. März von 10-17 Uhr - Gratis Beratung & Probefahrten!',
    ctaText: 'Mehr Infos',
    ctaLink: '/kontakt',
    backgroundColor: 'from-purple-600 to-violet-700',
    textColor: 'text-white',
    icon: 'clock' as const,
    dismissible: true,
    autoHide: true,
    hideAfterDays: 5,
    createdAt: '2024-03-10',
  },

  // Urgent Notice
  urgentNotice: {
    isActive: true,
    type: 'urgent' as const,
    title: '⚠️ Wichtiger Hinweis',
    message: 'Geänderte Öffnungszeiten vom 20.-22. März - Details hier.',
    ctaText: 'Details',
    ctaLink: '/kontakt',
    backgroundColor: 'from-red-600 to-red-700',
    textColor: 'text-white',
    icon: 'zap' as const,
    dismissible: false,
    autoHide: true,
    hideAfterDays: 3,
    createdAt: '2024-03-18',
  },

  // Winter Special
  winterSpecial: {
    isActive: false,
    type: 'promotion' as const,
    title: '❄️ Winter-Special',
    message: 'Winterservice + kostenlose Inspektion bei Kauf bis Jahresende!',
    ctaText: 'Mehr erfahren',
    ctaLink: '/kontakt',
    backgroundColor: 'from-cyan-600 to-blue-700',
    textColor: 'text-white',
    icon: 'gift' as const,
    dismissible: true,
    autoHide: true,
    hideAfterDays: 45,
    createdAt: '2024-11-01',
  },
};

/*
HOW TO USE:

1. Quick Update:
   Simply change the values in CURRENT_BANNER above.

2. Use a Template:
   Replace CURRENT_BANNER with one of the templates:
   export const CURRENT_BANNER: BannerConfig = BANNER_TEMPLATES.springPromo;

3. Create Custom Banner:
   Copy any template and modify the values as needed.

4. Hide Banner:
   Set isActive: false in CURRENT_BANNER.

5. Temporary Banner:
   Set autoHide: true and specify hideAfterDays.

TIPS:
- Use descriptive titles with emojis for visual appeal
- Keep messages concise but compelling
- Test on mobile devices for text length
- Update createdAt when deploying new banners
- Use dismissible: false only for critical announcements
*/
