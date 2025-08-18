"use client";

import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    id: 1,
    name: "M. Keller",
    rating: 5,
    comment:
      "Top Beratung und super Abwicklung. Mein neues Bike war in zwei Tagen abholbereit!",
    date: "2024-06-01",
  },
  {
    id: 2,
    name: "S. Baumgartner",
    rating: 5,
    comment:
      "Sehr freundliches Team, Probefahrt war spontan möglich. Klare Empfehlung.",
    date: "2024-04-18",
  },
  {
    id: 3,
    name: "A. Meier",
    rating: 5,
    comment:
      "Werkstatt-Service ist erstklassig – fairer Preis und schnelle Ausführung.",
    date: "2024-02-10",
  },
];

export default function Testimonials() {
  return (
    <section className="py-14 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
            Kundenstimmen
          </h2>
          <p className="mt-3 text-gray-600 md:text-lg">
            Was unsere Kundinnen und Kunden über Auto Vögeli sagen
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                  <Quote className="w-4 h-4" />
                </div>
                <p className="text-gray-700 leading-relaxed">“{t.comment}”</p>
              </div>
              <div className="text-sm text-gray-500 border-t border-gray-200 pt-3">
                <span className="font-medium text-gray-900">{t.name}</span>
                <span className="mx-2">•</span>
                {new Date(t.date).toLocaleDateString("de-CH", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}




