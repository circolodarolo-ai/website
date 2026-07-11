'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Upload, Megaphone } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { adminFetch } from '@/lib/admin-fetch';

interface Banner {
  id: string;
  tipo: string;
  posizione: string;
  sponsorNome: string;
  sponsorLogo: string | null;
  sponsorUrl: string;
  titolo: string | null;
  descrizione: string | null;
  ctaTesto: string | null;
  ctaUrl: string | null;
  immagineUrl: string | null;
  coloreSfondo: string | null;
  attivo: boolean;
  ordine: number;
  pagine: string | null;
}

const POSIZIONI = ['top', 'bottom', 'sidebar', 'inline'];
const TIPI = ['adsense', 'custom', 'sponsor'];

const emptyForm = {
  tipo: 'adsense',
  posizione: 'top',
  sponsorNome: '',
  sponsorLogo: '',
  sponsorUrl: '',
  titolo: '',
  descrizione: '',
  ctaTesto: '',
  ctaUrl: '',
  immagineUrl: '',
  coloreSfondo: '#f3f4f6',
  attivo: true,
  ordine: 0,
  pagine: 'eventi',
};

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [delBanner, setDelBanner] = useState<Banner | null>(false as unknown as Banner);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminfetch('/api/admin/banners');
      if (!res.ok) {
        console.error('[AdminBanners] fetchData error:', res.status);
        toast.error('Errore nel caricamento banner');
        setBanners([]);
        return;
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        console.error('[AdminBanners] fetchData: response is not an array', data);
        setBanners([]);
        return;
      }
      setBanners(data);
    } catch (err) {
      console.error('[AdminBanners] fetchData error:', err);
      toast.error('Errore nel caricamento');
      setBanners([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openNew = () => { setForm(emptyForm); setEditing(null); setDlgOpen(true); };
  const openEdit = (b: Banner) => { setForm({ tipo: b.tipo, posizione: b.posizione, sponsorNome: b.sponsorNome, sponsorLogo: b.sponsorLogo || '', sponsorUrl: b.sponsorUrl, titolo: b.titolo || '', descrizione: b.descrizione || '', ctaTesto: b.ctaTesto || '', ctaUrl: b.ctaUrl || '', immagineUrl: b.immagineUrl || '', coloreSfondo: b.coloreSfondo || '#f3f4f6', attivo: b.attivo, ordine: b.ordine, pagine: b.pagine || '' }); setEditing(b); setDlgOpen(true); };

  const save = async () => {
    setFormError('');
    if (!form.sponsorNome.trim()) {
      setFormError('Il nome dello sponsor e obbligatorio');
      return;
    }
    setSaving(true);
    try {
      const url = '/api/admin/banners';
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { ...form, id: editing.id } : form;
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const msg = errData?.error || `Errore ${res.status}`;
        setFormError(msg);
        console.error('[AdminBanners] Save failed:', res.status, errData);
        return;
      }
      toast.success(editing ? 'Banner aggiornato' : 'Banner creato');
      setDlgOpen(false);
      fetchData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Errore di rete';
      setFormError(msg);
      console.error('[AdminBanners] Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const deleteBanner = async () => {
    if (!delBanner) return;
    try {
      await fetch(`/api/admin/banners?id=${delBanner.id}`, { method: 'DELETE' });
      toast.success('Banner eliminato');
      setDelBanner(null as unknown as Banner);
      fetchData();
    } catch { toast.error('Errore'); }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await adminfetch('/api/admin/upload-image', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) return null;
      return data.url as string;
    } catch { return null; }
    finally { setUploading(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone className="h-6 w-6" /> Banner Pubblicitari
        </h2>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />Nuovo Banner</Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Caricamento...</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Megaphone className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Nessun banner configurato</p>
          <p className="text-sm mt-1">I banner saranno mostrati sulla pagina Eventi se l&apos;utente accetta i cookie di profilazione.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Sponsor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Posizione</TableHead>
                <TableHead>Pagine</TableHead>
                <TableHead>Ordine</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.sponsorNome || b.titolo || '-'}</TableCell>
                  <TableCell><span className="text-xs bg-gray-100 px-2 py-1 rounded">{b.tipo}</span></TableCell>
                  <TableCell>{b.posizione}</TableCell>
                  <TableCell className="text-sm">{b.pagine || 'Tutte'}</TableCell>
                  <TableCell>{b.ordine}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${b.attivo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {b.attivo ? 'Attivo' : 'Disattivo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(b)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setDelBanner(b)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dlgOpen} onOpenChange={setDlgOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifica Banner' : 'Nuovo Banner'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TIPI.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Posizione</Label>
                <Select value={form.posizione} onValueChange={v => setForm({ ...form, posizione: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{POSIZIONI.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nome Sponsor *</Label>
              <Input value={form.sponsorNome} onChange={e => setForm({ ...form, sponsorNome: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>URL Sponsor</Label>
              <Input value={form.sponsorUrl} onChange={e => setForm({ ...form, sponsorUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Titolo</Label>
              <Input value={form.titolo} onChange={e => setForm({ ...form, titolo: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Descrizione</Label>
              <Textarea value={form.descrizione} onChange={e => setForm({ ...form, descrizione: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Testo CTA</Label>
                <Input value={form.ctaTesto} onChange={e => setForm({ ...form, ctaTesto: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>URL CTA</Label>
                <Input value={form.ctaUrl} onChange={e => setForm({ ...form, ctaUrl: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Pagine (separate da virgola, es: eventi,menu)</Label>
              <Input value={form.pagine} onChange={e => setForm({ ...form, pagine: e.target.value })} placeholder="eventi" />
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
                    const url = await uploadImage(file); if (url) setForm({ ...form, immagineUrl: url });
                    e.target.value = '';
                  }}
                />
                <Button type="button" variant="outline" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                  {uploading ? '...' : <Upload className="h-4 w-4" />}
                </Button>
              </div>
              {form.immagineUrl && <img src={form.immagineUrl} alt="preview" className="w-full max-h-32 object-cover rounded-lg border" />}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Colore Sfondo</Label>
                <div className="flex gap-2">
                  <input type="color" value={form.coloreSfondo} onChange={e => setForm({ ...form, coloreSfondo: e.target.value })} className="w-10 h-10 rounded border cursor-pointer" />
                  <Input value={form.coloreSfondo} onChange={e => setForm({ ...form, coloreSfondo: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Ordine</Label>
                <Input type="number" value={form.ordine} onChange={e => setForm({ ...form, ordine: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.attivo} onCheckedChange={v => setForm({ ...form, attivo: v })} />
              <Label>Attivo</Label>
            </div>
          </div>
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {formError}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDlgOpen(false)} disabled={saving}>Annulla</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Salvataggio...' : 'Salva'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!delBanner} onOpenChange={() => setDelBanner(null as unknown as Banner)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare il banner?</AlertDialogTitle>
            <AlertDialogDescription>Il banner &quot;{delBanner?.sponsorNome}&quot; verrà eliminato definitivamente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={deleteBanner} className="bg-red-600 hover:bg-red-700">Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}