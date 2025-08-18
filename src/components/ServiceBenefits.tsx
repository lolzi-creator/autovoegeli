import React from 'react';
import { Shield, Wrench, Handshake, Clock } from 'lucide-react';

const items = [
  { icon: Shield, title: 'Geprüfte Fahrzeuge', desc: 'Jedes Bike wird sorgfältig kontrolliert und vorbereitet.' },
  { icon: Wrench, title: 'Werkstatt & Service', desc: 'Eigene Werkstatt für Wartung, Reparatur und Umbauten.' },
  { icon: Handshake, title: 'Faire Beratung', desc: 'Transparent, ehrlich und ohne versteckte Kosten.' },
  { icon: Clock, title: 'Schnelle Abwicklung', desc: 'Probefahrt, Finanzierung und Übergabe – schnell und einfach.' },
];

const ServiceBenefits = () => {
  return (
    <section className="relative py-14 md:py-20 bg-gradient-to-b from-white via-green-50/50 to-white overflow-hidden">
      {/* subtle pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.03)_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
            <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">Warum Auto Vögeli?</span>
          </h2>
          <p className="mt-3 text-gray-600 md:text-lg">Mehr als Verkauf – wir begleiten Sie rund um Ihr Motorrad.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 p-5 md:p-6 shadow-sm hover:shadow-lg hover:border-green-200 transition-all">
              <div className="w-11 h-11 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceBenefits;


