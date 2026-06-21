'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save } from 'lucide-react';

interface FooterInfoData {
  id: string; indirizzo: string; telefono: string; email: string;
  facebookUrl: string | null; instagramUrl: string | null; twitterUrl: string | null;
  linkedinUrl: string | null; whatsappUrl: string | null; tiktokUrl: string | null;
  justeatUrl: string | null; deliverooUrl: string | null; glovoUrl: string | null; ubereatsUrl: string | null;
  orariTesto: string | null; giorniChiusura: string | null;
}

export default function AdminFooter() {
  const [footer, setFooter] = useState<FooterInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/footer-info');
      setFooter(await res.json());
    } catch {
      toast.error('Errore nel caricamento');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/footer-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(footer),
      });
      if (!res.ok) { toast.error('Errore'); return; }
      setFooter(await res.json());
      toast.success('Footer salvato con successo');
    } catch { toast.error('Errore'); }
    setSaving(false);
  };

  if (!footer) return <div className="animate-pulse p-6">Caricamento...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">🗺️ Gestione Footer</h2>
      <Tabs defaultValue="indirizzo">
        <TabsList className="mb-6">
          <TabsTrigger value="indirizzo">Indirizzo</TabsTrigger>
          <TabsTrigger value="orari">Orari</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>

        {/* ── Indirizzo ── */}
        <TabsContent value="indirizzo">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Indirizzo</Label>
              <Input value={footer.indirizzo} onChange={e => setFooter({ ...footer, indirizzo: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Città e CAP</Label>
              <Input value={footer.indirizzo} onChange={e => setFooter({ ...footer, indirizzo: e.target.value })} placeholder="Via Roma 42, 00100 Roma (RM)" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefono</Label>
                <Input value={footer.telefono} onChange={e => setFooter({ ...footer, telefono: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={footer.email} onChange={e => setFooter({ ...footer, email: e.target.value })} />
              </div>
            </div>
            <Button onClick={save} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Indirizzo'}
            </Button>
          </div>
        </TabsContent>

        {/* ── Orari ── */}
        <TabsContent value="orari">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Testo Orari</Label>
              <Textarea value={footer.orariTesto || ''} onChange={e => setFooter({ ...footer, orariTesto: e.target.value })} rows={4} placeholder="Mar-Dom: 12:00-14:30, 19:00-23:00" />
            </div>
            <div className="space-y-2">
              <Label>Giorni di Chiusura</Label>
              <Input value={footer.giorniChiusura || ''} onChange={e => setFooter({ ...footer, giorniChiusura: e.target.value })} placeholder="Lunedì" />
            </div>
            <Button onClick={save} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Orari'}
            </Button>
          </div>
        </TabsContent>

        {/* ── Social ── */}
        <TabsContent value="social">
          <div className="space-y-4">
            {[
              { key: 'facebookUrl' as const, label: 'Facebook' },
              { key: 'instagramUrl' as const, label: 'Instagram' },
              { key: 'twitterUrl' as const, label: 'Twitter / X' },
              { key: 'linkedinUrl' as const, label: 'LinkedIn' },
              { key: 'whatsappUrl' as const, label: 'WhatsApp' },
              { key: 'tiktokUrl' as const, label: 'TikTok' },
            ].map(field => (
              <div key={field.key} className="space-y-2">
                <Label>{field.label}</Label>
                <Input value={footer[field.key] || ''} onChange={e => setFooter({ ...footer, [field.key]: e.target.value })} placeholder={`https://${field.key.replace('Url', '').toLowerCase()}.com/...`} />
              </div>
            ))}
            <Button onClick={save} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Social'}
            </Button>
          </div>
        </TabsContent>

        {/* ── Delivery ── */}
        <TabsContent value="delivery">
          <div className="space-y-4">
            {[
              { key: 'justeatUrl' as const, label: 'JustEat' },
              { key: 'deliverooUrl' as const, label: 'Deliveroo' },
              { key: 'glovoUrl' as const, label: 'Glovo' },
              { key: 'ubereatsUrl' as const, label: 'Uber Eats' },
            ].map(field => (
              <div key={field.key} className="space-y-2">
                <Label>{field.label}</Label>
                <Input value={footer[field.key] || ''} onChange={e => setFooter({ ...footer, [field.key]: e.target.value })} placeholder={`https://${field.key.replace('Url', '').toLowerCase()}.com/...`} />
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
