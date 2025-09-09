'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vehicles, setVehicles] = useState<VehicleListing[]>([]);
  const [scrapeStatus, setScrapeStatus] = useState<string>('');
  const [isScraping, setIsScraping] = useState(false);
  const [isScrapingCars, setIsScrapingCars] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [lastSyncTime] = useState<string | null>(null);
  const [featured, setFeatured] = useState<string[]>([]);
  const maxFeatured = 5;
  
  // Banner/Action Box Settings State
  const [bannerSettings, setBannerSettings] = useState({
    enabled: true,
    title: "🎉 Frühjahrs-Aktion",
    message: "Bis zu 15% Rabatt auf alle Motorräder - Nur noch bis Ende März!",
    ctaText: "Jetzt sparen",
    ctaLink: "/aktion",
    iconType: "gift"
  });

  // Load banner settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('bannerSettings');
    if (savedSettings) {
      setBannerSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Auto-save banner settings whenever they change
  useEffect(() => {
    // Skip auto-save on initial load
    const timer = setTimeout(() => {
      localStorage.setItem('bannerSettings', JSON.stringify(bannerSettings));
    }, 500); // Debounce saves by 500ms

    return () => clearTimeout(timer);
  }, [bannerSettings]);

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
    fetch('/api/settings?key=homepage_featured_vehicle_ids')
      .then(r => r.json())
      .then(res => setFeatured(Array.isArray(res?.value) ? res.value : []))
      .catch(() => {});
  }, []);

  const toggleFeatured = (id: string) => {
    setFeatured(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= maxFeatured) return prev; // limit
      return [...prev, id];
    });
  };

  const saveFeatured = async () => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'homepage_featured_vehicle_ids', value: featured })
    });
  };

  const runScraper = async () => {
    try {
      setIsScraping(true);
      setScrapeStatus('Starte Aktualisierung…');
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start_sync' })
      });
      const json = await res.json();
      if (json.success) {
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
      } else {
        setScrapeStatus('Fehler bei der Aktualisierung');
      }
    } catch (e) {
      setScrapeStatus('Fehler beim Starten der Aktualisierung');
    } finally {
      setIsScraping(false);
    }
  };

  const runScraperCars = async () => {
    try {
      setIsScrapingCars(true);
      setScrapeStatus('Starte Auto-Aktualisierung…');
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start_sync_cars' })
      });
      const json = await res.json();
      setScrapeStatus(json.message || 'Auto-Aktualisierung abgeschlossen');
    } catch {
      setScrapeStatus('Fehler beim Aktualisieren der Autos');
    } finally {
      setIsScrapingCars(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'vehicles', label: 'Fahrzeuge', icon: Car },
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
                <button onClick={saveFeatured} className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm hover:bg-purple-700">Featured speichern</button>
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
                    {vehicles.map((vehicle, index) => (
                      <tr key={vehicle.id || `${vehicle.brand}-${vehicle.model}-${index}`}
                          className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-900">{vehicle.brand} {vehicle.model}</p>
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
                {vehicles.map((vehicle, index) => (
                  <div key={vehicle.id || `${vehicle.brand}-${vehicle.model}-${index}`}
                       className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {vehicle.brand} {vehicle.model}
                        </h3>
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

                  {/* Auto-save info */}
                  <div className="pt-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-sm text-blue-800 font-medium">Änderungen werden automatisch gespeichert</span>
                      </div>
                    </div>
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
    </div>
  );
}
