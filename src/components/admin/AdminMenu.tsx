'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash2, Upload, ImageIcon } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────
interface Categoria {
  id: string; nome: string; icona: string | null; ordine: number; attiva: boolean; _count?: { articoli: number };
}
interface Allergene {
  id: string; nome: string; icona: string | null; _count?: { articoli: number };
}
interface Articolo {
  id: string; nome: string; descrizione: string | null; categoriaId: string; prezzo: number;
  prezzoPromozionale: number | null; eBestChoice: boolean; eSurgelato: boolean; attivo: boolean; immagineUrl: string | null;
  categoria: Categoria; allergeni: { allergene: Allergene }[];
}

export default function AdminMenu() {
  // ─── State ─────────────────────────────────────────────────────────
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [allergeni, setAllergeni] = useState<Allergene[]>([]);
  const [articoli, setArticoli] = useState<Articolo[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialogs
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Categoria | null>(null);
  const [catForm, setCatForm] = useState({ nome: '', icona: '', ordine: 0, attiva: true });

  const [artDialogOpen, setArtDialogOpen] = useState(false);
  const [editingArt, setEditingArt] = useState<Articolo | null>(null);
  const [artForm, setArtForm] = useState({
    nome: '', descrizione: '', categoriaId: '', prezzo: '', prezzoPromozionale: '',
    eBestChoice: false, eSurgelato: false, attivo: true, immagineUrl: '', selectedAllergeni: [] as string[],
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const artFileInputRef = useRef<HTMLInputElement>(null);

  const [allDialogOpen, setAllDialogOpen] = useState(false);
  const [editingAll, setEditingAll] = useState<Allergene | null>(null);
  const [allForm, setAllForm] = useState({ nome: '', icona: '' });

  // ─── Fetch ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, artRes, allRes] = await Promise.all([
        fetch('/api/admin/categorie'),
        fetch('/api/admin/articoli'),
        fetch('/api/admin/allergeni'),
      ]);
      setCategorie(await catRes.json());
      setArticoli(await artRes.json());
      setAllergeni(await allRes.json());
    } catch {
      toast.error('Errore nel caricamento dati');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Image Upload ─────────────────────────────────────────────────
  const handleImageUpload = async (file: File, target: 'articolo' | 'evento') => {
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return null; }
      return data.url as string;
    } catch {
      toast.error('Errore nel caricamento');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // ─── Categorie CRUD ────────────────────────────────────────────────
  const openCatDialog = (cat?: Categoria) => {
    if (cat) {
      setEditingCat(cat);
      setCatForm({ nome: cat.nome, icona: cat.icona || '', ordine: cat.ordine, attiva: cat.attiva });
    } else {
      setEditingCat(null);
      setCatForm({ nome: '', icona: '', ordine: 0, attiva: true });
    }
    setCatDialogOpen(true);
  };

  const saveCat = async () => {
    if (!catForm.nome.trim()) { toast.error('Nome obbligatorio'); return; }
    try {
      const res = await fetch(editingCat ? '/api/admin/categorie' : '/api/admin/categorie', {
        method: editingCat ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCat ? { id: editingCat.id, ...catForm } : catForm),
      });
      if (!res.ok) { toast.error('Errore'); return; }
      toast.success(editingCat ? 'Categoria aggiornata' : 'Categoria creata');
      setCatDialogOpen(false);
      fetchData();
    } catch { toast.error('Errore'); }
  };

  const deleteCat = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/categorie?id=${id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Errore'); return; }
      toast.success('Categoria eliminata');
      fetchData();
    } catch { toast.error('Errore'); }
  };

  // ─── Articoli CRUD ────────────────────────────────────────────────
  const openArtDialog = (art?: Articolo) => {
    if (art) {
      setEditingArt(art);
      setArtForm({
        nome: art.nome, descrizione: art.descrizione || '', categoriaId: art.categoriaId,
        prezzo: String(art.prezzo), prezzoPromozionale: art.prezzoPromozionale ? String(art.prezzoPromozionale) : '',
        eBestChoice: art.eBestChoice, eSurgelato: art.eSurgelato, attivo: art.attivo, immagineUrl: art.immagineUrl || '',
        selectedAllergeni: art.allergeni.map(a => a.allergene.id),
      });
    } else {
      setEditingArt(null);
      setArtForm({
        nome: '', descrizione: '', categoriaId: categorie[0]?.id || '',
        prezzo: '', prezzoPromozionale: '', eBestChoice: false, eSurgelato: false, attivo: true, immagineUrl: '',
        selectedAllergeni: [],
      });
    }
    setArtDialogOpen(true);
  };

  const saveArt = async () => {
    if (!artForm.nome.trim() || !artForm.categoriaId || !artForm.prezzo) {
      toast.error('Compila nome, categoria e prezzo');
      return;
    }
    try {
      const body = {
        ...(editingArt ? { id: editingArt.id } : {}),
        nome: artForm.nome,
        descrizione: artForm.descrizione,
        categoriaId: artForm.categoriaId,
        prezzo: artForm.prezzo,
        prezzoPromozionale: artForm.prezzoPromozionale || null,
        eBestChoice: artForm.eBestChoice,
        eSurgelato: artForm.eSurgelato,
        attivo: artForm.attivo,
        immagineUrl: artForm.immagineUrl || null,
        allergeneIds: artForm.selectedAllergeni,
      };
      const res = await fetch(editingArt ? '/api/admin/articoli' : '/api/admin/articoli', {
        method: editingArt ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) { toast.error('Errore'); return; }
      toast.success(editingArt ? 'Articolo aggiornato' : 'Articolo creato');
      setArtDialogOpen(false);
      fetchData();
    } catch { toast.error('Errore'); }
  };

  const deleteArt = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/articoli?id=${id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Errore'); return; }
      toast.success('Articolo eliminato');
      fetchData();
    } catch { toast.error('Errore'); }
  };

  // ─── Allergeni CRUD ───────────────────────────────────────────────
  const openAllDialog = (all?: Allergene) => {
    if (all) {
      setEditingAll(all);
      setAllForm({ nome: all.nome, icona: all.icona || '' });
    } else {
      setEditingAll(null);
      setAllForm({ nome: '', icona: '' });
    }
    setAllDialogOpen(true);
  };

  const saveAll = async () => {
    if (!allForm.nome.trim()) { toast.error('Nome obbligatorio'); return; }
    try {
      const res = await fetch(editingAll ? '/api/admin/allergeni' : '/api/admin/allergeni', {
        method: editingAll ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAll ? { id: editingAll.id, ...allForm } : allForm),
      });
      if (!res.ok) { toast.error('Errore'); return; }
      toast.success(editingAll ? 'Allergene aggiornato' : 'Allergene creato');
      setAllDialogOpen(false);
      fetchData();
    } catch { toast.error('Errore'); }
  };

  const deleteAll = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/allergeni?id=${id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Errore'); return; }
      toast.success('Allergene eliminato');
      fetchData();
    } catch { toast.error('Errore'); }
  };

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">🍽️ Gestione Menu</h2>
      <Tabs defaultValue="categorie">
        <TabsList className="mb-6">
          <TabsTrigger value="categorie">Categorie</TabsTrigger>
          <TabsTrigger value="articoli">Articoli</TabsTrigger>
          <TabsTrigger value="allergeni">Allergeni</TabsTrigger>
        </TabsList>

        {/* ── Categorie ── */}
        <TabsContent value="categorie">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Categorie ({categorie.length})</h3>
            <Button onClick={() => openCatDialog()}><Plus className="mr-2 h-4 w-4" />Nuova</Button>
          </div>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Icona</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Ordine</TableHead>
                  <TableHead>Articoli</TableHead>
                  <TableHead>Attiva</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorie.map(cat => (
                  <TableRow key={cat.id}>
                    <TableCell className="text-2xl">{cat.icona || '🍽️'}</TableCell>
                    <TableCell className="font-medium">{cat.nome}</TableCell>
                    <TableCell>{cat.ordine}</TableCell>
                    <TableCell><Badge variant="secondary">{cat._count?.articoli || 0}</Badge></TableCell>
                    <TableCell>
                      <Switch
                        checked={cat.attiva}
                        onCheckedChange={async (v) => {
                          setCategorie(prev => prev.map(c => c.id === cat.id ? { ...c, attiva: v } : c));
                          try {
                            const res = await fetch('/api/admin/categorie', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: cat.id, attiva: v }),
                            });
                            if (!res.ok) {
                              setCategorie(prev => prev.map(c => c.id === cat.id ? { ...c, attiva: !v } : c));
                              toast.error('Errore nell\'aggiornamento');
                            }
                          } catch {
                            setCategorie(prev => prev.map(c => c.id === cat.id ? { ...c, attiva: !v } : c));
                            toast.error('Errore nell\'aggiornamento');
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openCatDialog(cat)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteCat(cat.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── Articoli ── */}
        <TabsContent value="articoli">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Articoli ({articoli.length})</h3>
            <Button onClick={() => openArtDialog()}><Plus className="mr-2 h-4 w-4" />Nuovo</Button>
          </div>
          <div className="rounded-lg border overflow-hidden max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Immagine</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Prezzo</TableHead>
                  <TableHead>Attivo</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articoli.map(art => (
                  <TableRow key={art.id}>
                    <TableCell>
                      {art.immagineUrl ? (
                        <img src={art.immagineUrl} alt={art.nome} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{art.nome}</div>
                      <div className="flex gap-1 mt-1">
                        {art.eBestChoice && <Badge className="text-xs" variant="default" style={{ background: '#f59e0b', color: '#fff' }}>★ Best</Badge>}
                        {art.eSurgelato && <Badge className="text-xs" variant="outline" style={{ borderColor: '#93c5fd', color: '#2563eb' }}>❄️ Surgelato</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>{art.categoria.nome}</TableCell>
                    <TableCell>
                      €{art.prezzo.toFixed(2)}
                      {art.prezzoPromozionale && (
                        <span className="ml-2 text-green-600 line-through">€{art.prezzoPromozionale.toFixed(2)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={art.attivo}
                        onCheckedChange={async (v) => {
                          setArticoli(prev => prev.map(a => a.id === art.id ? { ...a, attivo: v } : a));
                          try {
                            const res = await fetch('/api/admin/articoli', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: art.id, attivo: v }),
                            });
                            if (!res.ok) {
                              setArticoli(prev => prev.map(a => a.id === art.id ? { ...a, attivo: !v } : a));
                              toast.error("Errore nell'aggiornamento");
                            }
                          } catch {
                            setArticoli(prev => prev.map(a => a.id === art.id ? { ...a, attivo: !v } : a));
                            toast.error("Errore nell'aggiornamento");
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openArtDialog(art)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteArt(art.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ── Allergeni ── */}
        <TabsContent value="allergeni">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Allergeni ({allergeni.length})</h3>
            <Button onClick={() => openAllDialog()}><Plus className="mr-2 h-4 w-4" />Nuovo</Button>
          </div>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Icona</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Piatti</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allergeni.map(all => (
                  <TableRow key={all.id}>
                    <TableCell className="text-2xl">{all.icona || '⚠️'}</TableCell>
                    <TableCell className="font-medium">{all.nome}</TableCell>
                    <TableCell><Badge variant="secondary">{all._count?.articoli || 0}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openAllDialog(all)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteAll(all.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Categorie Dialog ─── */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCat ? 'Modifica Categoria' : 'Nuova Categoria'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Icona Emoji</Label>
              <Input value={catForm.icona} onChange={e => setCatForm({ ...catForm, icona: e.target.value })} placeholder="🍽️" />
            </div>
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={catForm.nome} onChange={e => setCatForm({ ...catForm, nome: e.target.value })} placeholder="Antipasti" />
            </div>
            <div className="space-y-2">
              <Label>Ordine</Label>
              <Input type="number" value={catForm.ordine} onChange={e => setCatForm({ ...catForm, ordine: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={catForm.attiva} onCheckedChange={v => setCatForm({ ...catForm, attiva: v })} />
              <Label>Attiva</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialogOpen(false)}>Annulla</Button>
            <Button onClick={saveCat}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Articolo Dialog ─── */}
      <Dialog open={artDialogOpen} onOpenChange={setArtDialogOpen}>
        <DialogContent className="max-w-2xl flex flex-col max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{editingArt ? 'Modifica Articolo' : 'Nuovo Articolo'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 overflow-y-auto flex-1 min-h-0 pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={artForm.nome} onChange={e => setArtForm({ ...artForm, nome: e.target.value })} placeholder="Spaghetti alla Carbonara" />
              </div>
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={artForm.categoriaId} onValueChange={v => setArtForm({ ...artForm, categoriaId: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                  <SelectContent>
                    {categorie.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrizione</Label>
              <Textarea value={artForm.descrizione} onChange={e => setArtForm({ ...artForm, descrizione: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prezzo *</Label>
                <Input type="number" step="0.01" value={artForm.prezzo} onChange={e => setArtForm({ ...artForm, prezzo: e.target.value })} placeholder="12.50" />
              </div>
              <div className="space-y-2">
                <Label>Prezzo Promozionale</Label>
                <Input type="number" step="0.01" value={artForm.prezzoPromozionale} onChange={e => setArtForm({ ...artForm, prezzoPromozionale: e.target.value })} placeholder="10.00" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={artForm.eBestChoice} onCheckedChange={v => setArtForm({ ...artForm, eBestChoice: v })} />
                <Label>Best Choice</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={artForm.eSurgelato} onCheckedChange={v => setArtForm({ ...artForm, eSurgelato: v })} />
                <Label>Surgelato</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={artForm.attivo} onCheckedChange={v => setArtForm({ ...artForm, attivo: v })} />
                <Label>Attivo</Label>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Immagine</Label>
              <div className="flex gap-2 items-center">
                <Input value={artForm.immagineUrl} onChange={e => setArtForm({ ...artForm, immagineUrl: e.target.value })} placeholder="URL immagine o carica un file" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={artFileInputRef}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await handleImageUpload(file, 'articolo');
                    if (url) setArtForm(f => ({ ...f, immagineUrl: url }));
                    e.target.value = '';
                  }}
                />
                <Button type="button" variant="outline" disabled={uploadingImage} onClick={() => artFileInputRef.current?.click()}>
                  {uploadingImage ? '...' : <Upload className="h-4 w-4" />}
                </Button>
              </div>
              {artForm.immagineUrl && (
                <img src={artForm.immagineUrl} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
              )}
            </div>

            {/* Allergeni */}
            <div className="space-y-2">
              <Label>Allergeni</Label>
              <div className="flex flex-wrap gap-2">
                {allergeni.map(all => (
                  <div
                    key={all.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      const id = all.id;
                      setArtForm(prev => ({
                        ...prev,
                        selectedAllergeni: prev.selectedAllergeni.includes(id)
                          ? prev.selectedAllergeni.filter(a => a !== id)
                          : [...prev.selectedAllergeni, id],
                      }));
                    }}
                  >
                    <Checkbox checked={artForm.selectedAllergeni.includes(all.id)} />
                    <span>{all.icona || '⚠️'} {all.nome}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setArtDialogOpen(false)}>Annulla</Button>
            <Button type="button" onClick={saveArt}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Allergene Dialog ─── */}
      <Dialog open={allDialogOpen} onOpenChange={setAllDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAll ? 'Modifica Allergene' : 'Nuovo Allergene'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Icona Emoji</Label>
              <Input value={allForm.icona} onChange={e => setAllForm({ ...allForm, icona: e.target.value })} placeholder="Clicca un\'emoji qui sotto o digita" />
              <div className="flex flex-wrap gap-1.5 mt-2 max-h-40 overflow-y-auto rounded-md border p-2 bg-gray-50">
                {['⚠️','🥜','🌾','🥛','🥚','🐟','🦐','🐟','🌰','🫘','🫐','🍎','🍊','🍋','🥝','🍌','🍇','🍓','🍑','🍒','🫑','🌽','🥕','🧅','🧄','🥬','🥦','🍄','🫒','🍖','🍗','🧈','🧀','🍯','🦀','🐙','🦪','🌭','🍕','🧁','🎂','🍰','🍪','🍫','🍬','🍩','🍦','🧊','❄️','❄','🫧','💧','🌱','🌿','☘️','🍀','🌸','🌺','🌻','🌹','🍀','🟢','🟡','🔴','🔵','⚪','⚫','🟠','🟣','🔶','🔷'].map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    className={`text-xl p-1 rounded hover:bg-gray-200 transition-colors cursor-pointer ${allForm.icona === emoji ? 'bg-blue-100 ring-2 ring-blue-400' : ''}`}
                    onClick={() => setAllForm({ ...allForm, icona: emoji })}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={allForm.nome} onChange={e => setAllForm({ ...allForm, nome: e.target.value })} placeholder="Glutine" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAllDialogOpen(false)}>Annulla</Button>
            <Button onClick={saveAll}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
