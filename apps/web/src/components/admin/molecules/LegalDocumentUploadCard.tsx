'use client';

import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import type { IngestionSourceFormat, LegalDocumentType } from '@tariffos/shared-types';
import { FunnelCard } from '@/components/funnel/atoms/FunnelCard';
import type { UploadDocumentClientInput } from '@/lib/admin/ingestion-port';

const VE_PATH_PRESETS = ['loa', 'decreto-4944', 'seniat', 'exoneraciones', 'arancel', 'SEC-XVI', '85'];
const INPUT_CLS = 'w-full rounded-lg border border-border-strong bg-surface-app px-2.5 py-1.5 text-xs';

export interface LegalDocumentUploadCardProps {
  countryCode: string;
  onUpload: (input: UploadDocumentClientInput) => Promise<void>;
}

function inferFormat(fileName: string): IngestionSourceFormat {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.md')) return 'markdown';
  if (lower.endsWith('.csv')) return 'tariff_csv';
  if (lower.endsWith('.json')) return 'tariff_json';
  return 'txt';
}

export function LegalDocumentUploadCard({ countryCode, onUpload }: LegalDocumentUploadCardProps) {
  const [legalType, setLegalType] = useState<LegalDocumentType>('LEGAL_NOTE');
  const [hierarchyPath, setHierarchyPath] = useState('loa');
  const [title, setTitle] = useState('');
  const [decreeNumber, setDecreeNumber] = useState('');
  const [officialDocumentNumber, setOfficialDocumentNumber] = useState('');
  const [validFromDate, setValidFromDate] = useState('2026-01-01');
  const [sourceFormat, setSourceFormat] = useState<IngestionSourceFormat>('markdown');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [replaceSameDate, setReplaceSameDate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (nextFile: File | null) => {
    setFile(nextFile);
    if (!nextFile) return;
    setSourceFormat(inferFormat(nextFile.name));
    if (!title.trim()) setTitle(nextFile.name.replace(/\.[^.]+$/, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onUpload({
        countryCode,
        legalType,
        hierarchyPath: hierarchyPath.trim(),
        title: title.trim(),
        sourceFormat,
        sourceFile: file?.name,
        officialDocumentNumber: officialDocumentNumber.trim() || undefined,
        decreeNumber: decreeNumber.trim() || undefined,
        validFromDate,
        replaceSameDate,
        content: file ? undefined : content,
        file,
      });
      setTitle('');
      setContent('');
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando borrador');
    } finally {
      setBusy(false);
    }
  };

  return (
    <FunnelCard padding="p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-ink-primary">
          <UploadCloud className="w-4 h-4 text-accent-ink" />
          <span>Cargar instrumento legal o arancel en borrador ({countryCode})</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <div>
            <label htmlFor="ing-type" className="block text-[11px] text-ink-muted mb-1">Tipo</label>
            <select id="ing-type" value={legalType} onChange={(e) => setLegalType(e.target.value as LegalDocumentType)} className={INPUT_CLS}>
              <option value="LEGAL_NOTE">LEGAL_NOTE</option>
              <option value="CHAPTER">CHAPTER</option>
              <option value="SECTION">SECTION</option>
              <option value="EXEMPTION">EXEMPTION</option>
              <option value="TARIFF_SCHEDULE">TARIFF_SCHEDULE</option>
            </select>
          </div>
          <div>
            <label htmlFor="ing-path" className="block text-[11px] text-ink-muted mb-1">Ruta jerárquica</label>
            <input id="ing-path" list="ve-path-presets" value={hierarchyPath} onChange={(e) => setHierarchyPath(e.target.value)} required className={`${INPUT_CLS} font-mono`} />
            <datalist id="ve-path-presets">{VE_PATH_PRESETS.map((p) => <option key={p} value={p} />)}</datalist>
          </div>
          <div>
            <label htmlFor="ing-format" className="block text-[11px] text-ink-muted mb-1">Formato</label>
            <select id="ing-format" value={sourceFormat} onChange={(e) => setSourceFormat(e.target.value as IngestionSourceFormat)} className={INPUT_CLS}>
              <option value="markdown">Markdown (.md)</option>
              <option value="pdf">PDF (.pdf)</option>
              <option value="txt">Texto (.txt)</option>
              <option value="tariff_csv">Arancel CSV</option>
              <option value="tariff_json">Arancel JSON</option>
            </select>
          </div>
          <div>
            <label htmlFor="ing-date" className="block text-[11px] text-ink-muted mb-1">Vigencia desde</label>
            <input id="ing-date" type="date" value={validFromDate} onChange={(e) => setValidFromDate(e.target.value)} required className={INPUT_CLS} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label htmlFor="ing-title" className="block text-[11px] text-ink-muted mb-1">Título del instrumento</label>
            <input id="ing-title" placeholder="Ej. Ley Orgánica de Aduanas" value={title} onChange={(e) => setTitle(e.target.value)} required className={INPUT_CLS} />
          </div>
          <input aria-label="Decreto o Providencia" placeholder="Decreto N° 4.944" value={decreeNumber} onChange={(e) => setDecreeNumber(e.target.value)} className={`self-end ${INPUT_CLS}`} />
          <input aria-label="Gaceta Oficial" placeholder="Gaceta Oficial N° 6.804" value={officialDocumentNumber} onChange={(e) => setOfficialDocumentNumber(e.target.value)} className={`self-end ${INPUT_CLS}`} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="sm:col-span-2">
            <label htmlFor="ing-content" className="block text-[11px] text-ink-muted mb-1">Contenido legal o tabla (opcional si adjunta archivo)</label>
            <textarea id="ing-content" rows={3} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Pegue artículos, notas o CSV/JSON..." className={`${INPUT_CLS} font-mono`} />
          </div>
          <div className="space-y-2">
            <label htmlFor="ing-file" className="block text-[11px] text-ink-muted">Archivo (PDF/MD/TXT/CSV/JSON)</label>
            <input id="ing-file" type="file" accept=".pdf,.md,.txt,.csv,.json" onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} className="block w-full text-[11px] text-ink-muted" />
            <label className="flex items-center gap-1.5 text-[11px] text-ink-muted cursor-pointer">
              <input type="checkbox" checked={replaceSameDate} onChange={(e) => setReplaceSameDate(e.target.checked)} />
              Reemplazar si coincide la fecha
            </label>
          </div>
        </div>

        {error && <p className="text-xs text-rose-600">{error}</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={busy} className="rounded-lg bg-accent-brand px-4 py-1.5 text-xs font-semibold text-white hover:bg-accent-brand-hover cursor-pointer disabled:opacity-50">
            {busy ? 'Procesando...' : 'Cargar borrador'}
          </button>
        </div>
      </form>
    </FunnelCard>
  );
}
