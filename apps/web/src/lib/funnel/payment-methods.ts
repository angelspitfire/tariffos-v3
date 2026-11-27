import type { ManualPaymentMethod } from '@tariffos/shared-types';

export interface PaymentMethodCoordinates {
  title: string;
  coordinates: string | null;
  fallbackHint: string;
  isVesMethod: boolean;
}

export const SUPPORT_EMAIL = 'soporte@tariffos.app';

export function isVesPaymentMethod(method: ManualPaymentMethod): boolean {
  return method === 'pago_movil' || method === 'transferencia_bs';
}

export function resolvePaymentCoordinates(method: ManualPaymentMethod): PaymentMethodCoordinates {
  const map: Record<ManualPaymentMethod, { title: string; envVal?: string; fallback: string }> = {
    zelle: {
      title: 'Datos para pago vía Zelle (USD)',
      envVal: process.env.NEXT_PUBLIC_PAYMENT_ZELLE_INFO,
      fallback: `Solicita el correo Zelle vigente por WhatsApp o a ${SUPPORT_EMAIL} para acreditarlo en minutos.`,
    },
    binance_pay: {
      title: 'Binance Pay (USDT)',
      envVal: process.env.NEXT_PUBLIC_PAYMENT_BINANCE_INFO,
      fallback: `Solicita nuestro Binance Pay ID / QR vigente por WhatsApp o a ${SUPPORT_EMAIL} y guarda tu Order ID.`,
    },
    pago_movil: {
      title: 'Pago Móvil (Bs. a tasa BCV)',
      envVal: process.env.NEXT_PUBLIC_PAYMENT_PAGO_MOVIL_INFO,
      fallback: `Solicita los datos de Pago Móvil (Banco, RIF/C.I. y teléfono) por WhatsApp o a ${SUPPORT_EMAIL}.`,
    },
    transferencia_usd: {
      title: 'Transferencia internacional (USD / ACH / Wire)',
      envVal: process.env.NEXT_PUBLIC_PAYMENT_TRANSFER_USD_INFO,
      fallback: `Solicita los datos de cuenta USD vigente a ${SUPPORT_EMAIL} o por WhatsApp indicando tu empresa.`,
    },
    transferencia_bs: {
      title: 'Transferencia bancaria nacional (Bs.)',
      envVal: process.env.NEXT_PUBLIC_PAYMENT_TRANSFER_BS_INFO,
      fallback: `Solicita los datos de cuenta nacional en Bs. a ${SUPPORT_EMAIL} o por WhatsApp.`,
    },
    efectivo: {
      title: 'Pago presencial / Efectivo',
      fallback: `Coordina la entrega presencial directamente con soporte comercial (${SUPPORT_EMAIL}).`,
    },
    otro: {
      title: 'Otro medio acordado',
      fallback: `Indica la referencia acordada con tu asesor o escríbenos a ${SUPPORT_EMAIL}.`,
    },
  };

  const entry = map[method];
  const trimmed = entry.envVal?.trim();
  return {
    title: entry.title,
    coordinates: trimmed && trimmed.length > 0 ? trimmed : null,
    fallbackHint: entry.fallback,
    isVesMethod: isVesPaymentMethod(method),
  };
}

export function buildWhatsAppSupportUrl(message: string): string | null {
  const rawPhone = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP?.replace(/\D/g, '') ?? '';
  if (rawPhone.length < 8) return null;
  return `https://wa.me/${rawPhone}?text=${encodeURIComponent(message)}`;
}
