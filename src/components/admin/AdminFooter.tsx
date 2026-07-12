'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, MapPin, AlertCircle } from 'lucide-react';

interface FooterInfoData {
  id: string;
  indirizzo: string | null;
  telefono: string | null;
  citta: string | null;
  cap: string | null;
  provincia: string | null;
  latitudine: number | null;
  longitudine: number | null;
  orariApertura: string | null;
  giorniChiusura: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  whatsappUrl: string | null;
  tiktokUrl: string | null;
  justeatUrl: string | null;
  deliverooUrl: string | null;
  glovoUrl: string | null;
  ubereatsUrl: string | null;
  [key: string]: string | number | null | undefined;
}

export default function AdminFooter() {
  const [footer, setFooter] = useState<FooterInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch('/api/footer-info');
      if (res.ok) {
        const data = await res.json();
        setFooter(data);
      } else {
        setLoadError(true);
        toast.error('Errore nel caricamento');
      }
    } catch {
      setLoadError(true);
      toast.error('Errore nel caricamento');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const set = (key: string, value: string) => {
    if (!footer) return;
    if (key === 'latitudine' || key === 'longitudine') {
      setFooter({ ...footer, [key]: value ? parseFloat(value) : null });
    } else {
      setFooter({ ...footer, [key]: value });
    }
  };

  const save = async () => {
    if (!footer) return;
    setSaving(true);
    try {
      const res = await fetch('/api/footer-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(footer),
      });
      if (!res.ok) { toast.error('Errore nel salvataggio'); return; }
      setFooter(await res.json());
      toast.success('Footer salvato con successo');
    } catch {
      toast.error('Errore nel salvataggio');
    }
    finally { setSaving(false); }
  };

  if (loading) return <div className="animate-pulse p-6">Caricamento...</div>;

  if (loadError || !footer) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Impossibile caricare i dati del footer</h3>
        <p className="text-sm text-gray-500 mb-4">Verifica la connessione al database e riprova.</p>
        <Button onClick={fetchData} variant="outline">Riprova</Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Gestione Footer</h2>
      <Tabs defaultValue="indirizzo">
        <TabsList className="mb-6">
          <TabsTrigger value="indirizzo">Indirizzo</TabsTrigger>
          <TabsTrigger value="orari">Orari</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>

        {/* ── Indirizzo ── */}
        <TabsContent value="indirizzo">
          <div className="space-y-4 max-w-lg">
            <div className="space-y-2">
              <Label>Indirizzo</Label>
              <Input
                value={footer.indirizzo || ''}
                onChange={(e) => set('indirizzo', e.target.value)}
                placeholder="Via Roma 42"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>CAP</Label>
                <Input
                  value={footer.cap || ''}
                  onChange={(e) => set('cap', e.target.value)}
                  placeholder="00100"
                />
              </div>
              <div className="space-y-2">
                <Label>Citta</Label>
                <Input
                  value={footer.citta || ''}
                  onChange={(e) => set('citta', e.target.value)}
                  placeholder="Roma"
                />
              </div>
              <div className="space-y-2">
                <Label>Provincia</Label>
                <Input
                  value={footer.provincia || ''}
                  onChange={(e) => set('provincia', e.target.value)}
                  placeholder="RM"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Telefono</Label>
              <Input
                value={footer.telefono || ''}
                onChange={(e) => set('telefono', e.target.value)}
                placeholder="+39 02 1234 5678"
              />
            </div>

            {/* Map preview */}
            {footer.indirizzo && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Anteprima Mappa</Label>
                <div className="rounded-xl overflow-hidden border h-48">
                  <iframe
                    title="Anteprima mappa"
                    src={`https://www.google.com/maps?q=${encodeURIComponent([footer.indirizzo, footer.cap, footer.citta, footer.provincia].filter(Boolean).join(', '))}&z=16&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  La mappa nel footer viene generata automaticamente dall&apos;indirizzo. Se la posizione non e precisa, inserisci le coordinate qui sotto.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Latitudine (opzionale)</Label>
                <Input
                  type="number"
                  step="any"
                  value={footer.latitudine ?? ''}
                  onChange={(e) => set('latitudine', e.target.value)}
                  placeholder="41.9028"
                />
              </div>
              <div className="space-y-2">
                <Label>Longitudine (opzionale)</Label>
                <Input
                  type="number"
                  step="any"
                  value={footer.longitudine ?? ''}
                  onChange={(e) => set('longitudine', e.target.value)}
                  placeholder="12.4964"
                />
              </div>
            </div>

            <Button onClick={save} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Indirizzo'}
            </Button>
          </div>
        </TabsContent>

        {/* ── Orari ── */}
        <TabsContent value="orari">
          <div className="space-y-4 max-w-lg">
            <div className="space-y-2">
              <Label>Testo Orari</Label>
              <Textarea
                value={footer.orariApertura || ''}
                onChange={(e) => set('orariApertura', e.target.value)}
                rows={4}
                placeholder={"Mercoledì - Domenica\n11:00 - 15:00\n18:00 - 22:00"}
              />
              <p className="text-xs text-muted-foreground">Questo testo viene mostrato direttamente nel footer.</p>
            </div>
            <div className="space-y-2">
              <Label>Nota Chiusura / Info</Label>
              <Textarea
                value={footer.giorniChiusura || ''}
                onChange={(e) => set('giorniChiusura', e.target.value)}
                rows={3}
                placeholder="Chiuso il lunedì e il martedì. Per gruppi superiori a 10 persone, contattaci direttamente."
              />
              <p className="text-xs text-muted-foreground">Appare come nota in basso nel footer.</p>
            </div>
            <Button onClick={save} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Orari'}
            </Button>
          </div>
        </TabsContent>

        {/* ── Social ── */}
        <TabsContent value="social">
          <div className="space-y-4 max-w-lg">
            {[
              { key: 'facebookUrl', label: 'Facebook' },
              { key: 'instagramUrl', label: 'Instagram' },
              { key: 'twitterUrl', label: 'Twitter / X' },
              { key: 'linkedinUrl', label: 'LinkedIn' },
              { key: 'whatsappUrl', label: 'WhatsApp' },
              { key: 'tiktokUrl', label: 'TikTok' },
            ].map((field) => (
              <div key={field.key} className="space-y-2">
                <Label>{field.label}</Label>
                <Input
                  value={footer[field.key] || ''}
                  onChange={(e) => set(field.key, e.target.value)}
                  placeholder={`https://${field.key.replace('Url', '').toLowerCase()}.com/...`}
                />
              </div>
            ))}
            <Button onClick={save} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Social'}
            </Button>
          </div>
        </TabsContent>

        {/* ── Delivery ── */}
        <TabsContent value="delivery">
          <div className="space-y-4 max-w-lg">
            {[
              { key: 'justeatUrl', label: 'Just Eat' },
              { key: 'deliverooUrl', label: 'Deliveroo' },
              { key: 'glovoUrl', label: 'Glovo' },
              { key: 'ubereatsUrl', label: 'Uber Eats' },
            ].map((field) => (
              <div key={field.key} className="space-y-2">
                <Label>{field.label}</Label>
                <Input
                  value={footer[field.key] || ''}
                  onChange={(e) => set(field.key, e.target.value)}
                  placeholder={`https://${field.key.replace('Url', '').toLowerCase()}.com/...`}
                />
              </div>
            ))}
            <Button onClick={save} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Delivery'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}