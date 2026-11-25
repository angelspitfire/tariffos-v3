/**
 * Artifact entity - a computational result displayed in the canvas.
 */

export enum ArtifactType {
  SINGLE_ITEM = 'single-item',
  BATCH_MANIFEST = 'batch-manifest',
  TAX_BREAKDOWN = 'tax-breakdown',
  DISCREPANCY_AUDIT = 'discrepancy-audit',
  DISAMBIGUATION = 'disambiguation',
  PERMITS_MATRIX = 'permits-matrix',
  EXONERATION_SIMULATOR = 'exoneration-simulator',
  CUSTOMS_DOSSIER = 'customs-dossier',
}

export interface ArtifactProps {
  id: string;
  type: ArtifactType;
  title: string;
  subtitle: string;
  data: unknown;
  version: number;
  timestamp: Date;
  filingId: string;
}

export class Artifact {
  private readonly _id: string;
  private readonly _type: ArtifactType;
  private _title: string;
  private _subtitle: string;
  private _data: unknown;
  private _version: number;
  private readonly _timestamp: Date;
  private readonly _filingId: string;

  private constructor(props: ArtifactProps) {
    this._id = props.id;
    this._type = props.type;
    this._title = props.title;
    this._subtitle = props.subtitle;
    this._data = props.data;
    this._version = props.version;
    this._timestamp = props.timestamp;
    this._filingId = props.filingId;
  }

  static create(
    type: ArtifactType,
    title: string,
    subtitle: string,
    data: unknown,
    filingId: string
  ): Artifact {
    return new Artifact({
      id: crypto.randomUUID(),
      type,
      title,
      subtitle,
      data,
      version: 1,
      timestamp: new Date(),
      filingId,
    });
  }

  static reconstruct(props: ArtifactProps): Artifact {
    return new Artifact(props);
  }

  get id(): string { return this._id; }
  get type(): ArtifactType { return this._type; }
  get title(): string { return this._title; }
  get subtitle(): string { return this._subtitle; }
  get data(): unknown { return this._data; }
  get version(): number { return this._version; }
  get timestamp(): Date { return this._timestamp; }
  get filingId(): string { return this._filingId; }

  updateTitle(title: string): void {
    if (title !== this._title) {
      this._title = title;
      this.incrementVersion();
    }
  }

  updateSubtitle(subtitle: string): void {
    if (subtitle !== this._subtitle) {
      this._subtitle = subtitle;
      this.incrementVersion();
    }
  }

  updateData(data: unknown): void {
    this._data = data;
    this.incrementVersion();
  }

  incrementVersion(): void {
    this._version += 1;
  }

  getVersionSnapshot(): { version: number; data: unknown; timestamp: Date } {
    return {
      version: this._version,
      data: this._data,
      timestamp: this._timestamp,
    };
  }

  toSnapshot(): ArtifactProps {
    return {
      id: this._id,
      type: this._type,
      title: this._title,
      subtitle: this._subtitle,
      data: this._data,
      version: this._version,
      timestamp: this._timestamp,
      filingId: this._filingId,
    };
  }
}
