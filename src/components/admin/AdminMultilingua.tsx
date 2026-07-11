'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Globe, RefreshCw, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { adminFetch } from '@/lib/admin-fetch';

interface I18nSettings {
  id: string;
  multilinguaAttivo: boolean;
  enAttivo: boolean;
  frAttivo: boolean;
  deAttivo: boolean;
  esAttivo: boolean;
}

interface TranslationStats {
  total: number;
  byLocale: Record<string, number>;
}

const LANGUAGES = [
  { key: 'en' as const, label: 'Inglese', flag: '🇬🇧', nativeLabel: 'English' },
  { key: 'fr' as const, label: 'Francese', flag: '🇫🇷', nativeLabel: 'Français' },
  { key: 'de' as const, label: 'Tedesco', flag: '🇩🇪', nativeLabel: 'Deutsch' },
  { key: 'es' as const, label: 'Spagnolo', flag: '🇪🇸', nativeLabel: 'Español' },
];

export default function AdminMultilingua() {
  const [settings, setSettings] = useState<I18nSettings | null>(null);
  const [stats, setStats] = useState<TranslationStats>({ total: 0, byLocale: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/i18n');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setStats(data.stats || { total: 0, byLocale: {} });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleToggle = async (field: keyof I18nSettings) => {
    if (!settings) return;
    const newValue = !settings[field];
    const updated = { ...settings, [field]: newValue };

    // Se si disattiva il multilingua, disattiva anche tutte le lingue
    if (field === 'multilinguaAttivo' && !newValue) {
      updated.enAttivo = false;
      updated.frAttivo = false;
      updated.deAttivo = false;
      updated.esAttivo = false;
    }

    setSettings(updated);
    setSaving(true);
    try {
      const res = await adminFetch('/api/admin/i18n', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        toast.success('Impostazioni salvate');
        fetchSettings();
      } else {
        toast.error('Errore nel salvataggio');
        setSettings(settings); // rollback
      }
    } catch {
      toast.error('Errore di connessione');
      setSettings(settings); // rollback
    } finally {
      setSaving(false);
    }
  };

  const handleTranslateAll = async (locale: string) => {
    setTranslating(locale);
    try {
      const res = await adminFetch('/api/admin/i18n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'translate-all', locale }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Traduzione completata: ${data.result.translated} testi tradotti, ${data.result.errors} errori`);
        fetchSettings();
      } else {
        toast.error('Errore nella traduzione');
      }
    } catch {
      toast.error('Errore di connessione');
    } finally {
      setTranslating(null);
    }
  };

  const handleClearCache = async () => {
    setClearing(true);
    try {
      const res = await adminFetch('/api/admin/i18n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear-cache' }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Cache cancellata: ${data.deleted} traduzioni rimosse`);
        fetchSettings();
      }
    } catch {
      toast.error('Errore');
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!settings) {
    return <p className="text-gray-500 p-6">Impossibile caricare le impostazioni.</p>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Intestazione */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="h-6 w-6" />
          Multilingua
        </h2>
        <p className="text-gray-500 mt-1">
          Attiva il sito multilingua per i tuoi visitatori. Le traduzioni vengono generate automaticamente e messe in cache.
        </p>
      </div>

      {/* Switch principale */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sito multilingua</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Attiva sito multilingua</p>
              <p className="text-sm text-gray-500">Il selettore lingua apparirà nell&apos;header del sito</p>
            </div>
            <Switch
              checked={settings.multilinguaAttivo}
              onCheckedChange={() => handleToggle('multilinguaAttivo')}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lingue disponibili */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Lingue disponibili</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Italiano sempre attivo */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <span className="text-xl">🇮🇹</span>
              <div>
                <p className="font-medium">Italiano</p>
                <p className="text-sm text-gray-500">Lingua base (sempre attiva)</p>
              </div>
            </div>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>

          <Separator />

          {LANGUAGES.map((lang) => (
            <div key={lang.key}>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <div>
                    <p className="font-medium">{lang.label}</p>
                    <p className="text-sm text-gray-500">{lang.nativeLabel}</p>
                  </div>
                </div>
                <Switch
                  checked={settings[`${lang.key}Attivo` as keyof I18nSettings] as boolean}
                  onCheckedChange={() => handleToggle(`${lang.key}Attivo` as keyof I18nSettings)}
                  disabled={saving || !settings.multilinguaAttivo}
                />
              </div>
              {settings[`${lang.key}Attivo` as keyof I18nSettings] && (
                <div className="ml-12 mt-1 flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {stats.byLocale[lang.key] || 0} testi in cache
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => handleTranslateAll(lang.key)}
                    disabled={translating === lang.key}
                  >
                    {translating === lang.key ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <RefreshCw className="h-3 w-3 mr-1" />
                    )}
                    Traduci tutto
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Statistiche e azioni cache */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cache traduzioni</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-gray-500">Totale</p>
            </div>
            {LANGUAGES.map((lang) => (
              <div key={lang.key} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xl">{lang.flag}</p>
                <p className="text-lg font-bold">{stats.byLocale[lang.key] || 0}</p>
                <p className="text-xs text-gray-500">{lang.key}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              disabled={clearing || stats.total === 0}
            >
              {clearing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Reset cache
            </Button>
          </div>

          <p className="text-xs text-gray-400">
            Le traduzioni vengono generate automaticamente alla prima visita e salvate in cache. 
            Usa &quot;Traduci tutto&quot; per precaricare tutte le traduzioni di una lingua.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}