'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Trash2, CalendarDays, Users, Clock, CheckCircle, XCircle, AlertCircle, Settings2, RefreshCw } from 'lucide-react';

interface Reservation {
  id: string; nome: string; cognome: string; email: string; telefono: string;
  data: string; ora: string; persone: number; tipologia: string; note: string | null; stato: string;
  eventoId: string | null; evento: { titolo: string } | null; createdAt: string;
}

interface SiteConfig {
  prenotazioniAttive: boolean;
  orarioPranzoInizio: string;
  orarioPranzoFine: string;
  orarioCenaInizio: string;
  orarioCenaFine: string;
}

export default function AdminPrenotazioni() {
  const [prenotazioni, setPrenotazioni] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [prenotazioniAttive, setPrenotazioniAttive] = useState(true);
  const [savingSwitch, setSavingSwitch] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [giorniChiusura, setGiorniChiusura] = useState('');
  const lastFetchTimeRef = useRef<Date>(new Date());
  const [lastFetchDisplay, setLastFetchDisplay] = useState('');

  const [config, setConfig] = useState<SiteConfig>({
    prenotazioniAttive: true,
    orarioPranzoInizio: '12:00',
    orarioPranzoFine: '14:30',
    orarioCenaInizio: '19:00',
    orarioCenaFine: '22:30',
  });

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/admin/prenotazioni');
      if (res.ok) { const data = await res.json(); setPrenotazioni(Array.isArray(data) ? data : []); } else { setPrenotazioni([]); }
      lastFetchTimeRef.current = new Date();
      setLastFetchDisplay(new Date().toLocaleTimeString('it-IT'));
    } catch {
      if (!silent) toast.error('Errore nel caricamento');
    }
    if (!silent) setLoading(false);
  }, []);

  // Caricamento iniziale + auto-refresh ogni 15 secondi
  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const interval = setInterval(() => fetchData(true), 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Carica configurazione
  useEffect(() => {
    Promise.all([
      fetch('/api/site-info').then(r => r.json()),
      fetch('/api/footer-info').then(r => r.json()),
    ])
      .then(([s, f]) => {
        if (s.prenotazioniAttive !== undefined) setPrenotazioniAttive(s.prenotazioniAttive);
        setConfig({
          prenotazioniAttive: s.prenotazioniAttive ?? true,
          orarioPranzoInizio: s.orarioPranzoInizio || '12:00',
          orarioPranzoFine: s.orarioPranzoFine || '14:30',
          orarioCenaInizio: s.orarioCenaInizio || '19:00',
          orarioCenaFine: s.orarioCenaFine || '22:30',
        });
        setGiorniChiusura(f.giorniChiusura || '');
      })
      .catch(() => {});
  }, []);

  const togglePrenotazioniAttive = async (value: boolean) => {
    setPrenotazioniAttive(value);
    setSavingSwitch(true);
    try {
      const res = await fetch('/api/site-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenotazioniAttive: value }),
      });
      if (!res.ok) { toast.error('Errore nel salvataggio'); setPrenotazioniAttive(!value); return; }
      toast.success(value ? 'Prenotazioni attivate' : 'Prenotazioni disattivate');
    } catch {
      toast.error('Errore nel salvataggio');
      setPrenotazioniAttive(!value);
    }
    setSavingSwitch(false);
  };

  const saveConfig = async () => {
    setSavingConfig(true);
    try {
      const res = await fetch('/api/site-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) { toast.error('Errore nel salvataggio'); setSavingConfig(false); return; }
      toast.success('Configurazione salvata');
    } catch {
      toast.error('Errore nel salvataggio');
    }
    setSavingConfig(false);
  };

  const updateStato = async (id: string, stato: string) => {
    // Trova la prenotazione corrente per prendere il telefono
    const prenotazione = prenotazioni.find(p => p.id === id);
    try {
      const res = await fetch('/api/admin/prenotazioni', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stato }),
      });
      if (!res.ok) { toast.error('Errore'); return; }

      // Messaggi WhatsApp per conferma o cancellazione
      if (prenotazione && (stato === 'confirmed' || stato === 'cancelled')) {
        const phone = prenotazione.telefono.replace(/[\s+\-()]/g, '');
        if (phone) {
          const statoLabel = stato === 'confirmed' ? 'confermata' : 'cancellata';
          const msg = encodeURIComponent(
            `Gentile ${prenotazione.nome} ${prenotazione.cognome},\n\n` +
            `La Sua prenotazione per il ${prenotazione.data} alle ore ${prenotazione.ora} ` +
            `per ${prenotazione.persone} persona/e è stata ${statoLabel}.\n\n` +
            `Cordiali saluti`
          );
          window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
        }
      }

      toast.success('Stato aggiornato');
      fetchData();
    } catch { toast.error('Errore'); }
  };

  const deletePrenotazione = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/prenotazioni?id=${id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Errore'); return; }
      toast.success('Prenotazione eliminata');
      fetchData();
    } catch { toast.error('Errore'); }
  };

  const stats = {
    totali: prenotazioni.length,
    inAttesa: prenotazioni.filter(p => p.stato === 'pending').length,
    Confermate: prenotazioni.filter(p => p.stato === 'confirmed').length,
    Rifiutate: prenotazioni.filter(p => p.stato === 'cancelled').length,
  };

  const statoColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    confirmed: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
    completed: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">📅 Prenotazioni</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={prenotazioniAttive}
              onCheckedChange={togglePrenotazioniAttive}
              disabled={savingSwitch}
            />
            <Label className="text-sm">
              {prenotazioniAttive ? 'Attive' : 'Disattivate'}
            </Label>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
            className="gap-1.5"
          >
            <Settings2 className="h-4 w-4" />
            Configurazione
          </Button>
        </div>
      </div>

      {!prenotazioniAttive && (
        <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
          Le prenotazioni sono attualmente <strong>disattivate</strong>. Il bottone &quot;Prenota&quot; nel menu e il form di prenotazione sono nascosti ai visitatori. Le prenotazioni esistenti rimangono visibili e gestibili qui sotto.
        </div>
      )}

      {/* Pannello Configurazione */}
      {showConfig && (
        <div className="mb-6 rounded-lg border bg-gray-50 p-6 space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings2 className="h-5 w-5" /> Configurazione Prenotazioni
          </h3>

          {/* Orari di Servizio */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> Orari di Servizio
            </h4>
            <p className="text-xs text-gray-500 mb-3">
              Definisci gli orari di pranzo e cena. Le fasce orarie del form di prenotazione verranno generate automaticamente ogni 30 minuti.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Inizio Pranzo</Label>
                <Input
                  type="time"
                  value={config.orarioPranzoInizio}
                  onChange={e => setConfig(p => ({ ...p, orarioPranzoInizio: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Fine Pranzo</Label>
                <Input
                  type="time"
                  value={config.orarioPranzoFine}
                  onChange={e => setConfig(p => ({ ...p, orarioPranzoFine: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Inizio Cena</Label>
                <Input
                  type="time"
                  value={config.orarioCenaInizio}
                  onChange={e => setConfig(p => ({ ...p, orarioCenaInizio: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Fine Cena</Label>
                <Input
                  type="time"
                  value={config.orarioCenaFine}
                  onChange={e => setConfig(p => ({ ...p, orarioCenaFine: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Giorni di Chiusura */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" /> Giorni di Chiusura
            </h4>
            <p className="text-xs text-gray-500 mb-2">
              I giorni di chiusura si configurano nella sezione <strong>Footer &rarr; Informazioni</strong> (campo &quot;Giorni di chiusura&quot;). Inserisci i nomi dei giorni in italiano (es. &quot;Lunedì&quot; oppure &quot;Lunedì, Martedì&quot;).
            </p>
            <div className="rounded-md bg-white border p-3 text-sm">
              <span className="text-gray-500">Valore attuale: </span>
              <span className="font-medium">{giorniChiusura || <em className="text-gray-400">Nessun giorno configurato (default: lunedì)</em>}</span>
            </div>
          </div>

          {/* Info WhatsApp */}
          <div>
            <h4 className="text-sm font-semibold mb-2">📱 Notifica WhatsApp</h4>
            <p className="text-xs text-gray-500">
              Dopo ogni prenotazione, il cliente viene reindirizzato automaticamente su WhatsApp con un messaggio pre-compilato verso il numero del ristorante. Il numero viene rilevato automaticamente dal campo <strong>WhatsApp URL</strong> del Footer, oppure dal <strong>Telefono</strong> del Footer/Sito. Nessuna configurazione aggiuntiva necessaria.
            </p>
          </div>

          <Button onClick={saveConfig} disabled={savingConfig} className="rounded-full">
            {savingConfig ? 'Salvataggio...' : 'Salva Configurazione'}
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg border p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg"><CalendarDays className="h-5 w-5 text-blue-600" /></div>
          <div><p className="text-sm text-gray-500">Totali</p><p className="text-xl font-bold">{stats.totali}</p></div>
        </div>
        <div className="rounded-lg border p-4 flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg"><AlertCircle className="h-5 w-5 text-yellow-600" /></div>
          <div><p className="text-sm text-gray-500">In Attesa</p><p className="text-xl font-bold">{stats.inAttesa}</p></div>
        </div>
        <div className="rounded-lg border p-4 flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="h-5 w-5 text-green-600" /></div>
          <div><p className="text-sm text-gray-500">Confermate</p><p className="text-xl font-bold">{stats.Confermate}</p></div>
        </div>
        <div className="rounded-lg border p-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg"><XCircle className="h-5 w-5 text-red-600" /></div>
          <div><p className="text-sm text-gray-500">Rifiutate</p><p className="text-xl font-bold">{stats.Rifiutate}</p></div>
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400">
          Ultimo aggiornamento: {lastFetchDisplay} (auto-refresh ogni 15s)
        </p>
        <Button variant="ghost" size="sm" onClick={() => fetchData()} className="h-7 gap-1 text-xs text-gray-500">
          <RefreshCw className="h-3 w-3" /> Aggiorna ora
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden max-h-[500px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipologia</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Ora</TableHead>
              <TableHead>Persone</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prenotazioni.map(p => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="font-medium">{p.nome} {p.cognome}</div>
                  <div className="text-xs text-gray-500">{p.email} · {p.telefono}</div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.tipologia === 'aperitivo' ? 'bg-purple-100 text-purple-800' :
                    p.tipologia === 'evento' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {p.tipologia === 'aperitivo' ? 'Aperitivo' : p.tipologia === 'evento' ? 'Evento' : 'Ristorante'}
                  </span>
                </TableCell>
                <TableCell>{p.data}</TableCell>
                <TableCell>{p.ora}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1"><Users className="h-3 w-3" />{p.persone}</div>
                </TableCell>
                <TableCell>{p.evento?.titolo || '—'}</TableCell>
                <TableCell>
                  <Select value={p.stato} onValueChange={v => updateStato(p.id, v)}>
                    <SelectTrigger className={`w-32 text-xs ${statoColors[p.stato] || ''}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">In Attesa</SelectItem>
                      <SelectItem value="confirmed">Confermata</SelectItem>
                      <SelectItem value="completed">Completata</SelectItem>
                      <SelectItem value="cancelled">Rifiutata</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => deletePrenotazione(p.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}