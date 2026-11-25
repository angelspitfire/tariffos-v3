import { NextResponse } from 'next/server';
import {
  EXTRACT_CONFIDENCE_HIGH,
  EXTRACT_CONFIDENCE_MEDIUM,
  EXTRACT_CONFIDENCE_LOW,
} from '@/__mocks__';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Simulate document processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Return mock extracted data
    return NextResponse.json({
      filingId: `EXT-${Date.now()}`,
      items: [
        {
          id: 'ext-item-1',
          itemNumber: 1,
          hsCode: '8471.30.00.00',
          description: 'Computadoras portátiles de peso inferior o igual a 10 kg',
          quantity: 120,
          unit: 'U',
          fobValue: 72000,
          cifValue: 75400,
          dutyRate: 0,
          vatRate: 15,
          confidence: EXTRACT_CONFIDENCE_HIGH,
          permits: ['SENCAMER-001'],
          justification: 'Máquinas automáticas para tratamiento o procesamiento de datos digitales portátiles.',
        },
        {
          id: 'ext-item-2',
          itemNumber: 2,
          hsCode: '8528.52.00.00',
          description: 'Monitores capaces de conectarse directamente a máquinas automáticas',
          quantity: 80,
          unit: 'U',
          fobValue: 18400,
          cifValue: 19800,
          dutyRate: 5,
          vatRate: 15,
          confidence: EXTRACT_CONFIDENCE_MEDIUM,
          permits: [],
          justification: 'Aparatos de visualización con entrada digital directa HDMI/DisplayPort.',
        },
        {
          id: 'ext-item-3',
          itemNumber: 3,
          hsCode: '8504.40.90.00',
          description: 'Adaptadores y convertidores estáticos de corriente alterna/continua',
          quantity: 200,
          unit: 'U',
          fobValue: 4200,
          cifValue: 4650,
          dutyRate: 10,
          vatRate: 15,
          confidence: EXTRACT_CONFIDENCE_LOW,
          permits: ['CONATEL-REQ'],
          justification: 'Convertidor con discrepancia en tasa ad-valorem entre 5% y 10%.',
        },
      ],
      totalCif: 99850,
      totalDuties: 1455,
      extractedFields: {
        invoiceNumber: 'INV-2024-9981',
        vendor: 'Shenzhen Tech Logistics Ltd.',
        date: new Date().toISOString().split('T')[0],
        currency: 'USD',
      },
    });
  } catch (error) {
    console.error('Extract API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
