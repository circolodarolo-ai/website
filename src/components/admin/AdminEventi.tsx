'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Upload, Save, ImageIcon, Repeat } from 'lucide-react';
import { compressImage } from '@/lib/image-compress';

const GIORNI_SETTIMANA = [
  { value: 'lunedì', label: 'Lun' },
  { value: 'martedì', label: 'Mar' },
  { value: 'mercoledì', label: 'Mer' },
  { value: 'giovedì', label: 'Gio' },
  { value: 'venerdì', label: 'Ven' },
  { value: 'sabato', label: 'Sab' },
  { value: 'domenica', label: 'Dom' },
];

interface Evento {
  id: string; titolo: string; descrizione: string; descrizioneBreve: string;
  immagineUrl: string | null; data: string; oraInizio: string; oraFine: string;
  prezzo: number; gratuito: boolean; graditaPrenotazione: boolean;
  capacita: number; postiDisponibili: number; inEvidenza: boolean; attivo: boolean;
  ricorrente: boolean; giorniRicorrenza: string | null;
  prenotazioni: { id: string }[];
}

const emptyForm = {
  titolo: '', descrizione: '', descrizioneBreve: '', immagineUrl: '',
  data: '', oraInizio: '', oraFine: '', prezzo: '0', gratuito: false,
  graditaPrenotazione: false, capacita: '0', postiDisponibili: '0',
  inEvidenza: false, attivo: true, ricorrente: false, giorniRicorrenza: [] as string[],
};

export default function AdminEventi() {
  const [eventi, setEventi] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Evento | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/eventi');
      if (res.ok) { const data = await res.json(); setEventi(Array.isArray(data) ? data : []); } else { setEventi([]); }
    } catch {
      toast.error('Errore nel caricamento');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDialog = (evento?: Evento) => {
    if (evento) {
      setEditing(evento);
      setForm({
        titolo: evento.titolo, descrizione: evento.descrizione,
        descrizioneBreve: evento.descrizioneBreve, immagineUrl: evento.immagineUrl || '',
        data: evento.data ? new Date(evento.data).toISOString().split('T')[0] : '',
        oraInizio: evento.oraInizio, oraFine: evento.oraFine,
        prezzo: String(evento.prezzo), gratuito: evento.gratuito,
        graditaPrenotazione: evento.graditaPrenotazione,
        capacita: String(evento.capacita), postiDisponibili: String(evento.postiDisponibili),
        inEvidenza: evento.inEvidenza, attivo: evento.attivo ?? true,
        ricorrente: evento.ricorrente || false,
        giorniRicorrenza: evento.giorniRicorrenza ? evento.giorniRicorrenza.split(',').map((g: string) => g.trim()) : [],
      });
    } else {
      setEditing(null);
      setForm(emptyForm);
    }
    setDialogOpen(true);
  };

  const saveEvento = async () => {
    if (!form.titolo.trim() || !form.oraInizio || !form.oraFine) {
      toast.error('Compila titolo e orari');
      return;
    }
    if (!form.ricorrente && !form.data) {
      toast.error('Compila la data');
      return;
    }
    if (form.ricorrente && form.giorniRicorrenza.length === 0) {
      toast.error('Seleziona almeno un giorno di ricorrenza');
      return;
    }
    try {
      const body = {
        ...(editing ? { id: editing.id } : {}),
        titolo: form.titolo,
        descrizione: form.descrizione,
        descrizioneBreve: form.descrizioneBreve,
        immagineUrl: form.immagineUrl || null,
        data: form.data || new Date().toISOString().split('T')[0],
        oraInizio: form.oraInizio,
        oraFine: form.oraFine,
        prezzo: parseFloat(form.prezzo) || 0,
        gratuito: form.gratuito,
        graditaPrenotazione: form.graditaPrenotazione,
        capacita: parseInt(form.capacita) || 0,
        postiDisponibili: parseInt(form.postiDisponibili) || 0,
        inEvidenza: form.inEvidenza,
        attivo: form.attivo,
        ricorrente: form.ricorrente,
        giorniRicorrenza: form.ricorrente ? form.giorniRicorrenza.join(', ') : null,
      };
      const res = await fetch('/api/admin/eventi', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) { toast.error('Errore'); return; }
      toast.success(editing ? 'Evento aggiornato' : 'Evento creato');
      setDialogOpen(false);
      fetchData();
    } catch { toast.error('Errore'); }
  };

  const deleteEvento = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/eventi?id=${id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Errore'); return; }
      toast.success('Evento eliminato');
      fetchData();
    } catch { toast.error('Errore'); }
  };

  const formatGiorni = (giorni: string | null) => {
    if (!giorni) return '';
    return giorni.split(',').map(g => {
      const found = GIORNI_SETTIMANA.find(d => d.value === g.trim());
      return found ? found.label : g.trim();
    }).join(', ');
  };

  const toggleGiorno = (giorno: string) => {
    setForm(prev => ({
      ...prev,
      giorniRicorrenza: prev.giorniRicorrenza.includes(giorno)
        ? prev.giorniRicorrenza.filter(g => g !== giorno)
        : [...prev.giorniRicorrenza, giorno],
    }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">🎪 Gestione Eventi</h2>
        <Button onClick={() => openDialog()}><Plus className="mr-2 h-4 w-4" />Nuovo Evento</Button>
      </div>

      <div className="rounded-lg border overflow-hidden max-h-[600px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Immagine</TableHead>
              <TableHead>Titolo</TableHead>
              <TableHead>Data / Ricorrenza</TableHead>
              <TableHead>Prezzo</TableHead>
              <TableHead>Prenotazioni</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventi.map(ev => (
              <TableRow key={ev.id}>
                <TableCell>
                  {ev.immagineUrl ? (
                    <img src={ev.immagineUrl} alt={ev.titolo} className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center"><ImageIcon className="h-5 w-5 text-gray-400" /></div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{ev.titolo}</div>
                  <div className="text-xs text-gray-500">{ev.oraInizio} - {ev.oraFine}</div>
                </TableCell>
                <TableCell>
                  {ev.ricorrente ? (
                    <div>
                      <Badge variant="outline" className="text-purple-700 border-purple-300 bg-purple-50 gap-1">
                        <Repeat className="h-3 w-3" /> {formatGiorni(ev.giorniRicorrenza)}
                      </Badge>
                    </div>
                  ) : (
                    <span>{new Date(ev.data).toLocaleDateString('it-IT')}</span>
                  )}
                </TableCell>
                <TableCell>{ev.gratuito ? <Badge variant="secondary">Gratuito</Badge> : `€${ev.prezzo.toFixed(2)}`}</TableCell>
                <TableCell><Badge variant="outline">{ev.prenotazioni?.length || 0}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {ev.inEvidenza && <Badge style={{ background: '#f59e0b', color: '#fff' }}>★</Badge>}
                    <Switch
                      checked={ev.attivo ?? true}
                      onCheckedChange={async (v) => {
                        setEventi(prev => prev.map(e => e.id === ev.id ? { ...e, attivo: v } : e));
                        try {
                          const res = await fetch('/api/admin/eventi', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: ev.id, attivo: v }),
                          });
                          if (!res.ok) {
                            setEventi(prev => prev.map(e => e.id === ev.id ? { ...e, attivo: !v } : e));
                            toast.error("Errore nell'aggiornamento");
                          }
                        } catch {
                          setEventi(prev => prev.map(e => e.id === ev.id ? { ...e, attivo: !v } : e));
                          toast.error("Errore nell'aggiornamento");
                        }
                      }}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openDialog(ev)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteEvento(ev.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ─── Dialog ─── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-2xl flex flex-col max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifica Evento' : 'Nuovo Evento'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 overflow-y-auto flex-1 min-h-0 pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Titolo *</Label>
                <Input value={form.titolo} onChange={e => setForm({ ...form, titolo: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{form.ricorrente ? 'Data Inizio' : 'Data *'}</Label>
                <Input
                  type="date"
                  value={form.data}
                  onChange={e => setForm({ ...form, data: e.target.value })}
                  disabled={form.ricorrente}
                />
                {form.ricorrente && (
                  <p className="text-xs text-gray-400">La data viene impostata automaticamente per gli eventi ricorrenti.</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrizione Breve</Label>
              <Input value={form.descrizioneBreve} onChange={e => setForm({ ...form, descrizioneBreve: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Descrizione</Label>
              <Textarea value={form.descrizione} onChange={e => setForm({ ...form, descrizione: e.target.value })} rows={3} />
            </div>

            {/* ── Ricorrenza ── */}
            <div className="rounded-lg border p-4 space-y-3 bg-gray-50">
              <div className="flex items-center gap-2">
                <Switch checked={form.ricorrente} onCheckedChange={v => setForm({ ...form, ricorrente: v, giorniRicorrenza: v ? (form.giorniRicorrenza.length > 0 ? form.giorniRicorrenza : ['giovedì']) : [] })} />
                <Label className="font-medium flex items-center gap-1.5">
                  <Repeat className="h-4 w-4" /> Evento Ricorrente
                </Label>
              </div>
              {form.ricorrente && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Seleziona i giorni in cui si ripete l&apos;evento:</p>
                  <div className="flex flex-wrap gap-2">
                    {GIORNI_SETTIMANA.map(giorno => (
                      <button
                        key={giorno.value}
                        type="button"
                        className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                          form.giorniRicorrenza.includes(giorno.value)
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-50 hover:border-purple-300'
                        }`}
                        onClick={() => toggleGiorno(giorno.value)}
                      >
                        {giorno.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ora Inizio *</Label>
                <Input type="time" value={form.oraInizio} onChange={e => setForm({ ...form, oraInizio: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Ora Fine *</Label>
                <Input type="time" value={form.oraFine} onChange={e => setForm({ ...form, oraFine: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prezzo</Label>
                <Input type="number" step="0.01" value={form.prezzo} onChange={e => setForm({ ...form, prezzo: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Capienza</Label>
                <Input type="number" value={form.capacita} onChange={e => setForm({ ...form, capacita: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Posti Disponibili</Label>
                <Input type="number" value={form.postiDisponibili} onChange={e => setForm({ ...form, postiDisponibili: e.target.value })} />
              </div>
              <div className="flex items-end gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={form.gratuito} onCheckedChange={v => setForm({ ...form, gratuito: v })} />
                  <Label>Gratuito</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.graditaPrenotazione} onCheckedChange={v => setForm({ ...form, graditaPrenotazione: v })} />
                  <Label>Prenotazione</Label>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.inEvidenza} onCheckedChange={v => setForm({ ...form, inEvidenza: v })} />
                <Label>In Evidenza</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.attivo} onCheckedChange={v => setForm({ ...form, attivo: v })} />
                <Label>Attivo</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Immagine</Label>
              <div className="flex gap-2">
                <Input value={form.immagineUrl} onChange={e => setForm({ ...form, immagineUrl: e.target.value })} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file) return;
                    setUploading(true);
                    try {
                      const url = await compressImage(file, 1200, 0.8);
                      setForm(f => ({ ...f, immagineUrl: url }));
                    } catch { toast.error('Errore'); }
                    setUploading(false);
                    e.target.value = '';
                  }}
                />
                <Button type="button" variant="outline" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                  {uploading ? '...' : <Upload className="h-4 w-4" />}
                </Button>
              </div>
              {form.immagineUrl && <img src={form.immagineUrl} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annulla</Button>
            <Button onClick={saveEvento}><Save className="mr-2 h-4 w-4" />Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}