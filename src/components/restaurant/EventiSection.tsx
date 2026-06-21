'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Euro, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Evento {
  id: string;
  titolo: string;
  descrizione: string;
  descrizioneBreve: string | null;
  data: string;
  oraInizio: string;
  oraFine: string;
  prezzo: number;
  gratuito: boolean;
  graditaPrenotazione: boolean;
  capacita: number;
  postiDisponibili: number;
  inEvidenza: boolean;
}

export default function EventiSection() {
  const [eventi, setEventi] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

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
    });
  };

  if (loading) {
    return (
      <section id="eventi" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-48 mx-auto mb-4" />
            <Skeleton className="h-5 w-80 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (eventi.length === 0) {
    return null;
  }

  return (
    <section id="eventi" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-red-700 font-semibold text-sm uppercase tracking-wider">
            Prossimi Eventi
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
            Cosa succede da noi
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Serate speciali, laboratori e degustazioni per vivere esperienze uniche
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {eventi.map((evento) => (
            <Card
              key={evento.id}
              className={`overflow-hidden border-2 transition-all hover:shadow-xl group ${
                evento.inEvidenza ? 'border-red-200 shadow-lg' : 'border-gray-100 hover:border-red-100'
              }`}
            >
              <CardContent className="p-0">
                <div className="p-6">
                  {/* Top: Badge + Date */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex flex-wrap gap-2">
                      {evento.inEvidenza && (
                        <Badge className="bg-red-700 text-white gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          In evidenza
                        </Badge>
                      )}
                      {evento.gratuito && (
                        <Badge className="bg-green-600 text-white">Gratuito</Badge>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(evento.data)}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-700 transition-colors">
                    {evento.titolo}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                    {evento.descrizioneBreve || evento.descrizione}
                  </p>

                  {/* Details */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-5">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-red-700" />
                      <span>{evento.oraInizio} - {evento.oraFine}</span>
                    </div>
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

                  {/* CTA */}
                  {evento.graditaPrenotazione && (
                    <Button
                      onClick={() => document.getElementById('prenota')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full bg-red-700 hover:bg-red-800 text-white rounded-full"
                    >
                      Prenota per questo evento
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}