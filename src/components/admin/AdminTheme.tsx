'use client';

import { adminFetch } from '@/lib/admin-fetch';
import { useState, useEffect, useCallback, useRef } from 'react';
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
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Plus, Trash2, Upload, Save, ImageIcon, Check, ChevronDown, Search, Clock, MapPin, Euro } from 'lucide-react';

// ── Font Configuration ──
const FONT_LIST = [
  { group: 'Serif', fonts: [
    { value: 'Playfair Display', label: 'Playfair Display' },
    { value: 'Merriweather', label: 'Merriweather' },
    { value: 'Lora', label: 'Lora' },
    { value: 'Crimson Text', label: 'Crimson Text' },
    { value: 'Cormorant Garamond', label: 'Cormorant Garamond' },
    { value: 'Libre Baskerville', label: 'Libre Baskerville' },
    { value: 'Bitter', label: 'Bitter' },
    { value: 'EB Garamond', label: 'EB Garamond' },
  ]},
  { group: 'Sans Serif', fonts: [
    { value: 'Inter', label: 'Inter' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Raleway', label: 'Raleway' },
    { value: 'Nunito', label: 'Nunito' },
    { value: 'DM Sans', label: 'DM Sans' },
    { value: 'Quicksand', label: 'Quicksand' },
    { value: 'Outfit', label: 'Outfit' },
    { value: 'Manrope', label: 'Manrope' },
  ]},
  { group: 'Decorativo', fonts: [
    { value: 'Dancing Script', label: 'Dancing Script' },
    { value: 'Pacifico', label: 'Pacifico' },
    { value: 'Great Vibes', label: 'Great Vibes' },
    { value: 'Sacramento', label: 'Sacramento' },
    { value: 'Allura', label: 'Allura' },
  ]},
];

const ALL_FONTS = FONT_LIST.flatMap(g => g.fonts);
const GOOGLE_FONTS_URL = `https://fonts.googleapis.com/css2?family=${ALL_FONTS.map(f => f.value.replace(/ /g, '+')).join('&family=')}:wght@400;500;600;700&display=swap`;

interface SiteInfoData {
  id: string; nomeLocale: string; slogan: string; chiSiamoTitolo: string; chiSiamoTesto: string;
  telefono: string; email: string; prenotazioniAttive: boolean;
  heroTitle: string; heroSubtitle: string; heroCTAText: string; primaryColor: string;
  chiSiamoImageUrl: string | null; logoUrl: string | null; faviconUrl: string | null;
  heroImageUrl: string | null; heroOverlayOpacity: number;
  specialitaTitle: string | null; specialitaSubtitle: string | null; primaryForeground: string | null;
  secondaryColor: string | null; footerBgColor: string | null; footerTextColor: string | null; sectionBgColor: string | null;
  socialBtnColor: string | null; settingsBtnColor: string | null; prenotaBtnColor: string | null; prenotaSectionBgColor: string | null;
  headingFont: string | null; bodyFont: string | null;
}

interface SiteImage {
  id: string; sezione: string; titolo: string | null; descrizione: string | null;
  url: string; ordine: number; attiva: boolean;
}

const SEZIONI = ['hero', 'chi-siamo', 'specialita', 'gallery'];

// ── FontPicker Component (stile Word) ──
function FontPicker({ value, onChange, label, description }: {
  value: string; onChange: (v: string) => void; label: string; description: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <p className="text-xs text-muted-foreground">{description}</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between font-normal h-11">
            <span style={{ fontFamily: `"${value}", serif` }} className="truncate">{value}</span>
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca font..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto p-1">
            {FONT_LIST.map(group => {
              const groupFonts = group.fonts.filter(f =>
                !search || f.label.toLowerCase().includes(search.toLowerCase())
              );
              if (groupFonts.length === 0) return null;
              return (
                <div key={group.group}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground sticky top-0 bg-popover">{group.group}</div>
                  {groupFonts.map(font => (
                    <button
                      key={font.value}
                      onClick={() => { onChange(font.value); setOpen(false); setSearch(''); }}
                      className={`w-full text-left px-3 py-2 rounded-sm text-base hover:bg-accent flex items-center justify-between transition-colors ${value === font.value ? 'bg-accent' : ''}`}
                    >
                      <span style={{ fontFamily: `"${font.value}", serif` }} className="truncate">
                        {font.label}
                      </span>
                      {value === font.value && <Check className="h-4 w-4 shrink-0 text-primary" />}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function AdminTheme() {
  const [siteInfo, setSiteInfo] = useState<SiteInfoData | null>(null);
  const [images, setImages] = useState<SiteImage[]>([]);
  const [selectedSection, setSelectedSection] = useState('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imgForm, setImgForm] = useState({ titolo: '', descrizione: '', url: '', sezione: 'hero', ordine: 0, attiva: true });

  const logoFileRef = useRef<HTMLInputElement>(null);
  const faviconFileRef = useRef<HTMLInputElement>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);
  const chiSiamoFileRef = useRef<HTMLInputElement>(null);
  const imgDialogFileRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [infoRes, imgRes] = await Promise.all([
        fetch('/api/site-info'),
        adminFetch(`/api/admin/images?sezione=${selectedSection}`),
      ]);
      const infoData = await infoRes.json();
      setSiteInfo((infoRes.ok && infoData?.id) ? infoData : null);
      const imgData = await imgRes.json();
      setImages(Array.isArray(imgData) ? imgData : []);
    } catch {
      toast.error('Errore nel caricamento');
      setImages([]);
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
      const res = await adminFetch('/api/admin/images', {
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
      const res = await adminFetch(`/api/admin/images?id=${id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Errore'); return; }
      toast.success('Immagine eliminata');
      fetchData();
    } catch { toast.error('Errore'); }
  };

  if (!siteInfo) return <div className="animate-pulse p-6">Caricamento...</div>;

  return (
    <div>
      {/* Preload Google Fonts for the picker */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={GOOGLE_FONTS_URL} rel="stylesheet" />

      <h2 className="text-2xl font-bold mb-6">Temi e Personalizzazioni</h2>
      <Tabs defaultValue="testi">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="testi">Testi</TabsTrigger>
          <TabsTrigger value="font">Font</TabsTrigger>
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
              <Label>Titolo Specialita</Label>
              <Input value={siteInfo.specialitaTitle || ''} onChange={e => setSiteInfo({ ...siteInfo, specialitaTitle: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Sottotitolo Specialita</Label>
              <Input value={siteInfo.specialitaSubtitle || ''} onChange={e => setSiteInfo({ ...siteInfo, specialitaSubtitle: e.target.value })} />
            </div>
            <Button onClick={() => saveSiteInfo(siteInfo)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Testi'}
            </Button>
          </div>
        </TabsContent>

        {/* ── Font ── */}
        <TabsContent value="font">
          <div className="space-y-6">
            <FontPicker
              label="Font Titoli (Heading)"
              description="Usato per titoli h1, h2, h3, h4, h5, h6 in tutto il sito"
              value={siteInfo.headingFont || 'Playfair Display'}
              onChange={v => setSiteInfo({ ...siteInfo, headingFont: v })}
            />
            <FontPicker
              label="Font Corpo Testo (Body)"
              description="Usato per paragrafi, pulsanti e testo generale"
              value={siteInfo.bodyFont || 'Inter'}
              onChange={v => setSiteInfo({ ...siteInfo, bodyFont: v })}
            />

            {/* Anteprima Live */}
            <div className="space-y-3">
              <Label>Anteprima</Label>
              <div className="rounded-lg border p-6 space-y-3 bg-white">
                <h1 style={{ fontFamily: `"${siteInfo.headingFont || 'Playfair Display'}", serif` }} className="text-2xl font-bold">
                  Titolo di Esempio
                </h1>
                <h2 style={{ fontFamily: `"${siteInfo.headingFont || 'Playfair Display'}", serif` }} className="text-xl font-semibold">
                  Sottotitolo di Esempio
                </h2>
                <p style={{ fontFamily: `"${siteInfo.bodyFont || 'Inter'}", sans-serif` }} className="text-sm text-gray-600">
                  Questo e un esempio di corpo testo. La bella cucina italiana ha radici antiche che risalgono ai tempi dei romani.
                  Ogni piatto racconta una storia di tradizione e passione.
                </p>
                <Button style={{ fontFamily: `"${siteInfo.bodyFont || 'Inter'}", sans-serif` }}>
                  Pulsante di Esempio
                </Button>
              </div>
            </div>

            <Button onClick={() => saveSiteInfo(siteInfo)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Font'}
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
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={logoFileRef}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadImage(file);
                    if (url) setSiteInfo(s => ({ ...s!, logoUrl: url }));
                    e.target.value = '';
                  }}
                />
                <Button type="button" variant="outline" disabled={uploading} onClick={() => logoFileRef.current?.click()}>
                  {uploading ? '...' : <Upload className="h-4 w-4" />}
                </Button>
              </div>
              {siteInfo.logoUrl && (
                <img src={siteInfo.logoUrl} alt="Logo" className="w-24 h-24 object-contain rounded border p-1" />
              )}
            </div>
            <div className="space-y-2">
              <Label>Favicon URL</Label>
              <div className="flex gap-2">
                <Input value={siteInfo.faviconUrl || ''} onChange={e => setSiteInfo({ ...siteInfo, faviconUrl: e.target.value })} placeholder="URL favicon" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={faviconFileRef}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadImage(file);
                    if (url) setSiteInfo(s => ({ ...s!, faviconUrl: url }));
                    e.target.value = '';
                  }}
                />
                <Button type="button" variant="outline" disabled={uploading} onClick={() => faviconFileRef.current?.click()}>
                  {uploading ? '...' : <Upload className="h-4 w-4" />}
                </Button>
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
            {/* Colore Primario */}
            <div className="space-y-2">
              <Label>Colore Primario</Label>
              <p className="text-xs text-muted-foreground">Il colore principale del sito: bottoni, link, accenti, titoli sezione, CTA</p>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={siteInfo.primaryColor}
                  onChange={e => setSiteInfo({ ...siteInfo, primaryColor: e.target.value })}
                  className="w-12 h-12 rounded-lg border cursor-pointer"
                />
                <Input value={siteInfo.primaryColor} onChange={e => setSiteInfo({ ...siteInfo, primaryColor: e.target.value })} className="max-w-xs" />
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {['#b91c1c','#dc2626','#ea580c','#d97706','#ca8a04','#65a30d','#059669','#0d9488','#0891b2','#2563eb','#4f46e5','#7c3aed','#9333ea','#c026d3','#e11d48','#1c1917','#44403c','#78716c'].map(c => (
                  <button key={c} onClick={() => setSiteInfo({ ...siteInfo, primaryColor: c })} className="w-7 h-7 rounded-full border-2 hover:scale-110 transition-transform" style={{ background: c }} />
                ))}
              </div>
            </div>

            {/* Colore Testo su Primario (Foreground) */}
            <div className="space-y-2">
              <Label>Colore Testo su Primario (Foreground)</Label>
              <p className="text-xs text-muted-foreground">Il colore del testo quando lo sfondo e il colore primario (es. bottoni)</p>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={siteInfo.primaryForeground || '#ffffff'}
                  onChange={e => setSiteInfo({ ...siteInfo, primaryForeground: e.target.value })}
                  className="w-12 h-12 rounded-lg border cursor-pointer"
                />
                <Input value={siteInfo.primaryForeground || '#ffffff'} onChange={e => setSiteInfo({ ...siteInfo, primaryForeground: e.target.value })} className="max-w-xs" />
                <div className="flex gap-2">
                  {['#ffffff','#f8fafc','#fef2f2','#fefce8','#f0fdf4','#1c1917','#000000'].map(c => (
                    <button key={c} onClick={() => setSiteInfo({ ...siteInfo, primaryForeground: c })} className="w-7 h-7 rounded-full border-2 hover:scale-110 transition-transform" style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Anteprima Live Completa */}
            <div className="space-y-2">
              <Label>Anteprima Primaria</Label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: '50', var: '--primary-50' },
                  { label: '100', var: '--primary-100' },
                  { label: '200', var: '--primary-200' },
                  { label: 'light', var: '--primary-light' },
                  { label: 'Base', var: '--primary' },
                  { label: 'dark', var: '--primary-dark' },
                  { label: '700', var: '--primary-700' },
                  { label: '800', var: '--primary-800' },
                  { label: '900', var: '--primary-900' },
                  { label: 'darker', var: '--primary-darker' },
                ].map(s => (
                  <div key={s.var} className="text-center">
                    <div className="h-10 rounded-md border" style={{ background: `var(${s.var})` }} />
                    <span className="text-[10px] text-gray-500 mt-1 block">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Colore Secondario ── */}
            <div className="space-y-2 pt-4 border-t">
              <Label>Colore Secondario</Label>
              <p className="text-xs text-muted-foreground">Usato per accenti secondari, elementi distintivi dal colore primario (es. badge speciali, link alternativi).</p>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={siteInfo.secondaryColor || '#0d9488'}
                  onChange={e => setSiteInfo({ ...siteInfo, secondaryColor: e.target.value })}
                  className="w-12 h-12 rounded-lg border cursor-pointer"
                />
                <Input value={siteInfo.secondaryColor || '#0d9488'} onChange={e => setSiteInfo({ ...siteInfo, secondaryColor: e.target.value })} className="max-w-xs" />
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {['#0d9488','#0891b2','#2563eb','#4f46e5','#7c3aed','#9333ea','#059669','#65a30d','#ca8a04','#dc2626','#e11d48','#be185d','#1c1917','#44403c'].map(c => (
                  <button key={c} onClick={() => setSiteInfo({ ...siteInfo, secondaryColor: c })} className="w-7 h-7 rounded-full border-2 hover:scale-110 transition-transform" style={{ background: c }} />
                ))}
              </div>
              {/* Anteprima palette secondaria */}
              <div className="grid grid-cols-5 gap-2 mt-3">
                {[
                  { label: '50', var: '--secondary-50' },
                  { label: '100', var: '--secondary-100' },
                  { label: '200', var: '--secondary-200' },
                  { label: 'light', var: '--secondary-light' },
                  { label: 'Base', var: '--secondary-custom' },
                  { label: 'dark', var: '--secondary-dark' },
                  { label: '700', var: '--secondary-700' },
                  { label: '800', var: '--secondary-800' },
                ].map(s => (
                  <div key={s.var} className="text-center">
                    <div className="h-10 rounded-md border" style={{ background: `var(${s.var})` }} />
                    <span className="text-[10px] text-gray-500 mt-1 block">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Colore Sfondo Footer ── */}
            <div className="space-y-2 pt-4 border-t">
              <Label>Sfondo Footer</Label>
              <p className="text-xs text-muted-foreground">Il colore di sfondo del footer del sito.</p>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={siteInfo.footerBgColor || '#111827'}
                  onChange={e => setSiteInfo({ ...siteInfo, footerBgColor: e.target.value })}
                  className="w-12 h-12 rounded-lg border cursor-pointer"
                />
                <Input value={siteInfo.footerBgColor || '#111827'} onChange={e => setSiteInfo({ ...siteInfo, footerBgColor: e.target.value })} className="max-w-xs" />
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {['#111827','#1c1917','#18181b','#0f172a','#1e1b4b','#0c4a6e','#14532d','#422006','#78350f','#292524','#ffffff','#f8fafc','#f1f5f9','#e2e8f0','#1a1a2e','#16213e'].map(c => (
                  <button key={c} onClick={() => setSiteInfo({ ...siteInfo, footerBgColor: c })} className="w-7 h-7 rounded-full border-2 hover:scale-110 transition-transform" style={{ background: c }} />
                ))}
              </div>
            </div>

            {/* ── Colore Testo Footer ── */}
            <div className="space-y-2 pt-4 border-t">
              <Label>Testo Footer</Label>
              <p className="text-xs text-muted-foreground">Il colore del testo nel footer (titoli, paragrafi, link).</p>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={siteInfo.footerTextColor || '#d1d5db'}
                  onChange={e => setSiteInfo({ ...siteInfo, footerTextColor: e.target.value })}
                  className="w-12 h-12 rounded-lg border cursor-pointer"
                />
                <Input value={siteInfo.footerTextColor || '#d1d5db'} onChange={e => setSiteInfo({ ...siteInfo, footerTextColor: e.target.value })} className="max-w-xs" />
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {['#d1d5db','#e7e5e4','#f5f5f4','#a8a29e','#ffffff','#f8fafc','#cbd5e1','#94a3b8','#fbbf24','#fb923c','#a78bfa','#67e8f9'].map(c => (
                  <button key={c} onClick={() => setSiteInfo({ ...siteInfo, footerTextColor: c })} className="w-7 h-7 rounded-full border-2 hover:scale-110 transition-transform" style={{ background: c }} />
                ))}
              </div>
            </div>

            {/* ── Colore Sfondo Sezioni ── */}
            <div className="space-y-2 pt-4 border-t">
              <Label>Sfondo Sezioni Alternative</Label>
              <p className="text-xs text-muted-foreground">Il colore di sfondo per le sezioni con sfondo alternativo (es. area menu, eventi, chi siamo).</p>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={siteInfo.sectionBgColor || '#f9fafb'}
                  onChange={e => setSiteInfo({ ...siteInfo, sectionBgColor: e.target.value })}
                  className="w-12 h-12 rounded-lg border cursor-pointer"
                />
                <Input value={siteInfo.sectionBgColor || '#f9fafb'} onChange={e => setSiteInfo({ ...siteInfo, sectionBgColor: e.target.value })} className="max-w-xs" />
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {['#f9fafb','#f8fafc','#f1f5f9','#fefce8','#f0fdf4','#fdf2f8','#fff7ed','#f5f3ff','#ecfdf5','#fff1f2','#ffffff','#fef3c7','#dbeafe','#fce7f3','#e0e7ff','#d1fae5'].map(c => (
                  <button key={c} onClick={() => setSiteInfo({ ...siteInfo, sectionBgColor: c })} className="w-7 h-7 rounded-full border-2 hover:scale-110 transition-transform" style={{ background: c }} />
                ))}
              </div>
            </div>

            {/* ── Colore Tasto Social (sinistra) ── */}
            <div className="space-y-2 pt-4 border-t">
              <Label>Colore Tasto Social (Condividi)</Label>
              <p className="text-xs text-muted-foreground">Il colore del tasto &quot;Condividi&quot; fissato sul lato sinistro dello schermo.</p>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={siteInfo.socialBtnColor || '#ea580c'}
                  onChange={e => setSiteInfo({ ...siteInfo, socialBtnColor: e.target.value })}
                  className="w-12 h-12 rounded-lg border cursor-pointer"
                />
                <Input value={siteInfo.socialBtnColor || '#ea580c'} onChange={e => setSiteInfo({ ...siteInfo, socialBtnColor: e.target.value })} className="max-w-xs" />
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {['#ea580c','#b91c1c','#dc2626','#e11d48','#9333ea','#4f46e5','#2563eb','#0891b2','#059669','#65a30d','#1c1917','#374151'].map(c => (
                  <button key={c} onClick={() => setSiteInfo({ ...siteInfo, socialBtnColor: c })} className="w-7 h-7 rounded-full border-2 hover:scale-110 transition-transform" style={{ background: c }} />
                ))}
              </div>
            </div>

            {/* ── Colore Tasto Settings (admin, basso destra) ── */}
            <div className="space-y-2 pt-4 border-t">
              <Label>Colore Tasto Settings (Admin)</Label>
              <p className="text-xs text-muted-foreground">Il colore del tasto ingranaggio fissato in basso a destra per accedere al pannello admin.</p>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={siteInfo.settingsBtnColor || '#dc2626'}
                  onChange={e => setSiteInfo({ ...siteInfo, settingsBtnColor: e.target.value })}
                  className="w-12 h-12 rounded-lg border cursor-pointer"
                />
                <Input value={siteInfo.settingsBtnColor || '#dc2626'} onChange={e => setSiteInfo({ ...siteInfo, settingsBtnColor: e.target.value })} className="max-w-xs" />
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {['#dc2626','#b91c1c','#ea580c','#e11d48','#9333ea','#4f46e5','#2563eb','#0891b2','#1c1917','#374151','#44403c','#0f172a'].map(c => (
                  <button key={c} onClick={() => setSiteInfo({ ...siteInfo, settingsBtnColor: c })} className="w-7 h-7 rounded-full border-2 hover:scale-110 transition-transform" style={{ background: c }} />
                ))}
              </div>
            </div>

            {/* ── Colore Tasto Prenota (menu top) ── */}
            <div className="space-y-2 pt-4 border-t">
              <Label>Colore Tasto &quot;Prenota&quot; (Menu)</Label>
              <p className="text-xs text-muted-foreground">Il colore del bottone &quot;Prenota&quot; nel menu di navigazione in alto. Nascondibile tramite lo switch nel tab Prenotazioni.</p>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={siteInfo.prenotaBtnColor || '#ea580c'}
                  onChange={e => setSiteInfo({ ...siteInfo, prenotaBtnColor: e.target.value })}
                  className="w-12 h-12 rounded-lg border cursor-pointer"
                />
                <Input value={siteInfo.prenotaBtnColor || '#ea580c'} onChange={e => setSiteInfo({ ...siteInfo, prenotaBtnColor: e.target.value })} className="max-w-xs" />
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {['#ea580c','#b91c1c','#dc2626','#e11d48','#9333ea','#4f46e5','#2563eb','#0891b2','#059669','#65a30d','#1c1917','#374151'].map(c => (
                  <button key={c} onClick={() => setSiteInfo({ ...siteInfo, prenotaBtnColor: c })} className="w-7 h-7 rounded-full border-2 hover:scale-110 transition-transform" style={{ background: c }} />
                ))}
              </div>
            </div>

            {/* ── Colore Sfondo Sezione Prenota ── */}
            <div className="space-y-2 pt-4 border-t">
              <Label>Sfondo Sezione &quot;Prenota&quot;</Label>
              <p className="text-xs text-muted-foreground">Il colore di sfondo della sezione CTA &quot;Prenota il Tuo Tavolo&quot; che appare sopra il footer.</p>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={siteInfo.prenotaSectionBgColor || '#ea580c'}
                  onChange={e => setSiteInfo({ ...siteInfo, prenotaSectionBgColor: e.target.value })}
                  className="w-12 h-12 rounded-lg border cursor-pointer"
                />
                <Input value={siteInfo.prenotaSectionBgColor || '#ea580c'} onChange={e => setSiteInfo({ ...siteInfo, prenotaSectionBgColor: e.target.value })} className="max-w-xs" />
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {['#ea580c','#b91c1c','#dc2626','#e11d48','#9333ea','#4f46e5','#2563eb','#0891b2','#059669','#1c1917','#374151','#0f172a'].map(c => (
                  <button key={c} onClick={() => setSiteInfo({ ...siteInfo, prenotaSectionBgColor: c })} className="w-7 h-7 rounded-full border-2 hover:scale-110 transition-transform" style={{ background: c }} />
                ))}
              </div>
            </div>

            {/* Anteprima Live Completa */}
            <div className="space-y-2">
              <Label>Anteprima Live</Label>
              <div className="rounded-xl border overflow-hidden">
                {/* Preview Hero */}
                <div className="p-6" style={{ background: `linear-gradient(135deg, var(--primary-darker), var(--primary-dark), var(--primary))` }}>
                  <p className="text-xs opacity-60 mb-1" style={{ color: 'var(--primary-foreground)' }}>Header / Hero</p>
                  <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--primary-foreground)' }}>Il Nostro Menu</h3>
                  <p className="text-sm opacity-80" style={{ color: 'var(--primary-foreground)' }}>Sfondo gradient dal primario scuro</p>
                </div>
                {/* Preview Tabs / Bottoni */}
                <div className="p-4 space-y-3" style={{ background: 'var(--section-bg)' }}>
                  <p className="text-xs text-gray-400 mb-1">Bottoni &amp; Tab Attivi (sfondo sezione)</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-4 py-2 rounded-full text-sm font-medium text-white" style={{ background: 'var(--primary)' }}>Primario</span>
                    <span className="px-4 py-2 rounded-full text-sm font-medium text-white" style={{ background: 'var(--secondary-custom)' }}>Secondario</span>
                    <span className="px-4 py-2 rounded-full text-sm font-medium border" style={{ color: 'var(--primary)', borderColor: 'var(--primary-200)', background: 'var(--primary-50)' }}>Inattivo</span>
                    <span className="px-4 py-2 rounded-full text-sm font-medium" style={{ color: 'var(--primary)' }}>Link / Hover</span>
                  </div>
                </div>
                {/* Preview Badge / Bordo */}
                <div className="p-4 space-y-3">
                  <p className="text-xs text-gray-400 mb-1">Badge &amp; Bordi</p>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ background: 'var(--primary)' }}>In evidenza</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ background: 'var(--secondary-custom)' }}>Secondario</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium border-2" style={{ color: 'var(--primary)', borderColor: 'var(--primary-200)' }}>Con bordo</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ color: 'var(--primary)' }}>&euro;12,50</span>
                  </div>
                  <div className="h-px" style={{ background: 'var(--primary-100)' }} />
                  <h4 className="text-lg font-bold" style={{ color: 'var(--primary)' }}>Titolo Sezione</h4>
                </div>
                {/* Preview Footer */}
                <div className="p-4" style={{ background: 'var(--footer-bg)' }}>
                  <p className="text-xs opacity-50 mb-2" style={{ color: 'var(--footer-text)' }}>Footer</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--footer-text)' }}>Il Nostro Ristorante</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--footer-text-muted)' }}>Via Roma 123, Milano</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--footer-text-muted)' }}>info@ristorante.it</p>
                  <div className="flex gap-2 mt-3">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs" style={{ background: 'var(--footer-bg-light)', color: 'var(--footer-text)' }}>IG</span>
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs" style={{ background: 'var(--footer-bg-light)', color: 'var(--footer-text)' }}>FB</span>
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs" style={{ background: 'var(--footer-bg-light)', color: 'var(--footer-text)' }}>TW</span>
                  </div>
                </div>
              </div>
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
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={heroFileRef}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadImage(file);
                    if (url) setSiteInfo(s => ({ ...s!, heroImageUrl: url }));
                    e.target.value = '';
                  }}
                />
                <Button type="button" variant="outline" disabled={uploading} onClick={() => heroFileRef.current?.click()}>
                  {uploading ? '...' : <Upload className="h-4 w-4" />}
                </Button>
              </div>
              {siteInfo.heroImageUrl && (
                <img src={siteInfo.heroImageUrl} alt="Hero" className="w-full max-h-48 object-cover rounded-lg border" />
              )}
            </div>
            <div className="space-y-2">
              <Label>Opacita Overlay: {siteInfo.heroOverlayOpacity}</Label>
              <Slider value={[siteInfo.heroOverlayOpacity || 0.5]} onValueChange={([v]) => setSiteInfo({ ...siteInfo, heroOverlayOpacity: v })} min={0} max={1} step={0.05} />
            </div>
            <div className="space-y-2">
              <Label>Immagine Chi Siamo</Label>
              <div className="flex gap-2">
                <Input value={siteInfo.chiSiamoImageUrl || ''} onChange={e => setSiteInfo({ ...siteInfo, chiSiamoImageUrl: e.target.value })} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={chiSiamoFileRef}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadImage(file);
                    if (url) setSiteInfo(s => ({ ...s!, chiSiamoImageUrl: url }));
                    e.target.value = '';
                  }}
                />
                <Button type="button" variant="outline" disabled={uploading} onClick={() => chiSiamoFileRef.current?.click()}>
                  {uploading ? '...' : <Upload className="h-4 w-4" />}
                </Button>
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
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={imgDialogFileRef}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadImage(file);
                    if (url) setImgForm(f => ({ ...f, url }));
                    e.target.value = '';
                  }}
                />
                <Button type="button" variant="outline" disabled={uploading} onClick={() => imgDialogFileRef.current?.click()}>
                  {uploading ? '...' : <Upload className="h-4 w-4" />}
                </Button>
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