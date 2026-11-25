'use client';

import { useState } from 'react';
import type { ManifestLineItem } from '@/types/domain';
import { Check, X } from 'lucide-react';

export interface ManifestRowEditorProps {
  item: ManifestLineItem;
  onSave: (patch: Partial<ManifestLineItem>) => void;
  onCancel: () => void;
}

export function ManifestRowEditor({ item, onSave, onCancel }: ManifestRowEditorProps) {
  const [hsCode, setHsCode] = useState(item.hsCode);
  const [description, setDescription] = useState(item.description);
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [cifValue, setCifValue] = useState(String(item.cifValue));
  const [dutyRate, setDutyRate] = useState(String(item.dutyRate));
  const [vatRate, setVatRate] = useState(String(item.vatRate));

  const handleSave = () => {
    const parsedQty = Number(quantity);
    const parsedCif = Number(cifValue);
    const parsedDuty = Number(dutyRate);
    const parsedVat = Number(vatRate);

    onSave({
      hsCode: hsCode.trim(),
      description: description.trim(),
      quantity: Number.isFinite(parsedQty) ? parsedQty : item.quantity,
      cifValue: Number.isFinite(parsedCif) ? parsedCif : item.cifValue,
      dutyRate: Number.isFinite(parsedDuty) ? parsedDuty : item.dutyRate,
      vatRate: Number.isFinite(parsedVat) ? parsedVat : item.vatRate,
    });
  };

  return (
    <tr className="bg-indigo-950/40 border-y-2 border-indigo-500/50 text-xs">
      <td className="py-2 px-3 text-zinc-400 font-mono-numbers">{item.itemNumber}</td>
      <td className="py-1 px-2">
        <input
          aria-label="Subpartida arancelaria"
          value={hsCode}
          onChange={(e) => setHsCode(e.target.value)}
          className="w-28 px-1.5 py-1 bg-zinc-900 border border-indigo-400/60 rounded font-mono-numbers text-[var(--purple-text)] text-xs focus:outline-none"
        />
      </td>
      <td className="py-1 px-2">
        <input
          aria-label="Descripción de la mercancía"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-1.5 py-1 bg-zinc-900 border border-indigo-400/60 rounded text-[var(--text-hi)] text-xs focus:outline-none"
        />
      </td>
      <td className="py-1 px-2 text-right">
        <input
          aria-label="Cantidad"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-16 px-1.5 py-1 bg-zinc-900 border border-indigo-400/60 rounded font-mono-numbers text-right text-xs focus:outline-none"
        />
      </td>
      <td className="py-1 px-2 text-right">
        <input
          aria-label="Valor CIF en USD"
          type="number"
          value={cifValue}
          onChange={(e) => setCifValue(e.target.value)}
          className="w-20 px-1.5 py-1 bg-zinc-900 border border-indigo-400/60 rounded font-mono-numbers text-right text-xs focus:outline-none"
        />
      </td>
      <td className="py-1 px-2 text-right">
        <input
          aria-label="Tasa Arancelaria"
          type="number"
          value={dutyRate}
          onChange={(e) => setDutyRate(e.target.value)}
          className="w-12 px-1.5 py-1 bg-zinc-900 border border-indigo-400/60 rounded font-mono-numbers text-right text-xs focus:outline-none"
        />
      </td>
      <td className="py-1 px-2 text-right">
        <input
          aria-label="Tasa IVA"
          type="number"
          value={vatRate}
          onChange={(e) => setVatRate(e.target.value)}
          className="w-12 px-1.5 py-1 bg-zinc-900 border border-indigo-400/60 rounded font-mono-numbers text-right text-xs focus:outline-none"
        />
      </td>
      <td className="py-1 px-2 text-center">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={handleSave}
            aria-label="Guardar cambios"
            className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancelar edición"
            className="p-1 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
