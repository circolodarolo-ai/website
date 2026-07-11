'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { useI18n } from '@/lib/i18n-context';

interface SiteInfo {
  prenotazioniAttive: boolean;
  orarioPranzoInizio: string | null;
  orarioPranzoFine: string | null;
  orarioCenaInizio: string | null;
  orarioCenaFine: string | null;
  telefono: string | null;
}

interface FooterInfo {
  giorniChiusura: string | null;
  whatsappUrl: string | null;
  telefono: string | null;
}

// Mappa nomi giorni italiani -> numero giorno JS (0=Domenica, 1=Lunedì, ...)
const GIORNI_MAP: Record<string, number> = {
  'domenica': 0, 'lunedì': 1, 'martedì': 2, 'mercoledì': 3,
  'giovedì': 4, 'venerdì': 5, 'sabato': 6,
};

function parseGiorniChiusura(giorniChiusura: string | null): Set<number> {
  const closed = new Set<number>();
  if (!giorniChiusura) return closed;
  const lower = giorniChiusura.toLowerCase();
  for (const [nome, num] of Object.entries(GIORNI_MAP)) {
    if (lower.includes(nome)) {
      closed.add(num);
    }
  }
  return closed;
}

function generateTimeSlots(
  pranzoInizio: string, pranzoFine: string,
  cenaInizio: string, cenaFine: string
): string[] {
  const slots: string[] = [];

  function addSlots(start: string, end: string) {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let totalStart = sh * 60 + sm;
    const totalEnd = eh * 60 + em;
    while (totalStart < totalEnd) {
      const h = Math.floor(totalStart / 60);
      const m = totalStart % 60;
      slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      totalStart += 30;
    }
  }

  addSlots(pranzoInizio, pranzoFine);
  addSlots(cenaInizio, cenaFine);

  return [...new Set(slots)].sort();
}

// Pulisce un numero di telefono rimuovendo spazi, +, -, parentesi
function cleanPhoneNumber(raw: string | null | undefined): string {
  if (!raw) return '';
  return raw.replace(/[\s+\-()]/g, '');
}

// Estrae il numero da un URL wa.me
function extractWhatsAppFromUrl(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/(?:wa\.me\/|phone=)(\d+)/);
  return match ? match[1] : null;
}

export default function ReservationDialog() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [prenotazioniAttive, setPrenotazioniAttive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [footerInfo, setFooterInfo] = useState<FooterInfo | null>(null);

  const [form, setForm] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    data: '',
    ora: '',
    persone: '2',
    tipologia: 'ristorante',
    note: '',
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/site-info').then((r) => r.json()),
      fetch('/api/footer-info').then((r) => r.json()),
    ])
      .then(([s, f]) => {
        setSiteInfo(s);
        setFooterInfo(f);
        if (s.prenotazioniAttive !== undefined) {
          setPrenotazioniAttive(s.prenotazioniAttive);
        }
      })
      .catch(() => {});
  }, []);

  // Trova il numero WhatsApp: whatsappUrl > footer telefono > siteInfo telefono
  const whatsappNumber = useMemo(() => {
    // 1. Prova ad estrarre dal whatsappUrl del footer
    const fromUrl = extractWhatsAppFromUrl(footerInfo?.whatsappUrl);
    if (fromUrl) return fromUrl;

    // 2. Usa il telefono del footer
    const footerPhone = cleanPhoneNumber(footerInfo?.telefono);
    if (footerPhone) return footerPhone;

    // 3. Usa il telefono di SiteInfo
    const sitePhone = cleanPhoneNumber(siteInfo?.telefono);
    if (sitePhone) return sitePhone;

    return null;
  }, [footerInfo, siteInfo]);

  // Genera fasce orarie dagli orari di servizio del DB
  const orari = useMemo(() => {
    return generateTimeSlots(
      siteInfo?.orarioPranzoInizio || '12:00',
      siteInfo?.orarioPranzoFine || '14:30',
      siteInfo?.orarioCenaInizio || '19:00',
      siteInfo?.orarioCenaFine || '22:30',
    );
  }, [siteInfo]);

  // Genera date dei prossimi 30 giorni, saltando i giorni di chiusura
  const dateOptions = useMemo(() => {
    const closedDays = parseGiorniChiusura(footerInfo?.giorniChiusura || null);
    // Se non ci sono giorni di chiusura configurati, fallback a lunedì
    if (closedDays.size === 0) closedDays.add(1);

    const options: string[] = [];
    const oggi = new Date();
    for (let i = 1; i <= 30; i++) {
      const d = new Date(oggi);
      d.setDate(d.getDate() + i);
      if (!closedDays.has(d.getDay())) {
        options.push(d.toISOString().split('T')[0]);
      }
    }
    return options;
  }, [footerInfo]);

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

    // Apre un tab blank ORA (nel handler diretto del click) per evitare il popup blocker
    const waTab = whatsappNumber ? window.open('about:blank', '_blank') : null;

    try {
      const res = await fetch('/api/prenotazioni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        // Chiudi il tab blank se c'è un errore
        waTab?.close();
        let errorMsg = t('prenotazione.errore');
        try {
          const err = await res.json();
          errorMsg = err.error || errorMsg;
        } catch { /* risposta non JSON */ }
        throw new Error(errorMsg);
      }

      toast.success(t('prenotazione.successo'));

      // Naviga il tab già aperto verso WhatsApp
      if (waTab && whatsappNumber) {
        const waMessage = encodeURIComponent(
          `Nuova prenotazione da ${form.nome} ${form.cognome}\n` +
          `Tipologia: ${form.tipologia.charAt(0).toUpperCase() + form.tipologia.slice(1)}\n` +
          `Data: ${form.data}\n` +
          `Ora: ${form.ora}\n` +
          `Persone: ${form.persone}\n` +
          `Telefono: ${form.telefono}\n` +
          (form.note ? `Note: ${form.note}\n` : '')
        );
        waTab.location.href = `https://wa.me/${whatsappNumber}?text=${waMessage}`;
      } else if (!whatsappNumber) {
        console.warn('Nessun numero WhatsApp trovato per la notifica');
      }

      setForm({ nome: '', cognome: '', email: '', telefono: '', data: '', ora: '', persone: '2', tipologia: 'ristorante', note: '' });
      setOpen(false);
    } catch (error) {
      waTab?.close();
      toast.error(error instanceof Error ? error.message : t('prenotazione.errore'));
      console.error('Prenotazione fallita:', error);
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
      <section id="prenota" className="py-20 px-4 text-white" style={{ backgroundColor: 'var(--prenota-section-bg)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('prenotazione.ctaTitle')}</h2>
          <p className="text-white/70 text-lg mb-8 leading-relaxed">
            {t('prenotazione.ctaDescription')}
          </p>
          <Button
            size="lg"
            onClick={() => setOpen(true)}
            className="bg-white text-[var(--primary)] hover:bg-[var(--primary)]/5 rounded-full text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105 font-semibold"
          >
            <CalendarDays className="mr-2 h-5 w-5" />
            {t('prenotazione.ctaButton')}
          </Button>
        </div>
      </section>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-[var(--primary)]">{t('prenotazione.dialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('prenotazione.dialogDescription')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> {t('prenotazione.nome')}
                </Label>
                <Input
                  id="nome"
                  required
                  value={form.nome}
                  onChange={(e) => updateField('nome', e.target.value)}
                  placeholder={t('prenotazione.nomePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cognome">{t('prenotazione.cognome')}</Label>
                <Input
                  id="cognome"
                  required
                  value={form.cognome}
                  onChange={(e) => updateField('cognome', e.target.value)}
                  placeholder={t('prenotazione.cognomePlaceholder')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {t('prenotazione.email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder={t('prenotazione.emailPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {t('prenotazione.telefono')}
                </Label>
                <Input
                  id="telefono"
                  type="tel"
                  required
                  value={form.telefono}
                  onChange={(e) => updateField('telefono', e.target.value)}
                  placeholder={t('prenotazione.telefonoPlaceholder')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data" className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" /> {t('prenotazione.data')}
                </Label>
                <select
                  id="data"
                  required
                  value={form.data}
                  onChange={(e) => updateField('data', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">{t('prenotazione.selezionaData')}</option>
                  {dateOptions.map((d) => (
                    <option key={d} value={d}>
                      {formatDateLabel(d)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ora" className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {t('prenotazione.ora')}
                </Label>
                <select
                  id="ora"
                  required
                  value={form.ora}
                  onChange={(e) => updateField('ora', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">{t('prenotazione.selezionaOrario')}</option>
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
                <Users className="h-3.5 w-3.5" /> {t('prenotazione.numeroPersone')}
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
                    {n} {n === 1 ? t('prenotazione.persona') : t('prenotazione.persone')}
                  </option>
                ))}
                <option value="11">{t('prenotazione.piuDi10')}</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipologia" className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> {t('prenotazione.tipologia')}
              </Label>
              <select
                id="tipologia"
                required
                value={form.tipologia}
                onChange={(e) => updateField('tipologia', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="ristorante">{t('prenotazione.ristorante')}</option>
                <option value="aperitivo">{t('prenotazione.aperitivo')}</option>
                <option value="evento">{t('prenotazione.evento')}</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> {t('prenotazione.note')}
              </Label>
              <Textarea
                id="note"
                value={form.note}
                onChange={(e) => updateField('note', e.target.value)}
                placeholder={t('prenotazione.notePlaceholder')}
                rows={3}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t('prenotazione.annulla')}
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[var(--primary)] hover:opacity-90 text-white rounded-full"
              >
                {submitting ? t('prenotazione.invioInCorso') : t('prenotazione.conferma')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}