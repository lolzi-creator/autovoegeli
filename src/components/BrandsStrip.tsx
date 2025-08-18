import React from 'react';

type Brand = { name: string; logo?: string; color?: string };

const BRANDS: Brand[] = [
  { name: 'Zontes', color: '#8bc442' },
  { name: 'KOVE', color: '#2563eb' },
  { name: 'VOGE', color: '#111827' },
  { name: 'SWM', color: '#dc2626' },
  { name: 'Yamaha', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Yamaha_Motor_Company_logo.svg' },
  { name: 'Honda', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Honda_Logo.svg' },
  { name: 'BMW Motorrad', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg' },
  { name: 'Ducati', logo: 'https://upload.wikimedia.org/wikipedia/en/3/3c/Ducati_red_logo.svg' },
  { name: 'KTM', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/KTM-Logo.svg' },
  { name: 'Kawasaki', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Kawasaki_logo.svg' },
  { name: 'Triumph', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Triumph_Motorcycles_logo.svg' },
  { name: 'Suzuki', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Suzuki_logo_2.svg' },
  { name: 'Harley-Davidson', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Harley-Davidson_logo.svg' },
  { name: 'Aprilia', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Aprilia_logo.svg' },
  { name: 'Royal Enfield', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Royal_Enfield_logo.svg' },
  { name: 'CFMOTO', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/CFMoto_logo.svg' },
];

const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();

const BrandsStrip = () => {
  const VISIBLE_BRANDS = BRANDS.slice(0, 5);
  return (
    <section className="relative py-8 md:py-12 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* subtle pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.03)_1px,transparent_1px)] [background-size:14px_14px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5 md:mb-6">
          <h3 className="text-sm md:text-base font-semibold text-gray-700">Motorradmarken, die Sie bei uns finden</h3>
          <div className="hidden md:block h-px bg-gray-200 flex-1 ml-6" />
        </div>

        {/* Mobile: horizontal scroll (compact) */}
        <div className="md:hidden -mx-4 px-4 overflow-x-auto">
          <div className="flex gap-3">
            {VISIBLE_BRANDS.map((brand) => (
              <div
                key={brand.name}
                className="min-w-[96px] h-14 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-center"
              >
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="max-h-8 object-contain grayscale opacity-80"
                    loading="lazy"
                  />
                ) : (
                  <svg className="w-16 h-6" viewBox="0 0 160 60" aria-label={brand.name}>
                    <rect x="0" y="8" rx="8" ry="8" width="160" height="44" fill={(brand.color || '#64748b') + '20'} />
                    <text x="80" y="38" textAnchor="middle" fontSize="22" fontWeight="700" fill={brand.color || '#64748b'} fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial">
                      {getInitials(brand.name)}
                    </text>
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid grid-cols-5 gap-4">
          {VISIBLE_BRANDS.map((brand) => (
            <div
              key={brand.name}
              className="h-16 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow select-none"
            >
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-h-10 object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition"
                  loading="lazy"
                />
              ) : (
                <svg className="w-28 h-8" viewBox="0 0 180 64" aria-label={brand.name}>
                  <rect x="0" y="10" rx="10" ry="10" width="180" height="44" fill={(brand.color || '#64748b') + '20'} />
                  <text x="90" y="40" textAnchor="middle" fontSize="24" fontWeight="800" fill={brand.color || '#64748b'} fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial">
                    {getInitials(brand.name)}
                  </text>
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsStrip;


