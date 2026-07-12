'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n-context';
import { useDbTranslation } from '@/hooks/useDbTranslation';
import {
  MapPin,
  Phone,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  ExternalLink,
} from 'lucide-react';

interface FooterInfo {
  id: string;
  indirizzo: string | null;
  telefono: string | null;
  citta: string | null;
  cap: string | null;
  provincia: string | null;
  latitudine: number | null;
  longitudine: number | null;
  orariApertura: string | null;
  giorniChiusura: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  whatsappUrl: string | null;
  tiktokUrl: string | null;
  justeatUrl: string | null;
  deliverooUrl: string | null;
  glovoUrl: string | null;
  ubereatsUrl: string | null;
}

interface SiteInfo {
  nomeLocale: string;
}

const socialLinks: { key: keyof FooterInfo; icon: typeof Facebook; hoverColor: string }[] = [
  { key: 'facebookUrl', icon: Facebook, hoverColor: 'hover:bg-blue-600' },
  { key: 'instagramUrl', icon: Instagram, hoverColor: 'hover:bg-pink-600' },
  { key: 'twitterUrl', icon: Twitter, hoverColor: 'hover:bg-gray-500' },
  { key: 'linkedinUrl', icon: Linkedin, hoverColor: 'hover:bg-blue-700' },
  { key: 'whatsappUrl', icon: Phone, hoverColor: 'hover:bg-green-600' },
  { key: 'tiktokUrl', icon: Twitter, hoverColor: 'hover:bg-black' },
];

const deliveryLinks: { key: keyof FooterInfo; label: string; color: string }[] = [
  { key: 'justeatUrl', label: 'Just Eat', color: 'hover:text-orange-500' },
  { key: 'deliverooUrl', label: 'Deliveroo', color: 'hover:text-teal-500' },
  { key: 'glovoUrl', label: 'Glovo', color: 'hover:text-yellow-500' },
  { key: 'ubereatsUrl', label: 'Uber Eats', color: 'hover:text-green-500' },
];

export default function Footer() {
  const { t } = useI18n();
  const dbTr = useDbTranslation();
  const [footerInfo, setFooterInfo] = useState<FooterInfo | null>(null);
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/footer-info').then((r) => r.json()),
      fetch('/api/site-info').then((r) => r.json()),
    ])
      .then(([f, s]) => {
        setFooterInfo(f);
        setSiteInfo(s);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (footerInfo && siteInfo) {
      dbTr.register({
        'footer.nomeLocale': siteInfo.nomeLocale,
        'footer.indirizzo': footerInfo.indirizzo,
        'footer.citta': footerInfo.citta,
        'footer.orari': footerInfo.orariApertura,
        'footer.giorniChiusuraTesto': footerInfo.giorniChiusura,
      });
    }
  }, [footerInfo, siteInfo, dbTr]);

  const activeSocial = socialLinks.filter(
    (s) => footerInfo && footerInfo[s.key]
  );

  const activeDelivery = deliveryLinks.filter(
    (d) => footerInfo && footerInfo[d.key]
  );

  const mapSrc = useMemo(() => {
    if (!footerInfo) return '';
    if (footerInfo.latitudine && footerInfo.longitudine) {
      return `https://www.google.com/maps?q=${footerInfo.latitudine},${footerInfo.longitudine}&z=16&output=embed`;
    }
    const fullAddr = [footerInfo.indirizzo, footerInfo.cap, footerInfo.citta, footerInfo.provincia].filter(Boolean).join(', ');
    if (!fullAddr) return '';
    return `https://www.google.com/maps?q=${encodeURIComponent(fullAddr)}&z=16&output=embed`;
  }, [footerInfo]);

  const fullAddress = [
    dbTr.t('footer.indirizzo', footerInfo?.indirizzo),
    footerInfo?.cap,
    dbTr.t('footer.citta', footerInfo?.citta),
    footerInfo?.provincia && `(${footerInfo.provincia})`,
  ].filter(Boolean).join(', ');

  return (
    <footer id="contatti" style={{ backgroundColor: 'var(--footer-bg)', color: 'var(--footer-text)' }}>
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Top: Map left + Content right */}
        <div className="grid md:grid-cols-[280px_1fr] gap-10 items-start">
          {/* Map - square, left side */}
          {mapSrc && (
            <div className="aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-lg order-first md:order-first">
              <iframe
                title={t('footer.mappaTitolo')}
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          )}

          {/* Content columns */}
          <div className="grid sm:grid-cols-2 gap-8">
            {/* Column 1: Info + Schedule */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {dbTr.t('footer.nomeLocale', siteInfo?.nomeLocale || 'Il Nostro Ristorante')}
                </h3>
                {fullAddress && (
                  <div className="flex items-start gap-2.5 mb-2">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-60" />
                    <span className="text-sm leading-relaxed">{fullAddress}</span>
                  </div>
                )}
                {footerInfo?.telefono && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 flex-shrink-0 opacity-60" />
                    <a href={`tel:${footerInfo.telefono}`} className="text-sm hover:text-white transition-colors">
                      {footerInfo.telefono}
                    </a>
                  </div>
                )}
              </div>

              {(footerInfo?.orariApertura || footerInfo?.giorniChiusura) && (
                <div>
                  <div className="flex items-start gap-2.5">
                    <Clock className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-60" />
                    <div className="text-sm leading-relaxed">
                      {footerInfo?.orariApertura && (
                        <p className="whitespace-pre-line">{dbTr.t('footer.orari', footerInfo.orariApertura)}</p>
                      )}
                      {footerInfo?.giorniChiusura && (
                        <p className="mt-2">
                          <span className="font-semibold">{t('footer.giorniChiusura')}</span>{' '}
                          {dbTr.t('footer.giorniChiusuraTesto', footerInfo.giorniChiusura)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Column 2: Social + Delivery */}
            <div className="space-y-6">
              {activeSocial.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3">{t('footer.social')}</h4>
                  <div className="flex flex-wrap gap-2.5">
                    {activeSocial.map((s) => (
                      <a
                        key={s.key}
                        href={footerInfo![s.key] as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/60 ${s.hoverColor} hover:text-white transition-all`}
                      >
                        <s.icon className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {activeDelivery.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3">{t('footer.ordinaOnline')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeDelivery.map((d) => (
                      <a
                        key={d.key}
                        href={footerInfo![d.key] as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-xs font-medium text-white/70 ${d.color} hover:bg-white/15 transition-colors`}
                      >
                        <ExternalLink className="h-3 w-3" />
                        {d.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>


      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} {dbTr.t('footer.nomeLocale', siteInfo?.nomeLocale || 'Il Nostro Ristorante')}. {t('footer.diritti')}
          </p>
          <div className="flex gap-4 text-xs text-white/40">
            <Link href="/cookie-policy" className="hover:text-white/70 transition-colors">
              {t('footer.cookie')}
            </Link>
            <Link href="/privacy-policy" className="hover:text-white/70 transition-colors">
              {t('footer.privacy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}