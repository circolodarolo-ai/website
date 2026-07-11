'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useMarketingConsent } from '@/hooks/useAnalytics';
import { useI18n } from '@/lib/i18n-context';

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

interface AdSenseSlots {
  adSenseId: string | null;
  adSenseSlotHorizontal: string | null;
  adSenseSlotRectangle: string | null;
  adSenseSlotTop: string | null;
  adSenseSlotInline: string | null;
}

interface BannerContainerProps {
  pagina: string;
  posizione?: string;
}

// Mappa posizione -> campo slot AdSense
function getAdSenseSlot(slots: AdSenseSlots, posizione?: string): string | null {
  if (!slots.adSenseId) return null;
  switch (posizione) {
    case 'top': return slots.adSenseSlotTop;
    case 'bottom': return slots.adSenseSlotHorizontal;
    case 'inline': return slots.adSenseSlotInline;
    case 'sidebar': return slots.adSenseSlotRectangle;
    default: return slots.adSenseSlotHorizontal;
  }
}

// Dimensioni dell'ins in base alla posizione
function getAdSize(posizione?: string): { width: number; height: number } {
  switch (posizione) {
    case 'top': return { width: 728, height: 90 };
    case 'bottom': return { width: 728, height: 90 };
    case 'inline': return { width: 336, height: 280 };
    case 'sidebar': return { width: 300, height: 250 };
    default: return { width: 728, height: 90 };
  }
}

export default function BannerContainer({ pagina, posizione }: BannerContainerProps) {
  const marketingConsent = useMarketingConsent();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [adSlots, setAdSlots] = useState<AdSenseSlots | null>(null);

  // Carica gli slot AdSense
  useEffect(() => {
    fetch('/api/company-data-public')
      .then((r) => r.json())
      .then((data) => {
        setAdSlots({
          adSenseId: data.adSenseId || null,
          adSenseSlotHorizontal: data.adSenseSlotHorizontal || null,
          adSenseSlotRectangle: data.adSenseSlotRectangle || null,
          adSenseSlotTop: data.adSenseSlotTop || null,
          adSenseSlotInline: data.adSenseSlotInline || null,
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!marketingConsent) {
      setBanners([]);
      return;
    }
    fetch(`/api/banners?pagina=${pagina}${posizione ? `&posizione=${posizione}` : ''}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBanners(data);
      })
      .catch(() => {});
  }, [marketingConsent, pagina, posizione]);

  if (banners.length === 0) return null;

  return (
    <>
      {banners.map((banner) => {
        // Se il banner e' di tipo adsense e abbiamo uno slot configurato, usa il vero annuncio
        if (banner.tipo === 'adsense' && adSlots) {
          const slotId = getAdSenseSlot(adSlots, posizione);
          if (slotId) {
            return (
              <AdSenseUnit
                key={banner.id}
                adClient={adSlots.adSenseId!}
                adSlot={slotId}
                posizione={posizione}
                stileSfondo={banner.coloreSfondo}
              />
            );
          }
        }

        // Per tipo adsense senza slot configurato, mostra placeholder
        if (banner.tipo === 'adsense') {
          return <AdSensePlaceholder key={banner.id} banner={banner} posizione={posizione} />;
        }

        // Tipi custom e sponsor
        if (posizione === 'inline') return <InlineBanner key={banner.id} banner={banner} />;
        if (posizione === 'sidebar') return <SidebarBanner key={banner.id} banner={banner} />;
        return <HorizontalBanner key={banner.id} banner={banner} posizione={posizione} />;
      })}
    </>
  );
}

/* ─── Annuncio Google AdSense reale ─── */
function AdSenseUnit({ adClient, adSlot, posizione, stileSfondo }: {
  adClient: string;
  adSlot: string;
  posizione?: string;
  stileSfondo?: string | null;
}) {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);
  const size = getAdSize(posizione);

  const pushAd = useCallback(() => {
    if (pushed.current || !adRef.current) return;
    try {
      // @ts-expect-error adsbygoogle globale
      if (typeof window.adsbygoogle !== 'undefined') {
        pushed.current = true;
        // @ts-expect-error adsbygoogle globale
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch {}
  }, []);

  useEffect(() => {
    // Ritarda il push per dare tempo al script di caricarsi
    const timer = setTimeout(pushAd, 500);
    return () => clearTimeout(timer);
  }, [pushAd]);

  const isInline = posizione === 'inline';
  const isSidebar = posizione === 'sidebar';

  return (
    <div
      className={`overflow-hidden rounded-xl transition-all ${
        isInline ? 'border-2 border-gray-100 h-full' :
        isSidebar ? 'border border-gray-200/70' :
        'border border-gray-200/70 my-4'
      }`}
      style={{ backgroundColor: stileSfondo || (isInline ? '#ffffff' : '#f9fafb') }}
    >
      <div
        ref={adRef}
        className={`flex items-center justify-center ${
          isInline ? 'p-2 min-h-[200px]' :
          isSidebar ? 'p-2' :
          'p-2'
        }`}
      >
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', maxWidth: `${size.width}px`, height: `${size.height}px` }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}

/* ─── Placeholder quando AdSense non ha slot configurato ─── */
function AdSensePlaceholder({ banner, posizione }: { banner: Banner; posizione?: string }) {
  const { t } = useI18n();
  const isInline = posizione === 'inline';
  const isSidebar = posizione === 'sidebar';

  if (isInline) {
    return (
      <div
        className="overflow-hidden border-2 border-gray-100 rounded-2xl h-full"
        style={{ backgroundColor: banner.coloreSfondo || '#ffffff' }}
      >
        <div className="p-6 flex flex-col items-center justify-center h-full min-h-[200px] text-center">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">{t('banners.pubblicita')}</p>
          {banner.titolo && <p className="font-bold text-gray-900 text-lg">{banner.titolo}</p>}
          {banner.descrizione && <p className="text-sm text-gray-500 mt-1">{banner.descrizione}</p>}
          {banner.ctaTesto && banner.ctaUrl && (
            <a href={banner.ctaUrl} target="_blank" rel="noopener noreferrer sponsored"
              className="inline-block mt-3 px-4 py-2 bg-[var(--primary)] text-white text-sm rounded-full hover:opacity-90">
              {banner.ctaTesto}
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-gray-200/70 ${isSidebar ? '' : 'my-4'}`}
      style={{ backgroundColor: banner.coloreSfondo || '#f9fafb' }}
    >
      <div className={`text-center ${isSidebar ? 'p-4' : 'p-4 sm:p-6'}`}>
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">{t('banners.pubblicita')}</p>
        {banner.titolo && <p className="font-semibold text-gray-800 text-sm sm:text-base">{banner.titolo}</p>}
        {banner.descrizione && <p className="text-xs sm:text-sm text-gray-600 mt-1">{banner.descrizione}</p>}
      </div>
    </div>
  );
}

/* ─── Inline: identico alle schede eventi (border-2, h-48, p-6) ─── */
function InlineBanner({ banner }: { banner: Banner }) {
  const { t } = useI18n();
  return (
    <a
      href={banner.ctaUrl || banner.sponsorUrl || '#'}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="block"
    >
      <div
        className="overflow-hidden border-2 border-gray-100 hover:border-[var(--primary-100)] rounded-2xl transition-all hover:shadow-xl group h-full"
        style={{ backgroundColor: banner.coloreSfondo || '#ffffff' }}
      >
        {banner.immagineUrl ? (
          <>
            <div className="relative h-48 overflow-hidden">
              <img
                src={banner.immagineUrl}
                alt={banner.titolo || banner.sponsorNome || t('banners.pubblicita')}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <span className="bg-white/90 backdrop-blur-sm text-gray-500 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full">
                  {t('banners.sponsor')}
                </span>
              </div>
            </div>
            <div className="p-6">
              {banner.titolo && (
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[var(--primary)] transition-colors">
                  {banner.titolo}
                </h3>
              )}
              {banner.descrizione && (
                <p className="text-gray-500 text-sm leading-relaxed mt-2 line-clamp-2">{banner.descrizione}</p>
              )}
              <div className="flex items-center justify-between mt-4">
                {banner.sponsorNome && (
                  <span className="text-xs text-gray-400">{banner.sponsorNome}</span>
                )}
                {banner.ctaTesto && (
                  <span className="text-sm font-medium text-[var(--primary)] hover:underline">
                    {banner.ctaTesto} &rarr;
                  </span>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="p-6 flex flex-col justify-center h-full min-h-[200px]">
            {banner.sponsorLogo && (
              <img src={banner.sponsorLogo} alt={banner.sponsorNome} className="h-10 w-auto mb-3 rounded" />
            )}
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">{t('banners.pubblicita')}</p>
            {banner.titolo && (
              <h3 className="text-xl font-bold text-gray-900">{banner.titolo}</h3>
            )}
            {banner.descrizione && (
              <p className="text-gray-500 text-sm leading-relaxed mt-2">{banner.descrizione}</p>
            )}
            <div className="flex items-center justify-between mt-4">
              {banner.sponsorNome && (
                <span className="text-xs text-gray-400">{banner.sponsorNome}</span>
              )}
              {banner.ctaTesto && banner.ctaUrl && (
                <span className="text-sm font-medium text-[var(--primary)] hover:underline">
                  {banner.ctaTesto} &rarr;
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </a>
  );
}

/* ─── Sidebar: compatto, verticale ─── */
function SidebarBanner({ banner }: { banner: Banner }) {
  const { t } = useI18n();
  return (
    <a
      href={banner.ctaUrl || banner.sponsorUrl || '#'}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="block"
    >
      <div
        className="rounded-xl overflow-hidden border border-gray-200/70 transition-all hover:shadow-lg hover:border-gray-300 bg-white"
        style={{ backgroundColor: banner.coloreSfondo || '#ffffff' }}
      >
        {banner.immagineUrl ? (
          <div className="p-2">
            <img
              src={banner.immagineUrl}
              alt={banner.titolo || banner.sponsorNome || t('banners.pubblicita')}
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>
        ) : (
          <div className="p-3 text-center">
            {banner.sponsorLogo && (
              <img src={banner.sponsorLogo} alt={banner.sponsorNome} className="h-10 w-auto mx-auto mb-2" />
            )}
          </div>
        )}
        <div className="px-3 pb-3 text-center">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{t('banners.sponsor')}</p>
          {banner.titolo && (
            <p className="text-sm font-bold text-gray-800 leading-tight">{banner.titolo}</p>
          )}
          {banner.descrizione && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-3">{banner.descrizione}</p>
          )}
          {banner.ctaTesto && (
            <span className="inline-block mt-2 text-xs font-medium text-[var(--primary)] hover:underline">
              {banner.ctaTesto} &rarr;
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

/* ─── Top / Bottom: orizzontale compatto ─── */
function HorizontalBanner({ banner, posizione }: { banner: Banner; posizione?: string }) {
  const { t } = useI18n();
  const isTop = posizione === 'top';
  return (
    <a
      href={banner.ctaUrl || banner.sponsorUrl || '#'}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="block my-4"
    >
      <div
        className="rounded-xl overflow-hidden border border-gray-200/70 transition-all hover:shadow-lg hover:border-gray-300"
        style={{ backgroundColor: banner.coloreSfondo || '#f9fafb' }}
      >
        {banner.immagineUrl ? (
          <div className="relative">
            <img
              src={banner.immagineUrl}
              alt={banner.titolo || banner.sponsorNome || t('banners.pubblicita')}
              className={`w-full object-cover rounded-xl ${isTop ? 'h-24 sm:h-32' : 'h-20 sm:h-28'}`}
            />
            {(banner.titolo || banner.sponsorNome) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 sm:p-4">
                {banner.titolo && (
                  <p className="text-white font-semibold text-sm sm:text-base drop-shadow">{banner.titolo}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-4 sm:p-6">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{t('banners.pubblicita')}</p>
            {banner.titolo && (
              <p className="font-semibold text-gray-800 text-sm sm:text-base">{banner.titolo}</p>
            )}
            {banner.descrizione && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-lg mx-auto">{banner.descrizione}</p>
            )}
            {banner.ctaTesto && (
              <span className="inline-block mt-2 text-xs sm:text-sm font-medium text-[var(--primary)] hover:underline">
                {banner.ctaTesto} &rarr;
              </span>
            )}
          </div>
        )}
      </div>
    </a>
  );
}