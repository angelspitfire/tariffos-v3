'use client';

import { useEffect, useRef, useState } from 'react';
import { PenTool, Trash2, Upload } from 'lucide-react';

export interface BrokerSignaturePadProps {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  signerName?: string;
  brokerLicense?: string;
}

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 136;

export function BrokerSignaturePad({
  value,
  onChange,
  signerName,
  brokerLicense,
}: BrokerSignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isDrawingRef = useRef(false);
  const hasStrokeRef = useRef(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    hasStrokeRef.current = Boolean(value);
    if (!value) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      const scale = Math.min(
        (CANVAS_WIDTH - 24) / Math.max(1, img.width),
        (CANVAS_HEIGHT - 20) / Math.max(1, img.height),
        1,
      );
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      ctx.drawImage(img, (CANVAS_WIDTH - drawW) / 2, (CANVAS_HEIGHT - drawH) / 2, drawW, drawH);
    };
    img.src = value;
  }, [value]);

  const getCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / Math.max(1, rect.width)) * CANVAS_WIDTH,
      y: ((e.clientY - rect.top) / Math.max(1, rect.height)) * CANVAS_HEIGHT,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;
    setUploadError(null);
    canvasRef.current.setPointerCapture?.(e.pointerId);
    const { x, y } = getCoords(e);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawingRef.current = true;
    hasStrokeRef.current = true;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const commitCanvas = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (!canvasRef.current || !hasStrokeRef.current) return;
    onChange(canvasRef.current.toDataURL('image/png'));
  };

  const handleClear = () => {
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    hasStrokeRef.current = false;
    setUploadError(null);
    onChange(undefined);
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Selecciona un archivo de imagen válido (PNG, JPG o SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const rawUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!rawUrl) {
        setUploadError('No se pudo leer la imagen de firma.');
        return;
      }
      setUploadError(null);
      onChange(rawUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2 sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-xs font-medium text-ink-secondary">
            Firma gráfica del agente aduanal
          </span>
          <p className="text-[11px] text-ink-muted">
            Dibuja tu rúbrica en el recuadro o sube una imagen para tus dictámenes PDF.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleUploadImage}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border-subtle bg-surface-panel px-2.5 py-1 text-[11px] font-medium text-ink-secondary hover:bg-surface-hover"
          >
            <Upload className="h-3 w-3" aria-hidden="true" />
            Subir imagen
          </button>
          {value ? (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300"
            >
              <Trash2 className="h-3 w-3" aria-hidden="true" />
              Limpiar
            </button>
          ) : null}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-dashed border-border-strong bg-white">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          aria-label="Área de firma manuscrita"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={commitCanvas}
          onPointerCancel={commitCanvas}
          onPointerLeave={commitCanvas}
          className="block h-28 w-full cursor-crosshair touch-none"
        />
        {!value ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-slate-400">
            <PenTool className="h-4 w-4" aria-hidden="true" />
            <span className="text-[11px]">Dibuja aquí tu firma manuscrita</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-2 border-t border-border-subtle bg-surface-muted px-3 py-1.5 text-[11px] text-ink-muted">
          <span className="truncate font-medium text-ink-primary">{signerName?.trim() || 'Agente Aduanal'}</span>
          <span className="shrink-0 font-mono tabular-nums">
            {brokerLicense?.trim() ? `Reg. ${brokerLicense.trim()}` : 'Sin patente'}
          </span>
        </div>
      </div>

      {uploadError ? <p className="text-[11px] text-rose-700 dark:text-rose-400">{uploadError}</p> : null}
    </div>
  );
}
