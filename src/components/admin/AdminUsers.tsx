'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Shield, Save } from 'lucide-react';

interface Permesso {
  puoGestireMenu: boolean;
  puoGestireFooter: boolean;
  puoGestireTemi: boolean;
  puoGestirePrenotazioni: boolean;
  puoGestireDatiAzienda: boolean;
  puoGestireProfili: boolean;
  puoGestireAnalytics: boolean;
  puoGestireSito: boolean;
  puoGestireEventi: boolean;
  puoGestireCookiePrivacy: boolean;
  puoGestireBanners: boolean;
  puoGestireMultilingua: boolean;
}

interface UserRecord {
  id: string; email: string; nome: string; cognome: string | null; ruolo: string; Permission: Permesso | null;
}

const PERM_LABELS: Record<keyof Permesso, string> = {
  puoGestireMenu: 'Menu',
  puoGestireFooter: 'Footer',
  puoGestireTemi: 'Temi',
  puoGestirePrenotazioni: 'Prenotazioni',
  puoGestireDatiAzienda: 'Dati Azienda',
  puoGestireProfili: 'Profili Utenti',
  puoGestireAnalytics: 'Analytics',
  puoGestireSito: 'Info Sito',
  puoGestireEventi: 'Eventi',
  puoGestireCookiePrivacy: 'Cookie & Privacy',
  puoGestireBanners: 'Banner Pubblicitari',
  puoGestireMultilingua: 'Multilingua',
};

const PERM_KEYS = Object.keys(PERM_LABELS) as (keyof Permesso)[];

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UserRecord | null>(null);
  const [form, setForm] = useState({
    nome: '', cognome: '', email: '', password: '', ruolo: 'admin',
    permessi: {
      puoGestireMenu: true, puoGestireFooter: true, puoGestireTemi: true,
      puoGestirePrenotazioni: true, puoGestireDatiAzienda: true, puoGestireProfili: false,
      puoGestireAnalytics: true, puoGestireSito: true, puoGestireEventi: true,
      puoGestireCookiePrivacy: true, puoGestireBanners: true, puoGestireMultilingua: true,
    } as Permesso,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) { setUsers([]); return; }
      setUsers(await res.json());
    } catch { setUsers([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDialog = (user?: UserRecord) => {
    if (user) {
      setEditing(user);
      setForm({
        nome: user.nome, cognome: user.cognome || '', email: user.email,
        password: '', ruolo: user.ruolo,
        permessi: user.Permission || {
          puoGestireMenu: true, puoGestireFooter: true, puoGestireTemi: true,
          puoGestirePrenotazioni: true, puoGestireDatiAzienda: true, puoGestireProfili: false,
          puoGestireAnalytics: true, puoGestireSito: true, puoGestireEventi: true,
          puoGestireCookiePrivacy: true, puoGestireBanners: true, puoGestireMultilingua: true,
        },
      });
    } else {
      setEditing(null);
      setForm({
        nome: '', cognome: '', email: '', password: '', ruolo: 'admin',
        permessi: {
          puoGestireMenu: true, puoGestireFooter: true, puoGestireTemi: true,
          puoGestirePrenotazioni: true, puoGestireDatiAzienda: true, puoGestireProfili: false,
          puoGestireAnalytics: true, puoGestireSito: true, puoGestireEventi: true,
          puoGestireCookiePrivacy: true, puoGestireBanners: true, puoGestireMultilingua: true,
        },
      });
    }
    setDialogOpen(true);
  };

  const saveUser = async () => {
    if (!form.nome.trim() || !form.email.trim()) {
      toast.error('Nome e email obbligatori');
      return;
    }
    if (!editing && !form.password.trim()) {
      toast.error('Password obbligatoria per nuovi utenti');
      return;
    }
    try {
      const res = await fetch(editing ? '/api/admin/users' : '/api/admin/users', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing ? { id: editing.id, ...form } : form),
      });
      if (!res.ok) { const data = await res.json(); toast.error(data.error || 'Errore'); return; }
      toast.success(editing ? 'Utente aggiornato' : 'Utente creato');
      setDialogOpen(false);
      fetchData();
    } catch { toast.error('Errore'); }
  };

  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Errore'); return; }
      toast.success('Utente eliminato');
      fetchData();
    } catch { toast.error('Errore'); }
  };

  const togglePerm = (key: keyof Permesso) => {
    setForm(f => ({
      ...f,
      permessi: { ...f.permessi, [key]: !f.permessi[key] },
    }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">👤 Profili Utenti</h2>
        <Button onClick={() => openDialog()}><Plus className="mr-2 h-4 w-4" />Nuovo Utente</Button>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ruolo</TableHead>
              <TableHead>Permessi</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.nome} {user.cognome || ''}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell><Badge variant={user.ruolo === 'superadmin' ? 'default' : 'secondary'}>{user.ruolo}</Badge></TableCell>
                <TableCell>
                  {user.Permission && (
                    <div className="flex flex-wrap gap-1">
                      {PERM_KEYS.filter(k => user.Permission![k]).map(k => (
                        <Badge key={k} variant="outline" className="text-xs">{PERM_LABELS[k]}</Badge>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openDialog(user)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteUser(user.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ─── Dialog ─── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifica Utente' : 'Nuovo Utente'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Cognome</Label>
                <Input value={form.cognome} onChange={e => setForm({ ...form, cognome: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Password {editing ? '(vuota = non cambiare)' : '*'}</Label>
                <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={editing ? '••••••••' : ''} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ruolo</Label>
              <Input value={form.ruolo} onChange={e => setForm({ ...form, ruolo: e.target.value })} />
            </div>

            {/* Permissions */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2"><Shield className="h-4 w-4" />Permessi</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PERM_KEYS.map(key => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={form.permessi[key]}
                      onCheckedChange={() => togglePerm(key)}
                    />
                    <span className="text-sm">{PERM_LABELS[key]}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annulla</Button>
            <Button onClick={saveUser}><Save className="mr-2 h-4 w-4" />Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
