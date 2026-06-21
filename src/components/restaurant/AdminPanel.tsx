'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Settings, Plus, Pencil, Trash2, UtensilsCrossed, CalendarDays,
  ClipboardList, FolderOpen, ShieldAlert, Building2, Footprints, Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// ─── Types ──────────────────────────────────────────────────────────
interface Categoria { id: string; nome: string; icona: string | null; ordine: number; attiva: boolean; _count?: { articoli: number }; }
interface Allergene { id: string; nome: string; icona: string | null; _count?: { articoli: number }; }
interface Articolo { id: string; nome: string; descrizione: string; categoriaId: string; prezzo: number; prezzoPromozionale: number | null; eBestChoice: boolean; attivo: boolean; immagineUrl: string | null; categoria?: { id: string; nome: string }; }
interface Evento { id: string; titolo: string; descrizione: string; descrizioneBreve: string; data: string; oraInizio: string; oraFine: string; prezzo: number; gratuito: boolean; graditaPrenotazione: boolean; capacita: number; postiDisponibili: number; inEvidenza: boolean; attivo: boolean; immagineUrl: string | null; }
interface Prenotazione { id: string; nome: string; cognome: string; data: string; ora: string; persone: number; telefono: string; stato: string; evento?: { id: string; titolo: string } | null; }
interface SiteInfoType { id: string; nomeLocale: string; slogan: string; chiSiamoTitolo: string; chiSiamoTesto: string; telefono: string; email: string; indirizzo: string; orariApertura: string; prenotazioniAttive: boolean; heroTitle: string; heroSubtitle: string; heroCTAText: string; primaryColor: string; }
interface FooterInfoType { id: string; indirizzo: string; telefono: string; email: string; facebookUrl: string | null; instagramUrl: string | null; tiktokUrl: string | null; justeatUrl: string | null; deliverooUrl: string | null; glovoUrl: string | null; ubereatsUrl: string | null; }

interface ArtForm { nome: string; descrizione: string; categoriaId: string; prezzo: number; prezzoPromozionale: string; eBestChoice: boolean; immagineUrl: string; }
interface EvtForm { titolo: string; descrizione: string; descrizioneBreve: string; data: string; oraInizio: string; oraFine: string; prezzo: number; gratuito: boolean; graditaPrenotazione: boolean; capacita: number; postiDisponibili: number; inEvidenza: boolean; immagineUrl: string; }

const emptyArt: ArtForm = { nome: '', descrizione: '', categoriaId: '', prezzo: 0, prezzoPromozionale: '', eBestChoice: false, immagineUrl: '' };
const emptyEvt: EvtForm = { titolo: '', descrizione: '', descrizioneBreve: '', data: '', oraInizio: '', oraFine: '', prezzo: 0, gratuito: false, graditaPrenotazione: false, capacita: 50, postiDisponibili: 50, inEvidenza: false, immagineUrl: '' };

const fp = (v: number | null | undefined) => (v == null || isNaN(v) ? '-' : `\u20AC ${v.toFixed(2)}`);
const fd = (d: string) => (d ? new Date(d).toLocaleDateString('it-IT') : '-');

const api = (base: string, id?: string) => id ? `${base}?id=${id}` : base;
const crud = async (method: string, url: string, body?: unknown) => {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  return res;
};

// ─── Component ──────────────────────────────────────────────────────
export default function AdminPanel() {
  const [open, setOpen] = useState(false);

  // Menu
  const [articoli, setArticoli] = useState<Articolo[]>([]);
  const [cats, setCats] = useState<Categoria[]>([]);
  const [artLoad, setArtLoad] = useState(false);
  const [artDlg, setArtDlg] = useState(false);
  const [editArt, setEditArt] = useState<Articolo | null>(null);
  const [artF, setArtF] = useState<ArtForm>(emptyArt);
  const [artDel, setArtDel] = useState(false);
  const [delArt, setDelArt] = useState<Articolo | null>(null);

  // Categorie
  const [catList, setCatList] = useState<Categoria[]>([]);
  const [catLoad, setCatLoad] = useState(false);
  const [catDlg, setCatDlg] = useState(false);
  const [editCat, setEditCat] = useState<Categoria | null>(null);
  const [catF, setCatF] = useState({ nome: '', icona: '', ordine: 0, attiva: true });
  const [catDel, setCatDel] = useState(false);
  const [delCat, setDelCat] = useState<Categoria | null>(null);

  // Allergeni
  const [allList, setAllList] = useState<Allergene[]>([]);
  const [allLoad, setAllLoad] = useState(false);
  const [allDlg, setAllDlg] = useState(false);
  const [editAll, setEditAll] = useState<Allergene | null>(null);
  const [allF, setAllF] = useState({ nome: '', icona: '' });
  const [allDel, setAllDel] = useState(false);
  const [delAll, setDelAll] = useState<Allergene | null>(null);

  // Eventi
  const [eventi, setEventi] = useState<Evento[]>([]);
  const [evtLoad, setEvtLoad] = useState(false);
  const [evtDlg, setEvtDlg] = useState(false);
  const [editEvt, setEditEvt] = useState<Evento | null>(null);
  const [evtF, setEvtF] = useState<EvtForm>(emptyEvt);
  const [evtDel, setEvtDel] = useState(false);
  const [delEvt, setDelEvt] = useState<Evento | null>(null);

  // Prenotazioni
  const [pren, setPren] = useState<Prenotazione[]>([]);
  const [prenLoad, setPrenLoad] = useState(false);
  const [prenDel, setPrenDel] = useState(false);
  const [delPren, setDelPren] = useState<Prenotazione | null>(null);

  // Site Info
  const [si, setSi] = useState<SiteInfoType | null>(null);
  const [siF, setSiF] = useState<SiteInfoType | null>(null);
  const [siLoad, setSiLoad] = useState(false);

  // Footer Info
  const [fi, setFi] = useState<FooterInfoType | null>(null);
  const [fiF, setFiF] = useState<FooterInfoType | null>(null);
  const [fiLoad, setFiLoad] = useState(false);

  // ── Fetches ────────────────────────────────────────────────────────
  const fCats = useCallback(async () => { try { const r = await fetch('/api/admin/categorie'); if (r.ok) setCats(await r.json()); } catch {} }, []);
  const fArt = useCallback(async () => { setArtLoad(true); try { const r = await fetch('/api/admin/articoli'); if (r.ok) setArticoli(await r.json()); } catch { toast.error('Errore articoli'); } finally { setArtLoad(false); } }, []);
  const fAll = useCallback(async () => { setAllLoad(true); try { const r = await fetch('/api/admin/allergeni'); if (r.ok) setAllList(await r.json()); } catch { toast.error('Errore allergeni'); } finally { setAllLoad(false); } }, []);
  const fEvt = useCallback(async () => { setEvtLoad(true); try { const r = await fetch('/api/admin/eventi'); if (r.ok) setEventi(await r.json()); } catch { toast.error('Errore eventi'); } finally { setEvtLoad(false); } }, []);
  const fPren = useCallback(async () => { setPrenLoad(true); try { const r = await fetch('/api/admin/prenotazioni'); if (r.ok) setPren(await r.json()); } catch { toast.error('Errore prenotazioni'); } finally { setPrenLoad(false); } }, []);
  const fSi = useCallback(async () => { setSiLoad(true); try { const r = await fetch('/api/site-info'); if (r.ok) { const d = await r.json(); setSi(d); setSiF(d); } } catch {} finally { setSiLoad(false); } }, []);
  const fFi = useCallback(async () => { setFiLoad(true); try { const r = await fetch('/api/footer-info'); if (r.ok) { const d = await r.json(); setFi(d); setFiF(d); } } catch {} finally { setFiLoad(false); } }, []);

  // Also fetch categories for the admin list
  const fCatList = useCallback(async () => { setCatLoad(true); try { const r = await fetch('/api/admin/categorie'); if (r.ok) setCatList(await r.json()); } catch {} finally { setCatLoad(false); } }, []);

  useEffect(() => {
    if (open) { fCats(); fArt(); fAll(); fEvt(); fPren(); fSi(); fFi(); fCatList(); }
  }, [open, fCats, fArt, fAll, fEvt, fPren, fSi, fFi, fCatList]);

  const catName = (id: string) => cats.find(c => c.id === id)?.nome || '-';
  const spin = <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  // ── Articolo CRUD ──────────────────────────────────────────────────
  const openArtC = () => { setEditArt(null); setArtF(emptyArt); setArtDlg(true); };
  const openArtE = (a: Articolo) => { setEditArt(a); setArtF({ nome: a.nome, descrizione: a.descrizione || '', categoriaId: a.categoriaId, prezzo: a.prezzo, prezzoPromozionale: a.prezzoPromozionale != null ? String(a.prezzoPromozionale) : '', eBestChoice: a.eBestChoice, immagineUrl: a.immagineUrl || '' }); setArtDlg(true); };
  const saveArt = async () => {
    const p = { ...artF, prezzoPromozionale: artF.prezzoPromozionale ? Number(artF.prezzoPromozionale) : null };
    const r = await crud(editArt ? 'PUT' : 'POST', api('/api/admin/articoli', editArt?.id), editArt ? { id: editArt.id, ...p } : p);
    if (r.ok) { toast.success(editArt ? 'Aggiornato' : 'Creato'); setArtDlg(false); fArt(); } else toast.error('Errore');
  };
  const delArtFn = async () => { if (!delArt) return; const r = await crud('DELETE', api('/api/admin/articoli', delArt.id)); if (r.ok) { toast.success('Eliminato'); setArtDel(false); setDelArt(null); fArt(); } else toast.error('Errore'); };
  const togArt = async (a: Articolo) => { await crud('PUT', api('/api/admin/articoli', a.id), { id: a.id, attivo: !a.attivo }); fArt(); };

  // ── Categoria CRUD ─────────────────────────────────────────────────
  const openCatC = () => { setEditCat(null); setCatF({ nome: '', icona: '', ordine: catList.length, attiva: true }); setCatDlg(true); };
  const openCatE = (c: Categoria) => { setEditCat(c); setCatF({ nome: c.nome, icona: c.icona || '', ordine: c.ordine, attiva: c.attiva }); setCatDlg(true); };
  const saveCat = async () => {
    const r = await crud(editCat ? 'PUT' : 'POST', api('/api/admin/categorie', editCat?.id), editCat ? { id: editCat.id, ...catF } : catF);
    if (r.ok) { toast.success(editCat ? 'Aggiornata' : 'Creata'); setCatDlg(false); fCatList(); fCats(); } else toast.error('Errore');
  };
  const delCatFn = async () => { if (!delCat) return; const r = await crud('DELETE', api('/api/admin/categorie', delCat.id)); if (r.ok) { toast.success('Eliminata'); setCatDel(false); setDelCat(null); fCatList(); fCats(); } else toast.error('Errore'); };
  const togCat = async (c: Categoria) => { await crud('PUT', api('/api/admin/categorie', c.id), { id: c.id, attiva: !c.attiva }); fCatList(); };

  // ── Allergene CRUD ─────────────────────────────────────────────────
  const openAllC = () => { setEditAll(null); setAllF({ nome: '', icona: '' }); setAllDlg(true); };
  const openAllE = (a: Allergene) => { setEditAll(a); setAllF({ nome: a.nome, icona: a.icona || '' }); setAllDlg(true); };
  const saveAll = async () => {
    const r = await crud(editAll ? 'PUT' : 'POST', api('/api/admin/allergeni', editAll?.id), editAll ? { id: editAll.id, ...allF } : allF);
    if (r.ok) { toast.success(editAll ? 'Aggiornato' : 'Creato'); setAllDlg(false); fAll(); } else toast.error('Errore');
  };
  const delAllFn = async () => { if (!delAll) return; const r = await crud('DELETE', api('/api/admin/allergeni', delAll.id)); if (r.ok) { toast.success('Eliminato'); setAllDel(false); setDelAll(null); fAll(); } else toast.error('Errore'); };

  // ── Evento CRUD ────────────────────────────────────────────────────
  const openEvtC = () => { setEditEvt(null); setEvtF(emptyEvt); setEvtDlg(true); };
  const openEvtE = (e: Evento) => { setEditEvt(e); setEvtF({ titolo: e.titolo, descrizione: e.descrizione, descrizioneBreve: e.descrizioneBreve, data: e.data ? e.data.split('T')[0] : '', oraInizio: e.oraInizio, oraFine: e.oraFine, prezzo: e.prezzo, gratuito: e.gratuito, graditaPrenotazione: e.graditaPrenotazione, capacita: e.capacita, postiDisponibili: e.postiDisponibili, inEvidenza: e.inEvidenza, immagineUrl: e.immagineUrl || '' }); setEvtDlg(true); };
  const saveEvt = async () => {
    const r = await crud(editEvt ? 'PUT' : 'POST', api('/api/admin/eventi', editEvt?.id), editEvt ? { id: editEvt.id, ...evtF } : evtF);
    if (r.ok) { toast.success(editEvt ? 'Aggiornato' : 'Creato'); setEvtDlg(false); fEvt(); } else toast.error('Errore');
  };
  const delEvtFn = async () => { if (!delEvt) return; const r = await crud('DELETE', api('/api/admin/eventi', delEvt.id)); if (r.ok) { toast.success('Eliminato'); setEvtDel(false); setDelEvt(null); fEvt(); } else toast.error('Errore'); };
  const togEvt = async (e: Evento) => { await crud('PUT', api('/api/admin/eventi', e.id), { id: e.id, attivo: !e.attivo }); fEvt(); };

  // ── Prenotazione ───────────────────────────────────────────────────
  const chgPren = async (p: Prenotazione, s: string) => { const r = await crud('PUT', api('/api/admin/prenotazioni', p.id), { id: p.id, stato: s }); if (r.ok) { toast.success('Stato aggiornato'); fPren(); } else toast.error('Errore'); };
  const delPrenFn = async () => { if (!delPren) return; const r = await crud('DELETE', api('/api/admin/prenotazioni', delPren.id)); if (r.ok) { toast.success('Eliminata'); setPrenDel(false); setDelPren(null); fPren(); } else toast.error('Errore'); };

  // ── Site Info ──────────────────────────────────────────────────────
  const saveSi = async () => { if (!siF) return; setSiLoad(true); const r = await crud('PUT', '/api/site-info', siF); if (r.ok) { toast.success('Info sito salvate'); setSi(await r.json()); } else toast.error('Errore'); setSiLoad(false); };

  // ── Footer Info ────────────────────────────────────────────────────
  const saveFi = async () => { if (!fiF) return; setFiLoad(true); const r = await crud('PUT', '/api/footer-info', fiF); if (r.ok) { toast.success('Footer salvato'); setFi(await r.json()); } else toast.error('Errore'); setFiLoad(false); };

  const statoB = (s: string) => s === 'confirmed' ? <Badge className="bg-emerald-600 text-white">Confermato</Badge> : s === 'cancelled' ? <Badge variant="destructive">Annullato</Badge> : <Badge variant="secondary">In attesa</Badge>;

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <>
      <Button onClick={() => setOpen(true)} size="icon" className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-red-700 hover:bg-red-800" aria-label="Admin"><Settings className="h-6 w-6" /></Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-[820px] overflow-y-auto p-0">
          <SheetHeader className="p-6 pb-2"><SheetTitle className="text-2xl font-bold">Pannello Admin</SheetTitle></SheetHeader>

          <Tabs defaultValue="menu" className="w-full px-6 pb-6">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-gray-100 p-1">
              <TabsTrigger value="menu" className="flex-1 gap-1.5 text-xs sm:text-sm min-w-0"><UtensilsCrossed className="h-3.5 w-3.5" /><span className="hidden sm:inline">Menu</span></TabsTrigger>
              <TabsTrigger value="categorie" className="flex-1 gap-1.5 text-xs sm:text-sm min-w-0"><FolderOpen className="h-3.5 w-3.5" /><span className="hidden sm:inline">Categorie</span></TabsTrigger>
              <TabsTrigger value="allergeni" className="flex-1 gap-1.5 text-xs sm:text-sm min-w-0"><ShieldAlert className="h-3.5 w-3.5" /><span className="hidden sm:inline">Allergeni</span></TabsTrigger>
              <TabsTrigger value="eventi" className="flex-1 gap-1.5 text-xs sm:text-sm min-w-0"><CalendarDays className="h-3.5 w-3.5" /><span className="hidden sm:inline">Eventi</span></TabsTrigger>
              <TabsTrigger value="prenotazioni" className="flex-1 gap-1.5 text-xs sm:text-sm min-w-0"><ClipboardList className="h-3.5 w-3.5" /><span className="hidden sm:inline">Prenotazioni</span></TabsTrigger>
              <TabsTrigger value="sito" className="flex-1 gap-1.5 text-xs sm:text-sm min-w-0"><Building2 className="h-3.5 w-3.5" /><span className="hidden sm:inline">Info Sito</span></TabsTrigger>
              <TabsTrigger value="footer" className="flex-1 gap-1.5 text-xs sm:text-sm min-w-0"><Footprints className="h-3.5 w-3.5" /><span className="hidden sm:inline">Footer</span></TabsTrigger>
            </TabsList>

            {/* ═══ MENU ═══════════════════════════════════════════════════════ */}
            <TabsContent value="menu" className="mt-4 space-y-4">
              <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Gestione Menu</h3><Button onClick={openArtC} size="sm" className="gap-1"><Plus className="h-4 w-4" /> Aggiungi</Button></div>
              {artLoad ? spin : !articoli.length ? <p className="text-center py-12 text-muted-foreground">Nessun articolo</p> : (
                <div className="rounded-md border overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Categoria</TableHead><TableHead>Prezzo</TableHead><TableHead>Promo</TableHead><TableHead>Best</TableHead><TableHead>Attivo</TableHead><TableHead className="text-right">Azioni</TableHead></TableRow></TableHeader><TableBody>
                  {articoli.map(a => (<TableRow key={a.id}><TableCell className="font-medium">{a.nome}</TableCell><TableCell>{catName(a.categoriaId)}</TableCell><TableCell>{fp(a.prezzo)}</TableCell><TableCell>{a.prezzoPromozionale != null ? fp(a.prezzoPromozionale) : '-'}</TableCell><TableCell>{a.eBestChoice && <Badge className="bg-amber-500 text-white text-xs">Best</Badge>}</TableCell><TableCell><Switch checked={a.attivo} onCheckedChange={() => togArt(a)} /></TableCell><TableCell className="text-right"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openArtE(a)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDelArt(a); setArtDel(true); }}><Trash2 className="h-4 w-4" /></Button></div></TableCell></TableRow>))}
                </TableBody></Table></div>
              )}
            </TabsContent>

            {/* ═══ CATEGORIE ════════════════════════════════════════════════════ */}
            <TabsContent value="categorie" className="mt-4 space-y-4">
              <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Gestione Categorie</h3><Button onClick={openCatC} size="sm" className="gap-1"><Plus className="h-4 w-4" /> Aggiungi</Button></div>
              {catLoad ? spin : !catList.length ? <p className="text-center py-12 text-muted-foreground">Nessuna categoria</p> : (
                <div className="rounded-md border"><Table><TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Icona</TableHead><TableHead>Ordine</TableHead><TableHead>Piatti</TableHead><TableHead>Attiva</TableHead><TableHead className="text-right">Azioni</TableHead></TableRow></TableHeader><TableBody>
                  {catList.map(c => (<TableRow key={c.id}><TableCell className="font-medium">{c.nome}</TableCell><TableCell>{c.icona || '-'}</TableCell><TableCell>{c.ordine}</TableCell><TableCell>{c._count?.articoli ?? 0}</TableCell><TableCell><Switch checked={c.attiva} onCheckedChange={() => togCat(c)} /></TableCell><TableCell className="text-right"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openCatE(c)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDelCat(c); setCatDel(true); }}><Trash2 className="h-4 w-4" /></Button></div></TableCell></TableRow>))}
                </TableBody></Table></div>
              )}
            </TabsContent>

            {/* ═══ ALLERGENI ════════════════════════════════════════════════════ */}
            <TabsContent value="allergeni" className="mt-4 space-y-4">
              <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Gestione Allergeni</h3><Button onClick={openAllC} size="sm" className="gap-1"><Plus className="h-4 w-4" /> Aggiungi</Button></div>
              {allLoad ? spin : !allList.length ? <p className="text-center py-12 text-muted-foreground">Nessun allergene</p> : (
                <div className="rounded-md border"><Table><TableHeader><TableRow><TableHead>Icona</TableHead><TableHead>Nome</TableHead><TableHead>Piatti</TableHead><TableHead className="text-right">Azioni</TableHead></TableRow></TableHeader><TableBody>
                  {allList.map(a => (<TableRow key={a.id}><TableCell className="text-xl">{a.icona || '-'}</TableCell><TableCell className="font-medium">{a.nome}</TableCell><TableCell>{a._count?.articoli ?? 0}</TableCell><TableCell className="text-right"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openAllE(a)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDelAll(a); setAllDel(true); }}><Trash2 className="h-4 w-4" /></Button></div></TableCell></TableRow>))}
                </TableBody></Table></div>
              )}
            </TabsContent>

            {/* ═══ EVENTI ═══════════════════════════════════════════════════════ */}
            <TabsContent value="eventi" className="mt-4 space-y-4">
              <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Gestione Eventi</h3><Button onClick={openEvtC} size="sm" className="gap-1"><Plus className="h-4 w-4" /> Aggiungi</Button></div>
              {evtLoad ? spin : !eventi.length ? <p className="text-center py-12 text-muted-foreground">Nessun evento</p> : (
                <div className="rounded-md border overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Titolo</TableHead><TableHead>Data</TableHead><TableHead>Orario</TableHead><TableHead>Prezzo</TableHead><TableHead>Posti</TableHead><TableHead>Evid.</TableHead><TableHead>Attivo</TableHead><TableHead className="text-right">Azioni</TableHead></TableRow></TableHeader><TableBody>
                  {eventi.map(e => (<TableRow key={e.id}><TableCell className="font-medium">{e.titolo}</TableCell><TableCell>{fd(e.data)}</TableCell><TableCell>{e.oraInizio}{e.oraFine ? ` - ${e.oraFine}` : ''}</TableCell><TableCell>{e.gratuito ? <Badge className="bg-emerald-600 text-white text-xs">Gratis</Badge> : fp(e.prezzo)}</TableCell><TableCell>{e.postiDisponibili}/{e.capacita}</TableCell><TableCell>{e.inEvidenza && <Badge className="bg-purple-600 text-white text-xs">Evid.</Badge>}</TableCell><TableCell><Switch checked={e.attivo} onCheckedChange={() => togEvt(e)} /></TableCell><TableCell className="text-right"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEvtE(e)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDelEvt(e); setEvtDel(true); }}><Trash2 className="h-4 w-4" /></Button></div></TableCell></TableRow>))}
                </TableBody></Table></div>
              )}
            </TabsContent>

            {/* ═══ PRENOTAZIONI ═════════════════════════════════════════════════ */}
            <TabsContent value="prenotazioni" className="mt-4 space-y-4">
              <h3 className="text-lg font-semibold">Prenotazioni</h3>
              {prenLoad ? spin : !pren.length ? <p className="text-center py-12 text-muted-foreground">Nessuna prenotazione</p> : (
                <div className="rounded-md border overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Cognome</TableHead><TableHead>Data</TableHead><TableHead>Ora</TableHead><TableHead>Pers.</TableHead><TableHead>Tel</TableHead><TableHead>Stato</TableHead><TableHead>Evento</TableHead><TableHead className="text-right">Azioni</TableHead></TableRow></TableHeader><TableBody>
                  {pren.map(p => (<TableRow key={p.id}><TableCell className="font-medium">{p.nome}</TableCell><TableCell>{p.cognome}</TableCell><TableCell>{fd(p.data)}</TableCell><TableCell>{p.ora}</TableCell><TableCell>{p.persone}</TableCell><TableCell>{p.telefono || '-'}</TableCell><TableCell><Select value={p.stato} onValueChange={v => chgPren(p, v)}><SelectTrigger className="w-[130px] h-8"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">In attesa</SelectItem><SelectItem value="confirmed">Confermato</SelectItem><SelectItem value="cancelled">Annullato</SelectItem></SelectContent></Select></TableCell><TableCell>{p.evento?.titolo || '-'}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDelPren(p); setPrenDel(true); }}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}
                </TableBody></Table></div>
              )}
            </TabsContent>

            {/* ═══ INFO SITO ════════════════════════════════════════════════════ */}
            <TabsContent value="sito" className="mt-4 space-y-4">
              <h3 className="text-lg font-semibold">Informazioni Sito</h3>
              {siLoad && !siF ? spin : siF && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Modifica le informazioni generali, l&apos;hero e la sezione Chi Siamo.</p>
                  <div className="grid gap-4">
                    <div className="grid gap-2"><Label>Nome Locale</Label><Input value={siF.nomeLocale} onChange={e => setSiF({ ...siF!, nomeLocale: e.target.value })} /></div>
                    <div className="grid gap-2"><Label>Slogan</Label><Input value={siF.slogan} onChange={e => setSiF({ ...siF!, slogan: e.target.value })} /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2"><Label>Telefono</Label><Input value={siF.telefono} onChange={e => setSiF({ ...siF!, telefono: e.target.value })} /></div>
                      <div className="grid gap-2"><Label>Email</Label><Input value={siF.email} onChange={e => setSiF({ ...siF!, email: e.target.value })} /></div>
                    </div>
                    <div className="grid gap-2"><Label>Indirizzo</Label><Input value={siF.indirizzo} onChange={e => setSiF({ ...siF!, indirizzo: e.target.value })} /></div>
                    <div className="grid gap-2"><Label>Orari di Apertura</Label><Input value={siF.orariApertura} onChange={e => setSiF({ ...siF!, orariApertura: e.target.value })} /></div>
                    <div className="flex items-center gap-2"><Switch checked={siF.prenotazioniAttive} onCheckedChange={v => setSiF({ ...siF!, prenotazioniAttive: v })} /><Label>Prenotazioni attive</Label></div>
                    <div className="border-t pt-4"><p className="text-sm font-medium text-muted-foreground mb-3">Impostazioni Hero</p></div>
                    <div className="grid gap-2"><Label>Titolo Hero</Label><Input value={siF.heroTitle} onChange={e => setSiF({ ...siF!, heroTitle: e.target.value })} /></div>
                    <div className="grid gap-2"><Label>Sottotitolo Hero</Label><Input value={siF.heroSubtitle} onChange={e => setSiF({ ...siF!, heroSubtitle: e.target.value })} /></div>
                    <div className="grid gap-2"><Label>Testo Pulsante CTA</Label><Input value={siF.heroCTAText} onChange={e => setSiF({ ...siF!, heroCTAText: e.target.value })} /></div>
                    <div className="border-t pt-4"><p className="text-sm font-medium text-muted-foreground mb-3">Sezione Chi Siamo</p></div>
                    <div className="grid gap-2"><Label>Titolo &quot;Chi Siamo&quot;</Label><Input value={siF.chiSiamoTitolo} onChange={e => setSiF({ ...siF!, chiSiamoTitolo: e.target.value })} /></div>
                    <div className="grid gap-2"><Label>Testo &quot;Chi Siamo&quot;</Label><Textarea value={siF.chiSiamoTesto} onChange={e => setSiF({ ...siF!, chiSiamoTesto: e.target.value })} rows={4} /></div>
                    <div className="border-t pt-4"><p className="text-sm font-medium text-muted-foreground mb-3">Aspetto</p></div>
                    <div className="grid gap-2">
                      <Label>Colore Primario</Label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={siF.primaryColor} onChange={e => setSiF({ ...siF!, primaryColor: e.target.value })} className="h-10 w-14 rounded cursor-pointer border" />
                        <Input value={siF.primaryColor} onChange={e => setSiF({ ...siF!, primaryColor: e.target.value })} className="flex-1" />
                      </div>
                    </div>
                    <Button onClick={saveSi} disabled={siLoad} className="gap-2"><Save className="h-4 w-4" />{siLoad ? 'Salvataggio...' : 'Salva Informazioni Sito'}</Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ═══ FOOTER ══════════════════════════════════════════════════════ */}
            <TabsContent value="footer" className="mt-4 space-y-4">
              <h3 className="text-lg font-semibold">Impostazioni Footer</h3>
              {fiLoad && !fiF ? spin : fiF && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Contatti, social e piattaforme di delivery.</p>
                  <div className="grid gap-4">
                    <div className="grid gap-2"><Label>Indirizzo</Label><Input value={fiF.indirizzo} onChange={e => setFiF({ ...fiF!, indirizzo: e.target.value })} /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2"><Label>Telefono</Label><Input value={fiF.telefono} onChange={e => setFiF({ ...fiF!, telefono: e.target.value })} /></div>
                      <div className="grid gap-2"><Label>Email</Label><Input value={fiF.email} onChange={e => setFiF({ ...fiF!, email: e.target.value })} /></div>
                    </div>
                    <div className="border-t pt-4"><p className="text-sm font-medium text-muted-foreground mb-3">Social Media</p></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2"><Label>Facebook</Label><Input value={fiF.facebookUrl || ''} onChange={e => setFiF({ ...fiF!, facebookUrl: e.target.value || null })} placeholder="https://facebook.com/..." /></div>
                      <div className="grid gap-2"><Label>Instagram</Label><Input value={fiF.instagramUrl || ''} onChange={e => setFiF({ ...fiF!, instagramUrl: e.target.value || null })} placeholder="https://instagram.com/..." /></div>
                    </div>
                    <div className="grid gap-2"><Label>TikTok</Label><Input value={fiF.tiktokUrl || ''} onChange={e => setFiF({ ...fiF!, tiktokUrl: e.target.value || null })} placeholder="https://tiktok.com/..." /></div>
                    <div className="border-t pt-4"><p className="text-sm font-medium text-muted-foreground mb-3">Piattaforme Delivery</p></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2"><Label>Just Eat</Label><Input value={fiF.justeatUrl || ''} onChange={e => setFiF({ ...fiF!, justeatUrl: e.target.value || null })} placeholder="https://www.justeat.it/..." /></div>
                      <div className="grid gap-2"><Label>Deliveroo</Label><Input value={fiF.deliverooUrl || ''} onChange={e => setFiF({ ...fiF!, deliverooUrl: e.target.value || null })} placeholder="https://deliveroo.it/..." /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2"><Label>Glovo</Label><Input value={fiF.glovoUrl || ''} onChange={e => setFiF({ ...fiF!, glovoUrl: e.target.value || null })} placeholder="https://glovoapp.com/..." /></div>
                      <div className="grid gap-2"><Label>Uber Eats</Label><Input value={fiF.ubereatsUrl || ''} onChange={e => setFiF({ ...fiF!, ubereatsUrl: e.target.value || null })} placeholder="https://ubereats.com/..." /></div>
                    </div>
                    <Button onClick={saveFi} disabled={fiLoad} className="gap-2"><Save className="h-4 w-4" />{fiLoad ? 'Salvataggio...' : 'Salva Footer'}</Button>
                  </div>
                </div>
              )}
            </TabsContent>

          </Tabs>
        </SheetContent>
      </Sheet>

      {/* ═══ DIALOGS ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */}
      {/* Articolo */}
      <Dialog open={artDlg} onOpenChange={setArtDlg}><DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editArt ? 'Modifica Articolo' : 'Nuovo Articolo'}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2"><Label>Nome</Label><Input value={artF.nome} onChange={e => setArtF({ ...artF, nome: e.target.value })} /></div>
          <div className="grid gap-2"><Label>Descrizione</Label><Textarea value={artF.descrizione} onChange={e => setArtF({ ...artF, descrizione: e.target.value })} rows={3} /></div>
          <div className="grid gap-2"><Label>Categoria</Label><Select value={artF.categoriaId} onValueChange={v => setArtF({ ...artF, categoriaId: v })}><SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger><SelectContent>{cats.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2"><Label>Prezzo (&euro;)</Label><Input type="number" step="0.01" min="0" value={artF.prezzo} onChange={e => setArtF({ ...artF, prezzo: Number(e.target.value) })} /></div>
            <div className="grid gap-2"><Label>Promo (&euro;)</Label><Input type="number" step="0.01" min="0" placeholder="Opzionale" value={artF.prezzoPromozionale} onChange={e => setArtF({ ...artF, prezzoPromozionale: e.target.value })} /></div>
          </div>
          <div className="flex items-center gap-2"><Checkbox checked={artF.eBestChoice} onCheckedChange={v => setArtF({ ...artF, eBestChoice: v === true })} /><Label className="cursor-pointer">Best Choice</Label></div>
          <div className="grid gap-2"><Label>URL Immagine</Label><Input value={artF.immagineUrl} onChange={e => setArtF({ ...artF, immagineUrl: e.target.value })} placeholder="https://..." /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setArtDlg(false)}>Annulla</Button><Button onClick={saveArt}>{editArt ? 'Salva' : 'Crea'}</Button></DialogFooter>
      </DialogContent></Dialog>

      {/* Categoria */}
      <Dialog open={catDlg} onOpenChange={setCatDlg}><DialogContent className="sm:max-w-[450px]">
        <DialogHeader><DialogTitle>{editCat ? 'Modifica Categoria' : 'Nuova Categoria'}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2"><Label>Nome</Label><Input value={catF.nome} onChange={e => setCatF({ ...catF, nome: e.target.value })} /></div>
          <div className="grid gap-2"><Label>Icona (emoji o testo)</Label><Input value={catF.icona} onChange={e => setCatF({ ...catF, icona: e.target.value })} placeholder="🍝" /></div>
          <div className="grid gap-2"><Label>Ordine</Label><Input type="number" min="0" value={catF.ordine} onChange={e => setCatF({ ...catF, ordine: Number(e.target.value) })} /></div>
          <div className="flex items-center gap-2"><Switch checked={catF.attiva} onCheckedChange={v => setCatF({ ...catF, attiva: v })} /><Label>Attiva</Label></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setCatDlg(false)}>Annulla</Button><Button onClick={saveCat}>{editCat ? 'Salva' : 'Crea'}</Button></DialogFooter>
      </DialogContent></Dialog>

      {/* Allergene */}
      <Dialog open={allDlg} onOpenChange={setAllDlg}><DialogContent className="sm:max-w-[400px]">
        <DialogHeader><DialogTitle>{editAll ? 'Modifica Allergene' : 'Nuovo Allergene'}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2"><Label>Nome</Label><Input value={allF.nome} onChange={e => setAllF({ ...allF, nome: e.target.value })} /></div>
          <div className="grid gap-2"><Label>Icona (emoji)</Label><Input value={allF.icona} onChange={e => setAllF({ ...allF, icona: e.target.value })} placeholder="🌾" /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setAllDlg(false)}>Annulla</Button><Button onClick={saveAll}>{editAll ? 'Salva' : 'Crea'}</Button></DialogFooter>
      </DialogContent></Dialog>

      {/* Evento */}
      <Dialog open={evtDlg} onOpenChange={setEvtDlg}><DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editEvt ? 'Modifica Evento' : 'Nuovo Evento'}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2"><Label>Titolo</Label><Input value={evtF.titolo} onChange={e => setEvtF({ ...evtF, titolo: e.target.value })} /></div>
          <div className="grid gap-2"><Label>Descrizione Breve</Label><Input value={evtF.descrizioneBreve} onChange={e => setEvtF({ ...evtF, descrizioneBreve: e.target.value })} /></div>
          <div className="grid gap-2"><Label>Descrizione</Label><Textarea value={evtF.descrizione} onChange={e => setEvtF({ ...evtF, descrizione: e.target.value })} rows={3} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2"><Label>Data</Label><Input type="date" value={evtF.data} onChange={e => setEvtF({ ...evtF, data: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Prezzo (&euro;)</Label><Input type="number" step="0.01" min="0" value={evtF.prezzo} onChange={e => setEvtF({ ...evtF, prezzo: Number(e.target.value) })} disabled={evtF.gratuito} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2"><Label>Ora Inizio</Label><Input type="time" value={evtF.oraInizio} onChange={e => setEvtF({ ...evtF, oraInizio: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Ora Fine</Label><Input type="time" value={evtF.oraFine} onChange={e => setEvtF({ ...evtF, oraFine: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2"><Label>Capacit\u00E0</Label><Input type="number" min="1" value={evtF.capacita} onChange={e => setEvtF({ ...evtF, capacita: Number(e.target.value) })} /></div>
            <div className="grid gap-2"><Label>Posti Disponibili</Label><Input type="number" min="0" value={evtF.postiDisponibili} onChange={e => setEvtF({ ...evtF, postiDisponibili: Number(e.target.value) })} /></div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2"><Checkbox checked={evtF.gratuito} onCheckedChange={v => setEvtF({ ...evtF, gratuito: v === true })} /><Label className="cursor-pointer">Gratuito</Label></div>
            <div className="flex items-center gap-2"><Checkbox checked={evtF.graditaPrenotazione} onCheckedChange={v => setEvtF({ ...evtF, graditaPrenotazione: v === true })} /><Label className="cursor-pointer">Gradita Prenotazione</Label></div>
            <div className="flex items-center gap-2"><Checkbox checked={evtF.inEvidenza} onCheckedChange={v => setEvtF({ ...evtF, inEvidenza: v === true })} /><Label className="cursor-pointer">In Evidenza</Label></div>
          </div>
          <div className="grid gap-2"><Label>URL Immagine</Label><Input value={evtF.immagineUrl} onChange={e => setEvtF({ ...evtF, immagineUrl: e.target.value })} placeholder="https://..." /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setEvtDlg(false)}>Annulla</Button><Button onClick={saveEvt}>{editEvt ? 'Salva' : 'Crea'}</Button></DialogFooter>
      </DialogContent></Dialog>

      {/* ═══ DELETE ALERTS ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */}
      <AlertDialog open={artDel} onOpenChange={setArtDel}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Elimina Articolo</AlertDialogTitle><AlertDialogDescription>Eliminare &quot;{delArt?.nome}&quot;?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annulla</AlertDialogCancel><AlertDialogAction onClick={delArtFn} className="bg-destructive text-white hover:bg-destructive/90">Elimina</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <AlertDialog open={catDel} onOpenChange={setCatDel}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Elimina Categoria</AlertDialogTitle><AlertDialogDescription>Eliminare &quot;{delCat?.nome}&quot;? Gli articoli collegati saranno eliminati a cascata.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annulla</AlertDialogCancel><AlertDialogAction onClick={delCatFn} className="bg-destructive text-white hover:bg-destructive/90">Elimina</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <AlertDialog open={allDel} onOpenChange={setAllDel}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Elimina Allergene</AlertDialogTitle><AlertDialogDescription>Eliminare &quot;{delAll?.nome}&quot;? Sar\u00E0 rimosso da tutti i piatti collegati.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annulla</AlertDialogCancel><AlertDialogAction onClick={delAllFn} className="bg-destructive text-white hover:bg-destructive/90">Elimina</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <AlertDialog open={evtDel} onOpenChange={setEvtDel}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Elimina Evento</AlertDialogTitle><AlertDialogDescription>Eliminare &quot;{delEvt?.titolo}&quot;?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annulla</AlertDialogCancel><AlertDialogAction onClick={delEvtFn} className="bg-destructive text-white hover:bg-destructive/90">Elimina</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      <AlertDialog open={prenDel} onOpenChange={setPrenDel}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Elimina Prenotazione</AlertDialogTitle><AlertDialogDescription>Eliminare la prenotazione di &quot;{delPren?.nome} {delPren?.cognome}&quot;?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Annulla</AlertDialogCancel><AlertDialogAction onClick={delPrenFn} className="bg-destructive text-white hover:bg-destructive/90">Elimina</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </>
  );
}