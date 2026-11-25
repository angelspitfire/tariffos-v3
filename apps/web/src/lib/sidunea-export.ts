/**
 * SIDUNEA World (ASYCUDA) XML export builder.
 * Produces structured declaration documents for customs clearance filing.
 */

export interface SiduneaLine {
  lineNumber: number;
  hsCode: string | null;
  description: string;
  cifValue: number | null;
  advRate: number | null;
  ivaRate: number | null;
  permitAgency: string | null;
  permitStatus: string | null;
}

export interface SiduneaFiling {
  referenceId: string;
  customsOffice: string | null;
  clientName: string;
  clientTaxId: string | null;
  totalCif: number | null;
  totalDuty: number | null;
  lines: SiduneaLine[];
}

const esc = (v: string): string =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const digits = (hs: string): string => hs.replace(/[^0-9]/g, '');

const money = (n: number | null): string => (n == null ? '0.00' : n.toFixed(2));

export function buildSiduneaXml(filing: SiduneaFiling): string {
  const customs = filing.customsOffice ?? '';
  const lines = filing.lines
    .map(
      (l) => `  <LineItem Number="${l.lineNumber}">
    <HarmonizedCode>${l.hsCode ? digits(l.hsCode) : ''}</HarmonizedCode>
    <Description>${esc(l.description)}</Description>
    <ValueCIF>${money(l.cifValue)}</ValueCIF>
    <DutyRate AdValorem="${l.advRate != null ? l.advRate.toFixed(4) : ''}" IVA="${l.ivaRate != null ? l.ivaRate.toFixed(4) : ''}"/>${
        l.permitAgency
          ? `\n    <PermitAgency Code="${esc(l.permitAgency)}" Status="${esc(l.permitStatus ?? 'Pending')}"/>`
          : ''
      }
  </LineItem>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<ASYCUDA_Declaration Version="World-4.2">
  <Header>
    <FilingReference>${esc(filing.referenceId)}</FilingReference>
    <CustomsOffice Name="${esc(customs)}"/>
    <Declarant Name="${esc(filing.clientName)}"${filing.clientTaxId ? ` TaxId="${esc(filing.clientTaxId)}"` : ''}/>
    <TotalCIF Currency="USD">${money(filing.totalCif)}</TotalCIF>
    <EstimatedDutyTotal Currency="USD">${money(filing.totalDuty)}</EstimatedDutyTotal>
  </Header>
${lines}
</ASYCUDA_Declaration>`;
}

export function downloadTextFile(filename: string, content: string, mimeType = 'application/xml') {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
