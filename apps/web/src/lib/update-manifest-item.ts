import type { Dispatch, SetStateAction } from 'react';
import type { A2UIArtifact, ManifestGridPayload, ManifestLineItem } from '@/types/domain';

export function createUpdateManifestItem(
  setArtifacts: Dispatch<SetStateAction<A2UIArtifact[]>>,
): (artifactId: string, itemId: string, patch: Partial<ManifestLineItem>) => void {
  return (artifactId: string, itemId: string, patch: Partial<ManifestLineItem>) => {
    setArtifacts((prev) =>
      prev.map((art) => {
        if (art.id !== artifactId || art.type !== 'batch-manifest') return art;
        const data = art.data as ManifestGridPayload;
        const updatedItems = data.items.map((item) =>
          item.id === itemId ? { ...item, ...patch } : item
        );
        const totalCif = updatedItems.reduce((sum, it) => sum + it.cifValue * it.quantity, 0);
        const totalDuties = updatedItems.reduce(
          (sum, it) => sum + (it.cifValue * it.quantity * it.dutyRate) / 100,
          0
        );
        return { ...art, data: { ...data, items: updatedItems, totalCif, totalDuties } };
      })
    );
  };
}
