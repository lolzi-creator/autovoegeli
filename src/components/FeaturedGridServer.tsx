import Link from 'next/link';
import Image from 'next/image';
import { supabaseClient } from '@/lib/supabase';

export const revalidate = 300; // cache 5 minutes

async function loadFeaturedVehicles() {
  if (!supabaseClient) return [] as any[];
  const { data: setting } = await supabaseClient
    .from('settings')
    .select('value')
    .eq('key', 'homepage_featured_vehicle_ids')
    .maybeSingle();
  const ids: string[] = Array.isArray(setting?.value) ? setting.value : [];
  if (ids.length === 0) return [] as any[];
  const { data } = await supabaseClient
    .from('vehicles')
    .select('id,brand,model,images')
    .in('id', ids);
  const byId: Record<string, any> = {};
  (data || []).forEach((v: any) => (byId[v.id] = v));
  return ids.map(id => byId[id]).filter(Boolean).slice(0, 5);
}

export default async function FeaturedGridServer({ locale }: { locale: string }) {
  const vehicles = await loadFeaturedVehicles();
  if (!vehicles.length) return null;
  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {vehicles.map((v: any) => (
            <Link key={v.id} href={`/${locale}/fahrzeuge/${v.id}`} className="block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-28 w-full bg-gray-100 overflow-hidden relative">
                <Image src={(v.images?.[0]) || '/placeholder-bike.jpg'} alt={v.model || v.brand} fill sizes="(max-width:768px) 100vw, 20vw" className="object-cover" />
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


