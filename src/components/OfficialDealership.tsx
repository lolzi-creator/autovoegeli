"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';

const OfficialDealership = () => {
  const { t, locale } = useTranslation();
  
  const brands = [
    {
      name: 'ZONTES',
      logo: '/zontes.jpeg',
      vehicleCount: 22,
      category: 'bike'
    },
    {
      name: 'VOGE',
      logo: '/voge.png',
      vehicleCount: 14,
      category: 'bike'
    },
    {
      name: 'SWM',
      logo: '/swm.jpeg',
      vehicleCount: 6,
      category: 'bike'
    },
    {
      name: 'KOVE',
      logo: '/kove.png',
      vehicleCount: 4,
      category: 'bike'
    },
    {
      name: 'XEV',
      logo: '/xev.png',
      vehicleCount: 6,
      category: 'car' // XEV makes electric cars
    }
  ];

  return (
    <section className="relative py-14 md:py-20 bg-gradient-to-b from-white via-green-50/50 to-white overflow-hidden">
      {/* Subtle pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.03)_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
            <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              {t('home.official_dealership_title')}
            </span>
          </h2>
          <p className="text-gray-600 md:text-lg">
            {t('home.official_dealership_subtitle')}
          </p>
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-8">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              href={`/${locale}/fahrzeuge?type=${brand.category}&filter=${brand.name}`}
              className="group flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-green-300 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Brand Logo */}
              <div className="w-32 h-32 mb-4 relative overflow-hidden rounded-xl bg-white border border-gray-100 group-hover:bg-green-50 group-hover:border-green-200 transition-all duration-300 shadow-sm flex items-center justify-center">
                <div className="w-28 h-20 relative">
                  <Image
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    fill
                    className="object-contain"
                    sizes="112px"
                  />
                </div>
              </div>

              {/* Brand Name */}
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors text-center mb-1">
                {brand.name}
              </h3>

              {/* Vehicle Count */}
              <p className="text-sm text-gray-500 group-hover:text-green-500 transition-colors">
                {brand.vehicleCount} {t('home.vehicles_available')}
              </p>

              {/* Hover indicator */}
              <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile Horizontal Scroll Layout */}
        <div className="md:hidden">
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide">
            {brands.map((brand) => (
              <Link
                key={brand.name}
                href={`/${locale}/fahrzeuge?type=${brand.category}&filter=${brand.name}`}
                className="group flex-shrink-0 snap-center flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-300 transition-all duration-300 w-32"
              >
                {/* Brand Logo */}
                <div className="w-20 h-20 mb-3 relative overflow-hidden rounded-lg bg-white border border-gray-100 group-hover:bg-green-50 group-hover:border-green-200 transition-all duration-300 shadow-sm flex items-center justify-center">
                  <div className="w-16 h-12 relative">
                    <Image
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      fill
                      className="object-contain"
                      sizes="64px"
                    />
                  </div>
                </div>

                {/* Brand Name */}
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-green-600 transition-colors text-center mb-1 leading-tight">
                  {brand.name}
                </h3>

                {/* Vehicle Count */}
                <p className="text-xs text-gray-500 group-hover:text-green-500 transition-colors text-center">
                  {brand.vehicleCount} {t('home.vehicles_available')}
                </p>

                {/* Hover indicator */}
                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-6 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Mobile scroll hint */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center text-xs text-gray-400">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-1"></div>
              <span>Swipe to see all brands</span>
              <div className="w-2 h-2 bg-gray-300 rounded-full ml-1"></div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            {t('home.explore_all_brands')}
          </p>
          <Link
            href={`/${locale}/fahrzeuge`}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {t('home.view_all_vehicles')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OfficialDealership;