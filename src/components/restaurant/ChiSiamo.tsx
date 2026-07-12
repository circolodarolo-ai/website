'use client';

import { useState, useEffect, useMemo } from 'react';
import { Heart, Award, Leaf, Clock } from 'lucide-react';
import { useI18n, useSiteOverrides } from '@/lib/i18n-context';

interface SiteInfo {
  chiSiamoTitolo: string;
  chiSiamoSubtitle: string | null;
  chiSiamoTesto: string;
  nomeLocale: string;
  chiSiamoImageUrl: string | null;
  valore1Titolo: string | null;
  valore1Desc: string | null;
  valore2Titolo: string | null;
  valore2Desc: string | null;
  valore3Titolo: string | null;
  valore3Desc: string | null;
  valore4Titolo: string | null;
  valore4Desc: string | null;
}

interface SiteImage {
  id: string;
  url: string;
  titolo: string | null;
  descrizione: string | null;
  ordine: number;
}

const valueIcons = [Heart, Leaf, Award, Clock];
const valueKeys = [
  { titleKey: 'chiSiamo.valore1Titolo', descKey: 'chiSiamo.valore1Desc' },
  { titleKey: 'chiSiamo.valore2Titolo', descKey: 'chiSiamo.valore2Desc' },
  { titleKey: 'chiSiamo.valore3Titolo', descKey: 'chiSiamo.valore3Desc' },
  { titleKey: 'chiSiamo.valore4Titolo', descKey: 'chiSiamo.valore4Desc' },
];

export default function ChiSiamo() {
  const { t } = useI18n();
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [images, setImages] = useState<SiteImage[]>([]);

  useEffect(() => {
    fetch('/api/site-info')
      .then((r) => r.json())
      .then(setSiteInfo)
      .catch(() => {});
    fetch('/api/site-images?sezione=chi-siamo')
      .then((r) => r.json())
      .then(setImages)
      .catch(() => {});
  }, []);

  // Register DB content into i18n overrides so t() prioritizes DB values.
  // FIX: useMemo per stablire il reference dell'oggetto overrides; altrimenti un
  // literal nuovo ad ogni render farebbe girare l'useEffect in useSiteOverrides
  // ad ogni render (loop, anche se ora registerOverrides fa bailout).
  const chiSiamoOverrides = useMemo(() => siteInfo ? {
    'chiSiamo.subtitle': siteInfo.chiSiamoSubtitle,
    'chiSiamo.defaultTitle': siteInfo.chiSiamoTitolo,
    'chiSiamo.defaultText': siteInfo.chiSiamoTesto,
    'chiSiamo.valore1Titolo': siteInfo.valore1Titolo,
    'chiSiamo.valore1Desc': siteInfo.valore1Desc,
    'chiSiamo.valore2Titolo': siteInfo.valore2Titolo,
    'chiSiamo.valore2Desc': siteInfo.valore2Desc,
    'chiSiamo.valore3Titolo': siteInfo.valore3Titolo,
    'chiSiamo.valore3Desc': siteInfo.valore3Desc,
    'chiSiamo.valore4Titolo': siteInfo.valore4Titolo,
    'chiSiamo.valore4Desc': siteInfo.valore4Desc,
  } : {}, [siteInfo]);
  useSiteOverrides(chiSiamoOverrides);

  const values = valueKeys.map((vk, i) => ({
    icon: valueIcons[i],
    title: t(vk.titleKey),
    description: t(vk.descKey),
  }));

  return (
    <section id="chisiamo" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-[var(--primary)] font-semibold text-sm uppercase tracking-wider">
            {t('chiSiamo.subtitle')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
            {t('chiSiamo.defaultTitle')}
          </h2>
        </div>

        {/* Content with image */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Text */}
            <div className="text-center md:text-left">
              <p className="text-gray-600 text-lg leading-relaxed">
                {t('chiSiamo.defaultText')}
              </p>
            </div>

            {/* Featured image from SiteInfo */}
            {siteInfo?.chiSiamoImageUrl && (
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={siteInfo.chiSiamoImageUrl}
                  alt={t('chiSiamo.defaultTitle')}
                  className="w-full h-64 md:h-80 object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Image Gallery from SiteImage */}
        {images.length > 0 && (
          <div className="mb-16">
            <h3 className="text-xl font-semibold text-gray-800 text-center mb-6">{t('chiSiamo.galleria')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group"
                >
                  <div className="relative h-40 md:h-48">
                    <img
                      src={img.url}
                      alt={img.titolo || 'Galleria'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {img.titolo && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <p className="text-white text-sm font-medium">{img.titolo}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Values Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => (
            <div
              key={v.title}
              className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-[var(--primary)]/5 transition-colors group"
            >
              <div className="w-14 h-14 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--primary)]/15 transition-colors">
                <v.icon className="h-7 w-7 text-[var(--primary)]" />
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