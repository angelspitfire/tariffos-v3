'use client';

import { useCallback } from 'react';
import { useToast } from '@/components/organisms/Toast';
import { CustomsDossierPayload, type LegalBasisClause } from '@/types/dossier';
import { SkeletonCard, SkeletonText } from '@/components/atoms/Skeleton';
import { FileText, Printer, Download } from 'lucide-react';
import { CONFIDENCE_SAFE_THRESHOLD, CONFIDENCE_BORDERLINE_THRESHOLD, CONFIDENCE_PERCENT_MULTIPLIER } from '@/__mocks__';
import { buildSiduneaXml, downloadTextFile } from '@/lib/sidunea-export';

function confidenceBadge(confidence: number) {
  if (confidence >= CONFIDENCE_SAFE_THRESHOLD) {
    return 'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border font-mono-numbers bg-[var(--success-subtle)] text-[var(--success-text)] border-[var(--success-border)]';
  }
  if (confidence >= CONFIDENCE_BORDERLINE_THRESHOLD) {
    return 'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border font-mono-numbers bg-[var(--warning-subtle)] text-[var(--warning-text)] border-[var(--warning-border)]';
  }
  return 'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border font-mono-numbers bg-[var(--danger-subtle)] text-[var(--danger-text)] border-[var(--danger-border)]';
}

export function CustomsDossierInspector({ payload, isLoading = false }: { payload: CustomsDossierPayload; isLoading?: boolean }) {
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <SkeletonCard>
          <SkeletonText lines={3} />
        </SkeletonCard>
        <SkeletonCard>
          <SkeletonText lines={4} />
        </SkeletonCard>
        <SkeletonCard>
          <SkeletonText lines={3} />
        </SkeletonCard>
      </div>
    );
  }

  const handleExportXml = useCallback(() => {
    const xml = buildSiduneaXml({
      referenceId: payload.dossierNumber,
      customsOffice: payload.customsDistrict,
      clientName: payload.importerName,
      clientTaxId: payload.importerRuc,
      totalCif: payload.items.reduce((acc, i) => acc + i.cifValue, 0),
      totalDuty: payload.items.reduce((acc, i) => acc + (i.cifValue * (i.dutyRate / 100)), 0),
      lines: payload.items.map((i) => ({
        lineNumber: i.itemNumber,
        hsCode: i.hsCode,
        description: i.description,
        cifValue: i.cifValue,
        advRate: i.dutyRate,
        ivaRate: 16,
        permitAgency: null,
        permitStatus: null,
      })),
    });
    downloadTextFile(`SIDUNEA_${payload.dossierNumber}.xml`, xml);
    toast('SIDUNEA XML exported successfully', 'success');
  }, [payload, toast]);

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--purple-subtle)', color: 'var(--purple-text)' }}>
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--text-hi)]">Expediente Oficial de Clasificación Arancelaria</h4>
            <p className="text-[11px] text-[var(--text-lo)]">{payload.dossierNumber} · {payload.customsDistrict}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--success-subtle)] text-[var(--success-text)] border border-[var(--success-border)]">
            {payload.verificationStatus === 'ready_to_transmit' ? 'Listo para VUCE' : 'En Revisión'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Datos del Expediente</p>
            <dl className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-1">
                <dt className="text-[var(--text-lo)]">Número</dt>
                <dd className="font-mono text-[var(--text-hi)]">{payload.dossierNumber}</dd>
                <dt className="text-[var(--text-lo)]">Distrito</dt>
                <dd className="font-mono text-[var(--text-hi)]">{payload.customsDistrict}</dd>
                <dt className="text-[var(--text-lo)]">Fecha</dt>
                <dd className="font-mono text-[var(--text-hi)]">{payload.issueDate}</dd>
                <dt className="text-[var(--text-lo)]">Importador</dt>
                <dd className="font-mono text-[var(--text-hi)]">{payload.importerName}</dd>
                <dt className="text=[var(--text-lo)]">RIF</dt>
                <dd className="font-mono text-[var(--text-hi)]">{payload.importerRuc}</dd>
                <dt className="text-[var(--text-lo)]">Agente</dt>
                <dd className="font-mono text-[var(--text-hi)]">{payload.customsBroker}</dd>
              </div>
            </dl>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Partidas Dictaminadas</p>
            <dl className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-1">
                <dt className="text-[var(--text-lo)]">Total Partidas</dt>
                <dd className="font-mono text-[var(--text-hi)]">{payload.items.length}</dd>
                <dt className="text-[var(--text-lo)]">CIF Total</dt>
                <dd className="font-mono text-[var(--text-hi)]">${payload.items.reduce((a, i) => a + i.cifValue, 0).toLocaleString()}</dd>
                <dt className="text-[var(--text-lo)]">Total Derechos</dt>
                <dd className="font-mono text-[var(--text-hi)]">${payload.items.reduce((a, i) => a + i.cifValue * i.dutyRate / 100, 0).toFixed(2)}</dd>
                <dt className="text-[var(--text-lo)]">IVA Total (16%)</dt>
                <dd className="font-mono text-[var(--text-hi)]">${(payload.items.reduce((a, i) => a + i.cifValue * i.dutyRate / 100, 0) * 0.16).toFixed(2)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Legal clauses */}
        <div>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Fundamentación Jurídica</p>
          <div className="space-y-1 text-xs">
            {payload.legalClauses?.map((clause: LegalBasisClause) => (
              <div key={clause.rule} className="flex gap-2">
                <span className="font-mono text-xs text-[var(--text-lo)]">{clause.rule}</span>
                <span className="text-[var(--text-hi)] font-mono">{clause.title}</span>
                <span className="text-[var(--text-hi)]">{clause.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Required documents (VUCE) */}
        <div>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Documentación Requerida (VUCE)</p>
          <div className="space-y-1 text-xs">
            {payload.requiredPreClearanceDocs?.map((doc: string) => (
              <div key={doc} className="flex items-center gap-2">
                <span className="text-[var(--text-hi)]">{doc}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Detalle de Partidas</p>
          <div className="rounded-lg border border-[var(--border)] overflow-hidden">
            <table className="w-full text-[11px]">
              <thead className="bg-[var(--surface-raised)]">
                <tr>
                  <th className="text-left px-3 py-2 text-[var(--text-lo)] font-medium">#</th>
                  <th className="text-left px-3 py-2 text-[var(--text-lo)] font-medium">HS Code</th>
                  <th className="text-left px-3 py-2 text-[var(--text-lo)] font-medium">Descripción</th>
                  <th className="text-right px-3 py-2 text-[var(--text-lo)] font-medium">CIF</th>
                  <th className="text-right px-3 py-2 text-[var(--text-lo)] font-medium">Arancel</th>
                  <th className="text-center px-3 py-2 text-[var(--text-lo)] font-medium">Conf.</th>
                </tr>
              </thead>
              <tbody>
                {payload.items.map((item) => (
                  <tr key={item.itemNumber} className="border-t border-[var(--border)] hover:bg-[var(--surface-raised)]">
                    <td className="px-3 py-2 font-mono text-[var(--text-hi)]">{item.itemNumber}</td>
                    <td className="px-3 py-2 font-mono text-[var(--text-hi)]">{item.hsCode}</td>
                    <td className="px-3 py-2 text-[var(--text-hi)]">{item.description}</td>
                    <td className="text-right px-3 py-2 font-mono text-[var(--text-hi)]">${item.cifValue.toLocaleString()}</td>
                    <td className="text-right px-3 py-2 font-mono text-[var(--text-hi)]">{item.dutyRate.toFixed(0)}%</td>
                    <td className="text-center px-3 py-2">
                      <span className={confidenceBadge(item.confidence * CONFIDENCE_PERCENT_MULTIPLIER)}>
                        {(item.confidence * CONFIDENCE_PERCENT_MULTIPLIER).toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportXml}
            aria-label="Exportar XML SIDUNEA"
            className="px-4 py-2 rounded-lg text-sm font-medium text-indigo-700 transition-colors flex items-center gap-1.5"
            style={{ background: 'var(--indigo-subtle)', border: '1px solid var(--indigo-border)' }}
          >
            <Download className="w-4 h-4 text-indigo-400" />
            Exportar XML SIDUNEA
          </button>
          <button
            type="button"
            onClick={() => {}}
            aria-label="Imprimir expediente oficial"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-1.5"
            style={{ background: 'var(--brand)', border: 'none' }}
          >
            <Printer className="w-4 h-4" />
            Dictamen Oficial (PDF)
          </button>
        </div>
      </div>

      {/* CustomsDossierDocument disabled for debugging */}
        </div>
  );
}
