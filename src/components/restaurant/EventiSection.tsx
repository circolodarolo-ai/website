'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, Star, Loader2, MapPin, Users, Repeat } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n-context';
import { useDbTranslation } from '@/hooks/useDbTranslation';

interface Evento {
  id: string;
  titolo: string;
  slug: string;
  descrizioneBreve: string;
  descrizione: string;
  immagineUrl: string | null;
  data: string;
  oraInizio: string;
  oraFine: string;
  prezzo: number;
  gratuito: boolean;
  inEvidenza: boolean;
  nuovo: boolean;
  capacita: number;
  postiDisponibili: number;
  location: string | null;
  ricorrente: boolean;
  giorniRicorrenza: string | null;
}

// Event-themed gradient backgrounds for cards without images
const eventGradients = [
  'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)',
  'linear-gradient(135deg, #0369a1 0%, #38bdf8 100%)',
  'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
  'linear-gradient(135deg, #059669 0%, #34d399 100%)',
  'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
  'linear-gradient(135deg, #be185d 0%, #f472b6 100%)',
  'linear-gradient(135deg, #4338ca 0%, #818cf8 100%)',
  'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
];

export default function EventiSection() {
  const { t } = useI18n();
  const dbTr = useDbTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [eventi, setEventi] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/eventi')
      .then((r) => r.json())
      .then((data: Evento[]) => {
        // Ricorrenti first (sorted by inEvidenza), then upcoming by date
        const ricorrenti = data.filter(e => e.ricorrente).sort((a, b) => (b.inEvidenza ? 1 : 0) - (a.inEvidenza ? 1 : 0));
        const futuri = data
          .filter((e) => !e.ricorrente && new Date(e.data) >= new Date(new Date().toDateString()))
          .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
        setEventi([...ricorrenti, ...futuri]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (eventi.length === 0) return;
    const texts: Record<string, string | null | undefined> = {};
    for (const ev of eventi) {
      texts[`evento.${ev.id}.titolo`] = ev.titolo;
      texts[`evento.${ev.id}.descBreve`] = ev.descrizioneBreve;
      if (ev.descrizione && ev.descrizione !== ev.descrizioneBreve) {
        texts[`evento.${ev.id}.descrizione`] = ev.descrizione;
      }
      texts[`evento.${ev.id}.location`] = ev.location;
    }
    dbTr.register(texts);
  }, [eventi, dbTr.register]);

  // Auto-advance carousel
  useEffect(() => {
    if (eventi.length <= 1) return;
    const interval = setInterval(() => {
      goToNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [activeIndex, eventi.length]);

  const goToPrevious = () => {
    if (isAnimating || eventi.length === 0) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev === 0 ? eventi.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToNext = () => {
    if (isAnimating || eventi.length === 0) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev === eventi.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || eventi.length === 0) return;
    setIsAnimating(true);
    setActiveIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const getItemClass = (index: number) => {
    if (eventi.length === 0) return 'before-all';
    const diff = (index - activeIndex + eventi.length) % eventi.length;
    if (diff === 0) return 'active';
    if (diff === 1 || (activeIndex === eventi.length - 1 && index === 0)) return 'after';
    if (diff === eventi.length - 1) return 'before';
    if (diff === 2 || (activeIndex >= eventi.length - 2 && index <= 1)) return 'after-all';
    return 'before-all';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatGiorni = (giorni: string | null) => {
    if (!giorni) return '';
    const dayMap: Record<string, string> = {
      'lunedì': 'Lunedì', 'martedì': 'Martedì', 'mercoledì': 'Mercoledì',
      'giovedì': 'Giovedì', 'venerdì': 'Venerdì', 'sabato': 'Sabato', 'domenica': 'Domenica',
    };
    return giorni.split(',').map(g => dayMap[g.trim().toLowerCase()] || g.trim()).join(', ');
  };

  if (loading) {
    return (
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <div className="h-4 w-32 bg-gray-200 rounded mx-auto mb-3" />
            <div className="h-8 w-64 bg-gray-200 rounded mx-auto" />
            <div className="h-4 w-48 bg-gray-200 rounded mx-auto mt-3" />
          </div>
          <div className="flex justify-center items-center h-[420px]">
            <Loader2 className="h-8 w-8 text-[var(--primary)] animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (eventi.length === 0) return null;

  return (
    <>
      <section id="eventi" className="py-20 px-4 bg-gray-50 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <span className="text-[var(--primary)] font-semibold text-sm uppercase tracking-wider">
              {t('eventiSection.subtitle')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
              {t('eventiSection.title')}
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              {t('eventiSection.description')}
            </p>
          </div>
        </div>

        {/* 3D Carousel */}
        <div className="ev-carousel-container">
          <div className="ev-carousel-content">
            {eventi.map((evento, index) => {
              const itemClass = getItemClass(index);
              const gradient = eventGradients[index % eventGradients.length];

              return (
                <div key={evento.id} className={`ev-step-item ${itemClass}`}>
                  <div className="ev-card-content">
                    {/* Image area */}
                    <div className="ev-card-image" style={{ background: evento.immagineUrl ? 'transparent' : gradient }}>
                      {evento.immagineUrl ? (
                        <img
                          src={evento.immagineUrl}
                          alt={dbTr.t('evento.' + evento.id + '.titolo', evento.titolo)}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Calendar className="h-16 w-16 text-white/40" />
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      {/* Badges */}
                      <div className="ev-badges">
                        {evento.inEvidenza && (
                          <span className="ev-badge ev-badge-evidenza flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" /> {t('eventiSection.inEvidenza')}
                          </span>
                        )}
                        {evento.nuovo && (
                          <span className="ev-badge ev-badge-nuovo">{t('eventiSection.nuovo')}</span>
                        )}
                      </div>
                      {/* Price badge bottom-right */}
                      <div className="absolute bottom-3 right-3 z-10">
                        <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-sm font-bold text-[var(--primary)] rounded-full shadow-sm">
                          {evento.gratuito ? t('eventiSection.gratuito') : `${evento.prezzo.toFixed(2)}\u20ac`}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="ev-card-info">
                      <div>
                        {/* Date & Time row */}
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                          {evento.ricorrente ? (
                            <span className="flex items-center gap-1 text-purple-600 font-medium">
                              <Repeat className="h-3.5 w-3.5" />
                              {t('eventiSection.ogni', { giorni: formatGiorni(evento.giorniRicorrenza) })}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(evento.data)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {evento.oraInizio} - {evento.oraFine}
                          </span>
                        </div>
                        {/* Title */}
                        <div className="ev-card-title">{dbTr.t('evento.' + evento.id + '.titolo', evento.titolo)}</div>
                        {/* Description */}
                        <div className="ev-card-desc">
                          {evento.descrizioneBreve
                            ? dbTr.t('evento.' + evento.id + '.descBreve', evento.descrizioneBreve)
                            : dbTr.t('evento.' + evento.id + '.descrizione', evento.descrizione)
                          }
                        </div>
                      </div>
                      <div className="ev-card-footer">
                        {/* Location if available */}
                        {evento.location && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin className="h-3.5 w-3.5" />
                            {dbTr.t('evento.' + evento.id + '.location', evento.location)}
                          </span>
                        )}
                        {/* Seats remaining */}
                        {evento.postiDisponibili > 0 && evento.postiDisponibili <= 20 && (
                          <span className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                            <Users className="h-3.5 w-3.5" />
                            {evento.postiDisponibili} {t('eventiSection.postiRimasti')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Nav buttons */}
          <button
            className="ev-nav-btn ev-nav-prev"
            onClick={goToPrevious}
            aria-label={t('eventiSection.precedente')}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            className="ev-nav-btn ev-nav-next"
            onClick={goToNext}
            aria-label={t('eventiSection.successivo')}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Indicators */}
        <div className="ev-indicators">
          {eventi.map((_, index) => (
            <button
              key={index}
              className={`ev-indicator ${index === activeIndex ? 'ev-indicator-active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={t('eventiSection.vaiAllEvento', { n: String(index + 1) })}
            />
          ))}
        </div>

        {/* CTA link */}
        <div className="text-center mt-8">
          <Link
            href="/eventi"
            className="inline-flex items-center gap-1.5 text-[var(--primary)] hover:opacity-80 font-medium text-sm transition-colors group"
          >
            {t('eventiSection.vediTutti')}
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Embedded styles for 3D carousel - events variant */}
      <style dangerouslySetInnerHTML={{ __html: `
        .ev-carousel-container {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 500px;
          overflow: hidden;
          perspective: 1000px;
        }
        @media (max-width: 768px) {
          .ev-carousel-container { height: 420px; }
        }
        @media (max-width: 480px) {
          .ev-carousel-container { height: 380px; }
        }
        .ev-carousel-content {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .ev-step-item {
          position: absolute;
          width: 320px;
          height: 450px;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }
        @media (max-width: 768px) {
          .ev-step-item { width: 260px; height: 380px; }
        }
        @media (max-width: 480px) {
          .ev-step-item { width: 220px; height: 340px; }
        }
        .ev-step-item.active {
          z-index: 3;
          transform: translateX(0) scale(1);
          opacity: 1;
        }
        .ev-step-item.before {
          z-index: 2;
          transform: translateX(-120%) scale(0.8);
          opacity: 0.7;
          filter: blur(2px);
        }
        .ev-step-item.after {
          z-index: 2;
          transform: translateX(120%) scale(0.8);
          opacity: 0.7;
          filter: blur(2px);
        }
        .ev-step-item.before-all,
        .ev-step-item.after-all {
          z-index: 1;
          transform: translateX(0) scale(0.6);
          opacity: 0;
          filter: blur(4px);
        }
        .ev-card-content {
          width: 100%;
          height: 100%;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          transition: all 0.5s ease;
        }
        .ev-step-item.active .ev-card-content {
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
        }
        .ev-card-image {
          position: relative;
          width: 100%;
          height: 60%;
          overflow: hidden;
        }
        .ev-badges {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 2;
        }
        .ev-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: white;
        }
        .ev-badge-evidenza {
          background: var(--primary);
        }
        .ev-badge-nuovo {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        }
        .ev-card-info {
          padding: 16px;
          height: 40%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .ev-card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 4px;
          line-height: 1.3;
        }
        .ev-card-desc {
          font-size: 0.85rem;
          color: #666;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .ev-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }
        .ev-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: white;
          border: none;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 10;
          color: #1a1a1a;
        }
        .ev-nav-btn:hover {
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 6px 30px rgba(0, 0, 0, 0.2);
        }
        .ev-nav-btn:active {
          transform: translateY(-50%) scale(0.95);
        }
        .ev-nav-prev { left: 20px; }
        .ev-nav-next { right: 20px; }
        @media (max-width: 768px) {
          .ev-nav-prev { left: 10px; }
          .ev-nav-next { right: 10px; }
          .ev-nav-btn { width: 42px; height: 42px; }
        }
        @media (max-width: 480px) {
          .ev-nav-prev { left: 5px; }
          .ev-nav-next { right: 5px; }
          .ev-nav-btn { width: 38px; height: 38px; }
        }
        .ev-indicators {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 24px;
        }
        .ev-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #d1d5db;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .ev-indicator:hover { background: #9ca3af; }
        .ev-indicator-active {
          width: 30px;
          border-radius: 5px;
          background: var(--primary);
        }
      ` }} />
    </>
  );
}