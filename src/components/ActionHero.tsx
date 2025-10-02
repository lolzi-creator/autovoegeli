'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Gift, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  Phone,
  Calendar,
  Share2,
  Tag,
  Star,
  Zap,
  Sparkles
} from 'lucide-react';

// Admin banner settings interface
interface AdminBannerSettings {
  enabled: boolean;
  title: string;
  message: string;
  ctaText: string;
  ctaLink: string;
  iconType: string;
  type: string;
  startDate: string;
  endDate: string;
  countdownText: string;
}

// Icon mapping
const iconMap = {
  gift: Gift,
  tag: Tag,
  star: Star,
  fire: '🔥',
  sparkles: Sparkles,
};

const ActionHero = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [bannerSettings, setBannerSettings] = useState<AdminBannerSettings>({
    enabled: true,
    title: "🎉 Frühjahrs-Aktion",
    message: "Bis zu 15% Rabatt auf alle Motorräder - Nur noch bis Ende März!",
    ctaText: "Jetzt sparen",
    ctaLink: "/fahrzeuge",
    iconType: "gift",
    type: "promotion",
    startDate: "",
    endDate: "",
    countdownText: "Noch verfügbar bis Ende März"
  });
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Load admin banner settings from database
  useEffect(() => {
    const loadBannerSettings = async () => {
      try {
        // Add cache busting parameter to ensure fresh data
        const cacheBuster = Date.now();
        const response = await fetch(`/api/settings?key=banner_settings&t=${cacheBuster}`);
        const result = await response.json();
        console.log('ActionHero: Loading banner settings:', result);
        
        if (result.value) {
          console.log('ActionHero: Using database settings:', result.value);
          setBannerSettings(result.value);
          // Also save to localStorage for immediate use
          localStorage.setItem('bannerSettings', JSON.stringify(result.value));
        } else {
          // Fallback to localStorage
          const savedSettings = localStorage.getItem('bannerSettings');
          if (savedSettings) {
            try {
              const adminSettings: AdminBannerSettings = JSON.parse(savedSettings);
              console.log('ActionHero: Using localStorage settings:', adminSettings);
              setBannerSettings(adminSettings);
            } catch (error) {
              console.error('Error parsing banner settings:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading banner settings:', error);
        // Fallback to localStorage
        const savedSettings = localStorage.getItem('bannerSettings');
        if (savedSettings) {
          try {
            const adminSettings: AdminBannerSettings = JSON.parse(savedSettings);
            console.log('ActionHero: Using localStorage fallback:', adminSettings);
            setBannerSettings(adminSettings);
          } catch (error) {
            console.error('Error parsing banner settings:', error);
          }
        }
      }
    };

    loadBannerSettings();
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Countdown timer using banner settings
  useEffect(() => {
    const calculateTimeLeft = () => {
      // Use endDate from banner settings, fallback to March 31, 2024
      const endDate = bannerSettings.endDate || '2024-03-31';
      console.log('ActionHero: Calculating countdown for endDate:', endDate);
      const difference = +new Date(endDate) - +new Date();
      console.log('ActionHero: Time difference:', difference);
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        // If expired, show all zeros
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [bannerSettings.endDate]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '🎉 Frühjahrs-Aktion bei Auto Vögeli',
          text: 'Bis zu 15% Rabatt auf alle Motorräder - Nur noch bis Ende März!',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link kopiert!');
    }
  };

  const benefits = [
    'Bis zu 15% Rabatt auf alle Motorräder',
    'Kostenlose Probefahrt inklusive',
    'Professionelle Beratung',
    'Finanzierung ab 0% verfügbar',
    'Garantie und Service inklusive'
  ];

  return (
    <section className="relative py-12 md:py-16 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(34,197,94,0.15)_1px,transparent_0)] [background-size:20px_20px]"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-16 h-16 bg-green-400/20 rounded-full blur-xl"
          animate={{ 
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-32 right-16 w-24 h-24 bg-emerald-400/20 rounded-full blur-xl"
          animate={{ 
            y: [0, 20, 0],
            scale: [1.1, 1, 1.1]
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6">
          
          {/* Action Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-full text-sm font-semibold shadow-lg"
          >
            <Gift className="h-5 w-5 mr-2" />
            Limitierte Frühjahrs-Aktion
          </motion.div>

          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4"
          >
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl'} font-bold text-gray-900 leading-tight`}>
              <span className="block">{bannerSettings.title}</span>
            </h1>
            <p className={`${isMobile ? 'text-base' : 'text-lg md:text-xl'} font-semibold text-gray-700 max-w-3xl mx-auto`}>
              {bannerSettings.message}
            </p>
          </motion.div>

          {/* Countdown Timer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border border-green-200/50 max-w-lg mx-auto"
          >
            <div className="flex items-center justify-center mb-4">
              <Clock className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm font-semibold text-gray-600 tracking-wider">
                {bannerSettings.countdownText || 'Noch verfügbar bis Ende März'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 md:gap-4">
              {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="text-center">
                  <div className="text-lg md:text-xl font-bold text-green-600">
                    {value.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-600 uppercase tracking-wider">
                    {unit === 'days' ? 'Tage' : 
                     unit === 'hours' ? 'Std' : 
                     unit === 'minutes' ? 'Min' : 'Sek'}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto"
          >
            {['15% Rabatt', 'Kostenlose Probefahrt', 'Garantie inklusive'].map((benefit, index) => (
              <span
                key={index}
                className="bg-green-100 text-green-800 text-xs md:text-sm px-3 py-1 rounded-full font-medium"
              >
                ✓ {benefit}
              </span>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className={`flex ${isMobile ? 'flex-col space-y-3' : 'flex-row justify-center space-x-4'} max-w-lg mx-auto`}
          >
            <Link
              href={bannerSettings.ctaLink}
              className={`${isMobile ? 'w-full py-3' : 'px-6 py-3'} inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105`}
            >
              {bannerSettings.ctaText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            
            <Link
              href="/kontakt"
              className={`${isMobile ? 'w-full py-3' : 'px-6 py-3'} inline-flex items-center justify-center border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold rounded-lg text-sm transition-all duration-200 shadow-lg`}
            >
              <Phone className="mr-2 h-5 w-5" />
              Beratung vereinbaren
            </Link>

            <button
              onClick={handleShare}
              className={`${isMobile ? 'w-full py-4' : 'px-6 py-4'} inline-flex items-center justify-center border-2 border-gray-300 text-gray-700 hover:border-green-600 hover:text-green-600 font-semibold rounded-xl transition-all duration-200 shadow-lg`}
            >
              <Share2 className="mr-2 h-5 w-5" />
              Teilen
            </button>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-center space-y-2"
          >
            <p className="text-gray-600">
              <Calendar className="inline h-4 w-4 mr-1" />
              Öffnungszeiten: Mo. - Fr. / 07:30 - 12:00 / 13:30 - 17:30
            </p>
            <p className="text-gray-600">
              <Phone className="inline h-4 w-4 mr-1" />
              032 652 11 66 | Solothurnstrasse 129, 2540 Grenchen
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ActionHero;
