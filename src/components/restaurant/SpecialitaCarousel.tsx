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
      .catch(() => {})
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
    if (diff === 2 || (activeIndex >= articoli.length - 2 && index <= 1)) return 'after-all';
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
    <>
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
            <div className="sp-carousel-container">
              <div className="sp-carousel-content">
                {articoli.map((articolo, index) => {
                  const itemClass = getItemClass(index);
                  const gradient = foodGradients[index % foodGradients.length];
                  const emoji = foodEmojis[articolo.Categoria?.nome] || '🍽️';

                  return (
                    <div key={articolo.id} className={`sp-step-item ${itemClass}`}>
                      <div
                        className="sp-card-content cursor-pointer"
                        onClick={() => router.push(`/menu#art-${articolo.id}`)}
                      >
                        <div className="sp-card-image" style={{ background: articolo.immagineUrl ? 'transparent' : gradient }}>
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
                          <div className="sp-badges">
                            {articolo.eBestChoice && (
                              <span className="sp-badge sp-badge-best-choice flex items-center gap-1">
                                <Star className="h-3 w-3 fill-current" /> {t('specialita.bestChoice')}
                              </span>
                            )}
                            {isPromo(articolo) && (
                              <span className="sp-badge sp-badge-promo">{t('specialita.promo')}</span>
                            )}
                          </div>
                          <div className="absolute bottom-3 left-3">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full">
                              {dbTr.t('specialita.' + articolo.id + '.cat', articolo.Categoria?.nome)}
                            </span>
                          </div>
                        </div>

                        <div className="sp-card-info">
                          <div>
                            <div className="sp-card-title">{dbTr.t('specialita.' + articolo.id + '.nome', articolo.nome)}</div>
                            {articolo.descrizione && (
                              <div className="sp-card-description">{dbTr.t('specialita.' + articolo.id + '.desc', articolo.descrizione)}</div>
                            )}
                          </div>
                          <div className="sp-card-footer">
                            <div className="sp-card-price">
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

              <button className="sp-nav-btn sp-nav-prev" onClick={goToPrevious} aria-label={t('specialita.precedente')}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className="sp-nav-btn sp-nav-next" onClick={goToNext} aria-label={t('specialita.successivo')}>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="sp-indicators">
              {articoli.map((_, index) => (
                <button
                  key={index}
                  className={`sp-indicator ${index === activeIndex ? 'sp-indicator-active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={t('specialita.vaiAllaSlide', { n: String(index + 1) })}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Scoped styles via regular <style> tag instead of styled-jsx */}
      <style dangerouslySetInnerHTML={{ __html: `
        .sp-carousel-container {
          position: relative; display: flex; justify-content: center; align-items: center;
          height: 500px; overflow: hidden; perspective: 1000px;
        }
        @media (max-width: 768px) { .sp-carousel-container { height: 420px; } }
        @media (max-width: 480px) { .sp-carousel-container { height: 380px; } }
        .sp-carousel-content {
          position: relative; width: 100%; height: 100%;
          display: flex; justify-content: center; align-items: center;
        }
        .sp-step-item {
          position: absolute; width: 320px; height: 450px;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); transform-style: preserve-3d;
        }
        @media (max-width: 768px) { .sp-step-item { width: 260px; height: 380px; } }
        @media (max-width: 480px) { .sp-step-item { width: 220px; height: 340px; } }
        .sp-step-item.active { z-index: 3; transform: translateX(0) scale(1); opacity: 1; }
        .sp-step-item.before { z-index: 2; transform: translateX(-120%) scale(0.8); opacity: 0.7; filter: blur(2px); }
        .sp-step-item.after { z-index: 2; transform: translateX(120%) scale(0.8); opacity: 0.7; filter: blur(2px); }
        .sp-step-item.before-all, .sp-step-item.after-all { z-index: 1; transform: translateX(0) scale(0.6); opacity: 0; filter: blur(4px); }
        .sp-card-content {
          width: 100%; height: 100%; background: white; border-radius: 20px; overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15); transition: all 0.5s ease;
        }
        .sp-step-item.active .sp-card-content { box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25); }
        .sp-card-image { position: relative; width: 100%; height: 60%; overflow: hidden; }
        .sp-badges { position: absolute; top: 12px; left: 12px; display: flex; flex-direction: column; gap: 6px; z-index: 2; }
        .sp-badge {
          padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.5px; color: white;
        }
        .sp-badge-best-choice { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
        .sp-badge-promo { background: var(--primary); }
        .sp-card-info { padding: 16px; height: 40%; display: flex; flex-direction: column; justify-content: space-between; }
        .sp-card-title { font-size: 1.25rem; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; line-height: 1.3; }
        .sp-card-description {
          font-size: 0.85rem; color: #666; line-height: 1.4;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .sp-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
        .sp-card-price { font-size: 1.5rem; font-weight: 800; color: #059669; }
        .sp-nav-btn {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 50px; height: 50px; border-radius: 50%; background: white; border: none;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.3s ease; z-index: 10; color: #1a1a1a;
        }
        .sp-nav-btn:hover { transform: translateY(-50%) scale(1.1); box-shadow: 0 6px 30px rgba(0, 0, 0, 0.2); }
        .sp-nav-btn:active { transform: translateY(-50%) scale(0.95); }
        .sp-nav-prev { left: 20px; }
        .sp-nav-next { right: 20px; }
        @media (max-width: 768px) { .sp-nav-prev { left: 10px; } .sp-nav-next { right: 10px; } .sp-nav-btn { width: 42px; height: 42px; } }
        @media (max-width: 480px) { .sp-nav-prev { left: 5px; } .sp-nav-next { right: 5px; } .sp-nav-btn { width: 38px; height: 38px; } }
        .sp-indicators { display: flex; justify-content: center; gap: 10px; margin-top: 24px; }
        .sp-indicator {
          width: 10px; height: 10px; border-radius: 50%; background: #d1d5db; border: none;
          cursor: pointer; transition: all 0.3s ease;
        }
        .sp-indicator:hover { background: #9ca3af; }
        .sp-indicator-active { width: 30px; border-radius: 5px; background: var(--primary); }
      `}} />
    </>
  );
}