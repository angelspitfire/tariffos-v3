/**
 * Ingesta: Claim, Source y RawDocument.
 * Un Claim nunca apunta a un código arancelario: su target es un campo de
 * ficha, nunca una partida de 4+ dígitos. reader distingue texto de capa de
 * visión.
 */

import { z } from 'zod';
import { SourceSchema, type Source } from './sheet.js';

export type { Source };
export { SourceSchema };

export type ClaimMethod = 'rule' | 'model';

export type ClaimConfidence = 'high' | 'medium' | 'low';

export type FichaField = 'what' | 'madeOf' | 'howMade' | 'purpose' | 'presentation';

export const FICHA_FIELD_VALUES = ['what', 'madeOf', 'howMade', 'purpose', 'presentation'] as const;

export const FichaFieldSchema = z.union(FICHA_FIELD_VALUES.map((value) => z.literal(value)));

export type ReaderKind = 'text-layer' | 'vision';

export interface Claim {
  value: string;
  unit: string | null;
  target: FichaField | null;
  source: Source;
  method: ClaimMethod;
  confidence: ClaimConfidence;
}

export interface Region {
  bbox: [number, number, number, number];
  text: string;
}

export interface RawDocument {
  source: Source;
  text: string;
  claims: Claim[];
  reader: ReaderKind;
  readerModel?: string;
  regions?: Region[];
  /** Marca el documento como no legible: el lector no pudo producir texto. */
  unreadable?: boolean;
}

export const ClaimMethodSchema = z.enum(['rule', 'model']);

export const ClaimConfidenceSchema = z.enum(['high', 'medium', 'low']);

export const ReaderKindSchema = z.enum(['text-layer', 'vision']);

export const ClaimSchema = z.object({
  value: z.string().min(1),
  unit: z.nullable(z.string()),
  target: z.union([FichaFieldSchema, z.null()]),
  source: SourceSchema,
  method: ClaimMethodSchema,
  confidence: ClaimConfidenceSchema,
});

export const RegionSchema = z.object({
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  text: z.string(),
});

export const RawDocumentSchema = z.object({
  source: SourceSchema,
  text: z.string(),
  claims: z.array(ClaimSchema),
  reader: ReaderKindSchema,
  readerModel: z.string().optional(),
  regions: z.array(RegionSchema).optional(),
  unreadable: z.boolean().optional(),
});
