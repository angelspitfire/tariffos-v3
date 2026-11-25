import { describe, expect, it } from 'vitest';

import { guardNoTariffCodes, TARIFF_CODE_PATTERN } from './guard.js';
import type { Claim } from '../../domain/intake.js';
import type { Source } from '../../domain/sheet.js';
import { Logger } from '@tariffos/logger';

const source: Source = { kind: 'invoice', ref: 'INV-001' };

function claim(value: string, target: Claim['target'] = null): Claim {
  return {
    value,
    unit: null,
    target,
    source,
    method: 'rule',
    confidence: 'medium',
  };
}

class CaptureLogger extends Logger {
  writes: Array<{ level: string; msg: string; fields?: Record<string, unknown> }> = [];
  write(level: string, msg: string, fields?: Record<string, unknown>): void {
    this.writes.push({ level, msg, fields });
  }
  debug(msg: string, fields?: Record<string, unknown>): void {
    this.writes.push({ level: 'debug', msg, fields });
  }
  info(msg: string, fields?: Record<string, unknown>): void {
    this.writes.push({ level: 'info', msg, fields });
  }
  warn(msg: string, fields?: Record<string, unknown>): void {
    this.writes.push({ level: 'warn', msg, fields });
  }
  error(msg: string, fields?: Record<string, unknown>): void {
    this.writes.push({ level: 'error', msg, fields });
  }
}

describe('guardNoTariffCodes (F2-20)', () => {
  it('patrón detecta códigos arancelarios de 4+ dígitos', () => {
    expect(TARIFF_CODE_PATTERN.test('8708')).toBe(true);
    expect(TARIFF_CODE_PATTERN.test('8708.29')).toBe(true);
    expect(TARIFF_CODE_PATTERN.test('8708.29.00.00')).toBe(true);
    expect(TARIFF_CODE_PATTERN.test('3901')).toBe(true);
    expect(TARIFF_CODE_PATTERN.test('algodón')).toBe(false);
    expect(TARIFF_CODE_PATTERN.test('70%')).toBe(false);
  });

  it('descarta Claim con valor arancelario y registra el descarte', () => {
    const log = new CaptureLogger();
    const claims = [claim('camisa', 'what'), claim('8708.29', 'madeOf'), claim('algodón', 'madeOf')];
    const kept = guardNoTariffCodes(claims, log);
    expect(kept).toHaveLength(2);
    expect(kept.map((c) => c.value)).toEqual(['camisa', 'algodón']);
    expect(log.writes).toHaveLength(1);
    expect(log.writes[0].fields?.value).toBe('8708.29');
  });

  it('no descarta Claims sin código arancelario y no registra nada', () => {
    const log = new CaptureLogger();
    const claims = [claim('camisa', 'what'), claim('algodón', 'madeOf')];
    const kept = guardNoTariffCodes(claims, log);
    expect(kept).toHaveLength(2);
    expect(log.writes).toEqual([]);
  });

  it('usa logger compartido por defecto', () => {
    const claims = [claim('8708', 'what')];
    const kept = guardNoTariffCodes(claims);
    expect(kept).toEqual([]);
  });
});
