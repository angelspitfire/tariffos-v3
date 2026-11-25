import { describe, expect, it } from 'vitest';

import {
  assertNoTariffCodes,
  assertProductionSafe,
  isDeployed,
  isLoopbackUrl,
  TARIFF_CODE_PATTERN,
} from './guard.js';

function withEnv(vars: Record<string, string | undefined>, fn: () => void): void {
  const saved: Record<string, string | undefined> = {};
  for (const k of Object.keys(vars)) {
    saved[k] = process.env[k];
    if (vars[k] === undefined) delete process.env[k];
    else process.env[k] = vars[k];
  }
  try {
    fn();
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

describe('guard (F2-08) — loopback rechazado en despliegue', () => {
  it('detecta URLs de bucle', () => {
    expect(isLoopbackUrl('http://127.0.0.1:11434/v1')).toBe(true);
    expect(isLoopbackUrl('http://localhost:11434/v1')).toBe(true);
    expect(isLoopbackUrl('http://[::1]:11434/v1')).toBe(true);
    expect(isLoopbackUrl('https://openrouter.ai/api/v1')).toBe(false);
    expect(isLoopbackUrl('no-es-una-url')).toBe(false);
  });

  it('en despliegue lanza cuando VISION_BASE_URL es loopback', () => {
    withEnv({ DEPLOYED: 'true', NODE_ENV: 'production' }, () => {
      expect(() => assertProductionSafe('http://127.0.0.1:11434/v1')).toThrow(
        /bucle|loopback|producción/,
      );
    });
  });

  it('fuera de despliegue no lanza con loopback (modelos locales solo en pruebas)', () => {
    withEnv({ DEPLOYED: 'false' }, () => {
      expect(() => assertProductionSafe('http://127.0.0.1:11434/v1')).not.toThrow();
    });
  });

  it('en despliegue con URL remota no lanza', () => {
    withEnv({ DEPLOYED: 'true' }, () => {
      expect(() => assertProductionSafe('https://openrouter.ai/api/v1')).not.toThrow();
    });
  });

  it('isDeployed lee DEPLOYED y NODE_ENV', () => {
    withEnv({ DEPLOYED: 'true' }, () => {
      expect(isDeployed()).toBe(true);
    });
    withEnv({ DEPLOYED: undefined, NODE_ENV: 'production' }, () => {
      expect(isDeployed()).toBe(true);
    });
    withEnv({ DEPLOYED: 'false', NODE_ENV: 'development' }, () => {
      expect(isDeployed()).toBe(false);
    });
  });
});

describe('guard (F2-11) — el lector no emite códigos arancelarios', () => {
  it('rechaza un código de 4+ dígitos con puntos', () => {
    expect(() => assertNoTariffCodes('partida 8708.29.00.00 del producto')).toThrow(
      /arancelarios/,
    );
  });

  it('rechaza un código de 4 dígitos plano', () => {
    expect(() => assertNoTariffCodes('capítulo 8708')).toThrow(/arancelarios/);
  });

  it('acepta texto sin códigos arancelarios', () => {
    expect(() => assertNoTariffCodes('hoja de datos del producto de algodón')).not.toThrow();
    expect(() => assertNoTariffCodes('cantidad 12 unidades, precio 150')).not.toThrow();
  });

  it('el patrón TARIFF_CODE_PATTERN coincide con 8708.29.00.00', () => {
    expect('8708.29.00.00'.match(TARIFF_CODE_PATTERN)).not.toBeNull();
  });
});
