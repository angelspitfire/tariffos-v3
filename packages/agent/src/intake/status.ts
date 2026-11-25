/**
 * Estado de ingesta y taxonomía de errores (F2-29).
 *
 * Define el enum `IntakeStatus` con sus códigos de error y la asignación a
 * códigos HTTP. No contiene copy de interfaz: solo datos y mapeos.
 */

export type IntakeStatus =
  | 'ok'
  | 'needs-more-info'
  | 'conflict-unresolved'
  | 'unsupported'
  | 'unreadable';

export type IntakeErrorCode =
  | 'INTAKE_OK'
  | 'INTAKE_NEEDS_MORE_INFO'
  | 'INTAKE_CONFLICT_UNRESOLVED'
  | 'INTAKE_UNSUPPORTED'
  | 'INTAKE_UNREADABLE';

/** Código de error para cada estado de ingesta. */
export const ERROR_CODE: Record<IntakeStatus, IntakeErrorCode> = {
  ok: 'INTAKE_OK',
  'needs-more-info': 'INTAKE_NEEDS_MORE_INFO',
  'conflict-unresolved': 'INTAKE_CONFLICT_UNRESOLVED',
  unsupported: 'INTAKE_UNSUPPORTED',
  unreadable: 'INTAKE_UNREADABLE',
};

/** Código HTTP para cada estado de ingesta. */
export const HTTP_STATUS: Record<IntakeStatus, number> = {
  ok: 200,
  'needs-more-info': 400,
  'conflict-unresolved': 409,
  unsupported: 422,
  unreadable: 422,
};

/** Resultado tipado de evaluación de estado de ingesta. */
export interface IntakeResult {
  status: IntakeStatus;
  errorCode: IntakeErrorCode;
  httpStatus: number;
  message: string;
}

/**
 * Construye el resultado de estado de ingesta a partir de un status.
 */
export function intakeResult(status: IntakeStatus): IntakeResult {
  return {
    status,
    errorCode: ERROR_CODE[status],
    httpStatus: HTTP_STATUS[status],
    message: messageFor(status),
  };
}

function messageFor(status: IntakeStatus): string {
  switch (status) {
    case 'ok':
      return 'Ingesta completada sin conflictos.';
    case 'needs-more-info':
      return 'Se requiere información adicional para completar la ficha.';
    case 'conflict-unresolved':
      return 'Conflicto de normalización sin resolver entre fuentes.';
    case 'unsupported':
      return 'Tipo de documento no soportado por la ingesta.';
    case 'unreadable':
      return 'Documento no legible: no se pudo extraer texto.';
    default:
      return `Estado desconocido: ${status}`;
  }
}
