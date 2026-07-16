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

/** Costruisce un prompt fotografico professionale */
function buildAutoPrompt(nome?: string, descrizione?: string): string {
  const parts: string[] = [];
  if (nome?.trim()) parts.push(nome.trim());
  if (descrizione?.trim()) parts.push(descrizione.trim());
  if (parts.length === 0) return 'delicious Italian food dish';
  return parts.join(', ');
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
  const [generatingUrl, setGeneratingUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [showAi, setShowAi] = useState(false);

  // Zoom/pan state
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const remaining = getRemainingGenerations();
  const autoPrompt = buildAutoPrompt(aiContext, aiDescription);

  useEffect(() => { setImgError(false); }, [value]);
  useEffect(() => { if (!generating) setGeneratingUrl(null); }, [generating]);

  // --- Upload file ---
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
      // Fallback client-side base64 se il server fallisce (Vercel read-only)
      console.warn('Server upload fallito, converto in base64 client-side');
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        onChange(dataUrl);
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

  // --- AI Generation: usa <img> nel DOM (React) con onLoad/onError ---
  // NON usiamo crossOrigin (evita CORS). L'URL Pollination è permanente (deterministico).
  const handleGenerate = useCallback(() => {
    if (!autoPrompt) {
      toast.error('Inserisci il nome del piatto per generare');
      return;
    }
    if (remaining <= 0) {
      toast.error('Limite giornaliero raggiunto. Riprova domani.');
      return;
    }

    const prompt = `${autoPrompt}, professional food photography, high quality, appetizing presentation, restaurant style, warm lighting, shallow depth of field`;
    const seed = Math.floor(Math.random() * 999999);
    const imageUrl = `https://image.pollination.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=768&seed=${seed}&nologo=true`;

    setGenerating(true);
    setGeneratingUrl(imageUrl);
    setImgError(false);
  }, [autoPrompt, remaining]);

  // Quando l'img nascosto nel DOM carica con successo
  const handleAiImageLoad = useCallback(() => {
    if (!generatingUrl) return;
    onChange(generatingUrl);
    onAiGeneratedChange?.(true);
    incrementGenerationCount();
    setGenerating(false);
    toast.success('Immagine AI generata con successo');
  }, [generatingUrl, onChange, onAiGeneratedChange]);

  // Quando l'img nascosto nel DOM fallisce
  const handleAiImageError = useCallback(() => {
    console.error('AI image failed to load:', generatingUrl);
    setGenerating(false);
    setGeneratingUrl(null);
    toast.error('Errore nella generazione AI. Riprova.');
  }, [generatingUrl]);

  // --- Zoom/pan ---
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

          {/* Anteprima + loader durante generazione - <img> nel DOM con onLoad/onError */}
          {generating && generatingUrl && (
            <div className="relative rounded-lg overflow-hidden border-2 border-dashed border-amber-300 bg-amber-50/50">
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20">
                <div className="flex items-center gap-2 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generazione in corso...
                </div>
              </div>
              {/* Questo <img> è nel DOM reale - il browser lo carica tramite img-src CSP */}
              <img
                src={generatingUrl}
                alt="Generazione AI"
                className="w-full max-h-64 object-contain"
                onLoad={handleAiImageLoad}
                onError={handleAiImageError}
              />
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