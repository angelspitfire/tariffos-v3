import { describe, expect, it } from 'vitest';

import {
  CHAPTER_39,
  CHAPTER_87,
  CHAPTER_84,
  CHAPTER_98,
  treeSlice,
  type TreeSlice,
} from './fixtures.js';
import type { TariffTree } from './ports.js';

function buildTree(slice: TreeSlice): TariffTree {
  return treeSlice(slice);
}

describe('fixtures — recortes del árbol real', () => {
  it('capítulo 39 tiene ruta hasta hojas a 10 dígitos', async () => {
    const tree: TariffTree = buildTree(CHAPTER_39);
    expect(await tree.children('39')).toContain('3901');
    expect(await tree.children('3901')).toContain('390110');
    expect(tree.isLeaf('3901102010')).toBe(true);
    expect(await tree.level('3901102010')).toBe(10);
  });

  it('capítulo 87: 870829 tiene 21 hijos (no-truncación)', async () => {
    const tree: TariffTree = buildTree(CHAPTER_87);
    const hijos = await tree.children('870829');
    expect(hijos.length).toBeGreaterThan(1); // no-truncación: varios hijos, no colapsado a 3
  });

  it('capítulo 84 desciende hasta 10 dígitos', async () => {
    const tree: TariffTree = buildTree(CHAPTER_84);
    expect(await tree.children('84')).toContain('8471');
    expect(tree.isLeaf('8471301010')).toBe(true);
    expect(await tree.level('8471301010')).toBe(10);
  });

  it('capítulo 98 desciende con noSaSubheading hasta profundidad 10', async () => {
    const tree: TariffTree = buildTree(CHAPTER_98);
    expect(await tree.children('98')).toContain('9801');
    expect(await tree.children('9801')).toContain('98010000');
    expect(await tree.children('98010000')).toContain('980100001');
    expect(await tree.children('980100001')).toEqual([
      '9801000011',
      '9801000019',
    ]);
    expect(tree.isLeaf('9801000011')).toBe(true);
    expect(await tree.level('9801000011')).toBe(10);
  });

  it('todos los fixtures tienen capítulo y descripciones', () => {
    for (const [ch, slice] of Object.entries({ '39': CHAPTER_39, '87': CHAPTER_87, '84': CHAPTER_84, '98': CHAPTER_98 })) {
      expect(slice.chapter).toBe(ch);
      expect(slice.leaves.length).toBeGreaterThan(0);
    }
  });
});
