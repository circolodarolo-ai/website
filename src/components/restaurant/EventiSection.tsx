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
      <div className="carousel-container">
        <div className="carousel-content">
          {eventi.map((evento, index) => {
            const itemClass = getItemClass(index);
            const gradient = eventGradients[index % eventGradients.length];

            return (
              <div key={evento.id} className={`step-content-item ${itemClass}`}>
                <div className="card-content">
                  {/* Image area */}
                  <div className="card-image" style={{ background: evento.immagineUrl ? 'transparent' : gradient }}>
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
                    <div className="badges">
                      {evento.inEvidenza && (
                        <span className="badge badge-evidenza flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" /> {t('eventiSection.inEvidenza')}
                        </span>
                      )}
                      {evento.nuovo && (
                        <span className="badge badge-nuovo">{t('eventiSection.nuovo')}</span>
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
                  <div className="card-info">
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
                      <div className="card-title">{dbTr.t('evento.' + evento.id + '.titolo', evento.titolo)}</div>
                      {/* Description */}
                      <div className="card-description">
                        {evento.descrizioneBreve
                          ? dbTr.t('evento.' + evento.id + '.descBreve', evento.descrizioneBreve)
                          : dbTr.t('evento.' + evento.id + '.descrizione', evento.descrizione)
                        }
                      </div>
                    </div>
                    <div className="card-footer">
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
          className="nav-button nav-button-prev"
          onClick={goToPrevious}
          aria-label={t('eventiSection.precedente')}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          className="nav-button nav-button-next"
          onClick={goToNext}
          aria-label={t('eventiSection.successivo')}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Indicators */}
      <div className="indicators">
        {eventi.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === activeIndex ? 'active' : ''}`}
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

      {/* Carousel CSS now in globals.css — no inline <style> to prevent hydration mismatch */}
    </section>
  );
}
