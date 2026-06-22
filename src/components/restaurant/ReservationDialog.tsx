'use client';

import { useState, useEffect } from 'react';
import { CalendarDays, Clock, Users, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface SiteInfo {
  prenotazioniAttive: boolean;
}

export default function ReservationDialog() {
  const [open, setOpen] = useState(false);
  const [prenotazioniAttive, setPrenotazioniAttive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    data: '',
    ora: '',
    persone: '2',
    note: '',
  });

  useEffect(() => {
    fetch('/api/site-info')
      .then((r) => r.json())
      .then((data: SiteInfo) => setPrenotazioniAttive(data.prenotazioniAttive))
      .catch(() => {});
  }, []);

  // Generate time slots
  const orari = [];
  for (let h = 12; h <= 22; h++) {
    orari.push(`${h.toString().padStart(2, '0')}:00`);
    if (h < 22) orari.push(`${h.toString().padStart(2, '0')}:30`);
  }

  // Generate date options (next 30 days)
  const dateOptions: string[] = [];
  const oggi = new Date();
  for (let i = 1; i <= 30; i++) {
    const d = new Date(oggi);
    d.setDate(d.getDate() + i);
    if (d.getDay() !== 1) { // Skip Monday (closed)
      dateOptions.push(d.toISOString().split('T')[0]);
    }
  }

  const formatDateLabel = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/prenotazioni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Errore nella prenotazione');
      }

      toast.success('Prenotazione inviata con successo! Ti contatteremo per la conferma.');
      setForm({ nome: '', cognome: '', email: '', telefono: '', data: '', ora: '', persone: '2', note: '' });
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Errore nella prenotazione');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (!prenotazioniAttive) return null;

  return (
    <>
      {/* CTA Section */}
      <section id="prenota" className="py-20 px-4 bg-gradient-to-br from-red-800 to-red-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Prenota il Tuo Tavolo</h2>
          <p className="text-red-100 text-lg mb-8 leading-relaxed">
            Riserviamo il tuo posto per un&apos;esperienza indimenticabile. Compila il modulo e riceverai una conferma via email.
          </p>
          <Button
            size="lg"
            onClick={() => setOpen(true)}
            className="bg-white text-red-700 hover:bg-red-50 rounded-full text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105 font-semibold"
          >
            <CalendarDays className="mr-2 h-5 w-5" />
            Prenota Ora
          </Button>
        </div>
      </section>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-700">Prenota un Tavolo</DialogTitle>
            <DialogDescription>
              Compila i dati sotto e ti confermeremo la prenotazione via email
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Nome *
                </Label>
                <Input
                  id="nome"
                  required
                  value={form.nome}
                  onChange={(e) => updateField('nome', e.target.value)}
                  placeholder="Mario"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cognome">Cognome *</Label>
                <Input
                  id="cognome"
                  required
                  value={form.cognome}
                  onChange={(e) => updateField('cognome', e.target.value)}
                  placeholder="Rossi"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="mario@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Telefono *
                </Label>
                <Input
                  id="telefono"
                  type="tel"
                  required
                  value={form.telefono}
                  onChange={(e) => updateField('telefono', e.target.value)}
                  placeholder="+39 333 1234567"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data" className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" /> Data *
                </Label>
                <select
                  id="data"
                  required
                  value={form.data}
                  onChange={(e) => updateField('data', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Seleziona data</option>
                  {dateOptions.map((d) => (
                    <option key={d} value={d}>
                      {formatDateLabel(d)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ora" className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Ora *
                </Label>
                <select
                  id="ora"
                  required
                  value={form.ora}
                  onChange={(e) => updateField('ora', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Seleziona orario</option>
                  {orari.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="persone" className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Numero di persone *
              </Label>
              <select
                id="persone"
                required
                value={form.persone}
                onChange={(e) => updateField('persone', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'persona' : 'persone'}
                  </option>
                ))}
                <option value="11">Più di 10 (specificare nelle note)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> Note (opzionale)
              </Label>
              <Textarea
                id="note"
                value={form.note}
                onChange={(e) => updateField('note', e.target.value)}
                placeholder="Allergie, esigenze particolari, occasioni speciali..."
                rows={3}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-red-700 hover:bg-red-800 text-white rounded-full"
              >
                {submitting ? 'Invio in corso...' : 'Conferma Prenotazione'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}