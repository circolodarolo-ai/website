'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n-context';
import { useDbTranslation } from '@/hooks/useDbTranslation';

interface Articolo {
  id: string;
  nome: string;
  descrizione: string | null;
  prezzo: number;
  prezzoPromozionale: number | null;
  eBestChoice: boolean;
  immagineUrl: string | null;
  Categoria: { nome: string };
}

// Food gradient backgrounds for cards without images
const foodGradients = [
  'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
  'linear-gradient(135deg, #059669 0%, #34d399 100%)',
  'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
  'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)',
  'linear-gradient(135deg, #0369a1 0%, #38bdf8 100%)',
  'linear-gradient(135deg, #be185d 0%, #f472b6 100%)',
  'linear-gradient(135deg, #4338ca 0%, #818cf8 100%)',
  'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
];

const foodEmojis: Record<string, string> = {
  Antipasti: '🥗',
  'Primi Piatti': '🍝',
  'Secondi Piatti': '🥩',
  Dolci: '🍰',
  Bevande: '🍷',
};

export default function SpecialitaCarousel() {
  const { t } = useI18n();
  const dbTr = useDbTranslation();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [articoli, setArticoli] = useState<Articolo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articoli')
      .then((r) => r.json())
      .then(setArticoli)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (articoli.length === 0) return;
    const texts: Record<string, string | null | undefined> = {};
    for (const art of articoli) {
      texts[`specialita.${art.id}.nome`] = art.nome;
      texts[`specialita.${art.id}.desc`] = art.descrizione;
      texts[`specialita.${art.id}.cat`] = art.Categoria?.nome;
    }
    dbTr.register(texts);
  }, [articoli, dbTr.register]);

  const goToPrevious = () => {
    if (isAnimating || articoli.length === 0) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev === 0 ? articoli.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToNext = () => {
    if (isAnimating || articoli.length === 0) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev === articoli.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || articoli.length === 0) return;
    setIsAnimating(true);
    setActiveIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const getItemClass = (index: number) => {
    if (articoli.length === 0) return 'before-all';
    const diff = (index - activeIndex + articoli.length) % articoli.length;
    if (diff === 0) return 'active';
    if (diff === 1 || (activeIndex === articoli.length - 1 && index === 0)) return 'after';
    if (diff === articoli.length - 1) return 'before';
    if (
      diff === 2 ||
      (activeIndex >= articoli.length - 2 && index <= 1)
    )
      return 'after-all';
    return 'before-all';
  };

  const prezzoDaMostrare = (articolo: Articolo) => {
    return articolo.prezzoPromozionale ?? articolo.prezzo;
  };

  const isPromo = (articolo: Articolo) => {
    return !!articolo.prezzoPromozionale;
  };

  if (!loading && articoli.length === 0) return null;

  return (
    <section id="specialita" className="py-20 px-4 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4">
          <span className="text-[var(--primary)] font-semibold text-sm uppercase tracking-wider">
            {t('specialita.subtitle')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
            {t('specialita.title')}
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            {t('specialita.description')}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-[420px]">
          <Loader2 className="h-8 w-8 text-[var(--primary)] animate-spin" />
        </div>
      ) : (
        <>
          {/* 3D Carousel */}
          <div className="carousel-container">
            <div className="carousel-content">
              {articoli.map((articolo, index) => {
                const itemClass = getItemClass(index);
                const gradient = foodGradients[index % foodGradients.length];
                const emoji = foodEmojis[articolo.Categoria?.nome] || '🍽️';

                return (
                  <div key={articolo.id} className={`step-content-item ${itemClass}`}>
                    <div
                      className="card-content cursor-pointer"
                      onClick={() => router.push(`/menu#art-${articolo.id}`)}
                    >
                      {/* Image area */}
                      <div className="card-image" style={{ background: articolo.immagineUrl ? 'transparent' : gradient }}>
                        {articolo.immagineUrl ? (
                          <img
                            src={articolo.immagineUrl}
                            alt={dbTr.t('specialita.' + articolo.id + '.nome', articolo.nome)}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-7xl drop-shadow-lg">{emoji}</span>
                          </div>
                        )}
                        {/* Badges */}
                        <div className="badges">
                          {articolo.eBestChoice && (
                            <span className="badge badge-best-choice flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current" /> {t('specialita.bestChoice')}
                            </span>
                          )}
                          {isPromo(articolo) && (
                            <span className="badge badge-promo">{t('specialita.promo')}</span>
                          )}
                        </div>
                        {/* Category tag */}
                        <div className="absolute bottom-3 left-3">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full">
                            {dbTr.t('specialita.' + articolo.id + '.cat', articolo.Categoria?.nome)}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="card-info">
                        <div>
                          <div className="card-title">{dbTr.t('specialita.' + articolo.id + '.nome', articolo.nome)}</div>
                          {articolo.descrizione && (
                            <div className="card-description">{dbTr.t('specialita.' + articolo.id + '.desc', articolo.descrizione)}</div>
                          )}
                        </div>
                        <div className="card-footer">
                          <div className="card-price">
                            €{prezzoDaMostrare(articolo).toFixed(2)}
                            {isPromo(articolo) && (
                              <span className="text-sm font-normal text-gray-400 line-through ml-2">
                                €{articolo.prezzo.toFixed(2)}
                              </span>
                            )}
                          </div>
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
              aria-label={t('specialita.precedente')}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              className="nav-button nav-button-next"
              onClick={goToNext}
              aria-label={t('specialita.successivo')}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Indicators */}
          <div className="indicators">
            {articoli.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === activeIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={t('specialita.vaiAllaSlide', { n: String(index + 1) })}
              />
            ))}
          </div>
        </>
      )}

      {/* Carousel CSS now in globals.css — no inline <style> to prevent hydration mismatch */}
    </section>
  );
}