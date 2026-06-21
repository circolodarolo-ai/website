'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  Plus,
  Pencil,
  Trash2,
  UtensilsCrossed,
  CalendarDays,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Categoria {
  id: string;
  nome: string;
}

interface Articolo {
  id: string;
  nome: string;
  descrizione: string;
  categoriaId: string;
  prezzo: number;
  prezzoPromozionale: number | null;
  eBestChoice: boolean;
  attivo: boolean;
  immagineUrl: string | null;
  categoria?: Categoria;
}

interface Evento {
  id: string;
  titolo: string;
  descrizione: string;
  descrizioneBreve: string;
  data: string;
  oraInizio: string;
  oraFine: string;
  prezzo: number;
  gratuito: boolean;
  graditaPrenotazione: boolean;
  capacita: number;
  postiDisponibili: number;
  inEvidenza: boolean;
  attivo: boolean;
  immagineUrl: string | null;
}

interface Prenotazione {
  id: string;
  nome: string;
  cognome: string;
  data: string;
  ora: string;
  persone: number;
  telefono: string;
  stato: 'pending' | 'confirmed' | 'cancelled';
  evento?: { id: string; titolo: string } | null;
}

interface ArticoloFormData {
  nome: string;
  descrizione: string;
  categoriaId: string;
  prezzo: number;
  prezzoPromozionale: string;
  eBestChoice: boolean;
  immagineUrl: string;
}

interface EventoFormData {
  titolo: string;
  descrizione: string;
  descrizioneBreve: string;
  data: string;
  oraInizio: string;
  oraFine: string;
  prezzo: number;
  gratuito: boolean;
  graditaPrenotazione: boolean;
  capacita: number;
  postiDisponibili: number;
  inEvidenza: boolean;
  immagineUrl: string;
}

// ─── Default form values ─────────────────────────────────────────────────────

const emptyArticolo: ArticoloFormData = {
  nome: '',
  descrizione: '',
  categoriaId: '',
  prezzo: 0,
  prezzoPromozionale: '',
  eBestChoice: false,
  immagineUrl: '',
};

const emptyEvento: EventoFormData = {
  titolo: '',
  descrizione: '',
  descrizioneBreve: '',
  data: '',
  oraInizio: '',
  oraFine: '',
  prezzo: 0,
  gratuito: false,
  graditaPrenotazione: false,
  capacita: 50,
  postiDisponibili: 50,
  inEvidenza: false,
  immagineUrl: '',
};

// ─── Helper ─────────────────────────────────────────────────────────────────

function formatPrice(val: number | null | undefined): string {
  if (val == null || isNaN(val)) return '-';
  return `€ ${val.toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('it-IT');
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AdminPanel() {
  // Sheet open state
  const [open, setOpen] = useState(false);

  // ── Menu Tab State ─────────────────────────────────────────────────────────
  const [articoli, setArticoli] = useState<Articolo[]>([]);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [articoloLoading, setArticoloLoading] = useState(false);

  const [articoloDialogOpen, setArticoloDialogOpen] = useState(false);
  const [editingArticolo, setEditingArticolo] = useState<Articolo | null>(null);
  const [articoloForm, setArticoloForm] = useState<ArticoloFormData>(emptyArticolo);

  const [articoloDeleteOpen, setArticoloDeleteOpen] = useState(false);
  const [deletingArticolo, setDeletingArticolo] = useState<Articolo | null>(null);

  // ── Eventi Tab State ──────────────────────────────────────────────────────
  const [eventi, setEventi] = useState<Evento[]>([]);
  const [eventoLoading, setEventoLoading] = useState(false);

  const [eventoDialogOpen, setEventoDialogOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [eventoForm, setEventoForm] = useState<EventoFormData>(emptyEvento);

  const [eventoDeleteOpen, setEventoDeleteOpen] = useState(false);
  const [deletingEvento, setDeletingEvento] = useState<Evento | null>(null);

  // ── Prenotazioni Tab State ─────────────────────────────────────────────────
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([]);
  const [prenotazioneLoading, setPrenotazioneLoading] = useState(false);

  const [prenotazioneDeleteOpen, setPrenotazioneDeleteOpen] = useState(false);
  const [deletingPrenotazione, setDeletingPrenotazione] = useState<Prenotazione | null>(null);

  // ── Data Fetching ─────────────────────────────────────────────────────────

  const fetchCategorie = useCallback(async () => {
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        const cats: Categoria[] = data.categorie || data || [];
        setCategorie(Array.isArray(cats) ? cats : []);
      }
    } catch {
      // silent
    }
  }, []);

  const fetchArticoli = useCallback(async () => {
    setArticoloLoading(true);
    try {
      const res = await fetch('/api/admin/articoli');
      if (res.ok) {
        const data = await res.json();
        setArticoli(Array.isArray(data) ? data : data.articoli || []);
      }
    } catch {
      toast.error('Errore nel caricamento degli articoli');
    } finally {
      setArticoloLoading(false);
    }
  }, []);

  const fetchEventi = useCallback(async () => {
    setEventoLoading(true);
    try {
      const res = await fetch('/api/admin/eventi');
      if (res.ok) {
        const data = await res.json();
        setEventi(Array.isArray(data) ? data : data.eventi || []);
      }
    } catch {
      toast.error('Errore nel caricamento degli eventi');
    } finally {
      setEventoLoading(false);
    }
  }, []);

  const fetchPrenotazioni = useCallback(async () => {
    setPrenotazioneLoading(true);
    try {
      const res = await fetch('/api/admin/prenotazioni');
      if (res.ok) {
        const data = await res.json();
        setPrenotazioni(Array.isArray(data) ? data : data.prenotazioni || []);
      }
    } catch {
      toast.error('Errore nel caricamento delle prenotazioni');
    } finally {
      setPrenotazioneLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchCategorie();
      fetchArticoli();
      fetchEventi();
      fetchPrenotazioni();
    }
  }, [open, fetchCategorie, fetchArticoli, fetchEventi, fetchPrenotazioni]);

  // ── Category name lookup ───────────────────────────────────────────────────

  const getCategoryName = (categoriaId: string): string => {
    const cat = categorie.find((c) => c.id === categoriaId);
    return cat?.nome || '-';
  };

  // ── Articolo CRUD ─────────────────────────────────────────────────────────

  const openArticoloCreate = () => {
    setEditingArticolo(null);
    setArticoloForm(emptyArticolo);
    setArticoloDialogOpen(true);
  };

  const openArticoloEdit = (a: Articolo) => {
    setEditingArticolo(a);
    setArticoloForm({
      nome: a.nome || '',
      descrizione: a.descrizione || '',
      categoriaId: a.categoriaId || '',
      prezzo: a.prezzo || 0,
      prezzoPromozionale: a.prezzoPromozionale != null ? String(a.prezzoPromozionale) : '',
      eBestChoice: a.eBestChoice || false,
      immagineUrl: a.immagineUrl || '',
    });
    setArticoloDialogOpen(true);
  };

  const saveArticolo = async () => {
    const payload = {
      ...articoloForm,
      prezzoPromozionale: articoloForm.prezzoPromozionale
        ? Number(articoloForm.prezzoPromozionale)
        : null,
    };
    try {
      const url = editingArticolo
        ? `/api/admin/articoli/${editingArticolo.id}`
        : '/api/admin/articoli';
      const res = await fetch(url, {
        method: editingArticolo ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(editingArticolo ? 'Articolo aggiornato' : 'Articolo creato');
        setArticoloDialogOpen(false);
        fetchArticoli();
      } else {
        toast.error('Errore nel salvataggio');
      }
    } catch {
      toast.error('Errore di rete');
    }
  };

  const confirmDeleteArticolo = async () => {
    if (!deletingArticolo) return;
    try {
      const res = await fetch(`/api/admin/articoli/${deletingArticolo.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Articolo eliminato');
        setArticoloDeleteOpen(false);
        setDeletingArticolo(null);
        fetchArticoli();
      } else {
        toast.error('Errore nell\'eliminazione');
      }
    } catch {
      toast.error('Errore di rete');
    }
  };

  const toggleArticoloActive = async (a: Articolo) => {
    try {
      const res = await fetch(`/api/admin/articoli/${a.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attivo: !a.attivo }),
      });
      if (res.ok) {
        fetchArticoli();
        toast.success(a.attivo ? 'Articolo disattivato' : 'Articolo attivato');
      }
    } catch {
      toast.error('Errore');
    }
  };

  // ── Evento CRUD ────────────────────────────────────────────────────────────

  const openEventoCreate = () => {
    setEditingEvento(null);
    setEventoForm(emptyEvento);
    setEventoDialogOpen(true);
  };

  const openEventoEdit = (e: Evento) => {
    setEditingEvento(e);
    setEventoForm({
      titolo: e.titolo || '',
      descrizione: e.descrizione || '',
      descrizioneBreve: e.descrizioneBreve || '',
      data: e.data ? e.data.split('T')[0] : '',
      oraInizio: e.oraInizio || '',
      oraFine: e.oraFine || '',
      prezzo: e.prezzo || 0,
      gratuito: e.gratuito || false,
      graditaPrenotazione: e.graditaPrenotazione || false,
      capacita: e.capacita || 50,
      postiDisponibili: e.postiDisponibili || 50,
      inEvidenza: e.inEvidenza || false,
      immagineUrl: e.immagineUrl || '',
    });
    setEventoDialogOpen(true);
  };

  const saveEvento = async () => {
    const payload = { ...eventoForm };
    try {
      const url = editingEvento
        ? `/api/admin/eventi/${editingEvento.id}`
        : '/api/admin/eventi';
      const res = await fetch(url, {
        method: editingEvento ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(editingEvento ? 'Evento aggiornato' : 'Evento creato');
        setEventoDialogOpen(false);
        fetchEventi();
      } else {
        toast.error('Errore nel salvataggio');
      }
    } catch {
      toast.error('Errore di rete');
    }
  };

  const confirmDeleteEvento = async () => {
    if (!deletingEvento) return;
    try {
      const res = await fetch(`/api/admin/eventi/${deletingEvento.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Evento eliminato');
        setEventoDeleteOpen(false);
        setDeletingEvento(null);
        fetchEventi();
      } else {
        toast.error('Errore nell\'eliminazione');
      }
    } catch {
      toast.error('Errore di rete');
    }
  };

  const toggleEventoActive = async (e: Evento) => {
    try {
      const res = await fetch(`/api/admin/eventi/${e.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attivo: !e.attivo }),
      });
      if (res.ok) {
        fetchEventi();
        toast.success(e.attivo ? 'Evento disattivato' : 'Evento attivato');
      }
    } catch {
      toast.error('Errore');
    }
  };

  // ── Prenotazione Actions ──────────────────────────────────────────────────

  const changePrenotazioneStatus = async (p: Prenotazione, newStato: string) => {
    try {
      const res = await fetch(`/api/admin/prenotazioni/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stato: newStato }),
      });
      if (res.ok) {
        toast.success('Stato aggiornato');
        fetchPrenotazioni();
      } else {
        toast.error('Errore nell\'aggiornamento');
      }
    } catch {
      toast.error('Errore di rete');
    }
  };

  const confirmDeletePrenotazione = async () => {
    if (!deletingPrenotazione) return;
    try {
      const res = await fetch(`/api/admin/prenotazioni/${deletingPrenotazione.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Prenotazione eliminata');
        setPrenotazioneDeleteOpen(false);
        setDeletingPrenotazione(null);
        fetchPrenotazioni();
      } else {
        toast.error('Errore nell\'eliminazione');
      }
    } catch {
      toast.error('Errore di rete');
    }
  };

  // ── Status badge helper ────────────────────────────────────────────────────

  const statusBadge = (stato: string) => {
    switch (stato) {
      case 'confirmed':
        return <Badge className="bg-emerald-600 text-white">Confermato</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Annullato</Badge>;
      default:
        return <Badge variant="secondary">In attesa</Badge>;
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Floating Admin Button */}
      <Button
        onClick={() => setOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
        aria-label="Apri pannello admin"
      >
        <Settings className="h-6 w-6" />
      </Button>

      {/* Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-[700px] overflow-y-auto p-0">
          <SheetHeader className="p-6 pb-2">
            <SheetTitle className="text-2xl font-bold">Admin Panel</SheetTitle>
          </SheetHeader>

          <Tabs defaultValue="menu" className="w-full px-6 pb-6">
            <TabsList className="w-full">
              <TabsTrigger value="menu" className="flex-1 gap-2">
                <UtensilsCrossed className="h-4 w-4" />
                <span className="hidden sm:inline">Menu</span>
              </TabsTrigger>
              <TabsTrigger value="eventi" className="flex-1 gap-2">
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">Eventi</span>
              </TabsTrigger>
              <TabsTrigger value="prenotazioni" className="flex-1 gap-2">
                <ClipboardList className="h-4 w-4" />
                <span className="hidden sm:inline">Prenotazioni</span>
              </TabsTrigger>
            </TabsList>

            {/* ─── MENU TAB ──────────────────────────────────────────────── */}
            <TabsContent value="menu" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Gestione Menu</h3>
                <Button onClick={openArticoloCreate} size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Aggiungi
                </Button>
              </div>

              {articoloLoading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : articoli.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">
                  Nessun articolo trovato
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Prezzo</TableHead>
                        <TableHead>Promo</TableHead>
                        <TableHead>Best Choice</TableHead>
                        <TableHead>Attivo</TableHead>
                        <TableHead className="text-right">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {articoli.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.nome}</TableCell>
                          <TableCell>{getCategoryName(a.categoriaId)}</TableCell>
                          <TableCell>{formatPrice(a.prezzo)}</TableCell>
                          <TableCell>
                            {a.prezzoPromozionale != null
                              ? formatPrice(a.prezzoPromozionale)
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {a.eBestChoice && (
                              <Badge className="bg-amber-500 text-white">Best</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={a.attivo}
                              onCheckedChange={() => toggleArticoloActive(a)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openArticoloEdit(a)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setDeletingArticolo(a);
                                  setArticoloDeleteOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* ─── EVENTI TAB ────────────────────────────────────────────── */}
            <TabsContent value="eventi" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Gestione Eventi</h3>
                <Button onClick={openEventoCreate} size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Aggiungi
                </Button>
              </div>

              {eventoLoading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : eventi.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">
                  Nessun evento trovato
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titolo</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Orario</TableHead>
                        <TableHead>Prezzo</TableHead>
                        <TableHead>Posti</TableHead>
                        <TableHead>Evidenza</TableHead>
                        <TableHead>Attivo</TableHead>
                        <TableHead className="text-right">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eventi.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="font-medium">{e.titolo}</TableCell>
                          <TableCell>{formatDate(e.data)}</TableCell>
                          <TableCell>
                            {e.oraInizio}
                            {e.oraFine ? ` - ${e.oraFine}` : ''}
                          </TableCell>
                          <TableCell>
                            {e.gratuito ? (
                              <Badge className="bg-emerald-600 text-white">Gratuito</Badge>
                            ) : (
                              formatPrice(e.prezzo)
                            )}
                          </TableCell>
                          <TableCell>
                            {e.postiDisponibili}/{e.capacita}
                          </TableCell>
                          <TableCell>
                            {e.inEvidenza && (
                              <Badge className="bg-purple-600 text-white">Evidenza</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={e.attivo}
                              onCheckedChange={() => toggleEventoActive(e)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEventoEdit(e)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setDeletingEvento(e);
                                  setEventoDeleteOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* ─── PRENOTAZIONI TAB ───────────────────────────────────────── */}
            <TabsContent value="prenotazioni" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Prenotazioni</h3>
              </div>

              {prenotazioneLoading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : prenotazioni.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">
                  Nessuna prenotazione trovata
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Cognome</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Ora</TableHead>
                        <TableHead>Persone</TableHead>
                        <TableHead>Telefono</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead>Evento</TableHead>
                        <TableHead className="text-right">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prenotazioni.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.nome}</TableCell>
                          <TableCell>{p.cognome}</TableCell>
                          <TableCell>{formatDate(p.data)}</TableCell>
                          <TableCell>{p.ora}</TableCell>
                          <TableCell>{p.persone}</TableCell>
                          <TableCell>{p.telefono || '-'}</TableCell>
                          <TableCell>
                            <Select
                              value={p.stato}
                              onValueChange={(v) => changePrenotazioneStatus(p, v)}
                            >
                              <SelectTrigger className="w-[130px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">In attesa</SelectItem>
                                <SelectItem value="confirmed">Confermato</SelectItem>
                                <SelectItem value="cancelled">Annullato</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {p.evento ? p.evento.titolo : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => {
                                setDeletingPrenotazione(p);
                                setPrenotazioneDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* ─── Articolo Dialog ──────────────────────────────────────────────── */}
      <Dialog open={articoloDialogOpen} onOpenChange={setArticoloDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingArticolo ? 'Modifica Articolo' : 'Nuovo Articolo'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="art-nome">Nome</Label>
              <Input
                id="art-nome"
                value={articoloForm.nome}
                onChange={(e) =>
                  setArticoloForm((f) => ({ ...f, nome: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="art-descrizione">Descrizione</Label>
              <Textarea
                id="art-descrizione"
                value={articoloForm.descrizione}
                onChange={(e) =>
                  setArticoloForm((f) => ({ ...f, descrizione: e.target.value }))
                }
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="art-categoria">Categoria</Label>
              <Select
                value={articoloForm.categoriaId}
                onValueChange={(v) =>
                  setArticoloForm((f) => ({ ...f, categoriaId: v }))
                }
              >
                <SelectTrigger id="art-categoria">
                  <SelectValue placeholder="Seleziona categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorie.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="art-prezzo">Prezzo (€)</Label>
                <Input
                  id="art-prezzo"
                  type="number"
                  step="0.01"
                  min="0"
                  value={articoloForm.prezzo}
                  onChange={(e) =>
                    setArticoloForm((f) => ({
                      ...f,
                      prezzo: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="art-promo">Prezzo Promo (€)</Label>
                <Input
                  id="art-promo"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Opzionale"
                  value={articoloForm.prezzoPromozionale}
                  onChange={(e) =>
                    setArticoloForm((f) => ({
                      ...f,
                      prezzoPromozionale: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="art-best"
                checked={articoloForm.eBestChoice}
                onCheckedChange={(checked) =>
                  setArticoloForm((f) => ({
                    ...f,
                    eBestChoice: checked === true,
                  }))
                }
              />
              <Label htmlFor="art-best" className="cursor-pointer">
                Best Choice
              </Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="art-immagine">URL Immagine</Label>
              <Input
                id="art-immagine"
                value={articoloForm.immagineUrl}
                onChange={(e) =>
                  setArticoloForm((f) => ({ ...f, immagineUrl: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArticoloDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={saveArticolo}>
              {editingArticolo ? 'Salva' : 'Crea'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Articolo Delete Alert ────────────────────────────────────────── */}
      <AlertDialog open={articoloDeleteOpen} onOpenChange={setArticoloDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina Articolo</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare &quot;{deletingArticolo?.nome}&quot;? Questa azione
              non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteArticolo}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Evento Dialog ────────────────────────────────────────────────── */}
      <Dialog open={eventoDialogOpen} onOpenChange={setEventoDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvento ? 'Modifica Evento' : 'Nuovo Evento'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="evt-titolo">Titolo</Label>
              <Input
                id="evt-titolo"
                value={eventoForm.titolo}
                onChange={(e) =>
                  setEventoForm((f) => ({ ...f, titolo: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="evt-desc-breve">Descrizione Breve</Label>
              <Input
                id="evt-desc-breve"
                value={eventoForm.descrizioneBreve}
                onChange={(e) =>
                  setEventoForm((f) => ({ ...f, descrizioneBreve: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="evt-descrizione">Descrizione</Label>
              <Textarea
                id="evt-descrizione"
                value={eventoForm.descrizione}
                onChange={(e) =>
                  setEventoForm((f) => ({ ...f, descrizione: e.target.value }))
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="evt-data">Data</Label>
                <Input
                  id="evt-data"
                  type="date"
                  value={eventoForm.data}
                  onChange={(e) =>
                    setEventoForm((f) => ({ ...f, data: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="evt-prezzo">Prezzo (€)</Label>
                <Input
                  id="evt-prezzo"
                  type="number"
                  step="0.01"
                  min="0"
                  value={eventoForm.prezzo}
                  onChange={(e) =>
                    setEventoForm((f) => ({
                      ...f,
                      prezzo: Number(e.target.value),
                    }))
                  }
                  disabled={eventoForm.gratuito}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="evt-ora-inizio">Ora Inizio</Label>
                <Input
                  id="evt-ora-inizio"
                  type="time"
                  value={eventoForm.oraInizio}
                  onChange={(e) =>
                    setEventoForm((f) => ({ ...f, oraInizio: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="evt-ora-fine">Ora Fine</Label>
                <Input
                  id="evt-ora-fine"
                  type="time"
                  value={eventoForm.oraFine}
                  onChange={(e) =>
                    setEventoForm((f) => ({ ...f, oraFine: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="evt-capacita">Capacità</Label>
                <Input
                  id="evt-capacita"
                  type="number"
                  min="1"
                  value={eventoForm.capacita}
                  onChange={(e) =>
                    setEventoForm((f) => ({
                      ...f,
                      capacita: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="evt-posti">Posti Disponibili</Label>
                <Input
                  id="evt-posti"
                  type="number"
                  min="0"
                  value={eventoForm.postiDisponibili}
                  onChange={(e) =>
                    setEventoForm((f) => ({
                      ...f,
                      postiDisponibili: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="evt-gratuito"
                  checked={eventoForm.gratuito}
                  onCheckedChange={(checked) =>
                    setEventoForm((f) => ({
                      ...f,
                      gratuito: checked === true,
                    }))
                  }
                />
                <Label htmlFor="evt-gratuito" className="cursor-pointer">
                  Gratuito
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="evt-prenotazione"
                  checked={eventoForm.graditaPrenotazione}
                  onCheckedChange={(checked) =>
                    setEventoForm((f) => ({
                      ...f,
                      graditaPrenotazione: checked === true,
                    }))
                  }
                />
                <Label htmlFor="evt-prenotazione" className="cursor-pointer">
                  Gradita Prenotazione
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="evt-evidenza"
                  checked={eventoForm.inEvidenza}
                  onCheckedChange={(checked) =>
                    setEventoForm((f) => ({
                      ...f,
                      inEvidenza: checked === true,
                    }))
                  }
                />
                <Label htmlFor="evt-evidenza" className="cursor-pointer">
                  In Evidenza
                </Label>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="evt-immagine">URL Immagine</Label>
              <Input
                id="evt-immagine"
                value={eventoForm.immagineUrl}
                onChange={(e) =>
                  setEventoForm((f) => ({ ...f, immagineUrl: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEventoDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={saveEvento}>
              {editingEvento ? 'Salva' : 'Crea'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Evento Delete Alert ──────────────────────────────────────────── */}
      <AlertDialog open={eventoDeleteOpen} onOpenChange={setEventoDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina Evento</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare &quot;{deletingEvento?.titolo}&quot;? Questa azione
              non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEvento}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Prenotazione Delete Alert ────────────────────────────────────── */}
      <AlertDialog open={prenotazioneDeleteOpen} onOpenChange={setPrenotazioneDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina Prenotazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare la prenotazione di &quot;
              {deletingPrenotazione?.nome} {deletingPrenotazione?.cognome}&quot;? Questa
              azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePrenotazione}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
