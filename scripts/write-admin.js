const fs = require('fs');
const path = require('path');

const content = `'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  Plus,
  Pencil,
  Trash2,
  UtensilsCrossed,
  CalendarDays,
  ClipboardList,
  FolderOpen,
  ShieldAlert,
  Building2,
  Footprints,
  Save,
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
  icona: string | null;
  ordine: number;
  attiva: boolean;
  _count?: { articoli: number };
}

interface Allergene {
  id: string;
  nome: string;
  icona: string | null;
  _count?: { articoli: number };
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
  categoria?: { id: string; nome: string };
  allergeni?: { id: string; allergene: { id: string; nome: string; icona: string } }[];
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
  email?: string;
  note?: string;
  stato: 'pending' | 'confirmed' | 'cancelled';
  evento?: { id: string; titolo: string } | null;
}

interface SiteInfo {
  id: string;
  nomeLocale: string;
  slogan: string;
  chiSiamoTitolo: string;
  chiSiamoTesto: string;
  telefono: string;
  email: string;
  indirizzo: string;
  orariApertura: string;
  prenotazioniAttive: boolean;
  heroTitle: string;
  heroSubtitle: string;
  heroCTAText: string;
  primaryColor: string;
}

interface FooterInfo {
  id: string;
  indirizzo: string;
  telefono: string;
  email: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  justeatUrl: string | null;
  deliverooUrl: string | null;
  glovoUrl: string | null;
  ubereatsUrl: string | null;
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fp(val: number | null | undefined): string {
  if (val == null || isNaN(val)) return '-';
  return \\u20AC \\${val.toFixed(2)};
}

function fd(dateStr: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('it-IT');
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AdminPanel() {
  const [open, setOpen] = useState(false);

  // ── Tab State ─────────────────────────────────────────────────────────────
  // Menu
  const [articoli, setArticoli] = useState<Articolo[]>([]);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [artLoading, setArtLoading] = useState(false);
  const [artDialogOpen, setArtDialogOpen] = useState(false);
  const [editingArt, setEditingArt] = useState<Articolo | null>(null);
  const [artForm, setArtForm] = useState<ArticoloFormData>(emptyArticolo);
  const [artDeleteOpen, setArtDeleteOpen] = useState(false);
  const [deletingArt, setDeletingArt] = useState<Articolo | null>(null);

  // Categorie
  const [cats, setCats] = useState<Categoria[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Categoria | null>(null);
  const [catForm, setCatForm] = useState({ nome: '', icona: '', ordine: 0, attiva: true });
  const [catDeleteOpen, setCatDeleteOpen] = useState(false);
  const [deletingCat, setDeletingCat] = useState<Categoria | null>(null);

  // Allergeni
  const [allergeni, setAllergeni] = useState<Allergene[]>([]);
  const [allLoading, setAllLoading] = useState(false);
  const [allDialogOpen, setAllDialogOpen] = useState(false);
  const [editingAll, setEditingAll] = useState<Allergene | null>(null);
  const [allForm, setAllForm] = useState({ nome: '', icona: '' });
  const [allDeleteOpen, setAllDeleteOpen] = useState(false);
  const [deletingAll, setDeletingAll] = useState<Allergene | null>(null);

  // Eventi
  const [eventi, setEventi] = useState<Evento[]>([]);
  const [evtLoading, setEvtLoading] = useState(false);
  const [evtDialogOpen, setEvtDialogOpen] = useState(false);
  const [editingEvt, setEditingEvt] = useState<Evento | null>(null);
  const [evtForm, setEvtForm] = useState<EventoFormData>(emptyEvento);
  const [evtDeleteOpen, setEvtDeleteOpen] = useState(false);
  const [deletingEvt, setDeletingEvt] = useState<Evento | null>(null);

  // Prenotazioni
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([]);
  const [prenLoading, setPrenLoading] = useState(false);
  const [prenDeleteOpen, setPrenDeleteOpen] = useState(false);
  const [deletingPren, setDeletingPren] = useState<Prenotazione | null>(null);

  // Site Info
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [siteForm, setSiteForm] = useState<SiteInfo | null>(null);
  const [siteLoading, setSiteLoading] = useState(false);

  // Footer Info
  const [footerInfo, setFooterInfo] = useState<FooterInfo | null>(null);
  const [footerForm, setFooterForm] = useState<FooterInfo | null>(null);
  const [footerLoading, setFooterLoading] = useState(false);

  // ── Data Fetching ─────────────────────────────────────────────────────────

  const fetchCategorie = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categorie');
      if (res.ok) setCats(await res.json());
    } catch { /* silent */ }
  }, []);

  const fetchArticoli = useCallback(async () => {
    setArtLoading(true);
    try {
      const res = await fetch('/api/admin/articoli');
      if (res.ok) {
        const data = await res.json();
        setArticoli(Array.isArray(data) ? data : []);
        // extract categorie from articoli for the dropdown
        const catMap = new Map<string, { id: string; nome: string }>();
        (Array.isArray(data) ? data : []).forEach((a: Articolo) => {
          if (a.categoria && !catMap.has(a.categoria.id)) {
            catMap.set(a.categoria.id, { id: a.categoria.id, nome: a.categoria.nome });
          }
        });
      }
    } catch { toast.error('Errore caricamento articoli'); }
    finally { setArtLoading(false); }
  }, []);

  const fetchAllergeni = useCallback(async () => {
    setAllLoading(true);
    try {
      const res = await fetch('/api/admin/allergeni');
      if (res.ok) setAllergeni(await res.json());
    } catch { toast.error('Errore caricamento allergeni'); }
    finally { setAllLoading(false); }
  }, []);

  const fetchEventi = useCallback(async () => {
    setEvtLoading(true);
    try {
      const res = await fetch('/api/admin/eventi');
      if (res.ok) setEventi(await res.json());
    } catch { toast.error('Errore caricamento eventi'); }
    finally { setEvtLoading(false); }
  }, []);

  const fetchPrenotazioni = useCallback(async () => {
    setPrenLoading(true);
    try {
      const res = await fetch('/api/admin/prenotazioni');
      if (res.ok) setPrenotazioni(await res.json());
    } catch { toast.error('Errore caricamento prenotazioni'); }
    finally { setPrenLoading(false); }
  }, []);

  const fetchSiteInfo = useCallback(async () => {
    setSiteLoading(true);
    try {
      const res = await fetch('/api/site-info');
      if (res.ok) {
        const data = await res.json();
        setSiteInfo(data);
        setSiteForm(data);
      }
    } catch { toast.error('Errore caricamento info sito'); }
    finally { setSiteLoading(false); }
  }, []);

  const fetchFooterInfo = useCallback(async () => {
    setFooterLoading(true);
    try {
      const res = await fetch('/api/footer-info');
      if (res.ok) {
        const data = await res.json();
        setFooterInfo(data);
        setFooterForm(data);
      }
    } catch { toast.error('Errore caricamento footer'); }
    finally { setFooterLoading(false); }
  }, []);

  useEffect(() => {
    if (open) {
      fetchCategorie();
      fetchArticoli();
      fetchAllergeni();
      fetchEventi();
      fetchPrenotazioni();
      fetchSiteInfo();
      fetchFooterInfo();
    }
  }, [open, fetchCategorie, fetchArticoli, fetchAllergeni, fetchEventi, fetchPrenotazioni, fetchSiteInfo, fetchFooterInfo]);

  const getCatName = (id: string) => cats.find(c => c.id === id)?.nome || '-';

  // ── Spinner ───────────────────────────────────────────────────────────────
  const spinner = <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  // ── Articolo CRUD ─────────────────────────────────────────────────────────
  const openArtCreate = () => { setEditingArt(null); setArtForm(emptyArticolo); setArtDialogOpen(true); };
  const openArtEdit = (a: Articolo) => {
    setEditingArt(a);
    setArtForm({
      nome: a.nome || '', descrizione: a.descrizione || '', categoriaId: a.categoriaId || '',
      prezzo: a.prezzo || 0,
      prezzoPromozionale: a.prezzoPromozionale != null ? String(a.prezzoPromozionale) : '',
      eBestChoice: a.eBestChoice || false, immagineUrl: a.immagineUrl || '',
    });
    setArtDialogOpen(true);
  };
  const saveArt = async () => {
    const payload = { ...artForm, prezzoPromozionale: artForm.prezzoPromozionale ? Number(artForm.prezzoPromozionale) : null };
    try {
      const url = editingArt ? \\`/api/admin/articoli?id=\\${editingArt.id}\\` : '/api/admin/articoli';
      const res = await fetch(url, {
        method: editingArt ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingArt ? { id: editingArt.id, ...payload } : payload),
      });
      if (res.ok) { toast.success(editingArt ? 'Articolo aggiornato' : 'Articolo creato'); setArtDialogOpen(false); fetchArticoli(); }
      else toast.error('Errore nel salvataggio');
    } catch { toast.error('Errore di rete'); }
  };
  const deleteArt = async () => {
    if (!deletingArt) return;
    try {
      const res = await fetch(\\`/api/admin/articoli?id=\\${deletingArt.id}\\`, { method: 'DELETE' });
      if (res.ok) { toast.success('Articolo eliminato'); setArtDeleteOpen(false); setDeletingArt(null); fetchArticoli(); }
      else toast.error('Errore');
    } catch { toast.error('Errore di rete'); }
  };
  const toggleArt = async (a: Articolo) => {
    try {
      await fetch(\\`/api/admin/articoli?id=\\${a.id}\\`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: a.id, attivo: !a.attivo }),
      });
      fetchArticoli(); toast.success(a.attivo ? 'Disattivato' : 'Attivato');
    } catch { toast.error('Errore'); }
  };

  // ── Categoria CRUD ────────────────────────────────────────────────────────
  const openCatCreate = () => { setEditingCat(null); setCatForm({ nome: '', icona: '', ordine: cats.length, attiva: true }); setCatDialogOpen(true); };
  const openCatEdit = (c: Categoria) => { setEditingCat(c); setCatForm({ nome: c.nome, icona: c.icona || '', ordine: c.ordine, attiva: c.attiva }); setCatDialogOpen(true); };
  const saveCat = async () => {
    try {
      const url = editingCat ? \\`/api/admin/categorie?id=\\${editingCat.id}\\` : '/api/admin/categorie';
      const res = await fetch(url, {
        method: editingCat ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCat ? { id: editingCat.id, ...catForm } : catForm),
      });
      if (res.ok) { toast.success(editingCat ? 'Categoria aggiornata' : 'Categoria creata'); setCatDialogOpen(false); fetchCategorie(); }
      else toast.error('Errore');
    } catch { toast.error('Errore di rete'); }
  };
  const deleteCat = async () => {
    if (!deletingCat) return;
    try {
      const res = await fetch(\\`/api/admin/categorie?id=\\${deletingCat.id}\\`, { method: 'DELETE' });
      if (res.ok) { toast.success('Categoria eliminata'); setCatDeleteOpen(false); setDeletingCat(null); fetchCategorie(); }
      else toast.error('Errore');
    } catch { toast.error('Errore'); }
  };
  const toggleCat = async (c: Categoria) => {
    try {
      await fetch(\\`/api/admin/categorie?id=\\${c.id}\\`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, attiva: !c.attiva }),
      });
      fetchCategorie();
    } catch { toast.error('Errore'); }
  };

  // ── Allergene CRUD ────────────────────────────────────────────────────────
  const openAllCreate = () => { setEditingAll(null); setAllForm({ nome: '', icona: '' }); setAllDialogOpen(true); };
  const openAllEdit = (a: Allergene) => { setEditingAll(a); setAllForm({ nome: a.nome, icona: a.icona || '' }); setAllDialogOpen(true); };
  const saveAll = async () => {
    try {
      const url = editingAll ? \\`/api/admin/allergeni?id=\\${editingAll.id}\\` : '/api/admin/allergeni';
      const res = await fetch(url, {
        method: editingAll ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAll ? { id: editingAll.id, ...allForm } : allForm),
      });
      if (res.ok) { toast.success(editingAll ? 'Allergene aggiornato' : 'Allergene creato'); setAllDialogOpen(false); fetchAllergeni(); }
      else toast.error('Errore');
    } catch { toast.error('Errore di rete'); }
  };
  const deleteAll = async () => {
    if (!deletingAll) return;
    try {
      const res = await fetch(\\`/api/admin/allergeni?id=\\${deletingAll.id}\\`, { method: 'DELETE' });
      if (res.ok) { toast.success('Allergene eliminato'); setAllDeleteOpen(false); setDeletingAll(null); fetchAllergeni(); }
      else toast.error('Errore');
    } catch { toast.error('Errore'); }
  };

  // ── Evento CRUD ───────────────────────────────────────────────────────────
  const openEvtCreate = () => { setEditingEvt(null); setEvtForm(emptyEvento); setEvtDialogOpen(true); };
  const openEvtEdit = (e: Evento) => {
    setEditingEvt(e);
    setEvtForm({
      titolo: e.titolo, descrizione: e.descrizione, descrizioneBreve: e.descrizioneBreve,
      data: e.data ? e.data.split('T')[0] : '', oraInizio: e.oraInizio, oraFine: e.oraFine,
      prezzo: e.prezzo, gratuito: e.gratuito, graditaPrenotazione: e.graditaPrenotazione,
      capacita: e.capacita, postiDisponibili: e.postiDisponibili, inEvidenza: e.inEvidenza,
      immagineUrl: e.immagineUrl || '',
    });
    setEvtDialogOpen(true);
  };
  const saveEvt = async () => {
    try {
      const url = editingEvt ? \\`/api/admin/eventi?id=\\${editingEvt.id}\\` : '/api/admin/eventi';
      const res = await fetch(url, {
        method: editingEvt ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEvt ? { id: editingEvt.id, ...evtForm } : evtForm),
      });
      if (res.ok) { toast.success(editingEvt ? 'Evento aggiornato' : 'Evento creato'); setEvtDialogOpen(false); fetchEventi(); }
      else toast.error('Errore');
    } catch { toast.error('Errore di rete'); }
  };
  const deleteEvt = async () => {
    if (!deletingEvt) return;
    try {
      const res = await fetch(\\`/api/admin/eventi?id=\\${deletingEvt.id}\\`, { method: 'DELETE' });
      if (res.ok) { toast.success('Evento eliminato'); setEvtDeleteOpen(false); setDeletingEvt(null); fetchEventi(); }
      else toast.error('Errore');
    } catch { toast.error('Errore'); }
  };
  const toggleEvt = async (e: Evento) => {
    try {
      await fetch(\\`/api/admin/eventi?id=\\${e.id}\\`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: e.id, attivo: !e.attivo }),
      });
      fetchEventi();
    } catch { toast.error('Errore'); }
  };

  // ── Prenotazione Actions ──────────────────────────────────────────────────
  const changePrenStato = async (p: Prenotazione, s: string) => {
    try {
      const res = await fetch(\\`/api/admin/prenotazioni?id=\\${p.id}\\`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, stato: s }),
      });
      if (res.ok) { toast.success('Stato aggiornato'); fetchPrenotazioni(); }
      else toast.error('Errore');
    } catch { toast.error('Errore'); }
  };
  const deletePren = async () => {
    if (!deletingPren) return;
    try {
      const res = await fetch(\\`/api/admin/prenotazioni?id=\\${deletingPren.id}\\`, { method: 'DELETE' });
      if (res.ok) { toast.success('Prenotazione eliminata'); setPrenDeleteOpen(false); setDeletingPren(null); fetchPrenotazioni(); }
      else toast.error('Errore');
    } catch { toast.error('Errore'); }
  };

  // ── Site Info Save ────────────────────────────────────────────────────────
  const saveSiteInfo = async () => {
    if (!siteForm) return;
    setSiteLoading(true);
    try {
      const res = await fetch('/api/site-info', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(siteForm),
      });
      if (res.ok) { toast.success('Info sito aggiornate'); setSiteInfo(await res.json()); }
      else toast.error('Errore');
    } catch { toast.error('Errore'); }
    finally { setSiteLoading(false); }
  };

  // ── Footer Info Save ──────────────────────────────────────────────────────
  const saveFooterInfo = async () => {
    if (!footerForm) return;
    setFooterLoading(true);
    try {
      const res = await fetch('/api/footer-info', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(footerForm),
      });
      if (res.ok) { toast.success('Footer aggiornato'); setFooterInfo(await res.json()); }
      else toast.error('Errore');
    } catch { toast.error('Errore'); }
    finally { setFooterLoading(false); }
  };

  // ── Status badge ──────────────────────────────────────────────────────────
  const statoBadge = (s: string) => {
    if (s === 'confirmed') return <Badge className="bg-emerald-600 text-white">Confermato</Badge>;
    if (s === 'cancelled') return <Badge variant="destructive">Annullato</Badge>;
    return <Badge variant="secondary">In attesa</Badge>;
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-red-700 hover:bg-red-800"
        aria-label="Admin"
      >
        <Settings className="h-6 w-6" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-[800px] overflow-y-auto p-0">
          <SheetHeader className="p-6 pb-2">
            <SheetTitle className="text-2xl font-bold">Pannello Admin</SheetTitle>
          </SheetHeader>

          <Tabs defaultValue="menu" className="w-full px-6 pb-6">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-gray-100 p-1">
              <TabsTrigger value="menu" className="flex-1 gap-1.5 text-xs sm:text-sm min-w-0">
                <UtensilsCrossed className="h-3.5 w-3.5" /><span className="hidden sm:inline">Menu</span>
              </TabsTrigger>
              <TabsTrigger value="categorie" className="flex-1 gap-1.5 text-xs sm:text-sm min-w-0">
                <FolderOpen className="h-3.5 w-3.5" /><span className="hidden sm:inline">Categorie</span>
              </TabsTrigger>
              <TabsTrigger value="allergeni" className="flex-1 gap-1.5 text-xs sm:text-sm min-w-0">
                <ShieldAlert className="h-3.5 w-3.5" /><span className="hidden sm:inline">Allergeni</span>
              </TabsTrigger>
              <TabsTrigger value="eventi" className="flex-1 gap-1.5 text-xs sm:text-sm min-w-0">
                <CalendarDays className="h-3.5 w-3.5" /><span className="hidden sm:inline">Eventi</span>
              </TabsTrigger>
              <TabsTrigger value="prenotazioni" className="flex-1 gap-1.5 text-xs sm:text-sm min-w-0">
                <ClipboardList className="h-3.5 w-3.5" /><span className="hidden sm:inline">Prenotazioni</span>
              </TabsTrigger>
              <TabsTrigger value="sito" className="flex-1 gap-1.5 text-xs sm:text-sm min-w-0">
                <Building2 className="h-3.5 w-3.5" /><span className="hidden sm:inline">Info Sito</span>
              </TabsTrigger>
              <TabsTrigger value="footer" className="flex-1 gap-1.5 text-xs sm:text-sm min-w-0">
                <Footprints className="h-3.5 w-3.5" /><span className="hidden sm:inline">Footer</span>
              </TabsTrigger>
            </TabsList>

            {/* ═══ MENU TAB ═════════════════════════════════════════════════ */}
            <TabsContent value="menu" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Gestione Menu</h3>
                <Button onClick={openArtCreate} size="sm" className="gap-1"><Plus className="h-4 w-4" /> Aggiungi</Button>
              </div>
              {artLoading ? spinner : articoli.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">Nessun articolo</p>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Nome</TableHead><TableHead>Categoria</TableHead><TableHead>Prezzo</TableHead>
                      <TableHead>Promo</TableHead><TableHead>Best</TableHead><TableHead>Attivo</TableHead><TableHead className="text-right">Azioni</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {articoli.map(a => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.nome}</TableCell>
                          <TableCell>{getCatName(a.categoriaId)}</TableCell>
                          <TableCell>{fp(a.prezzo)}</TableCell>
                          <TableCell>{a.prezzoPromozionale != null ? fp(a.prezzoPromozionale) : '-'}</TableCell>
                          <TableCell>{a.eBestChoice && <Badge className="bg-amber-500 text-white text-xs">Best</Badge>}</TableCell>
                          <TableCell><Switch checked={a.attivo} onCheckedChange={() => toggleArt(a)} /></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openArtEdit(a)}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeletingArt(a); setArtDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* ═══ CATEGORIE TAB ═══════════════════════════════════════════ */}
            <TabsContent value="categorie" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Gestione Categorie</h3>
                <Button onClick={openCatCreate} size="sm" className="gap-1"><Plus className="h-4 w-4" /> Aggiungi</Button>
              </div>
              {catLoading ? spinner : cats.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">Nessuna categoria</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Nome</TableHead><TableHead>Icona</TableHead><TableHead>Ordine</TableHead>
                      <TableHead>Piatti</TableHead><TableHead>Attiva</TableHead><TableHead className="text-right">Azioni</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {cats.map(c => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.nome}</TableCell>
                          <TableCell>{c.icona || '-'}</TableCell>
                          <TableCell>{c.ordine}</TableCell>
                          <TableCell>{c._count?.articoli ?? 0}</TableCell>
                          <TableCell><Switch checked={c.attiva} onCheckedChange={() => toggleCat(c)} /></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openCatEdit(c)}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeletingCat(c); setCatDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* ═══ ALLERGENI TAB ════════════════════════════════════════════ */}
            <TabsContent value="allergeni" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Gestione Allergeni</h3>
                <Button onClick={openAllCreate} size="sm" className="gap-1"><Plus className="h-4 w-4" /> Aggiungi</Button>
              </div>
              {allLoading ? spinner : allergeni.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">Nessun allergene</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Icona</TableHead><TableHead>Nome</TableHead>
                      <TableHead>Piatti collegati</TableHead><TableHead className="text-right">Azioni</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {allergeni.map(a => (
                        <TableRow key={a.id}>
                          <TableCell className="text-xl">{a.icona || '-'}</TableCell>
                          <TableCell className="font-medium">{a.nome}</TableCell>
                          <TableCell>{a._count?.articoli ?? 0}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openAllEdit(a)}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeletingAll(a); setAllDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* ═══ EVENTI TAB ══════════════════════════════════════════════ */}
            <TabsContent value="eventi" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Gestione Eventi</h3>
                <Button onClick={openEvtCreate} size="sm" className="gap-1"><Plus className="h-4 w-4" /> Aggiungi</Button>
              </div>
              {evtLoading ? spinner : eventi.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">Nessun evento</p>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Titolo</TableHead><TableHead>Data</TableHead><TableHead>Orario</TableHead>
                      <TableHead>Prezzo</TableHead><TableHead>Posti</TableHead><TableHead>Evid.</TableHead>
                      <TableHead>Attivo</TableHead><TableHead className="text-right">Azioni</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {eventi.map(e => (
                        <TableRow key={e.id}>
                          <TableCell className="font-medium">{e.titolo}</TableCell>
                          <TableCell>{fd(e.data)}</TableCell>
                          <TableCell>{e.oraInizio}{e.oraFine ? \\` - \\${e.oraFine}\\` : ''}</TableCell>
                          <TableCell>{e.gratuito ? <Badge className="bg-emerald-600 text-white text-xs">Gratuito</Badge> : fp(e.prezzo)}</TableCell>
                          <TableCell>{e.postiDisponibili}/{e.capacita}</TableCell>
                          <TableCell>{e.inEvidenza && <Badge className="bg-purple-600 text-white text-xs">Evid.</Badge>}</TableCell>
                          <TableCell><Switch checked={e.attivo} onCheckedChange={() => toggleEvt(e)} /></TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEvtEdit(e)}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeletingEvt(e); setEvtDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* ═══ PRENOTAZIONI TAB ════════════════════════════════════════ */}
            <TabsContent value="prenotazioni" className="mt-4 space-y-4">
              <h3 className="text-lg font-semibold">Prenotazioni</h3>
              {prenLoading ? spinner : prenotazioni.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">Nessuna prenotazione</p>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Nome</TableHead><TableHead>Cognome</TableHead><TableHead>Data</TableHead>
                      <TableHead>Ora</TableHead><TableHead>Pers.</TableHead><TableHead>Tel</TableHead>
                      <TableHead>Stato</TableHead><TableHead>Evento</TableHead><TableHead className="text-right">Azioni</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {prenotazioni.map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.nome}</TableCell>
                          <TableCell>{p.cognome}</TableCell>
                          <TableCell>{fd(p.data)}</TableCell>
                          <TableCell>{p.ora}</TableCell>
                          <TableCell>{p.persone}</TableCell>
                          <TableCell>{p.telefono || '-'}</TableCell>
                          <TableCell>
                            <Select value={p.stato} onValueChange={v => changePrenStato(p, v)}>
                              <SelectTrigger className="w-[130px] h-8"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">In attesa</SelectItem>
                                <SelectItem value="confirmed">Confermato</SelectItem>
                                <SelectItem value="cancelled">Annullato</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{p.evento?.titolo || '-'}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeletingPren(p); setPrenDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* ═══ INFO SITO TAB ═══════════════════════════════════════════ */}
            <TabsContent value="sito" className="mt-4 space-y-4">
              <h3 className="text-lg font-semibold">Informazioni Sito</h3>
              {siteLoading && !siteForm ? spinner : siteForm && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Modifica le informazioni generali del ristorante e le impostazioni della homepage.</p>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Nome Locale</Label>
                      <Input value={siteForm.nomeLocale} onChange={e => setSiteForm(f => ({ ...f!, nomeLocale: e.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Slogan</Label>
                      <Input value={siteForm.slogan} onChange={e => setSiteForm(f => ({ ...f!, slogan: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Telefono</Label>
                        <Input value={siteForm.telefono} onChange={e => setSiteForm(f => ({ ...f!, telefono: e.target.value }))} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input value={siteForm.email} onChange={e => setSiteForm(f => ({ ...f!, email: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Indirizzo</Label>
                      <Input value={siteForm.indirizzo} onChange={e => setSiteForm(f => ({ ...f!, indirizzo: e.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Orari di Apertura</Label>
                      <Input value={siteForm.orariApertura} onChange={e => setSiteForm(f => ({ ...f!, orariApertura: e.target.value }))} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={siteForm.prenotazioniAttive} onCheckedChange={v => setSiteForm(f => ({ ...f!, prenotazioniAttive: v }))} />
                      <Label>Prenotazioni attive</Label>
                    </div>
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm font-medium text-muted-foreground mb-3">Impostazioni Hero</p>
                    </div>
                    <div className="grid gap-2">
                      <Label>Titolo Hero</Label>
                      <Input value={siteForm.heroTitle} onChange={e => setSiteForm(f => ({ ...f!, heroTitle: e.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Sottotitolo Hero</Label>
                      <Input value={siteForm.heroSubtitle} onChange={e => setSiteForm(f => ({ ...f!, heroSubtitle: e.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Testo Pulsante CTA</Label>
                      <Input value={siteForm.heroCTAText} onChange={e => setSiteForm(f => ({ ...f!, heroCTAText: e.target.value }))} />
                    </div>
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm font-medium text-muted-foreground mb-3">Sezione Chi Siamo</p>
                    </div>
                    <div className="grid gap-2">
                      <Label>Titolo Chi Siamo</Label>
                      <Input value={siteForm.chiSiamoTitolo} onChange={e => setSiteForm(f => ({ ...f!, chiSiamoTitolo: e.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Testo Chi Siamo</Label>
                      <Textarea value={siteForm.chiSiamoTesto} onChange={e => setSiteForm(f => ({ ...f!, chiSiamoTesto: e.target.value }))} rows={4} />
                    </div>
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm font-medium text-muted-foreground mb-3">Aspetto</p>
                    </div>
                    <div className="grid gap-2">
                      <Label>Colore Primario</Label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={siteForm.primaryColor} onChange={e => setSiteForm(f => ({ ...f!, primaryColor: e.target.value }))} className="h-10 w-14 rounded cursor-pointer border" />
                        <Input value={siteForm.primaryColor} onChange={e => setSiteForm(f => ({ ...f!, primaryColor: e.target.value }))} className="flex-1" />
                      </div>
                    </div>
                    <Button onClick={saveSiteInfo} disabled={siteLoading} className="gap-2">
                      <Save className="h-4 w-4" /> {siteLoading ? 'Salvataggio...' : 'Salva Informazioni Sito'}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ═══ FOOTER TAB ══════════════════════════════════════════════ */}
            <TabsContent value="footer" className="mt-4 space-y-4">
              <h3 className="text-lg font-semibold">Impostazioni Footer</h3>
              {footerLoading && !footerForm ? spinner : footerForm && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Modifica i dati di contatto, i link social e le piattaforme di delivery.</p>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Indirizzo</Label>
                      <Input value={footerForm.indirizzo} onChange={e => setFooterForm(f => ({ ...f!, indirizzo: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Telefono</Label>
                        <Input value={footerForm.telefono} onChange={e => setFooterForm(f => ({ ...f!, telefono: e.target.value }))} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input value={footerForm.email} onChange={e => setFooterForm(f => ({ ...f!, email: e.target.value }))} />
                      </div>
                    </div>
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm font-medium text-muted-foreground mb-3">Social Media</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Facebook URL</Label>
                        <Input value={footerForm.facebookUrl || ''} onChange={e => setFooterForm(f => ({ ...f!, facebookUrl: e.target.value || null }))} placeholder="https://facebook.com/..." />
                      </div>
                      <div className="grid gap-2">
                        <Label>Instagram URL</Label>
                        <Input value={footerForm.instagramUrl || ''} onChange={e => setFooterForm(f => ({ ...f!, instagramUrl: e.target.value || null }))} placeholder="https://instagram.com/..." />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>TikTok URL</Label>
                      <Input value={footerForm.tiktokUrl || ''} onChange={e => setFooterForm(f => ({ ...f!, tiktokUrl: e.target.value || null }))} placeholder="https://tiktok.com/..." />
                    </div>
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm font-medium text-muted-foreground mb-3">Piattaforme di Delivery</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Just Eat URL</Label>
                        <Input value={footerForm.justeatUrl || ''} onChange={e => setFooterForm(f => ({ ...f!, justeatUrl: e.target.value || null }))} placeholder="https://www.justeat.it/..." />
                      </div>
                      <div className="grid gap-2">
                        <Label>Deliveroo URL</Label>
                        <Input value={footerForm.deliverooUrl || ''} onChange={e => setFooterForm(f => ({ ...f!, deliverooUrl: e.target.value || null }))} placeholder="https://deliveroo.it/..." />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Glovo URL</Label>
                        <Input value={footerForm.glovoUrl || ''} onChange={e => setFooterForm(f => ({ ...f!, glovoUrl: e.target.value || null }))} placeholder="https://glovoapp.com/..." />
                      </div>
                      <div className="grid gap-2">
                        <Label>Uber Eats URL</Label>
                        <Input value={footerForm.ubereatsUrl || ''} onChange={e => setFooterForm(f => ({ ...f!, ubereatsUrl: e.target.value || null }))} placeholder="https://ubereats.com/..." />
                      </div>
                    </div>
                    <Button onClick={saveFooterInfo} disabled={footerLoading} className="gap-2">
                      <Save className="h-4 w-4" /> {footerLoading ? 'Salvataggio...' : 'Salva Footer'}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

          </Tabs>
        </SheetContent>
      </Sheet>

      {/* ═══ DIALOGS ═════════════════════════════════════════════════════ */}

      {/* Articolo Dialog */}
      <Dialog open={artDialogOpen} onOpenChange={setArtDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingArt ? 'Modifica Articolo' : 'Nuovo Articolo'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Nome</Label><Input value={artForm.nome} onChange={e => setArtForm(f => ({ ...f, nome: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>Descrizione</Label><Textarea value={artForm.descrizione} onChange={e => setArtForm(f => ({ ...f, descrizione: e.target.value }))} rows={3} /></div>
            <div className="grid gap-2">
              <Label>Categoria</Label>
              <Select value={artForm.categoriaId} onValueChange={v => setArtForm(f => ({ ...f, categoriaId: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                <SelectContent>{cats.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Prezzo (&euro;)</Label><Input type="number" step="0.01" min="0" value={artForm.prezzo} onChange={e => setArtForm(f => ({ ...f, prezzo: Number(e.target.value) }))} /></div>
              <div className="grid gap-2"><Label>Promo (&euro;)</Label><Input type="number" step="0.01" min="0" placeholder="Opzionale" value={artForm.prezzoPromozionale} onChange={e => setArtForm(f => ({ ...f, prezzoPromozionale: e.target.value }))} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={artForm.eBestChoice} onCheckedChange={v => setArtForm(f => ({ ...f, eBestChoice: v === true }))} />
              <Label className="cursor-pointer">Best Choice</Label>
            </div>
            <div className="grid gap-2"><Label>URL Immagine</Label><Input value={artForm.immagineUrl} onChange={e => setArtForm(f => ({ ...f, immagineUrl: e.target.value }))} placeholder="https://..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArtDialogOpen(false)}>Annulla</Button>
            <Button onClick={saveArt}>{editingArt ? 'Salva' : 'Crea'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Categoria Dialog */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>{editingCat ? 'Modifica Categoria' : 'Nuova Categoria'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Nome</Label><Input value={catForm.nome} onChange={e => setCatForm(f => ({ ...f, nome: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>Icona (emoji o testo)</Label><Input value={catForm.icona} onChange={e => setCatForm(f => ({ ...f, icona: e.target.value }))} placeholder="\\uD83C\\uDF7D\\uFE0F" /></div>
            <div className="grid gap-2"><Label>Ordine</Label><Input type="number" min="0" value={catForm.ordine} onChange={e => setCatForm(f => ({ ...f, ordine: Number(e.target.value) }))} /></div>
            <div className="flex items-center gap-2">
              <Switch checked={catForm.attiva} onCheckedChange={v => setCatForm(f => ({ ...f, attiva: v }))} />
              <Label>Attiva</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialogOpen(false)}>Annulla</Button>
            <Button onClick={saveCat}>{editingCat ? 'Salva' : 'Crea'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Allergene Dialog */}
      <Dialog open={allDialogOpen} onOpenChange={setAllDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>{editingAll ? 'Modifica Allergene' : 'Nuovo Allergene'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Nome</Label><Input value={allForm.nome} onChange={e => setAllForm(f => ({ ...f, nome: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>Icona (emoji)</Label><Input value={allForm.icona} onChange={e => setAllForm(f => ({ ...f, icona: e.target.value }))} placeholder="\\uD83E\\uDD6C" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAllDialogOpen(false)}>Annulla</Button>
            <Button onClick={saveAll}>{editingAll ? 'Salva' : 'Crea'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Evento Dialog */}
      <Dialog open={evtDialogOpen} onOpenChange={setEvtDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingEvt ? 'Modifica Evento' : 'Nuovo Evento'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2"><Label>Titolo</Label><Input value={evtForm.titolo} onChange={e => setEvtForm(f => ({ ...f, titolo: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>Descrizione Breve</Label><Input value={evtForm.descrizioneBreve} onChange={e => setEvtForm(f => ({ ...f, descrizioneBreve: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>Descrizione</Label><Textarea value={evtForm.descrizione} onChange={e => setEvtForm(f => ({ ...f, descrizione: e.target.value }))} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Data</Label><Input type="date" value={evtForm.data} onChange={e => setEvtForm(f => ({ ...f, data: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Prezzo (&euro;)</Label><Input type="number" step="0.01" min="0" value={evtForm.prezzo} onChange={e => setEvtForm(f => ({ ...f, prezzo: Number(e.target.value) }))} disabled={evtForm.gratuito} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Ora Inizio</Label><Input type="time" value={evtForm.oraInizio} onChange={e => setEvtForm(f => ({ ...f, oraInizio: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Ora Fine</Label><Input type="time" value={evtForm.oraFine} onChange={e => setEvtForm(f => ({ ...f, oraFine: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Capacit\u00E0</Label><Input type="number" min="1" value={evtForm.capacita} onChange={e => setEvtForm(f => ({ ...f, capacita: Number(e.target.value) }))} /></div>
              <div className="grid gap-2"><Label>Posti Disponibili</Label><Input type="number" min="0" value={evtForm.postiDisponibili} onChange={e => setEvtForm(f => ({ ...f, postiDisponibili: Number(e.target.value) }))} /></div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2"><Checkbox checked={evtForm.gratuito} onCheckedChange={v => setEvtForm(f => ({ ...f, gratuito: v === true }))} /><Label className="cursor-pointer">Gratuito</Label></div>
              <div className="flex items-center gap-2"><Checkbox checked={evtForm.graditaPrenotazione} onCheckedChange={v => setEvtForm(f => ({ ...f, graditaPrenotazione: v === true }))} /><Label className="cursor-pointer">Gradita Prenotazione</Label></div>
              <div className="flex items-center gap-2"><Checkbox checked={evtForm.inEvidenza} onCheckedChange={v => setEvtForm(f => ({ ...f, inEvidenza: v === true }))} /><Label className="cursor-pointer">In Evidenza</Label></div>
            </div>
            <div className="grid gap-2"><Label>URL Immagine</Label><Input value={evtForm.immagineUrl} onChange={e => setEvtForm(f => ({ ...f, immagineUrl: e.target.value }))} placeholder="https://..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEvtDialogOpen(false)}>Annulla</Button>
            <Button onClick={saveEvt}>{editingEvt ? 'Salva' : 'Crea'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alerts */}
      <AlertDialog open={artDeleteOpen} onOpenChange={setArtDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Elimina Articolo</AlertDialogTitle>
          <AlertDialogDescription>Eliminare &quot;{deletingArt?.nome}&quot;?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction onClick={deleteArt} className="bg-destructive text-white hover:bg-destructive/90">Elimina</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={catDeleteOpen} onOpenChange={setCatDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Elimina Categoria</AlertDialogTitle>
          <AlertDialogDescription>Eliminare &quot;{deletingCat?.nome}&quot;? Anche gli articoli collegati saranno eliminati.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction onClick={deleteCat} className="bg-destructive text-white hover:bg-destructive/90">Elimina</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={allDeleteOpen} onOpenChange={setAllDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Elimina Allergene</AlertDialogTitle>
          <AlertDialogDescription>Eliminare &quot;{deletingAll?.nome}&quot;?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction onClick={deleteAll} className="bg-destructive text-white hover:bg-destructive/90">Elimina</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={evtDeleteOpen} onOpenChange={setEvtDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Elimina Evento</AlertDialogTitle>
          <AlertDialogDescription>Eliminare &quot;{deletingEvt?.titolo}&quot;?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction onClick={deleteEvt} className="bg-destructive text-white hover:bg-destructive/90">Elimina</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={prenDeleteOpen} onOpenChange={setPrenDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Elimina Prenotazione</AlertDialogTitle>
          <AlertDialogDescription>Eliminare la prenotazione di &quot;{deletingPren?.nome} {deletingPren?.cognome}&quot;?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction onClick={deletePren} className="bg-destructive text-white hover:bg-destructive/90">Elimina</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
`;

fs.writeFileSync('/home/z/my-project/src/components/restaurant/AdminPanel.tsx', content);
console.log('AdminPanel.tsx written successfully, size:', content.length);