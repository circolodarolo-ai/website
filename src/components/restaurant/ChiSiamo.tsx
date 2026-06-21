'use client';

import { useState, useEffect } from 'react';
import { Heart, Award, Leaf, Clock } from 'lucide-react';

interface SiteInfo {
  chiSiamoTitolo: string;
  chiSiamoTesto: string;
  nomeLocale: string;
}

const values = [
  {
    icon: Heart,
    title: 'Passione',
    description: 'Ogni piatto è preparato con amore e dedizione, come la tradizione insegna',
  },
  {
    icon: Leaf,
    title: 'Ingredienti Freschi',
    description: 'Selezioniamo ogni giorno i migliori prodotti dai mercati locali',
  },
  {
    icon: Award,
    title: 'Tradizione dal 1985',
    description: 'Quasi 40 anni di storia culinaria tramandata di generazione in generazione',
  },
  {
    icon: Clock,
    title: 'Ricette Autentiche',
    description: 'Rispettiamo le ricette originali italiane con un tocco di creatività',
  },
];

export default function ChiSiamo() {
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);

  useEffect(() => {
    fetch('/api/site-info')
      .then((r) => r.json())
      .then(setSiteInfo)
      .catch(() => {});
  }, []);

  return (
    <section id="chisiamo" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-red-700 font-semibold text-sm uppercase tracking-wider">
            La Nostra Storia
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
            {siteInfo?.chiSiamoTitolo || 'Chi Siamo'}
          </h2>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-gray-600 text-lg leading-relaxed">
            {siteInfo?.chiSiamoTesto ||
              'Dal 1985, La Bella Tavola porta in tavola l\'autentica tradizione culinaria italiana. La nostra passione per la cucina e l\'amore per gli ingredienti freschi e di qualità si riflette in ogni piatto che prepariamo.'}
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => (
            <div
              key={v.title}
              className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-red-50 transition-colors group"
            >
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                <v.icon className="h-7 w-7 text-red-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}