'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Paperclip, RefreshCw, ScanLine, Upload, X } from 'lucide-react';
import { WorkspaceDialogShell } from '../atoms/WorkspaceDialogShell';

export interface CameraScannerModalProps {
  open: boolean;
  onClose: () => void;
  onCaptureFile: (file: File) => void;
}

const CAMERA_POSTER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%230f172a'/%3E%3C/svg%3E";

const SAMPLE_LABELS = [
  { id: 'sample-inverter', label: 'Inversor Solar 5kW', lines: ['INVERTER SOLAR HÍBRIDO 5000W', 'MODELO: SUN-5K-SG04LP1', 'ORIGEN: CHINA, 48V DC / 220V AC'] },
  { id: 'sample-ultrasound', label: 'Ecógrafo Portátil', lines: ['ULTRASOUND DIAGNOSTIC SYSTEM', 'MOD: MINDRAY Z60, CAP. 90', 'TRANSDUCTOR LINEAL + CONVEXO'] },
  { id: 'sample-valve', label: 'Válvula Acero Inox.', lines: ['INDUSTRIAL BALL VALVE 2"', 'MATERIAL: AISI 316 STAINLESS', 'PN40, USO PETROLERO / QUÍMICO'] },
] as const;

function renderSampleToFile(sample: (typeof SAMPLE_LABELS)[number]): File | null {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new File([sample.lines.join('\n')], `${sample.id}.txt`, { type: 'text/plain' });
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(20, 20, canvas.width - 40, 56);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(sample.label.toUpperCase(), 36, 56);
  ctx.fillStyle = '#0f172a';
  ctx.font = '18px monospace';
  sample.lines.forEach((line, i) => ctx.fillText(line, 36, 128 + i * 44));
  const bytes = atob(canvas.toDataURL('image/png').split(',')[1] ?? '');
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) arr[i] = bytes.charCodeAt(i);
  return new File([arr], `${sample.id}.png`, { type: 'image/png' });
}

export function CameraScannerModal({ open, onClose, onCaptureFile }: CameraScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Cámara no disponible en este navegador. Adjunta una imagen o usa una etiqueta de muestra.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
    } catch {
      setCameraError('No se pudo acceder a la cámara. Puedes subir una foto o probar con una etiqueta de muestra.');
    }
  }, [facingMode, stopCamera]);

  useEffect(() => {
    if (open) void startCamera();
    else stopCamera();
    return stopCamera;
  }, [open, startCamera, stopCamera]);

  const handleCaptureFrame = () => {
    const video = videoRef.current;
    if (!video || !cameraReady || video.videoWidth === 0) return;
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(video.videoWidth, 1280);
    canvas.height = Math.round((canvas.width * video.videoHeight) / Math.max(1, video.videoWidth));
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      onCaptureFile(new File([blob], `captura-${Date.now()}.png`, { type: 'image/png' }));
      onClose();
    }, 'image/png');
  };

  return (
    <WorkspaceDialogShell
      open={open}
      onClose={onClose}
      label="Escáner de cámara para etiquetas y facturas"
      maxWidthClassName="max-w-xl"
    >
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-accent-ink" aria-hidden="true" />
            <h3 className="text-sm font-semibold">Escáner de etiquetas y facturas</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar escáner"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="relative aspect-video overflow-hidden rounded-card border border-border-subtle bg-surface-inverted">
            <video ref={videoRef} poster={CAMERA_POSTER} playsInline muted className="h-full w-full object-cover" />
            {cameraError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-inverted/95 p-6 text-center text-xs text-ink-on-inverted/80">
                <ScanLine className="h-7 w-7 text-accent-ink" aria-hidden="true" />
                <p className="max-w-sm leading-relaxed">{cameraError}</p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'))}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border-subtle px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Cambiar cámara
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { onCaptureFile(f); onClose(); }
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border-subtle px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
              >
                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                Subir foto
              </button>
            </div>

            <button
              type="button"
              disabled={!cameraReady}
              onClick={handleCaptureFrame}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-accent-brand px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-brand-hover focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none disabled:opacity-40"
            >
              <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
              Capturar y adjuntar
            </button>
          </div>

          <div className="space-y-1.5 border-t border-border-hairline pt-3">
            <div className="text-xs font-semibold text-ink-secondary">Etiquetas de muestra para probar</div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_LABELS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => {
                    const file = renderSampleToFile(sample);
                    if (file) { onCaptureFile(file); onClose(); }
                  }}
                  className="cursor-pointer rounded-full border border-border-subtle bg-surface-muted px-3 py-1 text-xs font-medium text-ink-primary transition-colors hover:border-accent-brand hover:bg-accent-soft/40 focus-visible:ring-2 focus-visible:ring-accent-brand focus-visible:outline-none"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        </div>
    </WorkspaceDialogShell>
  );
}
