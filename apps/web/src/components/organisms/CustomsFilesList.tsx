'use client';

import { FileText, FileSpreadsheet, FileCheck, Upload, Sparkles, FolderOpen } from 'lucide-react';
import type { ConversationFile, ConversationFileType } from '@/types/files';

export interface CustomsFilesListProps {
  files: ConversationFile[];
  onAnalyze?: (fileName: string) => void;
  onUpload?: () => void;
}

function getFileIcon(type: ConversationFileType) {
  switch (type) {
    case 'packing_list':
      return FileSpreadsheet;
    case 'bol':
      return FileCheck;
    case 'invoice':
    case 'certificate':
    case 'other':
    default:
      return FileText;
  }
}

export function CustomsFilesList({ files, onAnalyze, onUpload }: CustomsFilesListProps) {
  if (files.length === 0) {
    return (
      <div className="py-12 px-4 text-center">
        <FolderOpen className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
        <p className="text-xs text-zinc-400 font-medium">No hay documentos adjuntos aún.</p>
        <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
          Adjunta facturas comerciales, listas de empaque o conocimientos BoL para su análisis arancelario.
        </p>
        {onUpload && (
          <button
            onClick={onUpload}
            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-sm"
          >
            <Upload size={12} />
            <span>Adjuntar documento</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-1">
      {onUpload && (
        <div className="flex items-center justify-between pb-1">
          <span className="text-[11px] font-medium text-zinc-400">Documentos del embarque</span>
          <button
            onClick={onUpload}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Upload size={11} />
            <span>Subir nuevo</span>
          </button>
        </div>
      )}

      {files.map((file) => {
        const Icon = getFileIcon(file.type);

        return (
          <div
            key={file.id}
            className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60 transition-colors hover:border-zinc-700/80"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Icon size={15} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold truncate text-zinc-100">{file.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-400">
                    <span className="text-zinc-300 font-medium">{file.typeLabel}</span>
                    <span>•</span>
                    <span className="font-mono">{file.size}</span>
                  </div>
                </div>
              </div>

              {onAnalyze && (
                <button
                  onClick={() => onAnalyze(file.name)}
                  aria-label={`Analizar ${file.name}`}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 transition-colors shrink-0"
                  title="Analizar con asistente IA"
                >
                  <Sparkles size={11} />
                  <span>Analizar</span>
                </button>
              )}
            </div>

            <div className="mt-2 pt-2 flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-zinc-800/60">
              <span>Cargado al expediente</span>
              <span>{file.uploadedAt}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
