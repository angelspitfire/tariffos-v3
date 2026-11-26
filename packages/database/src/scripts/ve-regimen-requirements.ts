/**
 * Requirements projection for the 21 régimen legal codes of Article 21
 * (Venezuela Decree 4.944 / GOE 6.804).
 */
export const REGIMEN_REQUIREMENTS: Record<
  number,
  { regulatoryEntity: string; permitType: string }
> = {
  1: { regulatoryEntity: 'Ministerio de Comercio Exterior', permitType: 'Importación o Exportación Prohibida' },
  2: { regulatoryEntity: 'Ejecutivo Nacional', permitType: 'Importación o Exportación Reservada al Ejecutivo Nacional' },
  3: { regulatoryEntity: 'MPPS (Salud)', permitType: 'Permiso Sanitario' },
  4: { regulatoryEntity: 'MPP Industrias y Producción Nacional', permitType: 'Permiso de Importación' },
  5: { regulatoryEntity: 'MPPS (Salud)', permitType: 'Certificado Sanitario del País de Origen' },
  6: { regulatoryEntity: 'MPP Agricultura Productiva y Tierras', permitType: 'Permiso Sanitario' },
  7: { regulatoryEntity: 'MPP Defensa', permitType: 'Permiso de Importación' },
  8: { regulatoryEntity: 'MPP Alimentación', permitType: 'Licencia de Importación' },
  9: { regulatoryEntity: 'MPP Comercio Exterior', permitType: 'Licencia de Importación' },
  10: { regulatoryEntity: 'MPP Ecosocialismo', permitType: 'Permiso de Importación' },
  11: { regulatoryEntity: 'MPP Petróleo', permitType: 'Permiso de Importación' },
  12: { regulatoryEntity: 'MPPS (Salud)', permitType: 'Registro Sanitario' },
  13: { regulatoryEntity: 'MPP Agricultura Productiva y Tierras', permitType: 'Registro Sanitario' },
  14: { regulatoryEntity: 'MPP Alimentación', permitType: 'Permiso de Importación' },
  15: { regulatoryEntity: 'MPP Ciencia, Tecnología e Innovación', permitType: 'Permiso de Importación' },
  16: { regulatoryEntity: 'MPP Industrias y Producción Nacional', permitType: 'Licencia de Importación' },
  17: { regulatoryEntity: 'MPP Energía Eléctrica', permitType: 'Permiso de Importación' },
  18: { regulatoryEntity: 'MPP Pesca y Acuicultura', permitType: 'Permiso de Importación' },
  19: { regulatoryEntity: 'MPP Comercio Exterior', permitType: 'Certificado del Proceso Kimberley' },
  20: { regulatoryEntity: 'SENCAMER', permitType: 'Constancia de Registro COVENIN / Reglamento Técnico' },
  21: { regulatoryEntity: 'SUNAQUIM', permitType: 'Permiso del Registro Nacional Único de Operadores de Sustancias Químicas Controladas' },
};
