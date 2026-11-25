/**
 * Filing aggregate root entity.
 */

import { FilingItem } from './FilingItem';
import { FilingCode } from './FilingCode';

export enum FilingStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
}

export interface FilingProps {
  id: string;
  code: FilingCode;
  title: string;
  status: FilingStatus;
  items: FilingItem[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
  auditLog: unknown[];
}

export class Filing {
  private readonly _id: string;
  private readonly _code: FilingCode;
  private _title: string;
  private _status: FilingStatus;
  private _items: FilingItem[];
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _version: number;
  private _auditLog: unknown[];

  private constructor(props: FilingProps) {
    this._id = props.id;
    this._code = props.code;
    this._title = props.title;
    this._status = props.status;
    this._items = props.items;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._version = props.version;
    this._auditLog = props.auditLog;
  }

  static create(code: FilingCode, title: string, items: FilingItem[] = []): Filing {
    const now = new Date();
    const filing = new Filing({
      id: crypto.randomUUID(),
      code,
      title,
      status: FilingStatus.DRAFT,
      items,
      createdAt: now,
      updatedAt: now,
      version: 1,
      auditLog: [],
    });
    filing.recordEvent({
      eventId: crypto.randomUUID(),
      type: 'FilingCreated',
      occurredAt: now,
      aggregateId: filing.id,
      payload: { code: code.value, title, itemCount: items.length },
    });
    return filing;
  }

  static reconstruct(props: FilingProps): Filing {
    return new Filing(props);
  }

  get id(): string { return this._id; }
  get code(): FilingCode { return this._code; }
  get title(): string { return this._title; }
  get status(): FilingStatus { return this._status; }
  get items(): readonly FilingItem[] { return this._items; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get version(): number { return this._version; }
  get auditLog(): readonly unknown[] { return this._auditLog; }
  get itemCount(): number { return this._items.length; }

  addItem(item: FilingItem): void {
    this._items.push(item);
    this.touch();
    this.recordEvent({
      eventId: crypto.randomUUID(),
      type: 'FilingItemAdded',
      occurredAt: new Date(),
      aggregateId: this._id,
      payload: { itemId: item.id, itemNumber: item.itemNumber },
    });
  }

  removeItem(itemId: string): boolean {
    const index = this._items.findIndex((i) => i.id === itemId);
    if (index === -1) return false;
    this._items.splice(index, 1);
    this.touch();
    this.recordEvent({
      eventId: crypto.randomUUID(),
      type: 'FilingItemRemoved',
      occurredAt: new Date(),
      aggregateId: this._id,
      payload: { itemId },
    });
    return true;
  }

  updateTitle(title: string): void {
    if (title !== this._title) {
      this._title = title;
      this.touch();
      this.recordEvent({
        eventId: crypto.randomUUID(),
        type: 'FilingTitleUpdated',
        occurredAt: new Date(),
        aggregateId: this._id,
        payload: { title },
      });
    }
  }

  updateStatus(status: FilingStatus): void {
    if (status !== this._status) {
      const previous = this._status;
      this._status = status;
      this.touch();
      this.recordEvent({
        eventId: crypto.randomUUID(),
        type: 'FilingStatusChanged',
        occurredAt: new Date(),
        aggregateId: this._id,
        payload: { previous, current: status },
      });
    }
  }

  private touch(): void {
    this._updatedAt = new Date();
    this._version += 1;
  }

  recordEvent(event: unknown): void {
    this._auditLog.push(event);
  }

  toSnapshot(): FilingProps {
    return {
      id: this._id,
      code: this._code,
      title: this._title,
      status: this._status,
      items: [...this._items],
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      version: this._version,
      auditLog: [...this._auditLog],
    };
  }
}
