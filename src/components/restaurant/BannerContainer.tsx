'use client';

import { useEffect, useState } from 'react';
import { useMarketingConsent } from '@/hooks/useAnalytics';

interface Banner {
  id: string;
  tipo: string;
  posizione: string;
  sponsorNome: string;
  sponsorLogo: string | null;
  sponsorUrl: string;
  titolo: string | null;
  descrizione: string | null;
  ctaTesto: string | null;
  ctaUrl: string | null;
  immagineUrl: string | null;
  coloreSfondo: string | null;
  attivo: boolean;
  ordine: number;
  pagine: string | null;
}

interface BannerContainerProps {
  pagina: string;
  posizione?: string;
}

export default function BannerContainer({ pagina, posizione }: BannerContainerProps) {
  const marketingConsent = useMarketingConsent();
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    if (!marketingConsent) {
      setBanners([]);
      return;
    }
    fetch(`/api/banners?pagina=${pagina}${posizione ? `&posizione=${posizione}` : ''}`)
      .then((r) => r.json())
      .then(setBanners)
      .catch(() => {});
  }, [marketingConsent, pagina, posizione]);

  if (banners.length === 0) return null;

  return (
    <div className="space-y-4 my-6">
      {banners.map((banner) => (
        <div
          key={banner.id}
          className="rounded-xl overflow-hidden border border-gray-200 transition-all hover:shadow-md"
          style={{ backgroundColor: banner.coloreSfondo || '#f9fafb' }}
        >
          {banner.tipo === 'adsense' && (
            <div className="p-4 text-center">
              <p className="text-xs text-gray-400 mb-2">Pubblicità</p>
              {banner.immagineUrl ? (
                <a href={banner.ctaUrl || banner.sponsorUrl || '#'} target="_blank" rel="noopener noreferrer sponsored">
                  <img
                    src={banner.immagineUrl}
                    alt={banner.titolo || banner.sponsorNome || 'Pubblicità'}
                    className="max-w-full mx-auto rounded-lg"
                  />
                </a>
              ) : (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <p className="text-sm text-gray-500">Spazio pubblicitario - AdSense</p>
                  {banner.titolo && <p className="text-lg font-semibold mt-1">{banner.titolo}</p>}
                  {banner.descrizione && <p className="text-sm text-gray-600 mt-1">{banner.descrizione}</p>}
                  {banner.ctaTesto && banner.ctaUrl && (
                    <a
                      href={banner.ctaUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="inline-block mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-full hover:bg-red-700 transition-colors"
                    >
                      {banner.ctaTesto}
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {banner.tipo === 'custom' && (
            <div className="p-4 flex flex-col sm:flex-row items-center gap-4">
              {banner.immagineUrl && (
                <a href={banner.sponsorUrl || '#'} target="_blank" rel="noopener noreferrer sponsored" className="flex-shrink-0">
                  <img src={banner.immagineUrl} alt={banner.sponsorNome} className="h-16 w-auto object-contain rounded" />
                </a>
              )}
              <div className="flex-1 text-center sm:text-left">
                {banner.titolo && <p className="font-semibold text-gray-900">{banner.titolo}</p>}
                {banner.descrizione && <p className="text-sm text-gray-600 mt-1">{banner.descrizione}</p>}
                {banner.ctaTesto && banner.ctaUrl && (
                  <a
                    href={banner.ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="inline-block mt-2 text-sm text-red-600 hover:underline"
                  >
                    {banner.ctaTesto} →
                  </a>
                )}
              </div>
              {banner.sponsorNome && (
                <span className="text-xs text-gray-400 flex-shrink-0">Sponsor: {banner.sponsorNome}</span>
              )}
            </div>
          )}

          {banner.tipo === 'sponsor' && (
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                {banner.sponsorLogo && (
                  <img src={banner.sponsorLogo} alt={banner.sponsorNome} className="h-8 w-auto" />
                )}
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</span>
              </div>
              {banner.immagineUrl && (
                <a href={banner.sponsorUrl || '#'} target="_blank" rel="noopener noreferrer sponsored">
                  <img
                    src={banner.immagineUrl}
                    alt={banner.titolo || banner.sponsorNome || 'Sponsor'}
                    className="w-full rounded-lg"
                  />
                </a>
              )}
              {!banner.immagineUrl && (
                <div className="text-center py-6">
                  {banner.titolo && <p className="font-semibold text-gray-800 text-lg">{banner.titolo}</p>}
                  {banner.descrizione && <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">{banner.descrizione}</p>}
                  {banner.ctaTesto && banner.ctaUrl && (
                    <a
                      href={banner.ctaUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="inline-block mt-4 px-6 py-2.5 bg-gray-900 text-white text-sm rounded-full hover:bg-gray-800 transition-colors"
                    >
                      {banner.ctaTesto}
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}