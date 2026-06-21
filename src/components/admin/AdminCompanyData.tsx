'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save } from 'lucide-react';

interface CompanyDataFull {
  id?: string;
  ragioneSociale: string | null; partitaIva: string | null; codiceFiscale: string | null;
  indirizzo: string | null; citta: string | null; cap: string | null; provincia: string | null; paese: string | null;
  telefono: string | null; email: string | null; pec: string | null;
  dpoNome: string | null; dpoEmail: string | null; dpoIndirizzo: string | null;
  privacyPolicy: string | null; privacyEnabled: boolean;
  cookiesPolicy: string | null; cookiesEnabled: boolean;
  cookieTecnici: boolean; cookieAnalitici: boolean; cookieMarketing: boolean;
  showCookieBanner: boolean; cookieBannerText: string | null;
  cookieAcceptText: string | null; cookieDeclineText: string | null;
  terminiServizio: string | null;
  thirdPartyScriptsEnabled: boolean;
  googleAnalyticsId: string | null; facebookPixelId: string | null; amazonTagId: string | null;
  adSenseId: string | null; adSenseSlotHorizontal: string | null; adSenseSlotRectangle: string | null;
  adSenseSlotTop: string | null; adSenseSlotInline: string | null;
}

interface AdminCompanyDataProps {
  initialTab?: string;
}

const defaultCompanyData: CompanyDataFull = {
  ragioneSociale: null, partitaIva: null, codiceFiscale: null, indirizzo: null, citta: null,
  cap: null, provincia: null, paese: null, telefono: null, email: null, pec: null,
  dpoNome: null, dpoEmail: null, dpoIndirizzo: null,
  privacyPolicy: null, privacyEnabled: true, cookiesPolicy: null, cookiesEnabled: true,
  cookieTecnici: true, cookieAnalitici: true, cookieMarketing: true,
  showCookieBanner: true, cookieBannerText: null, cookieAcceptText: 'Autorizzo', cookieDeclineText: 'Annulla',
  terminiServizio: null, thirdPartyScriptsEnabled: true,
  googleAnalyticsId: null, facebookPixelId: null, amazonTagId: null,
  adSenseId: null, adSenseSlotHorizontal: null, adSenseSlotRectangle: null,
  adSenseSlotTop: null, adSenseSlotInline: null,
};

export default function AdminCompanyData({ initialTab = 'azienda' }: AdminCompanyDataProps) {
  const [data, setData] = useState<CompanyDataFull>(defaultCompanyData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/company-data');
      const json = await res.json();
      setData({ ...defaultCompanyData, ...json });
    } catch {
      toast.error('Errore nel caricamento');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const save = async (updates: Partial<CompanyDataFull>) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/company-data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, ...updates }),
      });
      if (!res.ok) { toast.error('Errore'); return; }
      const json = await res.json();
      setData({ ...defaultCompanyData, ...json });
      toast.success('Salvato con successo');
    } catch { toast.error('Errore'); }
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse p-6">Caricamento...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">🏢 Dati Azienda</h2>
      <Tabs defaultValue={initialTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="azienda">Azienda</TabsTrigger>
          <TabsTrigger value="dpo">DPO</TabsTrigger>
          <TabsTrigger value="cookie">Cookie</TabsTrigger>
          <TabsTrigger value="script">Script</TabsTrigger>
        </TabsList>

        {/* ── Azienda ── */}
        <TabsContent value="azienda">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ragione Sociale</Label>
                <Input value={data.ragioneSociale || ''} onChange={e => setData({ ...data, ragioneSociale: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Partita IVA</Label>
                <Input value={data.partitaIva || ''} onChange={e => setData({ ...data, partitaIva: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Codice Fiscale</Label>
                <Input value={data.codiceFiscale || ''} onChange={e => setData({ ...data, codiceFiscale: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>PEC</Label>
                <Input value={data.pec || ''} onChange={e => setData({ ...data, pec: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Indirizzo</Label>
              <Input value={data.indirizzo || ''} onChange={e => setData({ ...data, indirizzo: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Città</Label>
                <Input value={data.citta || ''} onChange={e => setData({ ...data, citta: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>CAP</Label>
                <Input value={data.cap || ''} onChange={e => setData({ ...data, cap: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provincia</Label>
                <Input value={data.provincia || ''} onChange={e => setData({ ...data, provincia: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Paese</Label>
                <Input value={data.paese || ''} onChange={e => setData({ ...data, paese: e.target.value })} placeholder="Italia" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefono</Label>
                <Input value={data.telefono || ''} onChange={e => setData({ ...data, telefono: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={data.email || ''} onChange={e => setData({ ...data, email: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={data.privacyEnabled} onCheckedChange={v => setData({ ...data, privacyEnabled: v })} />
              <Label>Privacy Policy Attiva</Label>
            </div>
            <div className="space-y-2">
              <Label>Privacy Policy (HTML)</Label>
              <Textarea value={data.privacyPolicy || ''} onChange={e => setData({ ...data, privacyPolicy: e.target.value })} rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Termini di Servizio (HTML)</Label>
              <Textarea value={data.terminiServizio || ''} onChange={e => setData({ ...data, terminiServizio: e.target.value })} rows={4} />
            </div>
            <Button onClick={() => save(data)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Dati Azienda'}
            </Button>
          </div>
        </TabsContent>

        {/* ── DPO ── */}
        <TabsContent value="dpo">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome DPO</Label>
              <Input value={data.dpoNome || ''} onChange={e => setData({ ...data, dpoNome: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email DPO</Label>
              <Input value={data.dpoEmail || ''} onChange={e => setData({ ...data, dpoEmail: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Indirizzo DPO</Label>
              <Input value={data.dpoIndirizzo || ''} onChange={e => setData({ ...data, dpoIndirizzo: e.target.value })} />
            </div>
            <Button onClick={() => save(data)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva DPO'}
            </Button>
          </div>
        </TabsContent>

        {/* ── Cookie ── */}
        <TabsContent value="cookie">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch checked={data.showCookieBanner} onCheckedChange={v => setData({ ...data, showCookieBanner: v })} />
              <Label>Mostra Banner Cookie</Label>
            </div>
            <div className="space-y-2">
              <Label>Testo Banner</Label>
              <Textarea value={data.cookieBannerText || ''} onChange={e => setData({ ...data, cookieBannerText: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Testo Accetta</Label>
                <Input value={data.cookieAcceptText || ''} onChange={e => setData({ ...data, cookieAcceptText: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Testo Rifiuta</Label>
                <Input value={data.cookieDeclineText || ''} onChange={e => setData({ ...data, cookieDeclineText: e.target.value })} />
              </div>
            </div>
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold">Tipi di Cookie</h4>
              <div className="flex items-center gap-2">
                <Switch checked={data.cookieTecnici} onCheckedChange={v => setData({ ...data, cookieTecnici: v })} />
                <Label>Cookie Tecnici (necessari)</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={data.cookieAnalitici} onCheckedChange={v => setData({ ...data, cookieAnalitici: v })} />
                <Label>Cookie Analitici</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={data.cookieMarketing} onCheckedChange={v => setData({ ...data, cookieMarketing: v })} />
                <Label>Cookie Marketing</Label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={data.cookiesEnabled} onCheckedChange={v => setData({ ...data, cookiesEnabled: v })} />
              <Label>Cookie Policy Attiva</Label>
            </div>
            <div className="space-y-2">
              <Label>Cookie Policy (HTML)</Label>
              <Textarea value={data.cookiesPolicy || ''} onChange={e => setData({ ...data, cookiesPolicy: e.target.value })} rows={4} />
            </div>
            <Button onClick={() => save(data)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Cookie'}
            </Button>
          </div>
        </TabsContent>

        {/* ── Script ── */}
        <TabsContent value="script">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch checked={data.thirdPartyScriptsEnabled} onCheckedChange={v => setData({ ...data, thirdPartyScriptsEnabled: v })} />
              <Label>Abilita Script di Terze Parti</Label>
            </div>
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-semibold">Analytics & Tracking</h4>
              <div className="space-y-2">
                <Label>Google Analytics 4 (Measurement ID)</Label>
                <Input value={data.googleAnalyticsId || ''} onChange={e => setData({ ...data, googleAnalyticsId: e.target.value })} placeholder="G-XXXXXXXXXX" />
              </div>
              <div className="space-y-2">
                <Label>Facebook Pixel ID</Label>
                <Input value={data.facebookPixelId || ''} onChange={e => setData({ ...data, facebookPixelId: e.target.value })} placeholder="123456789" />
              </div>
              <div className="space-y-2">
                <Label>Amazon Tag ID</Label>
                <Input value={data.amazonTagId || ''} onChange={e => setData({ ...data, amazonTagId: e.target.value })} placeholder="rest-123456-1234567" />
              </div>
            </div>
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-semibold">Google AdSense</h4>
              <div className="space-y-2">
                <Label>AdSense Publisher ID</Label>
                <Input value={data.adSenseId || ''} onChange={e => setData({ ...data, adSenseId: e.target.value })} placeholder="ca-pub-123456789" />
              </div>
              <div className="space-y-2">
                <Label>Slot Orizzontale</Label>
                <Input value={data.adSenseSlotHorizontal || ''} onChange={e => setData({ ...data, adSenseSlotHorizontal: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Slot Rettangolo</Label>
                <Input value={data.adSenseSlotRectangle || ''} onChange={e => setData({ ...data, adSenseSlotRectangle: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Slot Top</Label>
                <Input value={data.adSenseSlotTop || ''} onChange={e => setData({ ...data, adSenseSlotTop: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Slot Inline</Label>
                <Input value={data.adSenseSlotInline || ''} onChange={e => setData({ ...data, adSenseSlotInline: e.target.value })} />
              </div>
            </div>
            <Button onClick={() => save(data)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Script'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
