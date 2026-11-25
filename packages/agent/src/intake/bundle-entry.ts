/**
 * Punto de entrada del bundle del pipeline de ingesta (F2-31).
 *
 * Re-exporta la superficie pública del pipeline de ingesta para que esbuild
 * pueda empaquetarlo en un único archivo apto para `functions deploy`.
 * Solo importa de módulos propios de intake y de dominio; las dependencias
 * externas (@tariffos/*, node:*) se externalizan en el bundle y el script
 * de bundling las reemplaza por implementaciones en línea.
 */

export type { IntakeStatus, IntakeErrorCode, IntakeResult } from './status.js';
export { intakeResult, ERROR_CODE, HTTP_STATUS } from './status.js';

export type { DocType, DocConfidence, DocTypeDetection } from './doc-type.js';
export { detectDocType, KEYWORDS } from './doc-type.js';

export type { IdempotencyResult } from './idempotency.js';
export {
  hashDocument,
  cacheKey,
  hashFromKey,
  docTypeFromKey,
  type IdempotencyCache,
  IdempotencyChecker,
  MemoryIdempotencyCache,
} from './idempotency.js';

export type { RawDocument, Claim, Region, ReaderKind, ClaimMethod, ClaimConfidence } from '../domain/intake.js';
export type { GoodsSheet, SheetField, SheetFieldName, Source, SheetFieldMethod } from '../domain/sheet.js';
export { SHEET_FIELD_NAMES, SourceSchema, SheetFieldSchema, GoodsSheetSchema, missingFields, requireComplete } from '../domain/sheet.js';
export type { GateResult, GateField, UnlockScope, Conflict } from '../domain/gate.js';
export { gateByImpact } from '../domain/gate.js';
