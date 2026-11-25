/**
 * FilingCode value object for filing identification.
 */

export interface FilingCodeProps {
  value: string;
}

export class FilingCode {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): { ok: true; value: FilingCode } | { ok: false; error: Error } {
    const normalized = value.trim().toUpperCase();
    if (!/^TR-\d{4}-\d{4}-[A-Z]{2}$/.test(normalized)) {
      return { ok: false, error: new Error('Invalid filing code format. Expected: TR-YYYY-NNNN-CC') };
    }
    return { ok: true, value: new FilingCode(normalized) };
  }

  static createUnsafe(value: string): FilingCode {
    const result = FilingCode.create(value);
    if (!result.ok) throw result.error;
    return result.value;
  }

  get value(): string { return this._value; }
  equals(other: FilingCode): boolean { return this._value === other._value; }
  toString(): string { return this._value; }
}
