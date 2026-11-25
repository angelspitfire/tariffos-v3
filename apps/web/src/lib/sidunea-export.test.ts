import { describe, it, expect } from 'vitest';
import { buildSiduneaXml, type SiduneaFiling } from './sidunea-export';

const mockFiling: SiduneaFiling = {
  referenceId: 'TR-2024-8849-VE',
  customsOffice: 'Aduana Principal Marítima de La Guaira',
  clientName: 'Importadora y Distribuidora Caracas C.A.',
  clientTaxId: 'J-30948291-0',
  totalCif: 99850,
  totalDuty: 1455,
  lines: [
    {
      lineNumber: 1,
      hsCode: '8471.30.00.00',
      description: 'Portátiles laptop Intel i7',
      cifValue: 55000,
      advRate: 0,
      ivaRate: 15,
      permitAgency: null,
      permitStatus: null,
    },
    {
      lineNumber: 2,
      hsCode: '8528.52.00.00',
      description: 'Monitores 27 pulgadas',
      cifValue: 33000,
      advRate: 5,
      ivaRate: 15,
      permitAgency: null,
      permitStatus: null,
    },
  ],
};

describe('sidunea-export', () => {
  it('generates valid ASYCUDA/SIDUNEA World XML with header and line items', () => {
    const xml = buildSiduneaXml(mockFiling);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<ASYCUDA_Declaration Version="World-4.2">');
    expect(xml).toContain('<FilingReference>TR-2024-8849-VE</FilingReference>');
    expect(xml).toContain('<CustomsOffice Name="Aduana Principal Marítima de La Guaira"/>');
    expect(xml).toContain('TaxId="J-30948291-0"');
    expect(xml).toContain('<TotalCIF Currency="USD">99850.00</TotalCIF>');
    expect(xml).toContain('<EstimatedDutyTotal Currency="USD">1455.00</EstimatedDutyTotal>');

    // Lines
    expect(xml).toContain('<LineItem Number="1">');
    expect(xml).toContain('<HarmonizedCode>8471300000</HarmonizedCode>');
    expect(xml).toContain('<LineItem Number="2">');
    expect(xml).toContain('<HarmonizedCode>8528520000</HarmonizedCode>');
  });

  it('escapes XML special characters in descriptions and client names', () => {
    const xml = buildSiduneaXml({
      ...mockFiling,
      clientName: 'Import & Export <Caracas> "C.A."',
      lines: [
        {
          lineNumber: 1,
          hsCode: '8471.30.00.00',
          description: 'Laptops 15" & Cables <USB-C>',
          cifValue: 1000,
          advRate: 0,
          ivaRate: 15,
          permitAgency: 'CONATEL',
          permitStatus: 'Approved',
        },
      ],
    });

    expect(xml).toContain('Import &amp; Export &lt;Caracas&gt; &quot;C.A.&quot;');
    expect(xml).toContain('Laptops 15&quot; &amp; Cables &lt;USB-C&gt;');
    expect(xml).toContain('<PermitAgency Code="CONATEL" Status="Approved"/>');
  });
});
