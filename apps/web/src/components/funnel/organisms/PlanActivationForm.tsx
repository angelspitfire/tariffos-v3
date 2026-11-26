'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Upload } from 'lucide-react';
import type {
  ManualPaymentMethod,
  SubscriptionBillingCycle,
  SubscriptionPlanConfig,
} from '@tariffos/shared-types';
import {
  MANUAL_PAYMENT_METHOD_OPTIONS,
  type SubmitManualPaymentPayload,
} from '@/lib/funnel/billing-port';
import { FunnelButton } from '../atoms/FunnelButton';
import { FunnelCard } from '../atoms/FunnelCard';
import { FunnelInput, FunnelSelect, FunnelTextarea } from '../atoms/FunnelField';

export interface PlanActivationFormProps {
  activePlan?: SubscriptionPlanConfig;
  effectiveCycle: SubscriptionBillingCycle;
  expectedAmount: number;
  defaultPayerName?: string;
  defaultPayerEmail?: string;
  isSubmitting: boolean;
  onSubmitPayment: (payload: SubmitManualPaymentPayload) => Promise<void>;
}

export function PlanActivationForm({
  activePlan,
  effectiveCycle,
  expectedAmount,
  defaultPayerName = '',
  defaultPayerEmail = '',
  isSubmitting,
  onSubmitPayment,
}: PlanActivationFormProps) {
  const [method, setMethod] = useState<ManualPaymentMethod>('zelle');
  const [referenceCode, setReferenceCode] = useState('');
  const [amountInput, setAmountInput] = useState(String(expectedAmount));
  const [paidAt, setPaidAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [payerName, setPayerName] = useState(defaultPayerName);
  const [payerEmail, setPayerEmail] = useState(defaultPayerEmail);
  const [notes, setNotes] = useState('');
  const [receiptFileName, setReceiptFileName] = useState<string | undefined>();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const methodMeta = MANUAL_PAYMENT_METHOD_OPTIONS.find((m) => m.id === method);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('El comprobante no debe superar los 5 MB.');
      return;
    }
    setErrorMsg(null);
    setReceiptFileName(file.name);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const parsedAmount = Number(amountInput) || expectedAmount;
    if (referenceCode.trim().length < 2) {
      setErrorMsg('Ingresa el número de referencia bancaria, Order ID o TxID.');
      return;
    }
    if (!payerName.trim()) {
      setErrorMsg('Indica el nombre del titular o empresa solicitante.');
      return;
    }
    if (!payerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail.trim())) {
      setErrorMsg('Ingresa un correo válido para confirmar la activación.');
      return;
    }
    if (parsedAmount <= 0) {
      setErrorMsg('El monto reportado debe ser mayor a cero.');
      return;
    }

    try {
      await onSubmitPayment({
        planId: activePlan?.planId ?? 'pilot',
        billingCycle: effectiveCycle,
        method,
        amount: parsedAmount,
        currency: methodMeta?.currencyHint ?? 'USD',
        referenceCode: referenceCode.trim(),
        paidAt,
        payerName: payerName.trim(),
        payerEmail: payerEmail.trim(),
        notes: notes.trim() || undefined,
        receiptStorageKey: receiptFileName,
      });
      setReferenceCode('');
      setNotes('');
      setReceiptFileName(undefined);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo enviar la solicitud.');
    }
  };

  return (
    <FunnelCard padding="p-6" className="lg:col-span-7">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-ink-primary">Reportar pago y solicitar activación</h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Monto sugerido:{' '}
            <strong className="font-mono text-ink-primary tabular-nums">
              ${expectedAmount.toLocaleString('en-US')} {activePlan?.currency ?? 'USD'}
            </strong>{' '}
            ({activePlan?.oneTimeOnly
              ? 'pago único · 100% acreditable a Agencia en 30 días'
              : effectiveCycle === 'annual'
                ? 'facturación anual'
                : 'facturación mensual'}).
          </p>
        </div>

        {errorMsg ? (
          <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/35 text-xs text-rose-800 dark:text-rose-300 font-medium">
            {errorMsg}
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FunnelSelect label="Medio de pago utilizado" value={method} onChange={(e) => setMethod(e.target.value as ManualPaymentMethod)}>
            {MANUAL_PAYMENT_METHOD_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </FunnelSelect>
          <FunnelInput label="Referencia bancaria / TxID" type="text" value={referenceCode} onChange={(e) => setReferenceCode(e.target.value)} placeholder="Ej. ZEL-894201 o Order ID" className="font-mono" />
          <FunnelInput label="Monto pagado" type="number" min="1" step="0.01" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} className="font-mono" />
          <FunnelInput label="Fecha del pago" type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
          <FunnelInput label="Titular o empresa" type="text" value={payerName} onChange={(e) => setPayerName(e.target.value)} placeholder="Ej. Aduanas del Caribe C.A." />
          <FunnelInput label="Correo de la cuenta" type="email" value={payerEmail} onChange={(e) => setPayerEmail(e.target.value)} placeholder="operador@empresa.com" />
        </div>

        <div className="space-y-1.5">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Comprobante o captura (opcional)
          </span>
          <label className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-dashed border-border-strong hover:border-accent-brand bg-surface-muted/60 cursor-pointer text-xs text-ink-secondary transition-colors">
            <span className="inline-flex items-center gap-2 truncate">
              <Upload className="w-4 h-4 text-accent-ink shrink-0" />
              <span className="truncate">{receiptFileName || 'Adjuntar imagen o PDF (máx. 5 MB)'}</span>
            </span>
            <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        <FunnelTextarea label="Notas adicionales (opcional)" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej. Pago enviado desde cuenta corporativa / solicitar factura fiscal..." />

        <FunnelButton type="submit" variant="primary" size="md" isLoading={isSubmitting} className="w-full">
          Reportar pago y solicitar activación
        </FunnelButton>
      </form>
    </FunnelCard>
  );
}
