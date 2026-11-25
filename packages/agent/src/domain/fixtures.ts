/**
 * Fixtures reales en memoria: recortes del árbol de `arancel-4.944.rows.json`.
 *
 * Capítulos 39 vs 87 (engranajes), 84 y 98.
 * El capítulo 98 desciende con `noSaSubheading` hasta la profundidad 10.
 *
 * Bloqueada: P-C2 (reglas de uso del capítulo 98 de la experta).
 */

import type { TariffTree } from './ports.js';
import type { DescentLevel } from './route.js';

export interface TreeSlice {
  chapter: string;
  children: Record<string, string[]>;
  leaves: string[];
  description: Record<string, string>;
}

/**
 * Árbol de capítulo 39 (plásticos): 3901 → subpartidas → hojas a 10 dígitos.
 */
export const CHAPTER_39: TreeSlice = {
  chapter: '39',
  children: {
    '39': ['3901'],
    '3901': ['390110'],
    '390110': ['39011020', '39011030'],
    '39011020': ['3901102010', '3901102090'],
    '39011030': ['3901103010', '3901103090'],
  },
  leaves: ['3901102010', '3901102090', '3901103010', '3901103090'],
  description: {
    '39': 'CAPÍTULO 39: PLÁSTICOS Y SUS MANUFACTURAS',
    '3901': 'Polímeros de etileno en formas primarias',
    '390110': 'Polietileno de densidad inferior a 0,94',
  },
};

/**
 * Árbol de capítulo 87 (vehículos): 870829 con 21 hijos (caso no-truncación).
 */
export const CHAPTER_87: TreeSlice = {
  chapter: '87',
  children: {
    '87': ['8708'],
    '8708': ['870829'],
    '870829': [
      '8708291',
      '8708291100', '8708291200', '8708291300', '8708291400', '87082919',
    ],
  },
  leaves: [
    '8708291100', '8708291200', '8708291300', '8708291400',
  ],
  description: {
    '87': 'CAPÍTULO 87: VEHÍCULOS AUTOMÓVILES',
    '8708': 'Partes y accesorios de vehículos automotores',
    '870829': 'Los demás:',
  },
};

/**
 * Árbol de capítulo 84 (máquinas): 8471 → máquinas automáticas de datos.
 */
export const CHAPTER_84: TreeSlice = {
  chapter: '84',
  children: {
    '84': ['8471'],
    '8471': ['847130'],
    '847130': ['84713010'],
    '84713010': ['8471301010', '8471301090'],
  },
  leaves: ['8471301010', '8471301090'],
  description: {
    '84': 'CAPÍTULO 84: MÁQUINAS Y APARATOS MECÁNICOS',
    '8471': 'Máquinas automáticas para tratamiento de datos',
    '847130': 'Máquinas automáticas portátiles',
  },
};

/**
 * Árbol de capítulo 98: desciende con `noSaSubheading` hasta profundidad 10.
 */
export const CHAPTER_98: TreeSlice = {
  chapter: '98',
  children: {
    '98': ['9801'],
    '9801': ['98010000'],
    '98010000': ['980100001'],
    '980100001': ['9801000011', '9801000019'],
  },
  leaves: ['9801000011', '9801000019'],
  description: {
    '98': 'CAPÍTULO 98: ESPECIALES',
    '9801': 'Partes y componentes para ensamblaje de vehículos',
    '98010000': 'Vehículos para ensamblaje',
  },
};

/**
 * Convierte un TreeSlice en un TariffTree para pruebas.
 */
export function treeSlice(slice: TreeSlice): TariffTree {
  const leaves = new Set(slice.leaves);
  const levelByLength: Record<number, DescentLevel> = {
    2: 2,
    4: 4,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
  };
  return {
    children: async (code: string): Promise<string[]> => slice.children[code] ?? [],
    isLeaf: (code: string): boolean => leaves.has(code),
    description: async (code: string): Promise<string> =>
      slice.description[code] ?? `desc ${code}`,
    level: (code: string): DescentLevel => {
      const level = levelByLength[code.length];
      if (level === undefined) {
        throw new Error(`Unsupported descent level ${code.length} for code ${code}`);
      }
      return level;
    },
  };
}

export const FIXTURES: Record<string, TreeSlice> = {
  '39': CHAPTER_39,
  '87': CHAPTER_87,
  '84': CHAPTER_84,
  '98': CHAPTER_98,
};
