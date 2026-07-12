'use client';

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
import { compressImage } from '@/lib/image-compress';

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
  id: string; nomeLocale: string; slogan: string;
  chiSiamoTitolo: string; chiSiamoSubtitle: string | null; chiSiamoTesto: string;
  valore1Titolo: string | null; valore1Desc: string | null;
  valore2Titolo: string | null; valore2Desc: string | null;
  valore3Titolo: string | null; valore3Desc: string | null;
  valore4Titolo: string | null; valore4Desc: string | null;
  telefono: string; email: string; prenotazioniAttive: boolean;
  heroTitle: string; heroSubtitle: string; heroCTAText: string; primaryColor: string;
  chiSiamoImageUrl: string | null; logoUrl: string | null; faviconUrl: string | null;
  heroImageUrl: string | null; heroOverlayOpacity: number;
  heroTextColor: string | null; headerTextColor: string | null;
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

// ── Color helper components ──
function ColorGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-lg border p-4 bg-gray-50/30">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ColorField({ label, description, value, presets, onChange }: {
  label: string; description: string; value: string; presets: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg border cursor-pointer shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">{label}</Label>
            <span className="text-xs text-muted-foreground hidden sm:inline">— {description}</span>
          </div>
        </div>
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-28 h-9 text-xs font-mono shrink-0"
        />
      </div>
      <div className="flex gap-1.5 pl-12 flex-wrap">
        {presets.map(c => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className="w-6 h-6 rounded-full border hover:scale-125 transition-transform"
            style={{ background: c, borderColor: value === c ? '#000' : undefined, borderWidth: value === c ? 2 : 1 }}
          />
        ))}
      </div>
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
    try {
      const url = await compressImage(file, 1200, 0.85);
      return url;
    } catch { toast.error('Errore nel caricamento'); return null; }
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
      {/* Preload Google Fonts for the picker */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={GOOGLE_FONTS_URL} rel="stylesheet" />

      <h2 className="text-2xl font-bold mb-6">Temi e Personalizzazioni</h2>
      <Tabs defaultValue="hero">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="chisiamo">Chi Siamo</TabsTrigger>
          <TabsTrigger value="testi">Testi Generali</TabsTrigger>
          <TabsTrigger value="font">Font</TabsTrigger>
          <TabsTrigger value="colori">Colori</TabsTrigger>
          <TabsTrigger value="logo">Logo & Favicon</TabsTrigger>
          <TabsTrigger value="immagini">Immagini Sito</TabsTrigger>
        </TabsList>

        {/* ── Hero ── */}
        <TabsContent value="hero">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Badge (sopra il titolo)</Label>
              <p className="text-xs text-muted-foreground">Es: &quot;Dal 1985 nel cuore di Milano&quot;</p>
              <Input value={siteInfo.slogan} onChange={e => setSiteInfo({ ...siteInfo, slogan: e.target.value })} />
            </div>
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
                <input type="file" accept="image/*" className="hidden" ref={heroFileRef} onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const url = await uploadImage(file); if (url) setSiteInfo(s => ({ ...s!, heroImageUrl: url })); e.target.value = ''; }} />
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
            <Button onClick={() => saveSiteInfo(siteInfo)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Hero'}
            </Button>
          </div>
        </TabsContent>

        {/* ── Chi Siamo ── */}
        <TabsContent value="chisiamo">
          <div className="space-y-6">
            {/* Sezione intestazione */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Intestazione</h3>
              <div className="space-y-2">
                <Label>Sottotitolo (sopra il titolo)</Label>
                <p className="text-xs text-muted-foreground">Es: &quot;La Nostra Storia&quot;</p>
                <Input value={siteInfo.chiSiamoSubtitle || ''} onChange={e => setSiteInfo({ ...siteInfo, chiSiamoSubtitle: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Titolo</Label>
                <Input value={siteInfo.chiSiamoTitolo} onChange={e => setSiteInfo({ ...siteInfo, chiSiamoTitolo: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Testo descrittivo</Label>
                <Textarea value={siteInfo.chiSiamoTesto} onChange={e => setSiteInfo({ ...siteInfo, chiSiamoTesto: e.target.value })} rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Immagine</Label>
                <div className="flex gap-2">
                  <Input value={siteInfo.chiSiamoImageUrl || ''} onChange={e => setSiteInfo({ ...siteInfo, chiSiamoImageUrl: e.target.value })} />
                  <input type="file" accept="image/*" className="hidden" ref={chiSiamoFileRef} onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const url = await uploadImage(file); if (url) setSiteInfo(s => ({ ...s!, chiSiamoImageUrl: url })); e.target.value = ''; }} />
                  <Button type="button" variant="outline" disabled={uploading} onClick={() => chiSiamoFileRef.current?.click()}>
                    {uploading ? '...' : <Upload className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Sezione carte valori */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Carte Valori</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 rounded-lg border p-4 bg-gray-50/50">
                  <Label className="text-xs font-medium text-muted-foreground">Carta 1</Label>
                  <Input placeholder="Es: Passione" value={siteInfo.valore1Titolo || ''} onChange={e => setSiteInfo({ ...siteInfo, valore1Titolo: e.target.value })} />
                  <Textarea placeholder="Descrizione..." value={siteInfo.valore1Desc || ''} onChange={e => setSiteInfo({ ...siteInfo, valore1Desc: e.target.value })} rows={2} />
                </div>
                <div className="space-y-2 rounded-lg border p-4 bg-gray-50/50">
                  <Label className="text-xs font-medium text-muted-foreground">Carta 2</Label>
                  <Input placeholder="Es: Ingredienti Freschi" value={siteInfo.valore2Titolo || ''} onChange={e => setSiteInfo({ ...siteInfo, valore2Titolo: e.target.value })} />
                  <Textarea placeholder="Descrizione..." value={siteInfo.valore2Desc || ''} onChange={e => setSiteInfo({ ...siteInfo, valore2Desc: e.target.value })} rows={2} />
                </div>
                <div className="space-y-2 rounded-lg border p-4 bg-gray-50/50">
                  <Label className="text-xs font-medium text-muted-foreground">Carta 3</Label>
                  <Input placeholder="Es: Tradizione dal 1985" value={siteInfo.valore3Titolo || ''} onChange={e => setSiteInfo({ ...siteInfo, valore3Titolo: e.target.value })} />
                  <Textarea placeholder="Descrizione..." value={siteInfo.valore3Desc || ''} onChange={e => setSiteInfo({ ...siteInfo, valore3Desc: e.target.value })} rows={2} />
                </div>
                <div className="space-y-2 rounded-lg border p-4 bg-gray-50/50">
                  <Label className="text-xs font-medium text-muted-foreground">Carta 4</Label>
                  <Input placeholder="Es: Ricette Autentiche" value={siteInfo.valore4Titolo || ''} onChange={e => setSiteInfo({ ...siteInfo, valore4Titolo: e.target.value })} />
                  <Textarea placeholder="Descrizione..." value={siteInfo.valore4Desc || ''} onChange={e => setSiteInfo({ ...siteInfo, valore4Desc: e.target.value })} rows={2} />
                </div>
              </div>
            </div>

            <Button onClick={() => saveSiteInfo(siteInfo)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Chi Siamo'}
            </Button>
          </div>
        </TabsContent>

        {/* ── Testi Generali ── */}
        <TabsContent value="testi">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Locale</Label>
              <Input value={siteInfo.nomeLocale} onChange={e => setSiteInfo({ ...siteInfo, nomeLocale: e.target.value })} />
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

            {/* ── Colori Principal ── */}
            <ColorGroup title="Colori Principali">
              <ColorField
                label="Primario" description="Bottoni, link, accenti"
                value={siteInfo.primaryColor} presets={['#b91c1c','#dc2626','#ea580c','#d97706','#65a30d','#059669','#0d9488','#2563eb','#4f46e5','#7c3aed','#9333ea','#1c1917']}
                onChange={v => setSiteInfo({ ...siteInfo, primaryColor: v })}
              />
              <ColorField
                label="Testo su Primario" description="Testo nei bottoni primari"
                value={siteInfo.primaryForeground || '#ffffff'} presets={['#ffffff','#f8fafc','#1c1917','#000000']}
                onChange={v => setSiteInfo({ ...siteInfo, primaryForeground: v })}
              />
              <ColorField
                label="Secondario" description="Accenti secondari, badge"
                value={siteInfo.secondaryColor || '#0d9488'} presets={['#0d9488','#0891b2','#2563eb','#4f46e5','#7c3aed','#059669','#dc2626','#1c1917']}
                onChange={v => setSiteInfo({ ...siteInfo, secondaryColor: v })}
              />
            </ColorGroup>

            {/* ── Header & Hero ── */}
            <ColorGroup title="Header e Hero">
              <ColorField
                label="Testo Header (trasparente)" description="Nav e nome locale sull'hero"
                value={siteInfo.headerTextColor || '#ffffff'} presets={['#ffffff','#f8fafc','#fef2f2','#1c1917','#000000','#fbbf24']}
                onChange={v => setSiteInfo({ ...siteInfo, headerTextColor: v })}
              />
              <ColorField
                label="Testo Hero" description="Titolo, sottotitolo e badge della hero"
                value={siteInfo.heroTextColor || '#ffffff'} presets={['#ffffff','#f8fafc','#fef2f2','#fefce8','#1c1917','#000000','#fbbf24']}
                onChange={v => setSiteInfo({ ...siteInfo, heroTextColor: v })}
              />
            </ColorGroup>

            {/* ── Footer ── */}
            <ColorGroup title="Footer">
              <ColorField
                label="Sfondo Footer" description="Background del footer"
                value={siteInfo.footerBgColor || '#111827'} presets={['#111827','#1c1917','#18181b','#0f172a','#1e1b4b','#ffffff','#f8fafc']}
                onChange={v => setSiteInfo({ ...siteInfo, footerBgColor: v })}
              />
              <ColorField
                label="Testo Footer" description="Titoli, paragrafi, link nel footer"
                value={siteInfo.footerTextColor || '#d1d5db'} presets={['#d1d5db','#ffffff','#fbbf24','#fb923c','#a78bfa','#cbd5e1']}
                onChange={v => setSiteInfo({ ...siteInfo, footerTextColor: v })}
              />
            </ColorGroup>

            {/* ── Bottoni ── */}
            <ColorGroup title="Bottoni">
              <ColorField
                label="Tasto Prenota (Header)" description="Bottone nel menu di navigazione"
                value={siteInfo.prenotaBtnColor || '#ea580c'} presets={['#ea580c','#dc2626','#059669','#2563eb','#1c1917']}
                onChange={v => setSiteInfo({ ...siteInfo, prenotaBtnColor: v })}
              />
              <ColorField
                label="Sfondo Sezione Prenota" description="Background della sezione CTA"
                value={siteInfo.prenotaSectionBgColor || '#ea580c'} presets={['#ea580c','#dc2626','#059669','#2563eb','#1c1917','#0f172a']}
                onChange={v => setSiteInfo({ ...siteInfo, prenotaSectionBgColor: v })}
              />
              <ColorField
                label="Tasto Condividi (Sociale)" description="Bottone fissato a sinistra"
                value={siteInfo.socialBtnColor || '#ea580c'} presets={['#ea580c','#dc2626','#4f46e5','#2563eb','#1c1917']}
                onChange={v => setSiteInfo({ ...siteInfo, socialBtnColor: v })}
              />
              <ColorField
                label="Tasto Admin (Settings)" description="Ingranaggio in basso a destra"
                value={siteInfo.settingsBtnColor || '#dc2626'} presets={['#dc2626','#ea580c','#4f46e5','#1c1917','#374151']}
                onChange={v => setSiteInfo({ ...siteInfo, settingsBtnColor: v })}
              />
            </ColorGroup>

            {/* ── Sezioni ── */}
            <ColorGroup title="Sezioni">
              <ColorField
                label="Sfondo Sezioni Alternative" description="Menu, eventi, chi siamo"
                value={siteInfo.sectionBgColor || '#f9fafb'} presets={['#f9fafb','#f8fafc','#f1f5f9','#fefce8','#f0fdf4','#ffffff']}
                onChange={v => setSiteInfo({ ...siteInfo, sectionBgColor: v })}
              />
            </ColorGroup>

            {/* Anteprima Live */}
            <div className="space-y-2">
              <Label>Anteprima</Label>
              <div className="rounded-xl border overflow-hidden">
                <div className="p-5" style={{ background: `linear-gradient(135deg, var(--primary-darker), var(--primary-dark), var(--primary))` }}>
                  <p className="text-xs opacity-60 mb-1" style={{ color: siteInfo.heroTextColor || '#fff' }}>Hero / Header</p>
                  <h3 className="text-lg font-bold" style={{ color: siteInfo.heroTextColor || '#fff' }}>Titolo Hero</h3>
                  <p className="text-sm opacity-80 mt-1" style={{ color: siteInfo.heroTextColor || '#fff' }}>Sottotitolo con colore personalizzabile</p>
                </div>
                <div className="p-3 space-y-2" style={{ background: 'var(--section-bg)' }}>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-full text-xs font-medium text-white" style={{ background: 'var(--primary)' }}>Primario</span>
                    <span className="px-3 py-1.5 rounded-full text-xs font-medium text-white" style={{ background: 'var(--secondary-custom)' }}>Secondario</span>
                    <span className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ color: 'var(--primary)' }}>Link</span>
                  </div>
                </div>
                <div className="p-3" style={{ background: 'var(--footer-bg)' }}>
                  <p className="text-xs font-bold" style={{ color: 'var(--footer-text)' }}>Footer</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--footer-text-muted)' }}>info@ristorante.it</p>
                </div>
              </div>
            </div>

            <Button onClick={() => saveSiteInfo(siteInfo)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Colori'}
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
        <DialogContent aria-describedby={undefined}>
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