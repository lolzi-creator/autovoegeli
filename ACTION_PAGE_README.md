# 🎉 Standalone Action Page - Instagram Marketing

## Overview
Created a dedicated action page at `/aktion` designed specifically for Instagram marketing campaigns. This page can be shared directly on social media to drive traffic to specific promotions.

## URL
**https://autovoegeli.ch/aktion**

## Features

### 📱 **Mobile-First Design**
- Optimized for Instagram users (primarily mobile)
- Touch-friendly interfaces
- Responsive design that works perfectly on all devices
- Fast loading with optimized images

### 🎯 **Action Hero Section**
- **Prominent promotion display** with countdown timer
- **Eye-catching title**: "🎉 Frühjahrs-Aktion"
- **Clear value proposition**: "Bis zu 15% Rabatt auf alle Motorräder"
- **Urgency indicator**: "Nur noch bis Ende März!"
- **Live countdown timer** to create urgency
- **Multiple CTAs**: View vehicles, schedule consultation, share

### 🚗 **Vehicle Carousel**
- **Featured vehicles** with action pricing
- **Visual discount badges** showing savings
- **Before/after pricing** to highlight deals
- **Key vehicle specs** (year, power, mileage)
- **Mobile-optimized carousel** with swipe support
- **Desktop navigation** with arrow controls

### 📢 **Social Sharing**
- **Native share API** for mobile devices
- **Fallback copy-to-clipboard** for desktop
- **Optimized meta tags** for social media previews
- **Perfect for Instagram Stories** and posts

### 🎨 **Design Features**
- **Consistent branding** with main website
- **Green theme** matching Auto Vögeli colors
- **Professional animations** with Framer Motion
- **Floating elements** and visual effects
- **Clean, modern layout**

## How to Use for Instagram Marketing

### 1. **Instagram Stories**
```
📸 Post story with vehicle image
📝 Add text: "Frühjahrs-Aktion! Bis zu 15% Rabatt"
🔗 Add link sticker to: autovoegeli.ch/aktion
```

### 2. **Instagram Posts**
```
📷 Carousel post with vehicle photos
📝 Caption: "🎉 Frühjahrs-Aktion bei Auto Vögeli! 
Bis zu 15% Rabatt auf alle Motorräder. 
Nur noch bis Ende März! 
👆 Link in Bio: autovoegeli.ch/aktion"
```

### 3. **Instagram Bio Link**
```
🔗 Update bio link to: autovoegeli.ch/aktion
📝 Bio text: "Frühjahrs-Aktion läuft! Bis zu 15% Rabatt ⬇️"
```

## Content Management

### **Update Action Content**
Edit `src/lib/banner-config.ts`:
```typescript
export const CURRENT_BANNER: BannerConfig = {
  isActive: true,
  title: '🎉 Your New Action Title',
  message: 'Your new promotion message',
  ctaText: 'Your CTA Text',
  ctaLink: '/aktion',
  // ... other settings
};
```

### **Update Vehicle Data**
Edit `src/components/VehicleCarousel.tsx`:
- Replace `FEATURED_VEHICLES` array with real scraped data
- Update pricing and discount information
- Add/remove vehicles as needed

### **Update Countdown Timer**
Edit `src/components/ActionHero.tsx`:
```typescript
// Change end date for countdown
const difference = +new Date('2024-03-31') - +new Date();
```

## Performance
- **Page size**: 6.85 kB (very fast loading)
- **First Load JS**: 155 kB (optimized)
- **Dynamic imports** for heavy components
- **Optimized images** with Next.js Image component

## SEO & Social Media
- **Perfect meta tags** for social sharing
- **Open Graph** optimization
- **Twitter Card** support
- **Structured data** for search engines
- **Mobile-friendly** for better rankings

## Benefits for Business
1. **Direct traffic** from Instagram to specific promotions
2. **Higher conversion rates** with focused messaging  
3. **Easy to share** with customers and on social media
4. **Professional appearance** maintains brand credibility
5. **Mobile optimization** for Instagram's mobile audience
6. **Measurable results** through analytics

## Usage Tips
- Use this page for **time-limited promotions**
- Update regularly for **new campaigns**
- Perfect for **holiday sales**, **seasonal promotions**
- Great for **Instagram advertising campaigns**
- Can be used in **email marketing** as well

---

**Ready to use!** Share `autovoegeli.ch/aktion` on Instagram and watch the traffic flow! 🚀












