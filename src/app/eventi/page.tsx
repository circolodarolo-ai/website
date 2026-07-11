'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Euro, Star, MapPin, ArrowLeft, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Header from '@/components/restaurant/Header';
import { useI18n } from '@/lib/i18n-context';
import { useDbTranslation } from '@/hooks/useDbTranslation';
import Footer from '@/components/restaurant/Footer';
import ReservationDialog from '@/components/restaurant/ReservationDialog';
import BannerContainer from '@/components/restaurant/BannerContainer';
import SocialSidebar from '@/components/restaurant/SocialSidebar';
import AdminPanel from '@/components/admin/AdminPanel';

interface Evento {
  id: string;
  titolo: string;
  slug: string;
  descrizione: string;
  descrizioneBreve: string | null;
  immagineUrl: string | null;
  data: string;
  oraInizio: string;
  oraFine: string;
  prezzo: number;
  gratuito: boolean;
  graditaPrenotazione: boolean;
  capacita: number;
  postiDisponibili: number;
  location: string | null;
  incluso: string | null;
  infoAggiuntive: string | null;
  inEvidenza: boolean;
  nuovo: boolean;
  ricorrente: boolean;
  giorniRicorrenza: string | null;
}

export default function EventiPage() {
  const { t } = useI18n();
  const dbTr = useDbTranslation();
  const [eventi, setEventi] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/eventi')
      .then((r) => r.json())
      .then(setEventi)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Register DB texts for translation
  useEffect(() => {
    if (eventi.length > 0) {
      const reg: Record<string, string> = {};
      eventi.forEach(e => {
        reg[`evt.${e.id}.titolo`] = e.titolo;
        if (e.descrizioneBreve) reg[`evt.${e.id}.descBreve`] = e.descrizioneBreve;
        if (e.descrizione) reg[`evt.${e.id}.desc`] = e.descrizione;
        if (e.location) reg[`evt.${e.id}.location`] = e.location;
        if (e.incluso) reg[`evt.${e.id}.incluso`] = e.incluso;
        if (e.infoAggiuntive) reg[`evt.${e.id}.info`] = e.infoAggiuntive;
      });
      dbTr.register(reg);
    }
  }, [eventi, dbTr.register]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatGiorniRicorrenza = (giorni: string | null) => {
    if (!giorni) return '';
    const dayMap: Record<string, string> = {
      'lunedì': 'Lunedì', 'martedì': 'Martedì', 'mercoledì': 'Mercoledì',
      'giovedì': 'Giovedì', 'venerdì': 'Venerdì', 'sabato': 'Sabato', 'domenica': 'Domenica',
    };
    return giorni.split(',').map(g => dayMap[g.trim().toLowerCase()] || g.trim()).join(', ');
  };

  const isPast = (dateStr: string) => {
    return new Date(dateStr) < new Date(new Date().toDateString());
  };

  const upcoming = eventi.filter((e) => !e.ricorrente && !isPast(e.data));
  const ricorrenti = eventi.filter((e) => e.ricorrente);
  const past = eventi.filter((e) => !e.ricorrente && isPast(e.data));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        {/* Page Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[var(--primary)] transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('eventiPage.backHome')}
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {t('eventiPage.title')}
            </h1>
            <p className="text-gray-500 mt-2 max-w-2xl">
              {t('eventiPage.description')}
            </p>
          </div>
        </div>

        {/* Banner Top */}
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <BannerContainer pagina="eventi" posizione="top" />
        </div>

        {/* Layout: contenuto + sidebar */}
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Colonna principale */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-80 w-full rounded-2xl" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Recurring Events */}
                  {ricorrenti.length > 0 && (
                    <section className="mb-12">
                      <div className="flex items-center gap-2 mb-6">
                        <Repeat className="h-5 w-5 text-purple-600" />
                        <h2 className="text-2xl font-bold text-gray-900">{t('eventiPage.ricorrenti')}</h2>
                        <Badge variant="outline" className="ml-2 text-purple-700 border-purple-300">{ricorrenti.length}</Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        {ricorrenti.map((evento) => (
                          <EventCard
                            key={evento.id}
                            evento={evento}
                            expanded={expandedId === evento.id}
                            onToggle={() => setExpandedId(expandedId === evento.id ? null : evento.id)}
                            formatDate={formatDate}
                            formatGiorniRicorrenza={formatGiorniRicorrenza}
                            dbTr={dbTr}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Upcoming Events */}
                  {upcoming.length > 0 && (
                    <section className="mb-12">
                      <div className="flex items-center gap-2 mb-6">
                        <Star className="h-5 w-5 text-[var(--primary)]" />
                        <h2 className="text-2xl font-bold text-gray-900">{t('eventiPage.prossimi')}</h2>
                        <Badge variant="outline" className="ml-2">{upcoming.length}</Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        {upcoming.map((evento) => (
                          <EventCard
                            key={evento.id}
                            evento={evento}
                            expanded={expandedId === evento.id}
                            onToggle={() => setExpandedId(expandedId === evento.id ? null : evento.id)}
                            formatDate={formatDate}
                            formatGiorniRicorrenza={formatGiorniRicorrenza}
                            dbTr={dbTr}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Banner Inline — stesso stile delle schede eventi */}
                  <div className="grid md:grid-cols-2 gap-6 my-2">
                    <BannerContainer pagina="eventi" posizione="inline" />
                  </div>

                  {/* Past Events */}
                  {past.length > 0 && (
                    <section>
                      <div className="flex items-center gap-2 mb-6">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <h2 className="text-2xl font-bold text-gray-900">{t('eventiPage.passati')}</h2>
                        <Badge variant="outline" className="ml-2">{past.length}</Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        {past.map((evento) => (
                          <EventCard
                            key={evento.id}
                            evento={evento}
                            expanded={expandedId === evento.id}
                            onToggle={() => setExpandedId(expandedId === evento.id ? null : evento.id)}
                            formatDate={formatDate}
                            formatGiorniRicorrenza={formatGiorniRicorrenza}
                            dbTr={dbTr}
                            isPast
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* No events */}
                  {eventi.length === 0 && (
                    <div className="text-center py-20">
                      <Calendar className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">{t('eventiPage.nessunEvento')}</h3>
                      <p className="text-gray-400 mb-6">
                        {t('eventiPage.nessunEventoDesc')}
                      </p>
                      <Link href="/">
                        <Button className="bg-[var(--primary)] hover:opacity-90 text-white rounded-full">
                          {t('eventiPage.backHome')}
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar con banner pubblicitari (solo su desktop) */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <BannerContainer pagina="eventi" posizione="sidebar" />
              </div>
            </aside>
          </div>
        </div>

        {/* Banner Bottom */}
        <div className="max-w-7xl mx-auto px-4 pb-10">
          <BannerContainer pagina="eventi" posizione="bottom" />
        </div>

        <ReservationDialog />
      </main>
      <Footer />
      <SocialSidebar />
      <AdminPanel />
    </div>
  );
}

/* ─── Event Card Sub-component ─── */

function EventCard({
  evento,
  expanded,
  onToggle,
  formatDate,
  formatGiorniRicorrenza,
  dbTr,
  isPast = false,
}: {
  evento: Evento;
  expanded: boolean;
  onToggle: () => void;
  formatDate: (d: string) => string;
  formatGiorniRicorrenza: (g: string | null) => string;
  dbTr: ReturnType<typeof useDbTranslation>;
  isPast?: boolean;
}) {
  const { t } = useI18n();
  return (
    <Card
      className={`overflow-hidden border-2 transition-all hover:shadow-xl group ${
        evento.inEvidenza
          ? 'border-[var(--primary-200)] shadow-lg'
          : isPast
          ? 'border-gray-200 opacity-80'
          : 'border-gray-100 hover:border-[var(--primary-100)]'
      }`}
    >
      {evento.immagineUrl && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={evento.immagineUrl}
            alt={dbTr.t('evt.' + evento.id + '.titolo', evento.titolo)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-3 flex gap-2">
            {evento.inEvidenza && (
              <Badge className="bg-[var(--primary)] text-white gap-1 text-xs">
                <Star className="h-3 w-3 fill-current" /> {t('eventiPage.inEvidenza')}
              </Badge>
            )}
            {evento.nuovo && (
              <Badge className="bg-green-600 text-white text-xs">{t('eventiPage.nuovo')}</Badge>
            )}
          </div>
          {isPast && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-black/60 text-white text-xs">{t('eventiPage.concluso')}</Badge>
            </div>
          )}
        </div>
      )}

      <CardContent className="p-6">
        {/* Badges row */}
        <div className="flex flex-wrap gap-2 mb-3">
          {evento.gratuito && (
            <Badge className="bg-green-600 text-white">{t('eventiPage.gratuito')}</Badge>
          )}
          {evento.graditaPrenotazione && !isPast && (
            <Badge variant="outline" className="border-[var(--primary-200)] text-[var(--primary)]">{t('eventiPage.prenotazioneConsigliata')}</Badge>
          )}
        </div>

        {/* Date / Ricorrenza */}
        <div className="text-xs text-gray-500 flex items-center gap-1 mb-2">
          {evento.ricorrente ? (
            <><Repeat className="h-3.5 w-3.5 text-purple-500" /><span className="text-purple-600 font-medium">{t('eventiSection.ogni', { giorni: formatGiorniRicorrenza(evento.giorniRicorrenza) })}</span> &middot; {evento.oraInizio} - {evento.oraFine}</>
          ) : (
            <><Calendar className="h-3.5 w-3.5" />{formatDate(evento.data)}</>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[var(--primary)] transition-colors">
          {dbTr.t('evt.' + evento.id + '.titolo', evento.titolo)}
        </h3>

        {/* Short description */}
        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
          {evento.descrizioneBreve
            ? dbTr.t('evt.' + evento.id + '.descBreve', evento.descrizioneBreve)
            : dbTr.t('evt.' + evento.id + '.desc', evento.descrizione)}
        </p>

        {/* Details */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-[var(--primary)]" />
            <span>{evento.oraInizio} - {evento.oraFine}</span>
          </div>
          {evento.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-[var(--primary)]" />
              <span>{dbTr.t('evt.' + evento.id + '.location', evento.location)}</span>
            </div>
          )}
          {evento.capacita > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-[var(--primary)]" />
              <span>{evento.postiDisponibili} {t('eventiPage.posti')}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Euro className="h-4 w-4 text-[var(--primary)]" />
            <span className="font-semibold">
              {evento.gratuito ? t('eventiPage.ingressoLibero') : `€${evento.prezzo.toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* Expandable content */}
        {expanded && (
          <div className="border-t pt-4 mt-2 space-y-3 text-sm text-gray-600">
            {evento.descrizione && evento.descrizione !== evento.descrizioneBreve && (
              <p className="leading-relaxed">{dbTr.t('evt.' + evento.id + '.desc', evento.descrizione)}</p>
            )}
            {evento.incluso && (
              <div>
                <strong className="text-gray-800">{t('eventiPage.laQuotaInclude')}</strong>
                <p className="mt-1">{dbTr.t('evt.' + evento.id + '.incluso', evento.incluso)}</p>
              </div>
            )}
            {evento.infoAggiuntive && (
              <div>
                <strong className="text-gray-800">{t('eventiPage.infoAggiuntive')}</strong>
                <p className="mt-1">{dbTr.t('evt.' + evento.id + '.info', evento.infoAggiuntive)}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggle}
            className="rounded-full"
          >
            {expanded ? t('eventiPage.mostraMeno') : t('eventiPage.dettagli')}
          </Button>
          {evento.graditaPrenotazione && !isPast && (
            <Button
              size="sm"
              onClick={() => document.getElementById('prenota')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-[var(--primary)] hover:opacity-90 text-white rounded-full"
            >
              {t('eventiPage.prenota')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}