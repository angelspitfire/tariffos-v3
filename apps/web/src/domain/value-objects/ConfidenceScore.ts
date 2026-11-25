/**
 * ConfidenceScore value object for classification confidence (0-1 range).
 */

export class ConfidenceScoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfidenceScoreError';
  }
}

export class ConfidenceScore {
  public static readonly SAFE_THRESHOLD = 0.85;
  public static readonly BORDERLINE_THRESHOLD = 0.65;

  private readonly _value: number;

  private constructor(value: number) {
    this._value = value;
  }

  static create(value: number): { ok: true; value: ConfidenceScore } | { ok: false; error: ConfidenceScoreError } {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return { ok: false, error: new ConfidenceScoreError('ConfidenceScore must be a number') };
    }
    if (value < 0 || value > 1) {
      return { ok: false, error: new ConfidenceScoreError('ConfidenceScore must be between 0 and 1') };
    }
    return { ok: true, value: new ConfidenceScore(value) };
  }

  static createUnsafe(value: number): ConfidenceScore {
    const result = ConfidenceScore.create(value);
    if (!result.ok) throw result.error;
    return result.value;
  }

  get value(): number {
    return this._value;
  }

  isSafe(): boolean {
    return this._value >= ConfidenceScore.SAFE_THRESHOLD;
  }

  isBorderline(): boolean {
    return this._value >= ConfidenceScore.BORDERLINE_THRESHOLD && this._value < ConfidenceScore.SAFE_THRESHOLD;
  }

  isUnsafe(): boolean {
    return this._value < ConfidenceScore.BORDERLINE_THRESHOLD;
  }

  toPercentage(): number {
    return Math.round(this._value * 100);
  }

  toFixed(decimals: number = 2): string {
    return this._value.toFixed(decimals);
  }

  equals(other: ConfidenceScore): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return `${this.toPercentage()}%`;
  }
}
