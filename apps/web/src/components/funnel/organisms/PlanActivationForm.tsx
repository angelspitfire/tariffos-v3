'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import type {
  ManualPaymentMethod,
  SubscriptionBillingCycle,
  SubscriptionPlanConfig,
} from '@tariffos/shared-types';
import {
  MANUAL_PAYMENT_METHOD_OPTIONS,
  type SubmitManualPaymentPayload,
} from '@/lib/funnel/billing-port';
import {
  buildManualPaymentPayload,
  validatePaymentFormFields,
} from '@/lib/funnel/payment-form-validation';
import { isVesPaymentMethod } from '@/lib/funnel/payment-methods';
import type { EligiblePilotCredit } from '@/lib/funnel/pilot-credit';
import { MAX_RECEIPT_SIZE_BYTES, uploadPaymentReceipt } from '@/lib/funnel/receipt-upload';
import { useBcvRate } from '@/lib/workspace/use-bcv-rate';
import { FunnelButton } from '../atoms/FunnelButton';
import { FunnelCard } from '../atoms/FunnelCard';
import { FunnelInput, FunnelSelect, FunnelTextarea } from '../atoms/FunnelField';
import { PaymentMethodDetailsCard } from '../molecules/PaymentMethodDetailsCard';
import { PaymentReceiptUploadField } from '../molecules/PaymentReceiptUploadField';
import { PlanActivationFormHeader } from '../molecules/PlanActivationFormHeader';

export interface PlanActivationFormProps {
  activePlan?: SubscriptionPlanConfig;
  effectiveCycle: SubscriptionBillingCycle;
  rawAmount?: number;
  expectedAmount: number;
  appliedPilotCredit?: EligiblePilotCredit | null;
  defaultPayerName?: string;
  defaultPayerEmail?: string;
  isSubmitting: boolean;
  onSubmitPayment: (payload: SubmitManualPaymentPayload) => Promise<void>;
}

export function PlanActivationForm({
  activePlan,
  effectiveCycle,
  rawAmount,
  expectedAmount,
  appliedPilotCredit,
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
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string | undefined>();
  const [amountUserEdited, setAmountUserEdited] = useState(false);
  const [bcvRate, setBcvRate] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const methodMeta = MANUAL_PAYMENT_METHOD_OPTIONS.find((m) => m.id === method);
  const isVesMethod = isVesPaymentMethod(method);
  const { isRefreshing: bcvLoading, rateMeta, refreshBcvRate } = useBcvRate({
    jurisdictionId: isVesMethod ? 've-seniat' : '',
    currencyCode: activePlan?.currency ?? 'USD',
    isUserEdited: amountUserEdited,
    onRateResolved: (rate) => {
      setBcvRate(rate);
      if (isVesMethod && !amountUserEdited) setAmountInput(String(Number((expectedAmount * rate).toFixed(2))));
    },
  });

  useEffect(() => {
    if (amountUserEdited) return;
    if (isVesMethod) {
      if (bcvRate && bcvRate > 0) setAmountInput(String(Number((expectedAmount * bcvRate).toFixed(2))));
    } else {
      setAmountInput(String(expectedAmount));
    }
  }, [amountUserEdited, bcvRate, expectedAmount, isVesMethod]);

  const handleMethodChange = (nextMethod: ManualPaymentMethod) => {
    setMethod(nextMethod);
    setAmountUserEdited(false);
    if (isVesPaymentMethod(nextMethod)) {
      if (bcvRate && bcvRate > 0) setAmountInput(String(Number((expectedAmount * bcvRate).toFixed(2))));
    } else {
      setAmountInput(String(expectedAmount));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_RECEIPT_SIZE_BYTES) return setErrorMsg('El comprobante no debe superar los 5 MB.');
    setErrorMsg(null);
    setReceiptFile(file);
    setReceiptFileName(file.name);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const parsedAmount = Number(amountInput) || expectedAmount;
    const validationError = validatePaymentFormFields({ referenceCode, payerName, payerEmail, amount: parsedAmount });
    if (validationError) return setErrorMsg(validationError);

    try {
      const uploadedReceipt = receiptFile ? await uploadPaymentReceipt(receiptFile) : null;
      await onSubmitPayment(
        buildManualPaymentPayload({
          activePlan,
          effectiveCycle,
          method,
          amount: parsedAmount,
          currency: methodMeta?.currencyHint ?? 'USD',
          referenceCode,
          paidAt,
          payerName,
          payerEmail,
          notes,
          appliedPilotCredit,
          receiptStorageKey: uploadedReceipt?.storageKey ?? receiptFileName,
        }),
      );
      setReferenceCode('');
      setNotes('');
      setReceiptFile(null);
      setReceiptFileName(undefined);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo enviar la solicitud.');
    }
  };

  return (
    <FunnelCard padding="p-6" className="lg:col-span-7">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <PlanActivationFormHeader
          activePlan={activePlan}
          effectiveCycle={effectiveCycle}
          rawAmount={rawAmount}
          expectedAmount={expectedAmount}
          appliedPilotCredit={appliedPilotCredit}
          errorMsg={errorMsg}
        />
        <PaymentMethodDetailsCard
          method={method}
          planName={activePlan?.name ?? 'Piloto Operativo'}
          expectedUsd={expectedAmount}
          bcvRate={bcvRate}
          bcvDate={rateMeta?.valueDate}
          bcvLoading={bcvLoading}
          onRefreshBcv={() => void refreshBcvRate()}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FunnelSelect label="Medio de pago utilizado" value={method} onChange={(e) => handleMethodChange(e.target.value as ManualPaymentMethod)}>
            {MANUAL_PAYMENT_METHOD_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </FunnelSelect>
          <FunnelInput label="Referencia bancaria / TxID" type="text" value={referenceCode} onChange={(e) => setReferenceCode(e.target.value)} placeholder="Ej. ZEL-894201 o Order ID" className="font-mono" />
          <FunnelInput
            label={`Monto pagado (${methodMeta?.currencyHint ?? 'USD'})`}
            type="number"
            min="1"
            step="0.01"
            value={amountInput}
            onChange={(e) => { setAmountUserEdited(true); setAmountInput(e.target.value); }}
            className="font-mono"
          />
          <FunnelInput label="Fecha del pago" type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
          <FunnelInput label="Titular o empresa" type="text" value={payerName} onChange={(e) => setPayerName(e.target.value)} placeholder="Ej. Aduanas del Caribe C.A." />
          <FunnelInput label="Correo de la cuenta" type="email" value={payerEmail} onChange={(e) => setPayerEmail(e.target.value)} placeholder="operador@empresa.com" />
        </div>
        <PaymentReceiptUploadField receiptFileName={receiptFileName} onChangeFile={handleFileChange} />
        <FunnelTextarea label="Notas adicionales (opcional)" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej. Pago enviado desde cuenta corporativa / solicitar factura fiscal..." />
        <FunnelButton type="submit" variant="primary" size="md" isLoading={isSubmitting} className="w-full">
          Reportar pago y solicitar activación
        </FunnelButton>
      </form>
    </FunnelCard>
  );
}
