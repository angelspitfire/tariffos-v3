/**
 * FilingItem entity - a line item within a filing.
 */

import { HSCode } from '../value-objects/HSCode';
import { Currency } from '../value-objects/Currency';
import { ConfidenceScore } from '../value-objects/ConfidenceScore';

export interface FilingItemProps {
  id: string;
  itemNumber: number;
  hsCode: HSCode;
  description: string;
  descriptionEs?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  currency: Currency;
  origin: string;
  destination: string;
  confidence: ConfidenceScore;
  permits: string[];
  justification?: string;
}

export class FilingItem {
  private readonly _id: string;
  private readonly _itemNumber: number;
  private readonly _hsCode: HSCode;
  private readonly _description: string;
  private readonly _descriptionEs: string | undefined;
  private readonly _quantity: number;
  private readonly _unit: string;
  private readonly _unitPrice: number;
  private readonly _currency: Currency;
  private readonly _origin: string;
  private readonly _destination: string;
  private readonly _confidence: ConfidenceScore;
  private readonly _permits: string[];
  private readonly _justification: string | undefined;

  private constructor(props: FilingItemProps) {
    this._id = props.id;
    this._itemNumber = props.itemNumber;
    this._hsCode = props.hsCode;
    this._description = props.description;
    this._descriptionEs = props.descriptionEs;
    this._quantity = props.quantity;
    this._unit = props.unit;
    this._unitPrice = props.unitPrice;
    this._currency = props.currency;
    this._origin = props.origin;
    this._destination = props.destination;
    this._confidence = props.confidence;
    this._permits = props.permits;
    this._justification = props.justification;
  }

  static create(props: Omit<FilingItemProps, 'id'>): FilingItem {
    return new FilingItem({
      ...props,
      id: crypto.randomUUID(),
    });
  }

  static reconstruct(props: FilingItemProps): FilingItem {
    return new FilingItem(props);
  }

  get id(): string {
    return this._id;
  }

  get itemNumber(): number {
    return this._itemNumber;
  }

  get hsCode(): HSCode {
    return this._hsCode;
  }

  get description(): string {
    return this._description;
  }

  get descriptionEs(): string | undefined {
    return this._descriptionEs;
  }

  get quantity(): number {
    return this._quantity;
  }

  get unit(): string {
    return this._unit;
  }

  get unitPrice(): number {
    return this._unitPrice;
  }

  get currency(): Currency {
    return this._currency;
  }

  get origin(): string {
    return this._origin;
  }

  get destination(): string {
    return this._destination;
  }

  get confidence(): ConfidenceScore {
    return this._confidence;
  }

  get permits(): ReadonlyArray<string> {
    return this._permits;
  }

  get justification(): string | undefined {
    return this._justification;
  }

  get fobValue(): number {
    return this._quantity * this._unitPrice;
  }

  toSnapshot(): FilingItemProps {
    return {
      id: this._id,
      itemNumber: this._itemNumber,
      hsCode: this._hsCode,
      description: this._description,
      descriptionEs: this._descriptionEs,
      quantity: this._quantity,
      unit: this._unit,
      unitPrice: this._unitPrice,
      currency: this._currency,
      origin: this._origin,
      destination: this._destination,
      confidence: this._confidence,
      permits: [...this._permits],
      justification: this._justification,
    };
  }
}
