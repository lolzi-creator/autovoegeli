'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadMultilingualVehicleData, type MultilingualVehicle } from '@/lib/multilingual-vehicle-data-loader';
import { useTranslation } from '@/hooks/useTranslation';

export default function FeaturedShowcase() {
  const { locale } = useTranslation();
  const [featured, setFeatured] = useState<MultilingualVehicle[] | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/settings?key=homepage_featured_vehicle_ids');
        const j = await r.json();
        const ids: string[] = Array.isArray(j?.value) ? j.value : [];
        if (ids.length === 0) { setFeatured([]); return; }
        const all = await loadMultilingualVehicleData();
        const pick = all.filter(v => ids.includes(v.id)).slice(0, 5);
        setFeatured(pick);
      } catch {
        setFeatured([]);
      }
    };
    load();
  }, []);

  if (!featured || featured.length === 0) return null;

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {featured.map(v => (
            <Link key={v.id} href={`/${locale}/fahrzeuge/${v.id}`} className="block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-28 w-full bg-gray-100 overflow-hidden">
                <img src={v.images?.[0] || '/placeholder-bike.jpg'} alt={v.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <div className="text-xs text-gray-500 truncate">{v.brand}</div>
                <div className="text-sm font-semibold text-gray-900 truncate">{v.model}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}


