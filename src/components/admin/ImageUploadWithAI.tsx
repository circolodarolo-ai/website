'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Upload, ImageIcon, Sparkles, ZoomIn, ZoomOut, X, RotateCcw,
  Loader2, Info,
} from 'lucide-react';
import { toast } from 'sonner';

// Limite giornaliero di generazioni AI
const DAILY_AI_LIMIT = 20;
const STORAGE_KEY = 'ai-gen-count';

// Stable Horde (fallback, CORS nativo)
const SH_SUBMIT = 'https://stablehorde.net/api/v2/generate/async';
const SH_CHECK = 'https://stablehorde.net/api/v2/generate/check/';
const SH_STATUS = 'https://stablehorde.net/api/v2/generate/status/';
const SH_POLL_MS = 4000;
const SH_MAX_WAIT = 180000; // 3 min max per Stable Horde

function getTodayKey(): string {
  return `ai-gen-${new Date().toISOString().slice(0, 10)}`;
}

function getRemainingGenerations(): number {
  if (typeof window === 'undefined') return DAILY_AI_LIMIT;
  try {
    const today = getTodayKey();
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DAILY_AI_LIMIT;
    const data = JSON.parse(stored) as Record<string, number>;
    return Math.max(0, DAILY_AI_LIMIT - (data[today] || 0));
  } catch { return DAILY_AI_LIMIT; }
}

function incrementGenerationCount(): void {
  if (typeof window === 'undefined') return;
  try {
    const today = getTodayKey();
    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) as Record<string, number> : {};
    data[today] = (data[today] || 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

function buildAutoPrompt(nome?: string, descrizione?: string): string {
  const parts: string[] = [];
  if (nome?.trim()) parts.push(nome.trim());
  if (descrizione?.trim()) parts.push(descrizione.trim());
  if (parts.length === 0) return 'delicious Italian food dish';
  return parts.join(', ');
}

/** Converte un Blob in data URL base64 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Conversione base64 fallita'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Strategia 1: Pollination AI via <img> nel DOM (senza crossOrigin).
 * Veloce (5-15s) ma potrebbe non funzionare da alcuni network.
 * Restituisce l'URL diretto Pollination se l'immagine si carica entro il timeout.
 */
function tryPollination(prompt: string, timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const seed = Math.floor(Math.random() * 999999);
    const imageUrl = `https://image.pollination.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=768&seed=${seed}&nologo=true`;

    const img = new Image();
    // SENZA crossOrigin — evita CORS, usa solo img-src CSP (ora https:)

    const timer = setTimeout(() => {
      img.src = '';
      img.onload = null;
      img.onerror = null;
      reject(new Error('timeout'));
    }, timeoutMs);

    img.onload = () => {
      clearTimeout(timer);
      // Verifica che sia un'immagine reale (non un errore 1x1 pixel)
      if (img.naturalWidth < 50 || img.naturalHeight < 50) {
        reject(new Error('immagine troppo piccola'));
        return;
      }
      resolve(imageUrl);
    };

    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error('load error'));
    };

    img.src = imageUrl;
  });
}

/**
 * Strategia 2: Stable Horde (fallback affidabile, CORS nativo).
 * Ottimizzato: 512x512, 15 step per velocità.
 * Scarica il blob e converte in data URL base64 (permanente).
 */
async function stableHordeGenerate(
  prompt: string,
  onStatus: (msg: string) => void,
  signal: AbortSignal,
): Promise<string> {
  onStatus('Invio a Stable Horde...');

  const submitRes = await fetch(SH_SUBMIT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': '0000000000',
      'Client-Agent': 'RestaurantAdmin:1.0',
    },
    body: JSON.stringify({
      prompt,
      params: { width: 512, height: 512, steps: 15, cfg_scale: 6 },
      nsfw: false,
      models: ['stable_diffusion'],
      r2: true,
    }),
    signal,
  });

  if (!submitRes.ok) {
    const err = await submitRes.json().catch(() => ({}));
    throw new Error((err as Record<string, string>).message || `Submit errore ${submitRes.status}`);
  }

  const { id: jobId } = await submitRes.json();
  onStatus('In coda Stable Horde...');

  const startTime = Date.now();
  // Polling
  while (true) {
    if (signal.aborted) throw new Error('Annullato');

    await new Promise(r => setTimeout(r, SH_POLL_MS));
    if (Date.now() - startTime > SH_MAX_WAIT) throw new Error('Timeout Stable Horde');

    const checkRes = await fetch(`${SH_CHECK}${jobId}`, { signal });
    if (!checkRes.ok) continue;
    const check = await checkRes.json();

    if (check.faulted) throw new Error('Generazione fallita sul worker');

    if (check.done) break;

    const wait = check.wait_time || 0;
    const pos = check.queue_position ?? '?';
    onStatus(`Stable Horde: coda ${pos}, ~${wait}s`);
  }

  // Recupera l'immagine
  onStatus('Download immagine...');
  const statusRes = await fetch(`${SH_STATUS}${jobId}`, { signal });
  const status = await statusRes.json();

  if (!status.generations?.length) throw new Error('Nessun risultato');

  const imgUrl: string = status.generations[0].img;

  // Scarica e converti in base64
  const imgRes = await fetch(imgUrl, { signal });
  if (!imgRes.ok) {
    // Fallback: salva URL diretto (può scadere)
    return imgUrl;
  }

  const blob = await imgRes.blob();
  if (blob.size < 100) throw new Error('Immagine vuota');
  return blobToDataUrl(blob);
}

interface ImageUploadWithAIProps {
  value: string;
  onChange: (url: string) => void;
  aiContext?: string;
  aiDescription?: string;
  recommendedSize?: string;
  label?: string;
  aiGenerated?: boolean;
  onAiGeneratedChange?: (v: boolean) => void;
}

export default function ImageUploadWithAI({
  value,
  onChange,
  aiContext,
  aiDescription,
  recommendedSize = '800 × 600 px',
  label = 'Immagine',
  aiGenerated,
  onAiGeneratedChange,
}: ImageUploadWithAIProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState('');
  const [imgError, setImgError] = useState(false);
  const [showAi, setShowAi] = useState(false);

  // Zoom/pan state
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const abortRef = useRef<AbortController | null>(null);

  const remaining = getRemainingGenerations();
  const autoPrompt = buildAutoPrompt(aiContext, aiDescription);

  useEffect(() => { setImgError(false); }, [value]);
  useEffect(() => () => { abortRef.current?.abort(); }, []);

  // --- Upload file (invariato) ---
  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    setImgError(false);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
        onAiGeneratedChange?.(false);
        toast.success('Immagine caricata');
        return;
      }
      console.warn('Server upload fallito, converto in base64 client-side');
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result as string);
        onAiGeneratedChange?.(false);
        toast.success('Immagine caricata (base64)');
      };
      reader.onerror = () => toast.error('Errore nella lettura del file');
      reader.readAsDataURL(file);
    } catch {
      toast.error('Errore di connessione');
    } finally {
      setUploading(false);
    }
  }, [onChange, onAiGeneratedChange]);

  // --- AI Generation: doppia strategia ---
  const handleGenerate = useCallback(async () => {
    if (!autoPrompt) {
      toast.error('Inserisci il nome del piatto per generare');
      return;
    }
    if (remaining <= 0) {
      toast.error('Limite giornaliero raggiunto. Riprova domani.');
      return;
    }

    const prompt = `${autoPrompt}, professional food photography, high quality, appetizing presentation, restaurant style, warm lighting, shallow depth of field`;

    setGenerating(true);
    setImgError(false);
    const controller = new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;

    const updateStatus = (msg: string) => {
      if (!signal.aborted) setGenStatus(msg);
    };

    try {
      // ═══ Strategia 1: Pollination AI (veloce, ~10s) ═══
      updateStatus('Tentativo veloce con Pollination AI (max 20s)...');
      try {
        const pollinationUrl = await tryPollination(prompt, 20000);
        onChange(pollinationUrl);
        onAiGeneratedChange?.(true);
        incrementGenerationCount();
        toast.success('Immagine AI generata con successo');
        return; // Successo!
      } catch {
        updateStatus('Pollination non disponibile, provo Stable Horde...');
      }

      if (signal.aborted) return;

      // ═══ Strategia 2: Stable Horde (affidabile, ~30-90s ottimizzato) ═══
      const result = await stableHordeGenerate(prompt, updateStatus, signal);
      onChange(result);
      onAiGeneratedChange?.(true);
      incrementGenerationCount();
      toast.success('Immagine AI generata con successo');
    } catch (err: unknown) {
      if (signal.aborted) return;
      const msg = err instanceof Error ? err.message : 'Errore sconosciuto';
      console.error('AI generation error:', msg);
      toast.error(`Errore AI: ${msg}`);
    } finally {
      setGenerating(false);
      setGenStatus('');
      abortRef.current = null;
    }
  }, [autoPrompt, remaining, onChange, onAiGeneratedChange]);

  // --- Zoom/pan (invariato) ---
  const openZoom = () => {
    if (!value || imgError) return;
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setZoomOpen(true);
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.min(5, Math.max(0.25, prev - e.deltaY * 0.002)));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    });
  };

  const handleMouseUp = () => setDragging(false);
  const hasImage = !!value && !imgError;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {/* Upload row */}
      <div className="flex gap-2 items-center">
        <Input
          value={value}
          onChange={e => { onChange(e.target.value); onAiGeneratedChange?.(false); setImgError(false); }}
          placeholder="URL immagine o carica un file"
        />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={e => {
            const file = e.target.files?.[0];
            if (!file) return;
            handleUpload(file);
            e.target.value = '';
          }}
        />
        <Button type="button" variant="outline" size="icon" disabled={uploading} onClick={() => fileInputRef.current?.click()} title="Carica immagine da file">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        </Button>
        <Button type="button" variant={showAi ? 'default' : 'outline'} size="icon" onClick={() => setShowAi(!showAi)} title="Genera con AI">
          <Sparkles className="h-4 w-4" />
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="icon" onClick={() => { onChange(''); onAiGeneratedChange?.(false); setImgError(false); }} title="Rimuovi immagine">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Dimensioni consigliate */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Info className="h-3 w-3 shrink-0" />
        <span>Dimensioni consigliate: <strong>{recommendedSize}</strong> — formato JPG, PNG o WebP</span>
      </div>

      {/* AI Generation panel */}
      {showAi && (
        <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Genera immagine con AI
            </div>
            <div className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              remaining > 5 ? 'bg-green-100 text-green-700' :
              remaining > 0 ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              {remaining}/{DAILY_AI_LIMIT} rimaste
            </div>
          </div>

          {/* Prompt automatico */}
          <div className="text-xs text-muted-foreground bg-background rounded-md p-2 border">
            <span className="font-medium">Prompt AI (auto-generato): </span>
            <span className="italic">{autoPrompt || 'Compila il nome per generare il prompt...'}</span>
          </div>

          {/* Stato generazione */}
          {generating && (
            <div className="rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/50 p-5 flex flex-col items-center justify-center gap-2 text-amber-700">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm font-medium">Generazione AI in corso...</span>
              {genStatus && (
                <span className="text-xs text-amber-600 text-center max-w-xs">{genStatus}</span>
              )}
            </div>
          )}

          {/* Pulsante genera */}
          <Button
            type="button"
            className="w-full"
            size="sm"
            onClick={handleGenerate}
            disabled={generating || remaining <= 0 || !autoPrompt}
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generazione in corso...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" />Genera immagine</>
            )}
          </Button>
        </div>
      )}

      {/* Anteprima immagine */}
      {value && (
        <div className="relative group inline-block">
          {imgError ? (
            <div className="w-48 h-48 rounded-lg border-2 border-dashed border-red-300 bg-red-50 flex flex-col items-center justify-center text-red-400 text-xs gap-1">
              <ImageIcon className="h-8 w-8" />
              <span>Immagine non caricabile</span>
            </div>
          ) : (
            <>
              <img
                src={value}
                alt="Anteprima"
                className={`w-48 h-48 object-cover rounded-lg border-2 cursor-pointer transition-all hover:opacity-90 ${aiGenerated ? 'ring-2 ring-amber-400' : 'border-gray-200'}`}
                onClick={openZoom}
                onError={() => setImgError(true)}
              />
              {aiGenerated && (
                <span className="absolute top-1 left-1 text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-medium shadow">
                  AI
                </span>
              )}
            </>
          )}
          {hasImage && (
            <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full shadow" onClick={openZoom} title="Zoom">
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Zoom/Pan Modal */}
      {zoomOpen && hasImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setZoomOpen(false)}
        >
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <Button size="icon" variant="secondary" className="rounded-full shadow-lg" onClick={e => { e.stopPropagation(); setZoom(prev => Math.min(5, prev + 0.5)); }}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" className="rounded-full shadow-lg" onClick={e => { e.stopPropagation(); setZoom(prev => Math.max(0.25, prev - 0.5)); }}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" className="rounded-full shadow-lg" onClick={e => { e.stopPropagation(); setZoom(1); setPan({ x: 0, y: 0 }); }}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" className="rounded-full shadow-lg" onClick={() => setZoomOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
            {Math.round(zoom * 100)}%
          </div>
          <div
            className="overflow-hidden max-w-[90vw] max-h-[85vh] flex items-center justify-center cursor-grab active:cursor-grabbing"
            onClick={e => e.stopPropagation()}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={value}
              alt="Zoom"
              className="max-w-full max-h-[85vh] object-contain select-none pointer-events-none"
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transition: dragging ? 'none' : 'transform 0.15s ease-out',
              }}
              draggable={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}