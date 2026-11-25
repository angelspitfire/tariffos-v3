'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/organisms/Toast';
import { UploadCloud, FileText, CheckCircle2, X, Loader2, FileSpreadsheet } from 'lucide-react';
import { MOCK_DELAY_MEDIUM_MS } from '@/__mocks__';

export interface DocumentDropzoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCompleted: (fileName: string, itemsCount: number) => void;
}

export type SampleDocument = typeof SAMPLE_DOCUMENTS[number];

export const SAMPLE_DOCUMENTS = [
  { name: 'Factura_Comercial_INV-2024-9981.pdf', type: 'Factura Comercial', size: '245 KB' },
  { name: 'Packing_List_Shenzhen_Logistics.xlsx', type: 'Lista de Empaque', size: '112 KB' },
  { name: 'Bill_of_Lading_MSK-9812-EC.pdf', type: 'Conocimiento BoL', size: '380 KB' },
] as const;

export function DocumentDropzoneModal({
  isOpen,
  onClose,
  onImportCompleted,
}: DocumentDropzoneModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStage, setProgressStage] = useState<string>('');
  const selectedDoc = SAMPLE_DOCUMENTS[selectedIndex].name;
  const { toast } = useToast();

  // Click outside to close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && !target.closest('[role="dialog"]')) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
    return undefined;
  }, [isOpen, onClose]);

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
    return undefined;
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSimulateUpload = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setProgressStage('1/3 Subiendo y extrayendo documento...');

    try {
      const formData = new FormData();
      const mockFile = new File([`Mock content for ${selectedDoc}`], selectedDoc, {
        type: selectedDoc.endsWith('.xlsx') ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf',
      });
      formData.append('file', mockFile);

      setProgressStage('2/3 Procesando con IA...');

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      setProgressStage('3/3 Generando manifiesto...');

      if (!response.ok) {
        throw new Error('Failed to extract document');
      }

      const data = await response.json();

      setIsProcessing(false);
      onImportCompleted(data.extractedFields?.invoiceNumber || selectedDoc, data.items?.length || 3);
      toast('Document uploaded and analyzed successfully', 'success');
      onClose();
    } catch (error) {
      console.error('Extraction error:', error);
      setIsProcessing(false);
      toast('Failed to process document', 'error');
      setProgressStage('Error al procesar documento');
      setTimeout(() => {
        onImportCompleted(selectedDoc, 3);
        onClose();
      }, MOCK_DELAY_MEDIUM_MS);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Cargar Documento Aduanero"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'var(--overlay-backdrop-strong)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
        style={{ background: 'var(--surface)', borderColor: 'var(--border-mid)' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-400">
              <UploadCloud size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Ingesta de Documentos de Despacho</h3>
              <p className="text-xs text-zinc-400">Factura comercial, lista de empaque o conocimiento BoL</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="w-7 h-7 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-[var(--surface-elevated)] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Dropzone Area */}
        <div
          onClick={isProcessing ? undefined : handleSimulateUpload}
          className={`border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center transition-all bg-zinc-900/40 hover:bg-zinc-900/70 group ${isProcessing ? 'cursor-not-allowed opacity-50' : 'hover:border-indigo-500/60 cursor-pointer'}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <UploadCloud size={24} />
          </div>
          <h4 className="text-xs font-semibold text-zinc-200">
            Arrastra tu archivo aquí o haz clic para examinar
          </h4>
          <p className="text-[11px] text-zinc-400 mt-1 max-w-xs mx-auto">
            Formatos admitidos: PDF, Excel (.xlsx), CSV e imágenes escaneadas de factura (hasta 25 MB).
          </p>
        </div>

        {/* Sample Mock Documents for Quick Test */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase text-zinc-400 block font-semibold">
            Archivos de Demostración del Embarque TR-2024-8849-VE:
          </span>
          <div className="space-y-1.5">
            {SAMPLE_DOCUMENTS.map((doc, idx) => {
              const isSelected = selectedIndex === idx;
              const isExcel = doc.name.endsWith('.xlsx');
              const Icon = isExcel ? FileSpreadsheet : FileText;

              return (
                <div
                  key={doc.name}
                  onClick={() => setSelectedIndex(idx)}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-500/60 bg-indigo-950/20 text-zinc-100'
                      : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon size={14} className={isExcel ? 'text-emerald-400' : 'text-indigo-400'} />
                    <span className="truncate font-mono">{doc.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-[11px]">
                    <span className="text-zinc-500">{doc.size}</span>
                    <span className="px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-mid)] font-mono text-[10px]">
                      {doc.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Processing State Indicator */}
        {isProcessing && (
          <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/30 flex items-center gap-2.5 text-xs text-indigo-300">
            <Loader2 size={16} className="animate-spin text-indigo-400 shrink-0" />
            <span className="font-mono">{progressStage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-700 text-[var(--text-mid)] hover:text-white bg-[var(--surface-elevated)] hover:bg-zinc-700 transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSimulateUpload}
            disabled={isProcessing}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
            <span>{isProcessing ? 'Procesando...' : 'Analizar y Subir'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}