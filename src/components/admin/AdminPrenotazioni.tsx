'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Trash2, CalendarDays, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Prenotazione {
  id: string; nome: string; cognome: string; email: string; telefono: string;
  data: string; ora: string; persone: number; note: string | null; stato: string;
  eventoId: string | null; evento: { titolo: string } | null; createdAt: string;
}

export default function AdminPrenotazioni() {
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/prenotazioni');
      setPrenotazioni(await res.json());
    } catch {
      toast.error('Errore nel caricamento');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStato = async (id: string, stato: string) => {
    try {
      const res = await fetch('/api/admin/prenotazioni', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stato }),
      });
      if (!res.ok) { toast.error('Errore'); return; }
      toast.success('Stato aggiornato');
      fetchData();
    } catch { toast.error('Errore'); }
  };

  const deletePrenotazione = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/prenotazioni?id=${id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Errore'); return; }
      toast.success('Prenotazione eliminata');
      fetchData();
    } catch { toast.error('Errore'); }
  };

  const stats = {
    totali: prenotazioni.length,
    inAttesa: prenotazioni.filter(p => p.stato === 'pending').length,
    Confermate: prenotazioni.filter(p => p.stato === 'confirmed').length,
    Rifiutate: prenotazioni.filter(p => p.stato === 'cancelled').length,
  };

  const statoColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    confirmed: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
    completed: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  const statoLabels: Record<string, string> = {
    pending: 'In Attesa',
    confirmed: 'Confermata',
    cancelled: 'Rifiutata',
    completed: 'Completata',
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">📅 Prenotazioni</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg border p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg"><CalendarDays className="h-5 w-5 text-blue-600" /></div>
          <div><p className="text-sm text-gray-500">Totali</p><p className="text-xl font-bold">{stats.totali}</p></div>
        </div>
        <div className="rounded-lg border p-4 flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg"><AlertCircle className="h-5 w-5 text-yellow-600" /></div>
          <div><p className="text-sm text-gray-500">In Attesa</p><p className="text-xl font-bold">{stats.inAttesa}</p></div>
        </div>
        <div className="rounded-lg border p-4 flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="h-5 w-5 text-green-600" /></div>
          <div><p className="text-sm text-gray-500">Confermate</p><p className="text-xl font-bold">{stats.Confermate}</p></div>
        </div>
        <div className="rounded-lg border p-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg"><XCircle className="h-5 w-5 text-red-600" /></div>
          <div><p className="text-sm text-gray-500">Rifiutate</p><p className="text-xl font-bold">{stats.Rifiutate}</p></div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden max-h-[500px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Ora</TableHead>
              <TableHead>Persone</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prenotazioni.map(p => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="font-medium">{p.nome} {p.cognome}</div>
                  <div className="text-xs text-gray-500">{p.email} · {p.telefono}</div>
                </TableCell>
                <TableCell>{p.data}</TableCell>
                <TableCell>{p.ora}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1"><Users className="h-3 w-3" />{p.persone}</div>
                </TableCell>
                <TableCell>{p.evento?.titolo || '—'}</TableCell>
                <TableCell>
                  <Select value={p.stato} onValueChange={v => updateStato(p.id, v)}>
                    <SelectTrigger className={`w-32 text-xs ${statoColors[p.stato] || ''}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">In Attesa</SelectItem>
                      <SelectItem value="confirmed">Confermata</SelectItem>
                      <SelectItem value="completed">Completata</SelectItem>
                      <SelectItem value="cancelled">Rifiutata</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => deletePrenotazione(p.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
