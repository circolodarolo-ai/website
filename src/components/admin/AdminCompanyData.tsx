'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, Building2 } from 'lucide-react';

interface CompanyDataFull {
  id?: string;
  ragioneSociale: string | null; partitaIva: string | null; codiceFiscale: string | null;
  indirizzo: string | null; citta: string | null; cap: string | null; provincia: string | null; paese: string | null;
  telefono: string | null; email: string | null; pec: string | null;
}

const defaults: CompanyDataFull = {
  ragioneSociale: null, partitaIva: null, codiceFiscale: null, indirizzo: null, citta: null,
  cap: null, provincia: null, paese: null, telefono: null, email: null, pec: null,
};

export default function AdminCompanyData() {
  const [data, setData] = useState<CompanyDataFull>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/company-data');
      if (res.ok) {
        const json = await res.json();
        setData({ ...defaults, ...json });
      } else {
        toast.error('Errore nel caricamento');
      }
    } catch {
      toast.error('Errore nel caricamento');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/company-data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) { toast.error('Errore nel salvataggio'); return; }
      const json = await res.json();
      setData({ ...defaults, ...json });
      toast.success('Dati azienda salvati');
    } catch { toast.error('Errore di rete'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="animate-pulse p-6">Caricamento...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <Building2 className="h-6 w-6" /> Dati Azienda
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Informazioni legali e di contatto della tua attivita.
      </p>

      <div className="space-y-6">
        {/* Dati Anagrafici */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dati Anagrafici</CardTitle>
            <CardDescription>Ragione sociale, P.IVA e codice fiscale</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ragione Sociale</Label>
              <Input value={data.ragioneSociale || ''} onChange={e => setData({ ...data, ragioneSociale: e.target.value })} placeholder="Il Mio Ristorante S.r.l." />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Partita IVA</Label>
                <Input value={data.partitaIva || ''} onChange={e => setData({ ...data, partitaIva: e.target.value })} placeholder="IT12345678901" />
              </div>
              <div className="space-y-2">
                <Label>Codice Fiscale</Label>
                <Input value={data.codiceFiscale || ''} onChange={e => setData({ ...data, codiceFiscale: e.target.value })} placeholder="12345678901" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>PEC</Label>
              <Input value={data.pec || ''} onChange={e => setData({ ...data, pec: e.target.value })} placeholder="pec@esempio.it" />
            </div>
          </CardContent>
        </Card>

        {/* Sede */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Sede Operativa</CardTitle>
            <CardDescription>Indirizzo e recapiti dell&apos;attivita</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Indirizzo</Label>
              <Input value={data.indirizzo || ''} onChange={e => setData({ ...data, indirizzo: e.target.value })} placeholder="Via Roma 1" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Citta</Label>
                <Input value={data.citta || ''} onChange={e => setData({ ...data, citta: e.target.value })} placeholder="Roma" />
              </div>
              <div className="space-y-2">
                <Label>CAP</Label>
                <Input value={data.cap || ''} onChange={e => setData({ ...data, cap: e.target.value })} placeholder="00100" />
              </div>
              <div className="space-y-2">
                <Label>Provincia</Label>
                <Input value={data.provincia || ''} onChange={e => setData({ ...data, provincia: e.target.value })} placeholder="RM" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Paese</Label>
              <Input value={data.paese || ''} onChange={e => setData({ ...data, paese: e.target.value })} placeholder="Italia" />
            </div>
          </CardContent>
        </Card>

        {/* Contatti */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Contatti</CardTitle>
            <CardDescription>Telefono e email visibili ai visitatori</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefono</Label>
                <Input value={data.telefono || ''} onChange={e => setData({ ...data, telefono: e.target.value })} placeholder="+39 06 1234567" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={data.email || ''} onChange={e => setData({ ...data, email: e.target.value })} placeholder="info@esempio.it" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={save} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />{saving ? 'Salvataggio...' : 'Salva Dati Azienda'}
        </Button>
      </div>
    </div>
  );
}