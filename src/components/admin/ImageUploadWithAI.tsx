'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Upload, ImageIcon, Sparkles, ZoomIn, ZoomOut, X, RotateCcw,
  Loader2, Info, Eye, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

// Limite giornaliero di generazioni AI (Pollination è gratuito ma conviene limitare)
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

/** Costruisce un prompt fotografico professionale a partire dal nome e dalla descrizione */
function buildAutoPrompt(nome?: string, descrizione?: string): string {
  const parts: string[] = [];
  if (nome?.trim()) parts.push(nome.trim());
  if (descrizione?.trim()) parts.push(descrizione.trim());
  // Se non c'è nulla, fallback generico
  if (parts.length === 0) return 'delicious Italian food dish';
  return parts.join(', ');
}

interface ImageUploadWithAIProps {
  value: string;
  onChange: (url: string) => void;
  /** Nome del piatto o titolo (usato per generare automaticamente il prompt AI) */
  aiContext?: string;
  /** Descrizione del piatto o contenuto (usata per arricchire il prompt AI) */
  aiDescription?: string;
  /** Dimensioni consigliate per l'anteprima sul sito */
  recommendedSize?: string;
  /** Label personalizzata */
  label?: string;
  /** Flag se l'immagine è generata da AI */
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
  const [generatingPreviewUrl, setGeneratingPreviewUrl] = useState<string | null>(null);
  const [showAi, setShowAi] = useState(false);

  // Zoom/pan state
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const remaining = getRemainingGenerations();

  // Calcola il prompt automatico a partire dal nome e dalla descrizione
  const autoPrompt = buildAutoPrompt(aiContext, aiDescription);

  // Reset anteprima generazione quando si chiude il pannello AI
  useEffect(() => {
    if (!showAi) setGeneratingPreviewUrl(null);
  }, [showAi]);

  // --- Upload handler ---
  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
        onAiGeneratedChange?.(false);
        toast.success('Immagine caricata');
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Errore nel caricamento');
      }
    } catch { toast.error('Errore di connessione'); }
    finally { setUploading(false); }
  }, [onChange, onAiGeneratedChange]);

  // --- AI Generation handler ---
  const handleGenerate = useCallback(async () => {
    if (!autoPrompt) { toast.error('Inserisci il nome del piatto per generare un\'immagine'); return; }
    if (remaining <= 0) { toast.error('Limite giornaliero raggiunto. Riprova domani.'); return; }

    setGenerating(true);
    setGeneratingPreviewUrl(null);
    try {
      // Costruisci il prompt completo per Pollination
      const prompt = `${autoPrompt}, professional food photography, high quality, appetizing presentation, restaurant style, warm lighting, shallow depth of field`;

      const seed = Math.floor(Math.random() * 999999);
      const width = 1024;
      const height = 768;
      const imageUrl = `https://image.pollination.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

      // Mostra l'anteprima del URL di Pollination mentre si scarica
      setGeneratingPreviewUrl(imageUrl);

      // Scarica l'immagine generata
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) throw new Error('Generazione fallita');
      const blob = await imgRes.blob();

      // Verifica che sia davvero un'immagine
      if (!blob.type.startsWith('image/')) throw new Error('Risposta non valida');

      // Salvala localmente tramite l'API upload
      const file = new File([blob], `ai-${seed}.png`, { type: 'image/png' });
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/admin/upload-image', { method: 'POST', body: formData });
      if (uploadRes.ok) {
        const data = await uploadRes.json();
        onChange(data.url);
        onAiGeneratedChange?.(true);
        incrementGenerationCount();
        toast.success('Immagine AI generata e salvata con successo');
      } else {
        // Fallback: usa direttamente l'URL di Pollination
        console.warn('Upload locale fallito, uso URL esterno Pollination');
        onChange(imageUrl);
        onAiGeneratedChange?.(true);
        incrementGenerationCount();
        toast.success('Immagine AI generata (salvata su server esterno)');
      }
    } catch (err) {
      console.error('AI generation error:', err);
      toast.error('Errore nella generazione AI. Riprova.');
      setGeneratingPreviewUrl(null);
    } finally {
      setGenerating(false);
    }
  }, [autoPrompt, remaining, onChange, onAiGeneratedChange]);

  // --- Zoom/pan handlers ---
  const openZoom = () => {
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

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {/* Upload row */}
      <div className="flex gap-2 items-center">
        <Input
          value={value}
          onChange={e => { onChange(e.target.value); onAiGeneratedChange?.(false); }}
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
          <Button type="button" variant="ghost" size="icon" onClick={() => { onChange(''); onAiGeneratedChange?.(false); }} title="Rimuovi immagine">
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

          {/* Prompt automatico (read-only) */}
          <div className="text-xs text-muted-foreground bg-background rounded-md p-2 border">
            <span className="font-medium">Prompt AI (auto-generato): </span>
            <span className="italic">{autoPrompt || 'Compila il nome per generare il prompt...'}</span>
          </div>

          {/* Anteprima durante generazione */}
          {generating && generatingPreviewUrl && (
            <div className="relative rounded-lg overflow-hidden border-2 border-dashed border-amber-300 bg-amber-50/50">
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20">
                <div className="flex items-center gap-2 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generazione in corso...
                </div>
              </div>
              <img
                src={generatingPreviewUrl}
                alt="Generazione AI in corso"
                className="w-full max-h-64 object-contain"
              />
            </div>
          )}

          {/* Pulsante genera */}
          <div className="flex gap-2">
            <Button
              type="button"
              className="flex-1"
              size="sm"
              onClick={handleGenerate}
              disabled={generating || remaining <= 0 || !autoPrompt}
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generazione...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" />Genera immagine</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Image preview with zoom button */}
      {value && (
        <div className="relative group inline-block">
          <img
            src={value}
            alt="Preview"
            className={`w-48 h-48 object-cover rounded-lg border cursor-pointer transition-all ${aiGenerated ? 'ring-2 ring-amber-400' : ''}`}
            onClick={openZoom}
          />
          {aiGenerated && (
            <span className="absolute top-1 left-1 text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-medium">
              AI
            </span>
          )}
          <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full shadow" onClick={openZoom} title="Zoom">
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Zoom/Pan Modal */}
      {zoomOpen && value && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setZoomOpen(false)}
        >
          {/* Controls bar */}
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

          {/* Zoom level indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
            {Math.round(zoom * 100)}%
          </div>

          {/* Image container */}
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