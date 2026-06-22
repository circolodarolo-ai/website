'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Euro, Star, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import Header from '@/components/restaurant/Header';
import Footer from '@/components/restaurant/Footer';
import ReservationDialog from '@/components/restaurant/ReservationDialog';
import BannerContainer from '@/components/restaurant/BannerContainer';
import CookieBanner from '@/components/restaurant/CookieBanner';
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
}

export default function EventiPage() {
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const isPast = (dateStr: string) => {
    return new Date(dateStr) < new Date(new Date().toDateString());
  };

  const upcoming = eventi.filter((e) => !isPast(e.data));
  const past = eventi.filter((e) => isPast(e.data));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        {/* Page Header */}
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-10">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-700 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna alla Home
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Eventi e Serate Speciali
            </h1>
            <p className="text-gray-500 mt-2 max-w-2xl">
              Scopri le serate tematiche, le degustazioni e gli eventi exclusivi che organizziamo nel nostro ristorante. Prenota il tuo posto per non perderti nulla.
            </p>
          </div>
        </div>

        {/* Banner Top — shown only if user accepted profiling cookies */}
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <BannerContainer pagina="eventi" posizione="top" />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-10">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-80 w-full rounded-2xl" />
              ))}
            </div>
          ) : (
            <>
              {/* Upcoming Events */}
              {upcoming.length > 0 && (
                <section className="mb-12">
                  <div className="flex items-center gap-2 mb-6">
                    <Star className="h-5 w-5 text-red-700" />
                    <h2 className="text-2xl font-bold text-gray-900">Prossimi Eventi</h2>
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
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Banner Inline — between upcoming and past events */}
              <BannerContainer pagina="eventi" posizione="inline" />

              {/* Past Events */}
              {past.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <h2 className="text-2xl font-bold text-gray-900">Eventi Passati</h2>
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
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Nessun evento programmato</h3>
                  <p className="text-gray-400 mb-6">
                    Al momento non ci sono eventi in programma. Torna presto per scoprire le nostre serate speciali!
                  </p>
                  <Link href="/">
                    <Button className="bg-red-700 hover:bg-red-800 text-white rounded-full">
                      Torna alla Home
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Banner Bottom */}
        <div className="max-w-6xl mx-auto px-4 pb-10">
          <BannerContainer pagina="eventi" posizione="bottom" />
        </div>

        <ReservationDialog />
      </main>
      <Footer />
      <CookieBanner />
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
  isPast = false,
}: {
  evento: Evento;
  expanded: boolean;
  onToggle: () => void;
  formatDate: (d: string) => string;
  isPast?: boolean;
}) {
  return (
    <Card
      className={`overflow-hidden border-2 transition-all hover:shadow-xl group ${
        evento.inEvidenza
          ? 'border-red-200 shadow-lg'
          : isPast
          ? 'border-gray-200 opacity-80'
          : 'border-gray-100 hover:border-red-100'
      }`}
    >
      {evento.immagineUrl && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={evento.immagineUrl}
            alt={evento.titolo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-3 flex gap-2">
            {evento.inEvidenza && (
              <Badge className="bg-red-700 text-white gap-1 text-xs">
                <Star className="h-3 w-3 fill-current" /> In evidenza
              </Badge>
            )}
            {evento.nuovo && (
              <Badge className="bg-green-600 text-white text-xs">Nuovo</Badge>
            )}
          </div>
          {isPast && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-black/60 text-white text-xs">Concluso</Badge>
            </div>
          )}
        </div>
      )}

      <CardContent className="p-6">
        {/* Badges row */}
        <div className="flex flex-wrap gap-2 mb-3">
          {evento.gratuito && (
            <Badge className="bg-green-600 text-white">Gratuito</Badge>
          )}
          {evento.graditaPrenotazione && !isPast && (
            <Badge variant="outline" className="border-red-200 text-red-700">Prenotazione consigliata</Badge>
          )}
        </div>

        {/* Date */}
        <div className="text-xs text-gray-500 flex items-center gap-1 mb-2">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(evento.data)}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-700 transition-colors">
          {evento.titolo}
        </h3>

        {/* Short description */}
        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
          {evento.descrizioneBreve || evento.descrizione}
        </p>

        {/* Details */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-red-700" />
            <span>{evento.oraInizio} - {evento.oraFine}</span>
          </div>
          {evento.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-red-700" />
              <span>{evento.location}</span>
            </div>
          )}
          {evento.capacita > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-red-700" />
              <span>{evento.postiDisponibili} posti</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Euro className="h-4 w-4 text-red-700" />
            <span className="font-semibold">
              {evento.gratuito ? 'Ingresso libero' : `€${evento.prezzo.toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* Expandable content */}
        {expanded && (
          <div className="border-t pt-4 mt-2 space-y-3 text-sm text-gray-600">
            {evento.descrizione && evento.descrizione !== evento.descrizioneBreve && (
              <p className="leading-relaxed">{evento.descrizione}</p>
            )}
            {evento.incluso && (
              <div>
                <strong className="text-gray-800">La quota include:</strong>
                <p className="mt-1">{evento.incluso}</p>
              </div>
            )}
            {evento.infoAggiuntive && (
              <div>
                <strong className="text-gray-800">Informazioni aggiuntive:</strong>
                <p className="mt-1">{evento.infoAggiuntive}</p>
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
            {expanded ? 'Mostra meno' : 'Dettagli'}
          </Button>
          {evento.graditaPrenotazione && !isPast && (
            <Button
              size="sm"
              onClick={() => document.getElementById('prenota')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-red-700 hover:bg-red-800 text-white rounded-full"
            >
              Prenota
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}