/**
 * Domain Events - capture things that happened in the domain.
 */

export interface DomainEvent {
  eventId: string;
  type: string;
  occurredAt: Date;
  aggregateId: string;
  payload: Record<string, unknown>;
}

export interface FilingCreatedPayload {
  code: string;
  title: string;
  itemCount: number;
}

export interface FilingUpdatedPayload {
  field: string;
  previous: unknown;
  current: unknown;
}

export interface FilingStatusChangedPayload {
  previous: string;
  current: string;
}

export interface FilingItemAddedPayload {
  itemId: string;
  itemNumber: number;
}

export interface FilingItemRemovedPayload {
  itemId: string;
}

export interface FilingTitleUpdatedPayload {
  title: string;
}

export interface ArtifactOpenedPayload {
  artifactId: string;
  artifactType: string;
}

export interface ArtifactClosedPayload {
  artifactId: string;
}

export interface TariffFavoritedPayload {
  code: string;
  name: string;
}

export interface TariffUnfavoritedPayload {
  code: string;
}

export interface DocumentUploadedPayload {
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface DisambiguationResolvedPayload {
  filingId: string;
  lineItemId: string;
  selectedHsCode: string;
  confidence: number;
}

export function createDomainEvent<T extends Record<string, unknown>>(
  type: string,
  aggregateId: string,
  payload: T
): DomainEvent {
  return {
    eventId: crypto.randomUUID(),
    type,
    occurredAt: new Date(),
    aggregateId,
    payload,
  };
}

export const EventTypes = {
  FILING_CREATED: 'FilingCreated',
  FILING_UPDATED: 'FilingUpdated',
  FILING_STATUS_CHANGED: 'FilingStatusChanged',
  FILING_ITEM_ADDED: 'FilingItemAdded',
  FILING_ITEM_REMOVED: 'FilingItemRemoved',
  FILING_TITLE_UPDATED: 'FilingTitleUpdated',
  ARTIFACT_OPENED: 'ArtifactOpened',
  ARTIFACT_CLOSED: 'ArtifactClosed',
  ARTIFACT_UPDATED: 'ArtifactUpdated',
  TARIFF_FAVORITED: 'TariffFavorited',
  TARIFF_UNFAVORITED: 'TariffUnfavorited',
  DOCUMENT_UPLOADED: 'DocumentUploaded',
  DISAMBIGUATION_RESOLVED: 'DisambiguationResolved',
} as const;
