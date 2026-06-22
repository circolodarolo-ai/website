'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  ExternalLink,
} from 'lucide-react';

interface FooterInfo {
  indirizzo: string;
  telefono: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  justeatUrl?: string;
  deliverooUrl?: string;
  glovoUrl?: string;
  ubereatsUrl?: string;
}

interface SiteInfo {
  nomeLocale: string;
  orariApertura?: string;
}

const deliveryLinks = [
  { key: 'justeatUrl', label: 'Just Eat', color: 'hover:text-orange-500' },
  { key: 'deliverooUrl', label: 'Deliveroo', color: 'hover:text-teal-500' },
  { key: 'glovoUrl', label: 'Glovo', color: 'hover:text-yellow-500' },
  { key: 'ubereatsUrl', label: 'Uber Eats', color: 'hover:text-green-500' },
];

export default function Footer() {
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

  const activeDelivery = deliveryLinks.filter(
    (d) => footerInfo && (footerInfo as Record<string, unknown>)[d.key]
  );

  return (
    <footer id="contatti" className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Restaurant Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">
              {siteInfo?.nomeLocale || 'La Bella Tavola'}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-red-400 flex-shrink-0" />
                <span className="text-sm">{footerInfo?.indirizzo || 'Via Roma 123, 20121 Milano'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-red-400 flex-shrink-0" />
                <a
                  href={`tel:${footerInfo?.telefono || ''}`}
                  className="text-sm hover:text-white transition-colors"
                >
                  {footerInfo?.telefono || '+39 02 1234 5678'}
                </a>
              </div>

            </div>
          </div>

          {/* Hours & Delivery */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Orari &amp; Delivery</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 mt-0.5 text-red-400 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-white font-medium mb-1">Orari di Apertura</p>
                  <p className="text-gray-400 whitespace-pre-line">
                    {siteInfo?.orariApertura || footerInfo?.orariApertura || 'Mar-Dom: 12:00-14:30, 19:00-23:00'}
                  </p>
                </div>
              </div>

              {activeDelivery.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-white font-medium mb-2">Ordina online</p>
                  <div className="flex flex-wrap gap-2">
                    {activeDelivery.map((d) => (
                      <a
                        key={d.key}
                        href={(footerInfo as Record<string, unknown>)[d.key] as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 rounded-full text-xs font-medium text-gray-400 ${d.color} hover:bg-gray-700 transition-colors`}
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

          {/* Social */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Seguici</h3>
            <div className="flex gap-3 mb-6">
              {footerInfo?.facebookUrl && (
                <a
                  href={footerInfo.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {footerInfo?.instagramUrl && (
                <a
                  href={footerInfo.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white transition-all"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Chiuso il lunedì. Per gruppi superiori a 10 persone, vi preghiamo di contattarci
              direttamente per organizzare al meglio la vostra serata.
            </p>
          </div>
        </div>

        {/* Map */}
        <div className="mt-10 rounded-xl overflow-hidden border border-gray-700 shadow-lg">
          <iframe
            title="Posizione del ristorante"
            src="https://maps.google.com/maps?q=Via+Roma+123+Milano+Italia&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="250"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full grayscale hover:grayscale-0 transition-all duration-500"
          />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} {siteInfo?.nomeLocale || 'La Bella Tavola'}. Tutti i diritti riservati.
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <Link href="/cookie-policy" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}