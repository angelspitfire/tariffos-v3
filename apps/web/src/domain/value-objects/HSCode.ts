/**
 * HSCode value object for Harmonized System tariff codes.
 * Validates 8-10 digit codes and provides hierarchy navigation.
 */

export class HSCodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HSCodeError';
  }
}

export interface HSCodeParts {
  chapter: string;
  heading: string;
  subheading: string;
  item: string;
}

export class HSCode {
  private readonly _code: string;
  private readonly _parts: HSCodeParts;

  private constructor(code: string) {
    this._code = code;
    this._parts = this.parseCode(code);
  }

  static create(code: string): { ok: true; value: HSCode } | { ok: false; error: HSCodeError } {
    const normalized = code.replace(/\D/g, '');
    
    if (normalized.length < 8 || normalized.length > 10) {
      return { ok: false, error: new Error(`HSCode must be 8-10 digits, got: ${normalized.length}`) };
    }

    if (!/^\d+$/.test(normalized)) {
      return { ok: false, error: new Error(`HSCode must contain only digits, got: ${normalized}`) };
    }

    return { ok: true, value: new HSCode(normalized.padStart(10, '0')) };
  }

  static createUnsafe(code: string): HSCode {
    const result = HSCode.create(code);
    if (!result.ok) throw result.error;
    return result.value;
  }

  private parseCode(code: string): HSCodeParts {
    const padded = code.padStart(10, '0');
    return {
      chapter: padded.slice(0, 2),
      heading: padded.slice(0, 4),
      subheading: padded.slice(0, 6),
      item: padded.slice(0, 8),
    };
  }

  get code(): string { return this._code; }
  get parts(): HSCodeParts { return this._parts; }
  get chapter(): string { return this._parts.chapter; }
  get heading(): string { return this._parts.heading; }
  get subheading(): string { return this._parts.subheading; }
  get item(): string { return this._parts.item; }

  getChapter(): string { return this._parts.chapter; }
  getHeading(): string { return this._parts.heading; }
  getSubheading(): string { return this._parts.subheading; }
  getItem(): string { return this._parts.item; }

  parent(): HSCode {
    const parentCode = this._code.slice(0, -2).padStart(10, '0');
    return new HSCode(parentCode);
  }

  children(): HSCode[] {
    const results: HSCode[] = [];
    const base = this._code.slice(0, 8);
    for (let i = 0; i < 100; i++) {
      const childCode = (base + i.toString().padStart(2, '0')).padStart(10, '0');
      results.push(new HSCode(childCode));
    }
    return results;
  }

  format(): string {
    return [
      this._code.slice(0, 2),
      this._code.slice(2, 4),
      this._code.slice(4, 6),
      this._code.slice(6, 8),
      this._code.slice(8, 10),
    ].join('.');
  }

  equals(other: HSCode): boolean { return this._code === other._code; }
  toString(): string { return this.format(); }
}
