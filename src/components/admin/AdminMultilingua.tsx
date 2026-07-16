'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Globe, RefreshCw, Trash2, Loader2, CheckCircle2, AlertCircle, Languages } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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

// SiteInfo fields that the admin can edit and that need translation
const TRANSLATABLE_FIELDS = [
  { field: 'slogan', label: 'Badge Hero' },
  { field: 'heroTitle', label: 'Titolo Hero' },
  { field: 'heroSubtitle', label: 'Sottotitolo Hero' },
  { field: 'chiSiamoSubtitle', label: 'Sottotitolo Chi Siamo' },
  { field: 'chiSiamoTitolo', label: 'Titolo Chi Siamo' },
  { field: 'chiSiamoTesto', label: 'Testo Chi Siamo' },
  { field: 'valore1Titolo', label: 'Carta 1 Titolo' },
  { field: 'valore1Desc', label: 'Carta 1 Descrizione' },
  { field: 'valore2Titolo', label: 'Carta 2 Titolo' },
  { field: 'valore2Desc', label: 'Carta 2 Descrizione' },
  { field: 'valore3Titolo', label: 'Carta 3 Titolo' },
  { field: 'valore3Desc', label: 'Carta 3 Descrizione' },
  { field: 'valore4Titolo', label: 'Carta 4 Titolo' },
  { field: 'valore4Desc', label: 'Carta 4 Descrizione' },
  { field: 'specialitaTitle', label: 'Titolo Specialità' },
  { field: 'specialitaSubtitle', label: 'Sottotitolo Specialità' },
];

export default function AdminMultilingua() {
  const [settings, setSettings] = useState<I18nSettings | null>(null);
  const [stats, setStats] = useState<TranslationStats>({ total: 0, byLocale: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState<string | null>(null);
  const [translatingAll, setTranslatingAll] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [dbTexts, setDbTexts] = useState<Record<string, string>>({});

  const fetchSettings = useCallback(async () => {
    try {
      const [i18nRes, siteRes] = await Promise.all([
        fetch('/api/admin/i18n'),
        fetch('/api/site-info'),
      ]);
      if (i18nRes.ok) {
        const data = await i18nRes.json();
        setSettings(data.settings);
        setStats(data.stats || { total: 0, byLocale: {} });
      }
      if (siteRes.ok) {
        const siteInfo = await siteRes.json();
        const texts: Record<string, string> = {};
        for (const f of TRANSLATABLE_FIELDS) {
          const val = siteInfo[f.field];
          if (val && typeof val === 'string' && val.trim()) {
            texts[f.field] = val;
          }
        }
        setDbTexts(texts);
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

    if (field === 'multilinguaAttivo' && !newValue) {
      updated.enAttivo = false;
      updated.frAttivo = false;
      updated.deAttivo = false;
      updated.esAttivo = false;
    }

    setSettings(updated);
    setSaving(true);
    try {
      const res = await fetch('/api/admin/i18n', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        toast.success('Impostazioni salvate');
        fetchSettings();
      } else {
        toast.error('Errore nel salvataggio');
        setSettings(settings);
      }
    } catch {
      toast.error('Errore di connessione');
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  const handleTranslateAll = async (locale: string) => {
    setTranslating(locale);
    try {
      const res = await fetch('/api/admin/i18n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'translate-all', locale }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`${data.result.translated} testi tradotti, ${data.result.errors} errori`);
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

  const handleTranslateAllLocales = async () => {
    setTranslatingAll(true);
    try {
      const res = await fetch('/api/admin/i18n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'translate-all-locales' }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`${data.totalTranslated} testi tradotti in tutte le lingue, ${data.totalErrors} errori`);
        fetchSettings();
      } else {
        toast.error('Errore nella traduzione');
      }
    } catch {
      toast.error('Errore di connessione');
    } finally {
      setTranslatingAll(false);
    }
  };

  const handleClearCache = async () => {
    setClearing(true);
    try {
      const res = await fetch('/api/admin/i18n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear-cache' }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`${data.deleted} traduzioni rimosse`);
        fetchSettings();
      }
    } catch {
      toast.error('Errore');
    } finally {
      setClearing(false);
    }
  };

  const activeLocales = LANGUAGES.filter(l => settings?.[`${l.key}Attivo` as keyof I18nSettings]);
  const isTranslating = translating !== null || translatingAll;

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
          Gestisci le lingue disponibili sul sito. Le traduzioni dei testi personalizzati vengono generate automaticamente.
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
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <span className="text-xl">🇮🇹</span>
              <div>
                <p className="font-medium">Italiano</p>
                <p className="text-xs text-gray-400">Lingua base — sempre attiva</p>
              </div>
            </div>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>

          <Separator />

          {LANGUAGES.map((lang) => (
            <div key={lang.key}>
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <div>
                    <p className="font-medium">{lang.label}</p>
                    <p className="text-xs text-gray-400">{lang.nativeLabel}</p>
                  </div>
                </div>
                <Switch
                  checked={settings[`${lang.key}Attivo` as keyof I18nSettings] as boolean}
                  onCheckedChange={() => handleToggle(`${lang.key}Attivo` as keyof I18nSettings)}
                  disabled={saving || !settings.multilinguaAttivo}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Testi personalizzati + traduzione */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Languages className="h-4 w-4" />
              Testi personalizzati
            </CardTitle>
            {activeLocales.length > 0 && (
              <div className="flex gap-1.5">
                {activeLocales.length > 1 && (
                  <Button
                    size="sm"
                    variant="default"
                    className="h-7 text-xs gap-1"
                    onClick={handleTranslateAllLocales}
                    disabled={isTranslating}
                  >
                    {translatingAll ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Languages className="h-3 w-3" />
                    )}
                    Traduci tutto
                  </Button>
                )}
                {activeLocales.map(lang => (
                  <Button
                    key={lang.key}
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() => handleTranslateAll(lang.key)}
                    disabled={isTranslating}
                  >
                    {translating === lang.key ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                    {lang.flag} Traduci
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(dbTexts).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Nessun testo personalizzato trovato. Modifica i testi nei tab Hero e Chi Siamo.
            </p>
          ) : (
            <div className="space-y-2">
              {TRANSLATABLE_FIELDS.filter(f => dbTexts[f.field]).map(f => (
                <div key={f.field} className="flex items-start gap-3 py-1.5 border-b border-gray-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">{f.label}</p>
                    <p className="text-sm text-gray-700 truncate">{dbTexts[f.field]}</p>
                  </div>
                  {activeLocales.length > 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-300 shrink-0 mt-1" />
                  )}
                </div>
              ))}
              {activeLocales.length === 0 && (
                <p className="text-xs text-amber-600 flex items-center gap-1 mt-2">
                  <AlertCircle className="h-3 w-3" />
                  Attiva almeno una lingua per tradurre questi testi
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiche cache */}
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
            Dopo aver modificato i testi in &quot;Hero&quot; o &quot;Chi Siamo&quot;, clicca il pulsante
            &quot;🇬🇧 Traduci&quot; per aggiornare le traduzioni nella cache.
            Le modifiche saranno visibili sul sito pubblico.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}