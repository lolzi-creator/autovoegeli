'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowRight, Star, Clock, Gift, Zap, Tag, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { CURRENT_BANNER } from '@/lib/banner-config';
import { useTranslation } from '@/hooks/useTranslation';

// Admin banner settings interface
interface AdminBannerSettings {
  enabled: boolean;
  title: string;
  message: string;
  ctaText: string;
  ctaLink: string;
  iconType: string;
}

// Icon mapping
const iconMap = {
  gift: Gift,
  star: Star,
  clock: Clock,
  zap: Zap,
  tag: Tag,
  sparkles: Sparkles,
};

interface ActionBoxProps {
  className?: string;
  isMobile?: boolean;
}

const ActionBox: React.FC<ActionBoxProps> = ({ className = '', isMobile = false }) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [bannerConfig, setBannerConfig] = useState(CURRENT_BANNER);

  useEffect(() => {
    // Load admin banner settings from localStorage
    const savedSettings = localStorage.getItem('bannerSettings');
    if (savedSettings) {
      try {
        const adminSettings: AdminBannerSettings = JSON.parse(savedSettings);
        // Convert admin settings to banner config format
        const updatedConfig = {
          ...CURRENT_BANNER,
          isActive: adminSettings.enabled,
          title: adminSettings.title,
          message: adminSettings.message,
          ctaText: adminSettings.ctaText,
          ctaLink: adminSettings.ctaLink,
          icon: adminSettings.iconType as keyof typeof iconMap,
        };
        setBannerConfig(updatedConfig);
      } catch (error) {
        console.error('Error parsing banner settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Check if action box should be visible
    if (!bannerConfig.isActive) {
      setIsVisible(false);
      return;
    }

    // Check if user has dismissed it (stored in localStorage)
    const dismissedKey = `action-box-dismissed-${bannerConfig.createdAt}`;
    const wasDismissed = localStorage.getItem(dismissedKey) === 'true';
    
    if (wasDismissed) {
      setIsDismissed(true);
      setIsVisible(false);
      return;
    }

    // Check auto-hide logic
    if (bannerConfig.autoHide && bannerConfig.hideAfterDays) {
      const createdDate = new Date(bannerConfig.createdAt);
      const now = new Date();
      const daysDifference = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDifference >= bannerConfig.hideAfterDays) {
        setIsVisible(false);
        return;
      }
    }

    setIsVisible(true);
  }, [bannerConfig]);

  const handleDismiss = useCallback(() => {
    if (bannerConfig.dismissible) {
      const dismissedKey = `action-box-dismissed-${bannerConfig.createdAt}`;
      localStorage.setItem(dismissedKey, 'true');
      setIsDismissed(true);
      setIsVisible(false);
    }
  }, [bannerConfig]);

  // Memoize expensive calculations
  const IconComponent = useMemo(() => iconMap[bannerConfig.icon as keyof typeof iconMap] || Gift, [bannerConfig.icon]);

  if (!isVisible || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`
          relative bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-xl rounded-2xl 
          ${isMobile ? 'mx-4 p-4' : 'p-6'} 
          shadow-2xl shadow-green-500/25
          border border-green-200/50
          ${className}
        `}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl"></div>
        
        {/* Subtle animated particles for premium feel */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <motion.div
            className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-2 -left-2 w-20 h-20 bg-gradient-to-tr from-emerald-400/20 to-transparent rounded-full blur-xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="relative z-10">
          {/* Header with icon and dismiss */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`
                w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600
                rounded-xl flex items-center justify-center shadow-lg
                ${bannerConfig.type === 'urgent' ? 'animate-pulse' : ''}
              `}>
                <IconComponent className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className={`
                  inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                  ${bannerConfig.type === 'promotion' ? 'bg-green-100 text-green-800' : ''}
                  ${bannerConfig.type === 'announcement' ? 'bg-green-100 text-green-800' : ''}
                  ${bannerConfig.type === 'event' ? 'bg-green-100 text-green-800' : ''}
                  ${bannerConfig.type === 'urgent' ? 'bg-red-100 text-red-800' : ''}
                `}>
                  {bannerConfig.type === 'promotion' && t('banner.promotion_label')}
                  {bannerConfig.type === 'announcement' && t('banner.announcement_label')}
                  {bannerConfig.type === 'event' && t('banner.event_label')}
                  {bannerConfig.type === 'urgent' && '⚠️'}
                </div>
              </div>
            </div>
            
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h3 className={`
              ${isMobile ? 'text-lg' : 'text-xl'} 
              font-bold text-gray-900 leading-tight
            `}>
              {t('banner.title')}
            </h3>
            
            <p className={`
              ${isMobile ? 'text-sm' : 'text-base'} 
              text-gray-600 leading-relaxed
            `}>
              {t('banner.message')}
            </p>

            {/* CTA Button */}
            {bannerConfig.ctaLink && (
              <Link
                href={bannerConfig.ctaLink}
                className={`
                  inline-flex items-center justify-center
                  ${isMobile ? 'w-full py-3 text-sm' : 'px-6 py-3 text-base'}
                  bg-gradient-to-r from-green-500 to-emerald-600
                  text-white font-semibold rounded-xl
                  hover:shadow-lg hover:scale-105 hover:from-green-600 hover:to-emerald-700
                  transition-all duration-200
                  shadow-md
                `}
              >
                {t('banner.cta')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            )}
          </div>

          {/* Urgent pulse indicator */}
          {bannerConfig.type === 'urgent' && (
            <motion.div
              className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [1, 0.5, 1]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ActionBox;
