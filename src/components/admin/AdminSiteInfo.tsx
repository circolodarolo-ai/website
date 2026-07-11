'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Save } from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';

interface SiteInfoData {
  id: string; nomeLocale: string; telefono: string; email: string; prenotazioniAttive: boolean;
  seoTitle: string | null; seoDescription: string | null; seoKeywords: string | null;
  seoRobots: string | null; seoCanonical: string | null;
  seoOgTitle: string | null; seoOgDescription: string | null; seoOgImage: string | null;
  seoTwitterCard: string | null;
}

export default function AdminSiteInfo() {
  const [siteInfo, setSiteInfo] = useState<SiteInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/site-info');
      setSiteInfo(await res.json());
    } catch {
      toast.error('Errore nel caricamento');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const save = async (updates: Partial<SiteInfoData>) => {
    setSaving(true);
    try {
      const res = await fetch('/api/site-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...siteInfo, ...updates }),
      });
      if (!res.ok) { toast.error('Errore'); return; }
      setSiteInfo(await res.json());
      toast.success('Salvato con successo');
    } catch { toast.error('Errore'); }
    setSaving(false);
  };

  if (!siteInfo) return <div className="animate-pulse p-6">Caricamento...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">📄 Info Sito e SEO</h2>
      <Tabs defaultValue="generali">
        <TabsList className="mb-6">
          <TabsTrigger value="generali">Generali</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="social">Social OG</TabsTrigger>
        </TabsList>

        {/* ── Generali ── */}
        <TabsContent value="generali">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Locale</Label>
              <Input value={siteInfo.nomeLocale} onChange={e => setSiteInfo({ ...siteInfo, nomeLocale: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={siteInfo.email} onChange={e => setSiteInfo({ ...siteInfo, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Telefono</Label>
                <Input value={siteInfo.telefono} onChange={e => setSiteInfo({ ...siteInfo, telefono: e.target.value })} />
              </div>
            </div>
            <Button onClick={() => save(siteInfo)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva'}
            </Button>
          </div>
        </TabsContent>

        {/* ── SEO ── */}
        <TabsContent value="seo">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Meta Title</Label>
                <span className={siteInfo.seoTitle && siteInfo.seoTitle.length > 60 ? 'text-red-500' : 'text-gray-500'}>{siteInfo.seoTitle?.length || 0}/60</span>
              </div>
              <Input value={siteInfo.seoTitle || ''} onChange={e => setSiteInfo({ ...siteInfo, seoTitle: e.target.value })} placeholder="Titolo per i motori di ricerca" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Meta Description</Label>
                <span className={siteInfo.seoDescription && siteInfo.seoDescription.length > 160 ? 'text-red-500' : 'text-gray-500'}>{siteInfo.seoDescription?.length || 0}/160</span>
              </div>
              <Textarea value={siteInfo.seoDescription || ''} onChange={e => setSiteInfo({ ...siteInfo, seoDescription: e.target.value })} placeholder="Descrizione per i motori di ricerca" rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Keywords</Label>
              <Input value={siteInfo.seoKeywords || ''} onChange={e => setSiteInfo({ ...siteInfo, seoKeywords: e.target.value })} placeholder="keyword1, keyword2, ..." />
            </div>
            <div className="space-y-2">
              <Label>Robots</Label>
              <Input value={siteInfo.seoRobots || ''} onChange={e => setSiteInfo({ ...siteInfo, seoRobots: e.target.value })} placeholder="index, follow" />
            </div>
            <div className="space-y-2">
              <Label>Canonical URL</Label>
              <Input value={siteInfo.seoCanonical || ''} onChange={e => setSiteInfo({ ...siteInfo, seoCanonical: e.target.value })} placeholder="https://www.ristorante.it" />
            </div>
            <Button onClick={() => save(siteInfo)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva SEO'}
            </Button>
          </div>
        </TabsContent>

        {/* ── Social OG ── */}
        <TabsContent value="social">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>OG Title</Label>
              <Input value={siteInfo.seoOgTitle || ''} onChange={e => setSiteInfo({ ...siteInfo, seoOgTitle: e.target.value })} placeholder="Titolo per la condivisione social" />
            </div>
            <div className="space-y-2">
              <Label>OG Description</Label>
              <Textarea value={siteInfo.seoOgDescription || ''} onChange={e => setSiteInfo({ ...siteInfo, seoOgDescription: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>OG Image URL</Label>
              <Input value={siteInfo.seoOgImage || ''} onChange={e => setSiteInfo({ ...siteInfo, seoOgImage: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Twitter Card Type</Label>
              <Select value={siteInfo.seoTwitterCard || 'summary_large_image'} onValueChange={v => setSiteInfo({ ...siteInfo, seoTwitterCard: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">summary</SelectItem>
                  <SelectItem value="summary_large_image">summary_large_image</SelectItem>
                  <SelectItem value="app">app</SelectItem>
                  <SelectItem value="player">player</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => save(siteInfo)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Social'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
