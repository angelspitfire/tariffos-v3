/**
 * TariffItem entity - a single tariff classification entry.
 */

import { HSCode } from '../value-objects/HSCode';

export enum TariffStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  UNDER_REVIEW = 'under-review',
  DISCONTINUED = 'discontinued',
  TEMPORARY = 'temporary',
}

export interface TariffItemProps {
  code: HSCode;
  description: string;
  descriptionEs?: string;
  dutyAdValorem: number;
  vat: number;
  fodinfa: number;
  unit: string;
  status: TariffStatus;
  notes?: string;
  requiresPermit?: boolean;
  permitAgencies?: string[];
}

export class TariffItem {
  private readonly _code: HSCode;
  private readonly _description: string;
  private readonly _descriptionEs: string | undefined;
  private readonly _dutyAdValorem: number;
  private readonly _vat: number;
  private readonly _fodinfa: number;
  private readonly _unit: string;
  private readonly _status: TariffStatus;
  private readonly _notes: string | undefined;
  private readonly _requiresPermit: boolean;
  private readonly _permitAgencies: string[];

  private constructor(props: TariffItemProps) {
    this._code = props.code;
    this._description = props.description;
    this._descriptionEs = props.descriptionEs;
    this._dutyAdValorem = props.dutyAdValorem;
    this._vat = props.vat;
    this._fodinfa = props.fodinfa;
    this._unit = props.unit;
    this._status = props.status;
    this._notes = props.notes;
    this._requiresPermit = props.requiresPermit ?? false;
    this._permitAgencies = props.permitAgencies ?? [];
  }

  static create(props: TariffItemProps): TariffItem {
    return new TariffItem(props);
  }

  static reconstruct(props: TariffItemProps): TariffItem {
    return new TariffItem(props);
  }

  get code(): HSCode {
    return this._code;
  }

  get description(): string {
    return this._description;
  }

  get descriptionEs(): string | undefined {
    return this._descriptionEs;
  }

  get dutyAdValorem(): number {
    return this._dutyAdValorem;
  }

  get vat(): number {
    return this._vat;
  }

  get fodinfa(): number {
    return this._fodinfa;
  }

  get unit(): string {
    return this._unit;
  }

  get status(): TariffStatus {
    return this._status;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  get requiresPermit(): boolean {
    return this._requiresPermit;
  }

  get permitAgencies(): ReadonlyArray<string> {
    return this._permitAgencies;
  }

  get totalEffectiveRate(): number {
    return this._dutyAdValorem + this._vat + this._fodinfa;
  }

  toSnapshot(): TariffItemProps {
    return {
      code: this._code,
      description: this._description,
      descriptionEs: this._descriptionEs,
      dutyAdValorem: this._dutyAdValorem,
      vat: this._vat,
      fodinfa: this._fodinfa,
      unit: this._unit,
      status: this._status,
      notes: this._notes,
      requiresPermit: this._requiresPermit,
      permitAgencies: [...this._permitAgencies],
    };
  }
}
