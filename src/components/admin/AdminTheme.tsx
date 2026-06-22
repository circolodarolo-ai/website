'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Plus, Trash2, Upload, Save, ImageIcon } from 'lucide-react';

interface SiteInfoData {
  id: string; nomeLocale: string; slogan: string; chiSiamoTitolo: string; chiSiamoTesto: string;
  telefono: string; email: string; indirizzo: string; orariApertura: string; prenotazioniAttive: boolean;
  heroTitle: string; heroSubtitle: string; heroCTAText: string; primaryColor: string;
  chiSiamoImageUrl: string | null; logoUrl: string | null; faviconUrl: string | null;
  heroImageUrl: string | null; heroOverlayOpacity: number;
  specialitaTitle: string | null; specialitaSubtitle: string | null; primaryForeground: string | null;
}

interface SiteImage {
  id: string; sezione: string; titolo: string | null; descrizione: string | null;
  url: string; ordine: number; attiva: boolean;
}

const SEZIONI = ['hero', 'chi-siamo', 'specialita', 'gallery'];

export default function AdminTheme() {
  const [siteInfo, setSiteInfo] = useState<SiteInfoData | null>(null);
  const [images, setImages] = useState<SiteImage[]>([]);
  const [selectedSection, setSelectedSection] = useState('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imgForm, setImgForm] = useState({ titolo: '', descrizione: '', url: '', sezione: 'hero', ordine: 0, attiva: true });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [infoRes, imgRes] = await Promise.all([
        fetch('/api/site-info'),
        fetch(`/api/admin/images?sezione=${selectedSection}`),
      ]);
      setSiteInfo(await infoRes.json());
      setImages(await imgRes.json());
    } catch {
      toast.error('Errore nel caricamento');
    }
    setLoading(false);
  }, [selectedSection]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveSiteInfo = async (updates: Partial<SiteInfoData>) => {
    setSaving(true);
    try {
      const res = await fetch('/api/site-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...siteInfo, ...updates }),
      });
      if (!res.ok) { toast.error('Errore'); return; }
      const data = await res.json();
      setSiteInfo(data);
      toast.success('Salvato con successo');
    } catch { toast.error('Errore'); }
    setSaving(false);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return null; }
      return data.url as string;
    } catch { toast.error('Errore'); return null; }
    finally { setUploading(false); }
  };

  // ── Image CRUD ──
  const saveImage = async () => {
    if (!imgForm.url) { toast.error('URL immagine obbligatorio'); return; }
    try {
      const res = await fetch('/api/admin/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...imgForm, sezione: selectedSection }),
      });
      if (!res.ok) { toast.error('Errore'); return; }
      toast.success('Immagine aggiunta');
      setImageDialogOpen(false);
      fetchData();
    } catch { toast.error('Errore'); }
  };

  const deleteImage = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/images?id=${id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Errore'); return; }
      toast.success('Immagine eliminata');
      fetchData();
    } catch { toast.error('Errore'); }
  };

  if (!siteInfo) return <div className="animate-pulse p-6">Caricamento...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">🎨 Temi e Personalizzazioni</h2>
      <Tabs defaultValue="testi">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="testi">Testi</TabsTrigger>
          <TabsTrigger value="logo">Logo & Favicon</TabsTrigger>
          <TabsTrigger value="colori">Colori</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="immagini">Immagini Sito</TabsTrigger>
        </TabsList>

        {/* ── Testi ── */}
        <TabsContent value="testi">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Locale</Label>
              <Input value={siteInfo.nomeLocale} onChange={e => setSiteInfo({ ...siteInfo, nomeLocale: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Slogan</Label>
              <Input value={siteInfo.slogan} onChange={e => setSiteInfo({ ...siteInfo, slogan: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Titolo Chi Siamo</Label>
              <Input value={siteInfo.chiSiamoTitolo} onChange={e => setSiteInfo({ ...siteInfo, chiSiamoTitolo: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Testo Chi Siamo</Label>
              <Textarea value={siteInfo.chiSiamoTesto} onChange={e => setSiteInfo({ ...siteInfo, chiSiamoTesto: e.target.value })} rows={5} />
            </div>
            <div className="space-y-2">
              <Label>Titolo Specialità</Label>
              <Input value={siteInfo.specialitaTitle || ''} onChange={e => setSiteInfo({ ...siteInfo, specialitaTitle: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Sottotitolo Specialità</Label>
              <Input value={siteInfo.specialitaSubtitle || ''} onChange={e => setSiteInfo({ ...siteInfo, specialitaSubtitle: e.target.value })} />
            </div>
            <Button onClick={() => saveSiteInfo(siteInfo)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Testi'}
            </Button>
          </div>
        </TabsContent>

        {/* ── Logo & Favicon ── */}
        <TabsContent value="logo">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <div className="flex gap-2">
                <Input value={siteInfo.logoUrl || ''} onChange={e => setSiteInfo({ ...siteInfo, logoUrl: e.target.value })} placeholder="URL logo" />
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadImage(file);
                    if (url) setSiteInfo(s => ({ ...s!, logoUrl: url }));
                  }} />
                  <Button type="button" variant="outline" disabled={uploading}>
                    {uploading ? '...' : <Upload className="h-4 w-4" />}
                  </Button>
                </label>
              </div>
              {siteInfo.logoUrl && (
                <img src={siteInfo.logoUrl} alt="Logo" className="w-24 h-24 object-contain rounded border p-1" />
              )}
            </div>
            <div className="space-y-2">
              <Label>Favicon URL</Label>
              <div className="flex gap-2">
                <Input value={siteInfo.faviconUrl || ''} onChange={e => setSiteInfo({ ...siteInfo, faviconUrl: e.target.value })} placeholder="URL favicon" />
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadImage(file);
                    if (url) setSiteInfo(s => ({ ...s!, faviconUrl: url }));
                  }} />
                  <Button type="button" variant="outline" disabled={uploading}>
                    {uploading ? '...' : <Upload className="h-4 w-4" />}
                  </Button>
                </label>
              </div>
              {siteInfo.faviconUrl && (
                <img src={siteInfo.faviconUrl} alt="Favicon" className="w-16 h-16 object-contain rounded border p-1" />
              )}
            </div>
            <Button onClick={() => saveSiteInfo(siteInfo)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Logo & Favicon'}
            </Button>
          </div>
        </TabsContent>

        {/* ── Colori ── */}
        <TabsContent value="colori">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Colore Primario</Label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={siteInfo.primaryColor}
                  onChange={e => setSiteInfo({ ...siteInfo, primaryColor: e.target.value })}
                  className="w-12 h-12 rounded-lg border cursor-pointer"
                />
                <Input value={siteInfo.primaryColor} onChange={e => setSiteInfo({ ...siteInfo, primaryColor: e.target.value })} className="max-w-xs" />
              </div>
              <div className="flex gap-2 mt-2">
                {['#b91c1c', '#dc2626', '#ea580c', '#d97706', '#65a30d', '#0d9488', '#0891b2', '#2563eb', '#7c3aed', '#c026d3'].map(c => (
                  <button key={c} onClick={() => setSiteInfo({ ...siteInfo, primaryColor: c })} className="w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform" style={{ background: c }} />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Colore Testo Primario (Foreground)</Label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={siteInfo.primaryForeground || '#ffffff'}
                  onChange={e => setSiteInfo({ ...siteInfo, primaryForeground: e.target.value })}
                  className="w-12 h-12 rounded-lg border cursor-pointer"
                />
                <Input value={siteInfo.primaryForeground || '#ffffff'} onChange={e => setSiteInfo({ ...siteInfo, primaryForeground: e.target.value })} className="max-w-xs" />
              </div>
            </div>
            {/* Live Preview */}
            <div className="rounded-lg p-6 text-white" style={{ background: siteInfo.primaryColor, color: siteInfo.primaryForeground || '#fff' }}>
              <h3 className="text-xl font-bold mb-2">Anteprima</h3>
              <p className="text-sm opacity-90">Questo è un esempio di come appaiono i colori scelti.</p>
            </div>
            <Button onClick={() => saveSiteInfo(siteInfo)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Colori'}
            </Button>
          </div>
        </TabsContent>

        {/* ── Hero ── */}
        <TabsContent value="hero">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titolo Hero</Label>
              <Input value={siteInfo.heroTitle} onChange={e => setSiteInfo({ ...siteInfo, heroTitle: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Sottotitolo</Label>
              <Textarea value={siteInfo.heroSubtitle} onChange={e => setSiteInfo({ ...siteInfo, heroSubtitle: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Testo CTA</Label>
              <Input value={siteInfo.heroCTAText} onChange={e => setSiteInfo({ ...siteInfo, heroCTAText: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Immagine Hero</Label>
              <div className="flex gap-2">
                <Input value={siteInfo.heroImageUrl || ''} onChange={e => setSiteInfo({ ...siteInfo, heroImageUrl: e.target.value })} />
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadImage(file);
                    if (url) setSiteInfo(s => ({ ...s!, heroImageUrl: url }));
                  }} />
                  <Button type="button" variant="outline" disabled={uploading}>
                    {uploading ? '...' : <Upload className="h-4 w-4" />}
                  </Button>
                </label>
              </div>
              {siteInfo.heroImageUrl && (
                <img src={siteInfo.heroImageUrl} alt="Hero" className="w-full max-h-48 object-cover rounded-lg border" />
              )}
            </div>
            <div className="space-y-2">
              <Label>Opacità Overlay: {siteInfo.heroOverlayOpacity}</Label>
              <Slider value={[siteInfo.heroOverlayOpacity || 0.5]} onValueChange={([v]) => setSiteInfo({ ...siteInfo, heroOverlayOpacity: v })} min={0} max={1} step={0.05} />
            </div>
            <div className="space-y-2">
              <Label>Immagine Chi Siamo</Label>
              <div className="flex gap-2">
                <Input value={siteInfo.chiSiamoImageUrl || ''} onChange={e => setSiteInfo({ ...siteInfo, chiSiamoImageUrl: e.target.value })} />
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadImage(file);
                    if (url) setSiteInfo(s => ({ ...s!, chiSiamoImageUrl: url }));
                  }} />
                  <Button type="button" variant="outline" disabled={uploading}>
                    {uploading ? '...' : <Upload className="h-4 w-4" />}
                  </Button>
                </label>
              </div>
            </div>
            <Button onClick={() => saveSiteInfo(siteInfo)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Hero'}
            </Button>
          </div>
        </TabsContent>

        {/* ── Immagini Sito ── */}
        <TabsContent value="immagini">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label>Sezione:</Label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SEZIONI.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-500">({images.length} immagini)</span>
              </div>
              <Button onClick={() => {
                setImgForm({ titolo: '', descrizione: '', url: '', sezione: selectedSection, ordine: 0, attiva: true });
                setImageDialogOpen(true);
              }}><Plus className="mr-2 h-4 w-4" />Aggiungi</Button>
            </div>

            {images.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <ImageIcon className="mx-auto h-12 w-12 mb-2" />
                <p>Nessuna immagine per questa sezione</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map(img => (
                  <div key={img.id} className="relative group rounded-lg border overflow-hidden bg-gray-50">
                    <img src={img.url} alt={img.titolo || ''} className="w-full h-32 object-cover" />
                    <div className="p-2">
                      <p className="text-sm font-medium truncate">{img.titolo || 'Senza titolo'}</p>
                      <p className="text-xs text-gray-500">Ordine: {img.ordine}</p>
                    </div>
                    <button onClick={() => deleteImage(img.id)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Add Image Dialog ─── */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiungi Immagine</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titolo</Label>
              <Input value={imgForm.titolo} onChange={e => setImgForm({ ...imgForm, titolo: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Descrizione</Label>
              <Textarea value={imgForm.descrizione} onChange={e => setImgForm({ ...imgForm, descrizione: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>URL Immagine *</Label>
              <div className="flex gap-2">
                <Input value={imgForm.url} onChange={e => setImgForm({ ...imgForm, url: e.target.value })} />
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadImage(file);
                    if (url) setImgForm(f => ({ ...f, url }));
                  }} />
                  <Button type="button" variant="outline" disabled={uploading}>
                    {uploading ? '...' : <Upload className="h-4 w-4" />}
                  </Button>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ordine</Label>
              <Input type="number" value={imgForm.ordine} onChange={e => setImgForm({ ...imgForm, ordine: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>Annulla</Button>
            <Button onClick={saveImage}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
