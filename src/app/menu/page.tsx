'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Flame, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Header from '@/components/restaurant/Header';
import Footer from '@/components/restaurant/Footer';

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
  allergeni: AllergeneArticolo[];
}

interface Categoria {
  id: string;
  nome: string;
  ordine: number;
  articoli: Articolo[];
}

export default function MenuPage() {
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

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

  const activeCategoria = categorie.find((c) => c.id === activeTab);

  // Filtra gli articoli della categoria attiva in base alla ricerca
  const filteredArticoli = activeCategoria?.articoli.filter((a) =>
    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.descrizione && a.descrizione.toLowerCase().includes(searchTerm.toLowerCase()))
  ) ?? [];

  // Conta tutti gli articoli
  const totalArticoli = categorie.reduce((sum, c) => sum + c.articoli.length, 0);

  // Trova le promo attive
  const promoCount = categorie.reduce(
    (sum, c) => sum + c.articoli.filter((a) => a.prezzoPromozionale !== null).length,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero skeleton */}
          <div className="bg-red-700 py-20 px-4">
            <div className="max-w-6xl mx-auto text-center">
              <Skeleton className="h-10 w-48 mx-auto mb-4 bg-white/20" />
              <Skeleton className="h-6 w-96 mx-auto bg-white/15" />
            </div>
          </div>
          <div className="py-20 px-4 bg-gray-50">
            <div className="max-w-6xl mx-auto">
              <Skeleton className="h-10 w-64 mx-auto mb-4" />
              <Skeleton className="h-5 w-96 mx-auto mb-10" />
              <div className="flex gap-2 justify-center mb-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-28 rounded-full" />
                ))}
              </div>
              <div className="grid gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Menu Hero Banner */}
        <section className="relative bg-gradient-to-br from-red-800 via-red-700 to-red-900 py-16 sm:py-24 px-4 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 border border-white rounded-full" />
            <div className="absolute bottom-10 right-10 w-60 h-60 border border-white rounded-full" />
            <div className="absolute top-1/2 left-1/3 w-20 h-20 border border-white rounded-full" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <Link href="/">
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10 mb-6 -ml-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Torna alla Home
              </Button>
            </Link>

            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90 text-sm font-medium mb-6">
              {totalArticoli} piatti disponibili
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              Il Nostro Menu
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Ogni piatto racconta la storia della nostra terra, con ingredienti selezionati
              e ricette tramandate da generazioni
            </p>

            {promoCount > 0 && (
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-400/30 rounded-full">
                <Flame className="h-4 w-4 text-orange-300" />
                <span className="text-orange-200 text-sm font-medium">
                  {promoCount} {promoCount === 1 ? 'offerta speciale' : 'offerte speciali'} attive
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Search Bar */}
        <section className="sticky top-16 md:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cerca un piatto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-full border-gray-200 focus:border-red-300 focus:ring-red-100"
              />
            </div>
          </div>
        </section>

        {/* Menu Content */}
        <section className="py-12 sm:py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 justify-center mb-10 sticky top-28 md:top-32 z-20 bg-gray-50 py-2">
              {categorie.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveTab(cat.id);
                    setShowAll(false);
                  }}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    activeTab === cat.id && !showAll
                      ? 'bg-red-700 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-700 border border-gray-200'
                  }`}
                >
                  {cat.nome}
                  <span className="ml-1.5 text-xs opacity-70">({cat.articoli.length})</span>
                </button>
              ))}
              <button
                onClick={() => setShowAll(true)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  showAll
                    ? 'bg-red-700 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-700 border border-gray-200'
                }`}
              >
                Tutti
                <span className="ml-1.5 text-xs opacity-70">({totalArticoli})</span>
              </button>
            </div>

            {/* Articles List */}
            {showAll ? (
              // Mostra tutte le categorie
              <div className="space-y-12 max-w-4xl mx-auto">
                {categorie.map((cat) => {
                  const catFiltered = cat.articoli.filter(
                    (a) =>
                      a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (a.descrizione && a.descrizione.toLowerCase().includes(searchTerm.toLowerCase()))
                  );
                  if (catFiltered.length === 0) return null;
                  return (
                    <div key={cat.id}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-px flex-1 bg-red-200" />
                        <h2 className="text-2xl font-bold text-red-700 whitespace-nowrap">
                          {cat.nome}
                        </h2>
                        <div className="h-px flex-1 bg-red-200" />
                      </div>
                      <div className="grid gap-4">
                        {catFiltered.map((articolo) => (
                          <ArticoloCard key={articolo.id} articolo={articolo} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Mostra la categoria selezionata
              activeCategoria && (
                <div className="max-w-4xl mx-auto">
                  {searchTerm && (
                    <p className="text-sm text-gray-500 mb-4 text-center">
                      {filteredArticoli.length} {filteredArticoli.length === 1 ? 'risultato' : 'risultati'} per &quot;{searchTerm}&quot;
                    </p>
                  )}
                  <div className="grid gap-4">
                    {filteredArticoli.map((articolo) => (
                      <ArticoloCard key={articolo.id} articolo={articolo} />
                    ))}
                  </div>
                  {filteredArticoli.length === 0 && (
                    <div className="text-center py-16">
                      <p className="text-gray-400 text-lg">
                        {searchTerm
                          ? 'Nessun piatto trovato per questa ricerca'
                          : 'Nessun piatto in questa categoria'}
                      </p>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </section>

        {/* Allergeni Info Section */}
        <section className="py-12 px-4 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Informazioni Allergeni
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-2xl mx-auto">
              Per qualsiasi informazione sugli allergeni contenuti nei nostri piatti, non esitare a chiedere al nostro personale.
              I simboli degli allergeni sono indicati accanto a ogni piatto nel menu.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {categorie
                .flatMap((c) => c.articoli)
                .flatMap((a) => a.allergeni)
                .filter((v, i, arr) => arr.findIndex((t) => t.allergene.id === v.allergene.id) === i)
                .map((aa) => (
                  <span
                    key={aa.allergene.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-full"
                  >
                    <span className="text-base">{aa.allergene.icona}</span>
                    <span className="font-medium">{aa.allergene.nome}</span>
                  </span>
                ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* Sotto-componente per la card di ogni piatto */
function ArticoloCard({ articolo }: { articolo: Articolo }) {
  return (
    <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-700 transition-colors">
              {articolo.nome}
            </h3>
            {articolo.eBestChoice && (
              <Badge className="bg-amber-500 text-white text-xs gap-1">
                <Star className="h-3 w-3 fill-current" />
                Consigliato
              </Badge>
            )}
            {articolo.prezzoPromozionale && (
              <Badge variant="destructive" className="text-xs gap-1 bg-orange-500">
                <Flame className="h-3 w-3" />
                Promo
              </Badge>
            )}
          </div>
          {articolo.descrizione && (
            <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">
              {articolo.descrizione}
            </p>
          )}
          {articolo.allergeni.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {articolo.allergeni.map((aa) => (
                <span
                  key={aa.id}
                  title={aa.allergene.nome}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  <span>{aa.allergene.icona}</span>
                  <span>{aa.allergene.nome}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="sm:text-right flex-shrink-0">
          <div className="flex items-center gap-2 sm:flex-col sm:items-end">
            {articolo.prezzoPromozionale && (
              <span className="text-sm text-gray-400 line-through">
                {articolo.prezzo.toFixed(2)}&euro;
              </span>
            )}
            <span className="text-xl font-bold text-red-700">
              {(articolo.prezzoPromozionale || articolo.prezzo).toFixed(2)}&euro;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}