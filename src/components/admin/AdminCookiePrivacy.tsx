'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, ShieldCheck, FileText, ScrollText, Cookie, Globe, ExternalLink } from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';

interface CookiePrivacyData {
  id?: string;
  // Cookie
  cookiesEnabled: boolean;
  showCookieBanner: boolean;
  cookieBannerText: string | null;
  cookieAcceptText: string | null;
  cookieDeclineText: string | null;
  cookieTecnici: boolean;
  cookieAnalitici: boolean;
  cookieMarketing: boolean;
  cookiesPolicy: string | null;
  cookiesPolicyUpdate: string | null;
  cookiesUrl: string | null;
  // Privacy
  privacyEnabled: boolean;
  privacyPolicy: string | null;
  privacyPolicyUpdate: string | null;
  privacyUrl: string | null;
  // Termini
  terminiServizio: string | null;
  terminiUrl: string | null;
  // DPO
  dpoNome: string | null;
  dpoEmail: string | null;
  dpoIndirizzo: string | null;
  // Script
  thirdPartyScriptsEnabled: boolean;
  googleAnalyticsId: string | null;
  facebookPixelId: string | null;
  amazonTagId: string | null;
  adSenseId: string | null;
  adSenseSlotHorizontal: string | null;
  adSenseSlotRectangle: string | null;
  adSenseSlotTop: string | null;
  adSenseSlotInline: string | null;
}

const defaults: CookiePrivacyData = {
  cookiesEnabled: true,
  showCookieBanner: true,
  cookieBannerText: null,
  cookieAcceptText: 'Autorizzo',
  cookieDeclineText: 'Annulla',
  cookieTecnici: true,
  cookieAnalitici: true,
  cookieMarketing: true,
  cookiesPolicy: null,
  cookiesPolicyUpdate: null,
  cookiesUrl: null,
  privacyEnabled: true,
  privacyPolicy: null,
  privacyPolicyUpdate: null,
  privacyUrl: null,
  terminiServizio: null,
  terminiUrl: null,
  dpoNome: null,
  dpoEmail: null,
  dpoIndirizzo: null,
  thirdPartyScriptsEnabled: true,
  googleAnalyticsId: null,
  facebookPixelId: null,
  amazonTagId: null,
  adSenseId: null,
  adSenseSlotHorizontal: null,
  adSenseSlotRectangle: null,
  adSenseSlotTop: null,
  adSenseSlotInline: null,
};

export default function AdminCookiePrivacy() {
  const [data, setData] = useState<CookiePrivacyData>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/company-data');
      const json = await res.json();
      setData({ ...defaults, ...json });
    } catch {
      toast.error('Errore nel caricamento');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const save = async (updates: Partial<CookiePrivacyData>) => {
    setSaving(true);
    try {
      const res = await adminFetch('/api/admin/company-data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, ...updates }),
      });
      if (!res.ok) { toast.error('Errore nel salvataggio'); return; }
      const json = await res.json();
      setData({ ...defaults, ...json });
      toast.success('Salvato con successo');
    } catch { toast.error('Errore di rete'); }
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse p-6">Caricamento...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <ShieldCheck className="h-6 w-6" /> Cookie, Privacy e Dati
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Gestisci banner cookie, privacy policy, termini di servizio, DPO e script di terze parti.
      </p>

      <Tabs defaultValue="cookie">
        <TabsList className="mb-6">
          <TabsTrigger value="cookie" className="flex items-center gap-1.5"><Cookie className="h-3.5 w-3.5" /> Cookie</TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Privacy</TabsTrigger>
          <TabsTrigger value="termini" className="flex items-center gap-1.5"><ScrollText className="h-3.5 w-3.5" /> Termini</TabsTrigger>
          <TabsTrigger value="dpo" className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> DPO</TabsTrigger>
          <TabsTrigger value="script" className="flex items-center gap-1.5"><ExternalLink className="h-3.5 w-3.5" /> Script</TabsTrigger>
        </TabsList>

        {/* ── Cookie ── */}
        <TabsContent value="cookie">
          <div className="space-y-6">
            {/* Banner */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Banner Cookie</CardTitle>
                <CardDescription>Configura il banner di consenso cookie mostrato ai visitatori</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Switch checked={data.showCookieBanner} onCheckedChange={v => setData({ ...data, showCookieBanner: v })} />
                  <Label>Mostra Banner Cookie</Label>
                </div>
                <div className="space-y-2">
                  <Label>Testo Banner</Label>
                  <Textarea value={data.cookieBannerText || ''} onChange={e => setData({ ...data, cookieBannerText: e.target.value })} rows={3} placeholder="Questo sito utilizza cookie tecnici e analitici..." />
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
              </CardContent>
            </Card>

            {/* Tipi Cookie */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tipi di Cookie</CardTitle>
                <CardDescription>Attiva o disattiva le categorie di cookie raccolti</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Switch checked={data.cookieTecnici} onCheckedChange={v => setData({ ...data, cookieTecnici: v })} disabled />
                  <Label>Cookie Tecnici (necessari)</Label>
                  <span className="text-xs text-gray-400 ml-auto">Sempre attivi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={data.cookieAnalitici} onCheckedChange={v => setData({ ...data, cookieAnalitici: v })} />
                  <Label>Cookie Analitici</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={data.cookieMarketing} onCheckedChange={v => setData({ ...data, cookieMarketing: v })} />
                  <Label>Cookie Marketing</Label>
                </div>
              </CardContent>
            </Card>

            {/* Cookie Policy */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Cookie Policy</CardTitle>
                <CardDescription>Testo della cookie policy e URL della pagina dedicata</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Switch checked={data.cookiesEnabled} onCheckedChange={v => setData({ ...data, cookiesEnabled: v })} />
                  <Label>Cookie Policy Attiva</Label>
                </div>
                <div className="space-y-2">
                  <Label>Cookie Policy (HTML)</Label>
                  <Textarea value={data.cookiesPolicy || ''} onChange={e => setData({ ...data, cookiesPolicy: e.target.value })} rows={6} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>URL Pagina Cookie</Label>
                    <Input value={data.cookiesUrl || ''} onChange={e => setData({ ...data, cookiesUrl: e.target.value })} placeholder="/cookie-policy" />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Aggiornamento</Label>
                    <Input value={data.cookiesPolicyUpdate ? new Date(data.cookiesPolicyUpdate).toLocaleDateString('it-IT') : ''} disabled placeholder="Aggiornato automaticamente" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={() => save(data)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Impostazioni Cookie'}
            </Button>
          </div>
        </TabsContent>

        {/* ── Privacy ── */}
        <TabsContent value="privacy">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Privacy Policy (GDPR)</CardTitle>
                <CardDescription>Informativa sulla privacy dei visitatori e dei dati raccolti</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Switch checked={data.privacyEnabled} onCheckedChange={v => setData({ ...data, privacyEnabled: v })} />
                  <Label>Privacy Policy Attiva</Label>
                </div>
                <div className="space-y-2">
                  <Label>Privacy Policy (HTML)</Label>
                  <Textarea value={data.privacyPolicy || ''} onChange={e => setData({ ...data, privacyPolicy: e.target.value })} rows={12} placeholder="Inserisci l'informativa sulla privacy..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>URL Pagina Privacy</Label>
                    <Input value={data.privacyUrl || ''} onChange={e => setData({ ...data, privacyUrl: e.target.value })} placeholder="/privacy-policy" />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Aggiornamento</Label>
                    <Input value={data.privacyPolicyUpdate ? new Date(data.privacyPolicyUpdate).toLocaleDateString('it-IT') : ''} disabled placeholder="Aggiornato automaticamente" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={() => save(data)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Privacy Policy'}
            </Button>
          </div>
        </TabsContent>

        {/* ── Termini ── */}
        <TabsContent value="termini">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Termini di Servizio</CardTitle>
                <CardDescription>Condizioni d'uso del sito web</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Termini di Servizio (HTML)</Label>
                  <Textarea value={data.terminiServizio || ''} onChange={e => setData({ ...data, terminiServizio: e.target.value })} rows={12} placeholder="Inserisci i termini e condizioni..." />
                </div>
                <div className="space-y-2">
                  <Label>URL Pagina Termini</Label>
                  <Input value={data.terminiUrl || ''} onChange={e => setData({ ...data, terminiUrl: e.target.value })} placeholder="/termini-servizio" />
                </div>
              </CardContent>
            </Card>

            <Button onClick={() => save(data)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Termini di Servizio'}
            </Button>
          </div>
        </TabsContent>

        {/* ── DPO ── */}
        <TabsContent value="dpo">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Data Protection Officer</CardTitle>
                <CardDescription>Responsabile della protezione dei dati (Art. 37 GDPR)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome DPO</Label>
                  <Input value={data.dpoNome || ''} onChange={e => setData({ ...data, dpoNome: e.target.value })} placeholder="Nome Cognome o Ragione Sociale" />
                </div>
                <div className="space-y-2">
                  <Label>Email DPO</Label>
                  <Input value={data.dpoEmail || ''} onChange={e => setData({ ...data, dpoEmail: e.target.value })} placeholder="dpo@esempio.it" />
                </div>
                <div className="space-y-2">
                  <Label>Indirizzo DPO</Label>
                  <Input value={data.dpoIndirizzo || ''} onChange={e => setData({ ...data, dpoIndirizzo: e.target.value })} placeholder="Via/Piazza, Città (CAP) - Provincia" />
                </div>
              </CardContent>
            </Card>

            <Button onClick={() => save(data)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva DPO'}
            </Button>
          </div>
        </TabsContent>

        {/* ── Script ── */}
        <TabsContent value="script">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Script di Terze Parti</CardTitle>
                <CardDescription>Analytics, pixel e integrazioni esterne</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Slot Orizzontale</Label>
                      <Input value={data.adSenseSlotHorizontal || ''} onChange={e => setData({ ...data, adSenseSlotHorizontal: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Slot Rettangolo</Label>
                      <Input value={data.adSenseSlotRectangle || ''} onChange={e => setData({ ...data, adSenseSlotRectangle: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Slot Top</Label>
                      <Input value={data.adSenseSlotTop || ''} onChange={e => setData({ ...data, adSenseSlotTop: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Slot Inline</Label>
                      <Input value={data.adSenseSlotInline || ''} onChange={e => setData({ ...data, adSenseSlotInline: e.target.value })} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={() => save(data)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Script'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}