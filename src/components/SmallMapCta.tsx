import React from 'react';
import { MapPin } from 'lucide-react';

export default function SmallMapCta() {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm grid md:grid-cols-3">
          <div className="p-6 md:p-8 bg-gray-50">
            <h3 className="text-xl font-bold text-gray-900 mb-2">So finden Sie uns</h3>
            <p className="text-gray-600 mb-4">Werkstrasse 12, 2540 Grenchen</p>
            <a
              href="https://maps.google.com"
              target="_blank"
              className="inline-flex items-center gap-2 text-green-700 font-semibold hover:underline"
            >
              <MapPin className="w-5 h-5" /> Route in Google Maps öffnen
            </a>
          </div>
          <div className="md:col-span-2 h-64 md:h-72">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d632.560336983446!2d7.406058245937209!3d47.1943086971897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x478e20940fbe52ff%3A0xe28ae91db3a3566e!2sAuto%20Voegeli%20AG!5e0!3m2!1sde!2sch!4v1755173964560!5m2!1sde!2sch"
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}


