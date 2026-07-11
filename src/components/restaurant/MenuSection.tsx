'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Flame } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';
import { useDbTranslation } from '@/hooks/useDbTranslation';

interface Allergene {
  id: string;
  nome: string;
  icona: string;
}

interface AllergeneArticolo {
  id: string;
  allergene: Allergene;
}

interface Articolo {
  id: string;
  nome: string;
  descrizione: string | null;
  prezzo: number;
  prezzoPromozionale: number | null;
  eBestChoice: boolean;
  eSurgelato: boolean;
  allergeni: AllergeneArticolo[];
}

interface Categoria {
  id: string;
  nome: string;
  ordine: number;
  articoli: Articolo[];
}

export default function MenuSection() {
  const { t } = useI18n();
  const dbTr = useDbTranslation();
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/menu')
      .then((r) => r.json())
      .then((data: Categoria[]) => {
        setCategorie(data);
        if (data.length > 0) setActiveTab(data[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (categorie.length === 0) return;
    const texts: Record<string, string | null | undefined> = {};
    for (const cat of categorie) {
      texts[`cat.${cat.id}`] = cat.nome;
      for (const art of cat.articoli) {
        texts[`art.${art.id}.nome`] = art.nome;
        texts[`art.${art.id}.desc`] = art.descrizione;
        for (const aa of art.allergeni) {
          if (aa.allergene.nome) {
            texts[`allergene.${aa.allergene.id}`] = aa.allergene.nome;
          }
        }
      }
    }
    dbTr.register(texts);
  }, [categorie, dbTr.register]);

  const activeCategoria = categorie.find((c) => c.id === activeTab);

  if (loading) {
    return (
      <section id="menu" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-96 mx-auto" />
          </div>
          <div className="flex gap-2 justify-center mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-28 rounded-full" />
            ))}
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-[var(--primary)] font-semibold text-sm uppercase tracking-wider">
            {t('menuSection.subtitle')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
            {t('menuSection.title')}
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            {t('menuSection.description')}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categorie.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === cat.id
                  ? 'bg-[var(--primary)] text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-[var(--primary)]/5 hover:text-[var(--primary)] border border-gray-200'
              }`}
            >
              {dbTr.t('cat.' + cat.id, cat.nome)}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {activeCategoria && (
          <div className="grid gap-4 max-w-4xl mx-auto">
            {activeCategoria.articoli.map((articolo) => (
              <div
                key={articolo.id}
                className="bg-white rounded-xl p-5 sm:p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--primary)] transition-colors">
                        {dbTr.t('art.' + articolo.id + '.nome', articolo.nome)}
                      </h3>
                      {articolo.eBestChoice && (
                        <Badge className="bg-amber-500 text-white text-xs gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          {t('menuSection.consigliato')}
                        </Badge>
                      )}
                      {articolo.eSurgelato && (
                        <Badge className="bg-blue-100 text-blue-700 text-xs gap-1 border border-blue-300">
                          ❄️ {t('menuSection.surgelato')}
                        </Badge>
                      )}
                    </div>
                    {articolo.descrizione && (
                      <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">
                        {dbTr.t('art.' + articolo.id + '.desc', articolo.descrizione)}
                      </p>
                    )}
                    {articolo.allergeni.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {articolo.allergeni.map((aa) => (
                          <span
                            key={aa.id}
                            title={dbTr.t('allergene.' + aa.allergene.id, aa.allergene.nome)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            <span>{aa.allergene.icona}</span>
                            <span>{dbTr.t('allergene.' + aa.allergene.id, aa.allergene.nome)}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="sm:text-right flex-shrink-0">
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                      {articolo.prezzoPromozionale && (
                        <span className="text-sm text-gray-400 line-through">
                          €{articolo.prezzo.toFixed(2)}
                        </span>
                      )}
                      <span className="text-xl font-bold text-[var(--primary)]">
                        €{(articolo.prezzoPromozionale || articolo.prezzo).toFixed(2)}
                      </span>
                    </div>
                    {articolo.prezzoPromozionale && (
                      <Badge variant="destructive" className="mt-1 text-xs gap-1 bg-orange-500">
                        <Flame className="h-3 w-3" />
                        {t('menuSection.promo')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}