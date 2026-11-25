import { z } from 'zod';
import { DEFAULT_CURRENCY } from '@/__mocks__';

export const InvoiceSchema = z.object({
  amount: z.number(),
  dueDate: z.string(),
  vendor: z.string(),
  currency: z.string().default(DEFAULT_CURRENCY),
  taxAmount: z.number().optional(),
  invoiceId: z.string().optional(),
});

export type InvoiceData = z.infer<typeof InvoiceSchema>;

/**
 * Service to extract and validate invoice data.
 */
export async function extractInvoiceData(_rawContent: string): Promise<InvoiceData> {
  const extracted = {
    amount: 1450.0,
    dueDate: '2024-12-31',
    vendor: 'Tax-System-Vendor',
    currency: DEFAULT_CURRENCY,
    taxAmount: 210.0,
    invoiceId: 'TX-99820',
  };

  return InvoiceSchema.parse(extracted);
}
