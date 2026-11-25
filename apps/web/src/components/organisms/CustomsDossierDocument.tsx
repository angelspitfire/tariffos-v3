'use client';

import { useMemo } from 'react';
import { useToast } from '@/components/organisms/Toast';
import type { CustomsDossierPayload } from '@/types/dossier';
import { Printer, Download, X, FileCheck2 } from 'lucide-react';
import { buildSiduneaXml, downloadTextFile } from '@/lib/sidunea-export';

export interface CustomsDossierDocumentProps {
  isOpen: boolean;
  onClose: () => void;
  payload?: CustomsDossierPayload | null;
}

export function CustomsDossierDocument({ isOpen, onClose, payload }: CustomsDossierDocumentProps) {
  const { toast } = useToast();

  if (!isOpen || !payload) return null;

  const siduneaXml = useMemo(() => {
    return buildSiduneaXml({
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
  }, [payload]);

  const handleDownloadXml = () => {
    downloadTextFile(`SIDUNEA_${payload.dossierNumber}.xml`, siduneaXml);
    toast('XML SIDUNEA exported successfully', 'success');
  };

  const handlePrint = () => {
    window.print();
    toast('Print dialog opened', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white text-zinc-900 rounded-xl shadow-2xl overflow-hidden my-8 print:m-0 print:shadow-none print:w-full">
        {/* Toolbar (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-3 bg-zinc-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-semibold">Expediente Oficial para Aduana</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              aria-label="Imprimir documento"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={handleDownloadXml}
              aria-label="Descargar XML SIDUNEA"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors border border-zinc-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>XML SIDUNEA</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Cerrar expediente"
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Sheet */}
        <div className="p-8 space-y-6 text-xs leading-relaxed font-sans">
          {/* Official Letterhead */}
          <div className="text-center border-b pb-4 border-zinc-200 space-y-1">
            <p className="font-bold text-[11px] uppercase tracking-widest text-zinc-600">República Bolivariana de Venezuela</p>
            <p className="font-semibold text-[10px] text-zinc-500">Servicio Nacional Integrado de Administración Aduanera y Tributaria (SENIAT)</p>
            <h1 className="text-base font-bold text-zinc-950 pt-2 tracking-tight">Dictamen Técnico de Clasificación Arancelaria</h1>
            <p className="text-[11px] font-mono text-indigo-700 font-semibold">{payload.dossierNumber}</p>
          </div>

          {/* Dossier Meta Grid */}
          <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-lg border border-zinc-200 text-[11px]">
            <div>
              <p><span className="font-semibold text-zinc-700">Importador / Razón Social:</span> {payload.importerName}</p>
              <p><span className="font-semibold text-zinc-700">Identificación Fiscal:</span> <span className="font-mono">{payload.importerRuc}</span></p>
              <p><span className="font-semibold text-zinc-700">Distrito Aduanero:</span> {payload.customsDistrict}</p>
            </div>
            <div>
              <p><span className="font-semibold text-zinc-700">Agente Aduanal:</span> {payload.customsBroker}</p>
              <p><span className="font-semibold text-zinc-700">Estatus:</span> <span className="text-emerald-700 font-bold">Dictaminado (Listo para VUCE)</span></p>
              <p><span className="font-semibold text-zinc-700">Fecha de Expedición:</span> {new Date().toLocaleDateString('es-VE')}</p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-800 mb-2">1. Determinación de Subpartidas Arancelarias</h2>
            <table className="w-full text-left border-collapse border border-zinc-200 text-[11px]">
              <thead className="bg-zinc-100 text-zinc-700 font-semibold">
                <tr>
                  <th className="p-2 border border-zinc-200">#</th>
                  <th className="p-2 border border-zinc-200">Subpartida HS</th>
                  <th className="p-2 border border-zinc-200">Descripción Técnica Arancelaria</th>
                  <th className="p-2 border border-zinc-200 text-right">Cant.</th>
                  <th className="p-2 border border-zinc-200 text-right">CIF (USD)</th>
                  <th className="p-2 border border-zinc-200 text-right">Ad-Valorem</th>
                </tr>
              </thead>
              <tbody>
                {payload.items.map((item) => (
                  <tr key={item.itemNumber} className="border-b border-zinc-200">
                    <td className="p-2 border border-zinc-200 font-mono text-zinc-600">{item.itemNumber}</td>
                    <td className="p-2 border border-zinc-200 font-mono font-bold text-indigo-900">{item.hsCode}</td>
                    <td className="p-2 border border-zinc-200">{item.description}</td>
                    <td className="p-2 border border-zinc-200 text-right font-mono">{item.quantity}</td>
                    <td className="p-2 border border-zinc-200 text-right font-mono font-medium">${item.cifValue.toLocaleString()}</td>
                    <td className="p-2 border border-zinc-200 text-right font-mono">{item.dutyRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legal Grounds */}
          <div>
            <h2 className="font-bold text-xs uppercase tracking-wider text-zinc-800 mb-2">2. Fundamentación Técnico-Jurídica (RGI)</h2>
            <div className="space-y-2">
              {payload.legalClauses.map((clause, idx) => (
                <div key={idx} className="p-2.5 rounded bg-zinc-50 border border-zinc-200">
                  <p className="font-bold text-indigo-900 text-[11px]">{clause.rule}: {clause.title}</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">{clause.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Signature Block */}
          <div className="pt-8 border-t border-zinc-300 grid grid-cols-2 gap-8 text-center text-[10px]">
            <div className="space-y-1">
              <div className="w-48 mx-auto border-b border-zinc-400 pb-8" />
              <p className="font-bold text-zinc-800">{payload.customsBroker}</p>
              <p className="text-zinc-500">Agente de Aduanas Colegiado · Matrícula SENIAT</p>
            </div>
            <div className="space-y-1">
              <div className="w-48 mx-auto border-b border-zinc-400 pb-8" />
              <p className="font-bold text-zinc-800">Perito Clasificador Arancelario</p>
              <p className="text-zinc-500">División de Operaciones y Valoración Aduanera</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
