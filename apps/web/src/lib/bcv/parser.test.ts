import { describe, expect, it } from 'vitest';
import {
  parseBcvHtml,
  parseVenezuelanDecimal,
  validateRateDelta,
} from './parser';

const SAMPLE_BCV_HTML = `
<html>
  <body>
    <div id="dolar">
      <div class="col-sm-6 col-xs-6 centrado"><strong> 52,43120000 </strong></div>
    </div>
    <div id="euro">
      <div class="col-sm-6 col-xs-6 centrado"><strong> 55,10480000 </strong></div>
    </div>
    <div class="pull-right dinpro center">
      Fecha Valor: <span class="date-display-single" property="dc:date" datatype="xsd:dateTime" content="2026-11-26T00:00:00-04:00">Jueves, 26 Noviembre 2026</span>
    </div>
  </body>
</html>
`;

describe('BCV parser', () => {
  it('parses Venezuelan decimal numbers with comma or dot separators', () => {
    expect(parseVenezuelanDecimal('52,43120000')).toBeCloseTo(52.4312, 4);
    expect(parseVenezuelanDecimal('1.250,75')).toBeCloseTo(1250.75, 2);
    expect(parseVenezuelanDecimal('0')).toBeNull();
    expect(parseVenezuelanDecimal('-10,5')).toBeNull();
    expect(parseVenezuelanDecimal('abc')).toBeNull();
  });

  it('extracts USD/VES, EUR/VES, and ISO valueDate from BCV HTML', () => {
    const quotes = parseBcvHtml(SAMPLE_BCV_HTML);
    expect(quotes).toHaveLength(2);
    expect(quotes[0]).toEqual({
      pair: 'USD/VES',
      rate: 52.4312,
      valueDate: '2026-11-26',
      source: 'bcv.org.ve',
    });
    expect(quotes[1]).toEqual({
      pair: 'EUR/VES',
      rate: 55.1048,
      valueDate: '2026-11-26',
      source: 'bcv.org.ve',
    });
  });

  it('falls back to Spanish date text when content attribute is missing', () => {
    const html = `
      <div id="dolar"><strong> 52,1500 </strong></div>
      <div id="euro"><strong> 54,9000 </strong></div>
      <span class="date-display-single">Viernes, 27 Noviembre 2026</span>
    `;
    const quotes = parseBcvHtml(html);
    expect(quotes[0]?.valueDate).toBe('2026-11-27');
  });

  it('throws when required rate blocks are missing or invalid', () => {
    expect(() => parseBcvHtml('<html><body>sin tasas</body></html>')).toThrow(/#dolar/i);
  });

  it('validates rate jump delta within safe 25% threshold', () => {
    expect(validateRateDelta(50, 51)).toBe(true);
    expect(validateRateDelta(50, 62.5)).toBe(true);
    expect(validateRateDelta(50, 80)).toBe(false);
    expect(validateRateDelta(null, 80)).toBe(true);
  });
});
