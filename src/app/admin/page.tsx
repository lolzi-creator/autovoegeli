'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminAuth from '@/components/AdminAuth';
// import AutoScoutSyncModal from '@/components/AutoScoutSyncModal';
import { 
  BarChart3, 
  Car, 
  Eye, 
  TrendingUp, 
  Users, 
  Search,
  Settings,
  Plus,
  Edit,
  Trash2,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Bell,
  RefreshCw,
  Tag,
  Gift,
  Monitor,
  ArrowRight,
  X
} from 'lucide-react';
import { type MultilingualVehicle, loadMultilingualVehicleData } from '@/lib/multilingual-vehicle-data-loader';

interface VehicleListing {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  views: number;
  inquiries: number;
  status: 'active' | 'sold' | 'pending';
  dateAdded: string;
}

interface AnalyticsData {
  totalVisitors: number;
  totalPageViews: number;
  avgSessionDuration: string;
  bounceRate: string;
  topPages: Array<{ page: string; views: number }>;
  topVehicles: Array<{ vehicle: string; views: number }>;
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vehicles, setVehicles] = useState<VehicleListing[]>([]);
  const [scrapeStatus, setScrapeStatus] = useState<string>('');
  const [isScraping, setIsScraping] = useState(false);
  const [isScrapingCars, setIsScrapingCars] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string>('');
  const [operationStatus, setOperationStatus] = useState<string>('');
  const [showFeaturedSelection, setShowFeaturedSelection] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState<VehicleListing[]>([]);
  const [selectedFeatured, setSelectedFeatured] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [lastSyncTime] = useState<string | null>(null);
  const [featured, setFeatured] = useState<string[]>([]);
  const maxFeatured = 5;
  
  // Rental Management State
  const [rentalCategories, setRentalCategories] = useState<{
    id: string;
    name: string;
    description: string;
    color: string;
  }[]>([]);
  const [rentalCars, setRentalCars] = useState<{
    id: string;
    name: string;
    brand: string;
    model: string;
    category_id: string;
    price_per_day: number;
    image_url: string | null;
    features: string[];
    transmission: string;
    fuel_type: string;
    seats: number;
    doors: number;
    airbags: number;
    abs: boolean;
    air_conditioning: boolean;
    bluetooth: boolean;
    navigation: boolean;
    max_weight: number | null;
    cargo_volume: string | null;
    engine_size: string;
    rental_categories: {
      id: string;
      name: string;
      description: string;
      color: string;
    };
  }[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddCar, setShowAddCar] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{id: string; name: string; description: string; color: string} | null>(null);
  const [editingCar, setEditingCar] = useState<{
    id: string;
    name: string;
    brand: string;
    model: string;
    category_id: string;
    price_per_day: number;
    image_url: string | null;
    features: string[];
    transmission: string;
    fuel_type: string;
    seats: number;
    doors: number;
    airbags: number;
    abs: boolean;
    air_conditioning: boolean;
    bluetooth: boolean;
    navigation: boolean;
    max_weight: number | null;
    cargo_volume: string | null;
    engine_size: string;
    rental_categories: {
      id: string;
      name: string;
      description: string;
      color: string;
    };
  } | null>(null);
  
  // Progress bar states
  const [progressPercent, setProgressPercent] = useState(0);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(0);
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Banner/Action Box Settings State
  const [bannerSettings, setBannerSettings] = useState({
    enabled: true,
    title: "🎉 Frühjahrs-Aktion",
    message: "Bis zu 15% Rabatt auf alle Motorräder - Nur noch bis Ende März!",
    ctaText: "Jetzt sparen",
    ctaLink: "/aktion",
    iconType: "gift",
    type: "promotion",
    startDate: "",
    endDate: ""
  });

  // Load banner settings from database
  useEffect(() => {
    const loadBannerSettings = async () => {
      try {
        const response = await fetch('/api/settings?key=banner_settings');
        const result = await response.json();
        
        if (result.value) {
          setBannerSettings(result.value);
          // Also save to localStorage for immediate use
          localStorage.setItem('bannerSettings', JSON.stringify(result.value));
        } else {
          // Fallback to localStorage if no database settings
          const savedSettings = localStorage.getItem('bannerSettings');
          if (savedSettings) {
            setBannerSettings(JSON.parse(savedSettings));
          }
        }
      } catch (error) {
        console.error('Error loading banner settings:', error);
        // Fallback to localStorage
        const savedSettings = localStorage.getItem('bannerSettings');
        if (savedSettings) {
          setBannerSettings(JSON.parse(savedSettings));
        }
      }
    };

    loadBannerSettings();
  }, []);

  // Save banner settings to database
  const saveBannerSettings = async () => {
    try {
      updateStatus('💾 Saving banner settings...');
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          key: 'banner_settings', 
          value: bannerSettings 
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Banner save result:', result);
      
      if (result.success) {
        // Also save to localStorage for immediate use
        localStorage.setItem('bannerSettings', JSON.stringify(bannerSettings));
        updateStatus('✅ Banner settings saved successfully!');
      } else {
        updateStatus(`❌ Failed to save banner: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving banner settings:', error);
      updateStatus(`❌ Error saving banner settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Console helper functions
  const updateStatus = (message: string) => {
    setOperationStatus(message);
  };

  const startProgress = (estimatedMinutes: number) => {
    setProgressPercent(0);
    setEstimatedTimeLeft(estimatedMinutes * 60); // Convert to seconds
    
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    
    const interval = setInterval(() => {
      setProgressPercent(prev => {
        const newPercent = Math.min(prev + (100 / (estimatedMinutes * 60)), 95); // Cap at 95% until actual completion
        return newPercent;
      });
      
      setEstimatedTimeLeft(prev => Math.max(prev - 1, 0));
    }, 1000);
    
    setProgressInterval(interval);
  };

  const completeProgress = () => {
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }
    setProgressPercent(100);
    setEstimatedTimeLeft(0);
    
    // Reset after 2 seconds
    setTimeout(() => {
      setProgressPercent(0);
    }, 2000);
  };

  const formatTimeLeft = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const startOperation = (operation: string) => {
    setCurrentOperation(operation);
    setOperationStatus('Starting...');
  };

  // Load real vehicles and mock analytics
  useEffect(() => {
    const mockAnalytics: AnalyticsData = {
      totalVisitors: 1247,
      totalPageViews: 3891,
      avgSessionDuration: '3m 24s',
      bounceRate: '34.2%',
      topPages: [
        { page: '/fahrzeuge', views: 1456 },
        { page: '/', views: 892 },
        { page: '/kontakt', views: 234 }
      ],
      topVehicles: [
        { vehicle: 'BMW R 1200 GS', views: 312 },
        { vehicle: 'YAMAHA MT-09A', views: 245 },
        { vehicle: 'VOGE 525 DSX', views: 189 }
      ]
    };

    const load = async () => {
      try {
        const data = await loadMultilingualVehicleData();
        // Map to admin list shape with defaults
        const mapped: VehicleListing[] = data.map((v) => ({
          id: v.id,
          brand: v.brand,
          model: v.model,
          year: v.year,
          price: v.price,
          views: Math.floor(Math.random() * 500),
          inquiries: Math.floor(Math.random() * 20),
          status: 'active',
          dateAdded: new Date().toISOString().slice(0,10),
        }));
        setVehicles(mapped);
      } catch (e) {
        console.warn('Failed to load vehicles for admin:', e);
      } finally {
        setAnalytics(mockAnalytics);
        setLoading(false);
      }
    };

    load();
  }, []);

  // Load featured IDs
  useEffect(() => {
    const loadFeatured = async () => {
      try {
        console.log('Loading featured vehicles...');
        const response = await fetch('/api/settings?key=homepage_featured_vehicle_ids');
        const result = await response.json();
        console.log('Featured vehicles response:', result);
        
        if (result.value && Array.isArray(result.value)) {
          setFeatured(result.value);
          console.log('Loaded featured vehicles:', result.value);
        } else {
          setFeatured([]);
          console.log('No featured vehicles found, using empty array');
        }
      } catch (error) {
        console.error('Error loading featured vehicles:', error);
        setFeatured([]);
      }
    };

    loadFeatured();
  }, []);

  // Load rental data
  useEffect(() => {
    const loadRentalData = async () => {
      try {
        // Load categories
        const categoriesRes = await fetch('/api/rental/categories');
        const categoriesData = await categoriesRes.json();
        if (categoriesData.categories) {
          setRentalCategories(categoriesData.categories);
        }

        // Load cars
        const carsRes = await fetch('/api/rental/cars');
        const carsData = await carsRes.json();
        if (carsData.cars) {
          setRentalCars(carsData.cars);
        }
      } catch (error) {
        console.error('Error loading rental data:', error);
      }
    };

    loadRentalData();
  }, []);

  const toggleFeatured = (id: string) => {
    setFeatured(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= maxFeatured) return prev; // limit
      return [...prev, id];
    });
  };

  const saveFeatured = async (featuredIds?: string[]) => {
    try {
      const idsToSave = featuredIds || featured;
      console.log('Saving featured vehicles:', idsToSave);
      
      if (!idsToSave || idsToSave.length === 0) {
        updateStatus('❌ No featured vehicles selected to save');
        return;
      }
      
      updateStatus('💾 Saving featured vehicles...');
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'homepage_featured_vehicle_ids', value: idsToSave })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Save result:', result);
      
      if (result.success) {
        updateStatus(`✅ Featured vehicles saved successfully! (${idsToSave.length} vehicles)`);
        // Update local state to match what was saved
        setFeatured(idsToSave);
        console.log('Updated local featured state:', idsToSave);
      } else {
        updateStatus(`❌ Failed to save: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving featured vehicles:', error);
      updateStatus(`❌ Error saving featured vehicles: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const runScraper = async () => {
    try {
      setIsScraping(true);
      setScrapeStatus('Starte Aktualisierung…');
      startOperation('Bikes Scraper');
      startProgress(4.5); // Start 4.5-minute progress bar for bikes
      
      updateStatus('🚀 Starting smart brand-model bike scraping...');
      
      const res = await fetch('https://autovoegeli-scraper.onrender.com/scrape/bikes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const json = await res.json();
      
      if (json.success) {
        // Simple status updates for progress
        updateStatus('⏳ Waking up server...');
        setTimeout(() => updateStatus('🏷️ Getting bike brands...'), 2000);
        setTimeout(() => updateStatus('🔍 Scraping bikes...'), 10000);
        setTimeout(() => updateStatus('🔄 Updating database...'), 120000);
        
        completeProgress(); // Complete the progress bar
        updateStatus('✅ Bikes scraping completed successfully!');
        
        setScrapeStatus(json.message || 'Aktualisierung abgeschlossen');
        
        // Reload vehicles after scrape
        const data = await loadMultilingualVehicleData();
        const mapped: VehicleListing[] = data.map((v) => ({
          id: v.id,
          brand: v.brand,
          model: v.model,
          year: v.year,
          price: v.price,
          views: Math.floor(Math.random() * 500),
          inquiries: Math.floor(Math.random() * 20),
          status: 'active',
          dateAdded: new Date().toISOString().slice(0,10),
        }));
        
        setVehicles(mapped);
        updateStatus(`Successfully loaded ${mapped.length} bike records from database`);
        updateStatus('All bike records now include multilingual support');
        updateStatus('Bike scraping and database update process complete');
        
      } else {
        updateStatus(`Bikes scraper failed with error: ${json.error || 'Unknown error'}`);
        setScrapeStatus('Fehler bei der Aktualisierung');
      }
    } catch (e) {
      updateStatus(`Network error occurred during bikes scraping: ${e}`);
      setScrapeStatus('Fehler beim Starten der Aktualisierung');
    } finally {
      setIsScraping(false);
      updateStatus('Bikes scraping operation finished');
    }
  };

  const runScraperCars = async () => {
    try {
      setIsScrapingCars(true);
      setScrapeStatus('Starte Auto-Aktualisierung…');
      startOperation('Cars Scraper');
      startProgress(1.42); // Start 1min 25sec progress bar for cars
      
      updateStatus('🚀 Starting smart brand-model car scraping...');
      updateStatus('⏳ Waking up Render server (may take 30-60 seconds)...');
      updateStatus('🏷️ Getting all available car brands...');
      
      const res = await fetch('https://autovoegeli-scraper.onrender.com/scrape/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const json = await res.json();
      
      if (json.success) {
        // Parse the actual scraper output to show real progress
        if (json.output) {
          const lines = json.output.split('\n');
          for (const line of lines) {
            if (line.trim()) {
              if (line.includes('✅')) {
                updateStatus(line.trim());
              } else if (line.includes('🚀') || line.includes('🏷️') || line.includes('🏍️') || line.includes('🔍')) {
                updateStatus(line.trim());
              } else if (line.includes('📄') || line.includes('📊')) {
                updateStatus(line.trim());
              } else if (line.includes('🧹') || line.includes('🔄')) {
                updateStatus(line.trim());
              } else if (line.includes('❌') || line.includes('⚠️')) {
                updateStatus(line.trim());
              } else if (line.trim().length > 0) {
                updateStatus(line.trim());
              }
            }
          }
        }
        updateStatus('✅ Smart brand-model car scraping completed successfully!');
        updateStatus('All car records now include multilingual support');
        updateStatus('Car scraping and database update process complete');
        updateStatus('Loading available cars for featured selection...');
        
        // Load cars for featured selection
        const carData = await loadMultilingualVehicleData();
        const cars = carData.filter(v => v.category === 'car');
        const carListings: VehicleListing[] = cars.map((v) => ({
          id: v.id,
          brand: v.brand,
          model: v.model,
          year: v.year,
          price: v.price,
          views: Math.floor(Math.random() * 500),
          inquiries: Math.floor(Math.random() * 20),
          status: 'active',
          dateAdded: new Date().toISOString().slice(0,10),
        }));
        
        setAvailableVehicles(carListings);
        updateStatus(`Found ${carListings.length} cars available for featured selection`);
        updateStatus('Ready to select 3 featured cars');
        setShowFeaturedSelection(true);
        completeProgress(); // Complete the progress bar
        
        setScrapeStatus(json.message || 'Auto-Aktualisierung abgeschlossen');
      } else {
        updateStatus(`Cars scraper failed with error: ${json.error || 'Unknown error'}`);
        setScrapeStatus('Fehler beim Aktualisieren der Autos');
      }
    } catch (e) {
      updateStatus(`Network error occurred during cars scraping: ${e}`);
      setScrapeStatus('Fehler beim Aktualisieren der Autos');
    } finally {
      setIsScrapingCars(false);
      updateStatus('Cars scraping operation finished');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'vehicles', label: 'Fahrzeuge', icon: Car },
    { id: 'rental', label: 'Mietwagen', icon: Car },
    { id: 'banner', label: 'Banner/Aktion', icon: Tag },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'settings', label: 'Einstellungen', icon: Settings }
  ];

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }: {
    title: string;
    value: string | number;
    change?: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-sm border border-gray-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">{title}</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className="text-green-600 text-xs sm:text-sm mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="truncate">{change}</span>
            </p>
          )}
        </div>
        <div className={`mt-2 sm:mt-0 p-2 sm:p-3 rounded-lg bg-${color}-100 self-start sm:self-auto`}>
          <Icon className={`w-4 h-4 sm:w-6 sm:h-6 text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Responsive Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Car className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Auto Vögeli Admin</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm">
                AV
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Responsive Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 sm:mb-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap min-w-0 ${
                activeTab === tab.id
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.slice(0, 4)}</span>
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Responsive Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <StatCard
                title="Gesamte Besucher"
                value={analytics?.totalVisitors || 0}
                change="+12.5% vs letzter Monat"
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Seitenaufrufe"
                value={analytics?.totalPageViews || 0}
                change="+8.3% vs letzter Monat"
                icon={Eye}
                color="green"
              />
              <StatCard
                title="Aktive Fahrzeuge"
                value={vehicles.filter(v => v.status === 'active').length}
                icon={Car}
                color="purple"
              />
              <StatCard
                title="Anfragen heute"
                value={23}
                change="+5 vs gestern"
                icon={Mail}
                color="orange"
              />
            </div>

            {/* Responsive Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Top Vehicles */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Beliebteste Fahrzeuge</h3>
                <div className="space-y-3">
                  {analytics?.topVehicles.map((vehicle, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{vehicle.vehicle}</span>
                      <span className="text-green-600 font-medium">{vehicle.views} Views</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Pages */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Beliebteste Seiten</h3>
                <div className="space-y-3">
                  {analytics?.topPages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{page.page}</span>
                      <span className="text-blue-600 font-medium">{page.views} Views</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Responsive Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Fahrzeuge verwalten</h2>
                {lastSyncTime && (
                  <p className="text-gray-600 text-xs sm:text-sm mt-1">
                    Letzte Synchronisation: {lastSyncTime}
                  </p>
                )}
                <p className="text-xs text-gray-600 mt-1">Ausgewählt: {featured.length}/{maxFeatured} für Startseite</p>
              </div>
              
              
              <div className="flex items-center gap-2 sm:gap-3">
                <button 
                  onClick={runScraper}
                  disabled={isScraping}
                  className={`bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 hover:bg-blue-700 transition-colors text-sm ${isScraping ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Update Bikes</span>
                </button>
                <button 
                  onClick={runScraperCars}
                  disabled={isScrapingCars}
                  className={`bg-orange-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 hover:bg-orange-700 transition-colors text-sm ${isScrapingCars ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Update Cars</span>
                </button>
                {scrapeStatus && (
                  <span className="text-xs text-gray-600">{scrapeStatus}</span>
                )}
                <button className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 hover:bg-green-700 transition-colors text-sm">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Neues</span> Fahrzeug
                </button>
                <button 
                  onClick={() => saveFeatured()} 
                  disabled={featured.length === 0}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${
                    featured.length === 0 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  Featured speichern ({featured.length})
                </button>
              </div>
            </div>

            {/* Mobile-first responsive vehicle list */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Fahrzeug</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Preis</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Views</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Anfragen</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {vehicles
                      .sort((a, b) => {
                        // Featured vehicles first
                        const aFeatured = featured.includes(a.id);
                        const bFeatured = featured.includes(b.id);
                        if (aFeatured && !bFeatured) return -1;
                        if (!aFeatured && bFeatured) return 1;
                        return 0;
                      })
                      .map((vehicle, index) => (
                      <tr key={vehicle.id || `${vehicle.brand}-${vehicle.model}-${index}`}
                          className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{vehicle.brand} {vehicle.model}</p>
                              {featured.includes(vehicle.id) && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  ⭐ Featured
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 text-sm">{vehicle.year}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-900 font-medium">
                          CHF {vehicle.price.toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-gray-700">{vehicle.views}</td>
                        <td className="py-4 px-6 text-gray-700">{vehicle.inquiries}</td>
                        <td className="py-4 px-6">
                          <label className="inline-flex items-center gap-2">
                            <input type="checkbox" checked={featured.includes(vehicle.id)}
                                   onChange={() => toggleFeatured(vehicle.id)}
                                   disabled={!featured.includes(vehicle.id) && featured.length >= maxFeatured}
                            />
                            <span className="text-sm text-gray-700">Featured</span>
                          </label>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            vehicle.status === 'active' ? 'bg-green-100 text-green-800' :
                            vehicle.status === 'sold' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {vehicle.status === 'active' ? 'Aktiv' : 
                             vehicle.status === 'sold' ? 'Verkauft' : 'Ausstehend'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button className="p-1 text-blue-600 hover:text-blue-800">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-200">
                {vehicles
                  .sort((a, b) => {
                    // Featured vehicles first
                    const aFeatured = featured.includes(a.id);
                    const bFeatured = featured.includes(b.id);
                    if (aFeatured && !bFeatured) return -1;
                    if (!aFeatured && bFeatured) return 1;
                    return 0;
                  })
                  .map((vehicle, index) => (
                  <div key={vehicle.id || `${vehicle.brand}-${vehicle.model}-${index}`}
                       className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {vehicle.brand} {vehicle.model}
                          </h3>
                          {featured.includes(vehicle.id) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 flex-shrink-0">
                              ⭐ Featured
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{vehicle.year}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                        vehicle.status === 'active' ? 'bg-green-100 text-green-800' :
                        vehicle.status === 'sold' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {vehicle.status === 'active' ? 'Aktiv' : 
                         vehicle.status === 'sold' ? 'Verkauft' : 'Ausstehend'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-500">Preis</p>
                        <p className="font-medium text-gray-900">CHF {vehicle.price.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Views</p>
                        <p className="font-medium text-gray-900">{vehicle.views}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Anfragen</p>
                        <p className="font-medium text-gray-900">{vehicle.inquiries}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Website Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Durchschnittliche Sitzungsdauer"
                value={analytics?.avgSessionDuration || '0m 0s'}
                icon={Clock}
                color="blue"
              />
              <StatCard
                title="Absprungrate"
                value={analytics?.bounceRate || '0%'}
                icon={TrendingUp}
                color="red"
              />
              <StatCard
                title="Konversionsrate"
                value="4.2%"
                change="+0.8% vs letzter Monat"
                icon={DollarSign}
                color="green"
              />
              <StatCard
                title="Mobile Besucher"
                value="68%"
                icon={Users}
                color="purple"
              />
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic-Quellen</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Google Search</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">65%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Direkt</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">20%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Social Media</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">10%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Andere</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: '5%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">SEO Insights</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="font-semibold text-gray-900">SEO Score</h3>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">87/100</div>
                <p className="text-gray-600 text-sm">Sehr gut optimiert</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Ranking Keywords</h3>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">24</div>
                <p className="text-gray-600 text-sm">In Top 10 bei Google</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                  <h3 className="font-semibold text-gray-900">Verbesserungen</h3>
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-2">3</div>
                <p className="text-gray-600 text-sm">Empfohlene Optimierungen</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Keywords</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-2 font-medium text-gray-900">Keyword</th>
                      <th className="text-left py-2 font-medium text-gray-900">Position</th>
                      <th className="text-left py-2 font-medium text-gray-900">Suchvolumen</th>
                      <th className="text-left py-2 font-medium text-gray-900">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-3 text-gray-900">YAMAHA Motorrad Schweiz</td>
                      <td className="py-3 text-green-600 font-medium">#3</td>
                      <td className="py-3 text-gray-700">1,200/Monat</td>
                      <td className="py-3">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-900">Premium Motorräder kaufen</td>
                      <td className="py-3 text-green-600 font-medium">#7</td>
                      <td className="py-3 text-gray-700">800/Monat</td>
                      <td className="py-3">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-900">Autohaus Finanzierung</td>
                      <td className="py-3 text-blue-600 font-medium">#12</td>
                      <td className="py-3 text-gray-700">650/Monat</td>
                      <td className="py-3">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Rental Management Tab */}
        {activeTab === 'rental' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Mietwagen verwalten</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddCategory(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Kategorie hinzufügen
                </button>
                <button
                  onClick={() => setShowAddCar(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Fahrzeug hinzufügen
                </button>
              </div>
            </div>

            {/* Categories Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategorien</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {rentalCategories.map((category) => (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingCategory(category)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete the category "${category.name}"? This will also delete all cars in this category.`)) {
                              try {
                                const response = await fetch(`/api/rental/categories?id=${category.id}`, { 
                                  method: 'DELETE' 
                                });
                                if (response.ok) {
                                  setRentalCategories(prev => prev.filter(c => c.id !== category.id));
                                  setRentalCars(prev => prev.filter(c => c.category_id !== category.id));
                                } else {
                                  const error = await response.json();
                                  alert(`Error deleting category: ${error.error}`);
                                }
                              } catch (error) {
                                console.error('Error deleting category:', error);
                                alert('Failed to delete category');
                              }
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {rentalCars.filter(car => car.category_id === category.id).length} Fahrzeuge
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cars Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mietfahrzeuge</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Fahrzeug</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Kategorie</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Preis/Tag</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Sitzplätze</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Getriebe</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentalCars.map((car) => {
                      return (
                        <tr key={car.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                {car.image_url ? (
                                  <img 
                                    src={car.image_url} 
                                    alt={car.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Car className="w-6 h-6 text-gray-500" />
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{car.name}</div>
                                <div className="text-sm text-gray-600">{car.brand} {car.model}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: car.rental_categories?.color || '#6b7280' }}
                            >
                              {car.rental_categories?.name || 'Unbekannt'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-green-600">CHF {car.price_per_day}</td>
                          <td className="py-3 px-4">{car.seats}</td>
                          <td className="py-3 px-4">{car.transmission}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              <button
                                onClick={() => setEditingCar(car)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    await fetch(`/api/rental/cars?id=${car.id}`, { method: 'DELETE' });
                                    setRentalCars(prev => prev.filter(c => c.id !== car.id));
                                  } catch (error) {
                                    console.error('Error deleting car:', error);
                                  }
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Banner/Action Box Tab */}
        {activeTab === 'banner' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Banner & Aktion verwalten</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  bannerSettings.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {bannerSettings.enabled ? 'Aktiv' : 'Deaktiviert'}
                </span>
              </div>
            </div>
            
            {/* Live Previews */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              
              {/* Home Page ActionBox Preview */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Live-Vorschau: Home Seite</h3>
                
                {/* Mini ActionBox Preview */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 shadow-sm border border-green-200/50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        {bannerSettings.iconType === 'gift' && <Gift className="h-4 w-4 text-white" />}
                        {bannerSettings.iconType === 'tag' && <Tag className="h-4 w-4 text-white" />}
                        {bannerSettings.iconType === 'star' && '⭐'}
                        {bannerSettings.iconType === 'fire' && '🔥'}
                        {bannerSettings.iconType === 'sparkles' && '✨'}
                      </div>
                      <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        🏷️ Sonderangebot
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-gray-900 leading-tight">
                      {bannerSettings.title || 'Banner Titel'}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {bannerSettings.message || 'Banner Nachricht'}
                    </p>
                    <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center">
                      {bannerSettings.ctaText || 'Button Text'}
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="text-sm text-blue-800">So wird es im Hero-Bereich der Startseite angezeigt</span>
                  </div>
                </div>
              </div>

              {/* Action Page Hero Preview */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Live-Vorschau: Aktion Seite</h3>
              
              {/* Mini Action Hero Preview */}
              <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 rounded-lg p-6 border border-green-200">
                <div className="text-center space-y-4">
                  {/* Action Badge */}
                  <div className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-full text-xs font-bold">
                    🎉 AKTION
                  </div>
                  
                  {/* Title */}
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                    {bannerSettings.title || 'Banner Titel'}
                  </h1>
                  
                  {/* Message */}
                  <p className="text-sm md:text-base font-semibold text-gray-700 max-w-2xl mx-auto">
                    {bannerSettings.message || 'Banner Nachricht'}
                  </p>
                  
                  {/* Countdown Timer Mockup */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-green-200/50 max-w-md mx-auto">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Noch verfügbar bis Ende März
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {['15', '12', '45', '33'].map((time, index) => (
                        <div key={index} className="text-center">
                          <div className="text-sm font-bold text-green-600">{time}</div>
                          <div className="text-xs text-gray-600 uppercase tracking-wider">
                            {['Tage', 'Std', 'Min', 'Sek'][index]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Quick Benefits */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {['15% Rabatt', 'Kostenlose Probefahrt', 'Garantie inklusive'].map((benefit, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium"
                      >
                        ✓ {benefit}
                      </span>
                    ))}
                  </div>
                  
                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 justify-center max-w-md mx-auto">
                    <button className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center">
                      {bannerSettings.ctaText || 'Button Text'}
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </button>
                    <button className="border-2 border-green-600 text-green-600 font-semibold py-2 px-4 rounded-lg text-sm transition-colors">
                      Beratung vereinbaren
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Preview Note */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="text-sm text-blue-800">So wird es auf der Aktion-Seite (/aktion) angezeigt</span>
                </div>
              </div>
              </div>
            </div>

            {/* Banner Settings Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Settings */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Grundeinstellungen</h3>
                
                <div className="space-y-4">
                  {/* Enable/Disable */}
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Banner aktivieren
                    </label>
                    <button
                      onClick={() => setBannerSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                        bannerSettings.enabled ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        bannerSettings.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titel
                    </label>
                    <input
                      type="text"
                      value={bannerSettings.title}
                      onChange={(e) => setBannerSettings(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="🎉 Frühjahrs-Aktion"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nachricht
                    </label>
                    <textarea
                      rows={3}
                      value={bannerSettings.message}
                      onChange={(e) => setBannerSettings(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Bis zu 15% Rabatt auf alle Motorräder..."
                    />
                  </div>

                  {/* CTA Button */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={bannerSettings.ctaText}
                        onChange={(e) => setBannerSettings(prev => ({ ...prev, ctaText: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Jetzt sparen"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Button Link
                      </label>
                      <input
                        type="text"
                        value={bannerSettings.ctaLink}
                        onChange={(e) => setBannerSettings(prev => ({ ...prev, ctaLink: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="/aktion"
                      />
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Datum
                      </label>
                      <input
                        type="date"
                        value={bannerSettings.startDate}
                        onChange={(e) => setBannerSettings(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Datum
                      </label>
                      <input
                        type="date"
                        value={bannerSettings.endDate}
                        onChange={(e) => setBannerSettings(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Display Settings */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Design-Einstellungen</h3>
                
                <div className="space-y-4">
                  {/* Info about position */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <Monitor className="w-4 h-4 mr-2 text-green-600" />
                      <span className="text-sm text-green-800 font-medium">Banner wird automatisch im Hero-Bereich angezeigt</span>
                    </div>
                  </div>

                  {/* Icon Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon
                    </label>
                    <select
                      value={bannerSettings.iconType}
                      onChange={(e) => setBannerSettings(prev => ({ ...prev, iconType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="gift">🎁 Geschenk</option>
                      <option value="tag">🏷️ Tag</option>
                      <option value="star">⭐ Stern</option>
                      <option value="fire">🔥 Feuer</option>
                      <option value="sparkles">✨ Funken</option>
                    </select>
                  </div>

                  {/* Banner Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banner Typ
                    </label>
                    <select
                      value={bannerSettings.type || 'promotion'}
                      onChange={(e) => setBannerSettings(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="promotion">🏷️ Promotion</option>
                      <option value="announcement">📢 Ankündigung</option>
                      <option value="event">📅 Event</option>
                      <option value="urgent">⚠️ Wichtig</option>
                    </select>
                  </div>

                  {/* Save button */}
                  <div className="pt-4">
                    <button
                      onClick={saveBannerSettings}
                      className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Banner-Einstellungen speichern
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Schnellaktionen</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setBannerSettings(prev => ({
                    ...prev,
                    title: "🎉 Frühjahrs-Aktion",
                    message: "Bis zu 15% Rabatt auf alle Motorräder - Nur noch bis Ende März!",
                    ctaText: "Jetzt sparen",
                    ctaLink: "/aktion"
                  }))}
                  className="p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <div className="text-green-600 font-medium">Frühjahrs-Aktion</div>
                  <div className="text-sm text-gray-600 mt-1">Standard Frühlings-Promotion</div>
                </button>
                <button
                  onClick={() => setBannerSettings(prev => ({
                    ...prev,
                    title: "🏍️ Sommer-Sale",
                    message: "Jetzt bis zu 20% sparen auf alle Motorräder!",
                    ctaText: "Sale ansehen",
                    ctaLink: "/fahrzeuge"
                  }))}
                  className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <div className="text-blue-600 font-medium">Sommer-Sale</div>
                  <div className="text-sm text-gray-600 mt-1">Sommer Verkaufs-Promotion</div>
                </button>
                <button
                  onClick={() => setBannerSettings(prev => ({
                    ...prev,
                    title: "🚗 Neu eingetroffen",
                    message: "Entdecken Sie unsere neuesten Fahrzeuge!",
                    ctaText: "Ansehen",
                    ctaLink: "/fahrzeuge"
                  }))}
                  className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <div className="text-purple-600 font-medium">Neue Fahrzeuge</div>
                  <div className="text-sm text-gray-600 mt-1">Neue Ankünfte bewerben</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Einstellungen</h2>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Google Analytics</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Measurement ID
                  </label>
                  <input
                    type="text"
                    placeholder="G-XXXXXXXXXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Speichern
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Einstellungen</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Beschreibung für Suchmaschinen..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords
                  </label>
                  <input
                    type="text"
                    placeholder="Auto Vögeli, Motorräder, Schweiz..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Speichern
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AutoScout Sync Modal - Temporarily disabled */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Sync Feature</h3>
            <p className="text-gray-600 mb-4">AutoScout sync feature is temporarily unavailable.</p>
            <button
              onClick={() => setShowSyncModal(false)}
              className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Progress Modal */}
      {(isScraping || isScrapingCars) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{currentOperation}</h3>
              <div className="text-sm text-gray-500">
                {estimatedTimeLeft > 0 ? `${formatTimeLeft(estimatedTimeLeft)} remaining` : 'Completing...'}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
            
            {/* Status Message */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="text-sm text-gray-700">{operationStatus}</div>
            </div>
            
            {/* Warning Message */}
            <div className="text-xs text-gray-500 text-center">
              ⚠️ Please do not close this window during the operation
            </div>
          </motion.div>
        </div>
      )}

      {/* Console removed - using clean progress modal instead */}
      {false && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl h-[70vh] flex flex-col"
          >
            {/* Console Header */}
            <div className="bg-gray-800 px-6 py-4 rounded-t-lg flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="text-white font-semibold">
                  Scraper Console - {currentOperation}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {}}
                  className="text-gray-400 hover:text-white px-3 py-1 text-sm bg-gray-700 rounded"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    if (!isScraping && !isScrapingCars) {
                      setShowFeaturedSelection(false);
                    }
                  }}
                  className={`${
                    (isScraping || isScrapingCars) 
                      ? 'text-gray-600 cursor-not-allowed' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  disabled={isScraping || isScrapingCars}
                  title={
                    (isScraping || isScrapingCars) 
                      ? 'Please do not close - scraping in progress' 
                      : 'Close console'
                  }
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Console Content */}
            <div className="flex-1 p-4 bg-gray-900 overflow-auto">
              <div className="font-mono text-sm space-y-1">
                <div className="text-gray-500 italic">Console has been replaced with the beautiful progress modal</div>
                {(isScraping || isScrapingCars) && (
                  <div className="text-blue-400 animate-pulse">
                    Scraping operation in progress...
                  </div>
                )}
                {(isScraping || isScrapingCars) && (
                  <div className="text-yellow-400 mt-2 p-2 bg-yellow-900/20 rounded border border-yellow-600/30">
                    Please do not close this console - scraping operation is running
                  </div>
                )}
              </div>

              {/* Featured Selection Interface */}
              {showFeaturedSelection && !isScraping && !isScrapingCars && (
                <div className="border-t border-gray-700 p-4">
                  <h4 className="text-white font-semibold mb-3">Select 3 Featured Cars</h4>
                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                    {availableVehicles.map((vehicle) => (
                      <label
                        key={vehicle.id}
                        className={`flex items-center p-3 rounded cursor-pointer transition-colors ${
                          selectedFeatured.includes(vehicle.id)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFeatured.includes(vehicle.id)}
                          onChange={(e) => {
                            if (e.target.checked && selectedFeatured.length < 3) {
                              setSelectedFeatured([...selectedFeatured, vehicle.id]);
                            } else if (!e.target.checked) {
                              setSelectedFeatured(selectedFeatured.filter(id => id !== vehicle.id));
                            }
                          }}
                          className="mr-3"
                          disabled={!selectedFeatured.includes(vehicle.id) && selectedFeatured.length >= 3}
                        />
                        <div className="flex-1">
                          <div className="font-medium">
                            {vehicle.brand} {vehicle.model} ({vehicle.year})
                          </div>
                          <div className="text-sm opacity-75">
                            {vehicle.price.toLocaleString()} CHF
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-gray-400 text-sm">
                      Selected: {selectedFeatured.length}/3
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowFeaturedSelection(false);
                          setSelectedFeatured([]);
                        }}
                        className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (selectedFeatured.length === 3) {
                            updateStatus('Saving featured car selection...');
                            setFeatured(selectedFeatured);
                            await saveFeatured(selectedFeatured);
                            updateStatus('Featured cars updated successfully');
                            setShowFeaturedSelection(false);
                            setSelectedFeatured([]);
                          }
                        }}
                        disabled={selectedFeatured.length !== 3}
                        className={`px-4 py-2 rounded ${
                          selectedFeatured.length === 3
                            ? 'bg-green-600 text-white hover:bg-green-500'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Save Featured Cars
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Console Footer */}
            <div className="bg-gray-800 px-6 py-3 rounded-b-lg border-t border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-400">
                  Status: {isScraping || isScrapingCars ? (
                    <span className="text-blue-400">Running...</span>
                  ) : (
                    <span className="text-green-400">Ready</span>
                  )}
                </div>
                <div className="text-gray-400">
                  Lines: {[].length}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingCategory ? 'Kategorie bearbeiten' : 'Neue Kategorie hinzufügen'}
            </h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const name = formData.get('name') as string;
              const description = formData.get('description') as string;
              const color = formData.get('color') as string;
              
              try {
                if (editingCategory) {
                  const response = await fetch('/api/rental/categories', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingCategory.id, name, description, color })
                  });
                  const data = await response.json();
                  if (data.category) {
                    setRentalCategories(prev => prev.map(c => 
                      c.id === editingCategory.id ? data.category : c
                    ));
                  }
                  setEditingCategory(null);
                } else {
                  const response = await fetch('/api/rental/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, description, color })
                  });
                  const data = await response.json();
                  if (data.category) {
                    setRentalCategories(prev => [...prev, data.category]);
                  }
                }
                setShowAddCategory(false);
              } catch (error) {
                console.error('Error saving category:', error);
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingCategory?.name || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                  <input
                    type="text"
                    name="description"
                    defaultValue={editingCategory?.description || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farbe</label>
                  <input
                    type="color"
                    name="color"
                    defaultValue={editingCategory?.color || '#3b82f6'}
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCategory(false);
                    setEditingCategory(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingCategory ? 'Speichern' : 'Hinzufügen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Car Modal */}
      {showAddCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingCar ? 'Fahrzeug bearbeiten' : 'Neues Fahrzeug hinzufügen'}
            </h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const carData = {
                name: formData.get('name') as string,
                brand: formData.get('brand') as string,
                model: formData.get('model') as string,
                category_id: formData.get('categoryId') as string,
                price_per_day: parseInt(formData.get('pricePerDay') as string),
                image_url: formData.get('image') as string || null,
                features: (formData.get('features') as string).split(',').map(f => f.trim()).filter(f => f),
                transmission: formData.get('transmission') as string,
                fuel_type: formData.get('fuel') as string,
                seats: parseInt(formData.get('seats') as string),
                doors: parseInt(formData.get('doors') as string),
                airbags: parseInt(formData.get('airbags') as string),
                abs: formData.get('abs') === 'on',
                air_conditioning: formData.get('airConditioning') === 'on',
                bluetooth: formData.get('bluetooth') === 'on',
                navigation: formData.get('navigation') === 'on',
                max_weight: formData.get('maxWeight') ? parseInt(formData.get('maxWeight') as string) : null,
                cargo_volume: formData.get('cargoVolume') as string || null,
                engine_size: formData.get('engineSize') as string
              };
              
              try {
                if (editingCar) {
                  const response = await fetch('/api/rental/cars', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingCar.id, ...carData })
                  });
                  const data = await response.json();
                  if (data.car) {
                    setRentalCars(prev => prev.map(c => c.id === editingCar.id ? data.car : c));
                  }
                  setEditingCar(null);
                } else {
                  const response = await fetch('/api/rental/cars', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(carData)
                  });
                  const data = await response.json();
                  if (data.car) {
                    setRentalCars(prev => [...prev, data.car]);
                  }
                }
                setShowAddCar(false);
              } catch (error) {
                console.error('Error saving car:', error);
              }
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingCar?.name || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marke</label>
                  <input
                    type="text"
                    name="brand"
                    defaultValue={editingCar?.brand || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modell</label>
                  <input
                    type="text"
                    name="model"
                    defaultValue={editingCar?.model || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                  <select
                    name="categoryId"
                    defaultValue={editingCar?.category_id || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Kategorie wählen</option>
                    {rentalCategories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preis pro Tag (CHF)</label>
                  <input
                    type="number"
                    name="pricePerDay"
                    defaultValue={editingCar?.price_per_day || ''}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sitzplätze</label>
                  <input
                    type="number"
                    name="seats"
                    defaultValue={editingCar?.seats || ''}
                    required
                    min="1"
                    max="9"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Türen</label>
                  <input
                    type="number"
                    name="doors"
                    defaultValue={editingCar?.doors || ''}
                    required
                    min="2"
                    max="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Airbags</label>
                  <input
                    type="number"
                    name="airbags"
                    defaultValue={editingCar?.airbags || ''}
                    required
                    min="1"
                    max="12"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Getriebe</label>
                  <select
                    name="transmission"
                    defaultValue={editingCar?.transmission || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Getriebe wählen</option>
                    <option value="Manuell">Manuell</option>
                    <option value="Automatik">Automatik</option>
                    <option value="Semi-Automatik">Semi-Automatik</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kraftstoff</label>
                  <select
                    name="fuel"
                    defaultValue={editingCar?.fuel_type || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Kraftstoff wählen</option>
                    <option value="Benzin">Benzin</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Elektro">Elektro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motor (z.B. 1.0L)</label>
                  <input
                    type="text"
                    name="engineSize"
                    defaultValue={editingCar?.engine_size || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max. Gewicht (kg) - nur für Vans</label>
                  <input
                    type="number"
                    name="maxWeight"
                    defaultValue={editingCar?.max_weight || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Laderaum - nur für Vans</label>
                  <input
                    type="text"
                    name="cargoVolume"
                    defaultValue={editingCar?.cargo_volume || ''}
                    placeholder="z.B. 8.3 m³"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features (kommagetrennt)</label>
                  <input
                    type="text"
                    name="features"
                    defaultValue={editingCar?.features?.join(', ') || ''}
                    placeholder="z.B. Klimaanlage, Bluetooth, USB"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fahrzeugbild</label>
                  <div className="space-y-3">
                    {editingCar?.image_url && (
                      <div className="relative">
                        <img 
                          src={editingCar.image_url} 
                          alt="Current car image"
                          className="w-32 h-24 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this image?')) {
                              try {
                                const fileName = editingCar.image_url?.split('/').pop();
                                if (fileName) {
                                  await fetch(`/api/rental/upload?fileName=${fileName}`, { method: 'DELETE' });
                                  setEditingCar(prev => prev ? { ...prev, image_url: null } : null);
                                }
                              } catch (error) {
                                console.error('Error deleting image:', error);
                              }
                            }
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('carId', editingCar?.id || 'new');
                            
                            const response = await fetch('/api/rental/upload', {
                              method: 'POST',
                              body: formData
                            });
                            
                            const data = await response.json();
                            if (data.imageUrl) {
                              if (editingCar) {
                                setEditingCar(prev => prev ? { ...prev, image_url: data.imageUrl } : null);
                              }
                              // For new cars, we'll store the image URL in a hidden field
                              const hiddenInput = document.querySelector('input[name="image"]') as HTMLInputElement;
                              if (hiddenInput) {
                                hiddenInput.value = data.imageUrl;
                              }
                            }
                          } catch (error) {
                            console.error('Error uploading image:', error);
                            alert('Failed to upload image');
                          }
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input type="hidden" name="image" value={editingCar?.image_url || ''} />
                    <p className="text-xs text-gray-500">Max. 5MB, JPEG, PNG oder WebP</p>
                  </div>
                </div>
              </div>
              
              {/* Checkboxes */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Ausstattung</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="abs"
                      defaultChecked={editingCar?.abs || false}
                      className="mr-2"
                    />
                    ABS
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="airConditioning"
                      defaultChecked={editingCar?.air_conditioning || false}
                      className="mr-2"
                    />
                    Klimaanlage
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="bluetooth"
                      defaultChecked={editingCar?.bluetooth || false}
                      className="mr-2"
                    />
                    Bluetooth
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="navigation"
                      defaultChecked={editingCar?.navigation || false}
                      className="mr-2"
                    />
                    Navigation
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCar(false);
                    setEditingCar(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingCar ? 'Speichern' : 'Hinzufügen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminAuth>
      <AdminDashboard />
    </AdminAuth>
  );
}
