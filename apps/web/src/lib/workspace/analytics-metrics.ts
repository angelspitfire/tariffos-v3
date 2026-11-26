import type { SkuPrecedent } from '@tariffos/shared-types';
import type { WorkspaceThread } from './types';

export interface ChapterMetric {
  chapter: string;
  count: number;
  sharePct: number;
}

export interface WorkspaceAnalyticsSummary {
  totalClassifications: number;
  approvedDossiers: number;
  hitlInterventions: number;
  avgLatencyMs: number;
  skuPrecedentsCount: number;
  chapterDistribution: ChapterMetric[];
  hitlBreakdown: {
    fastPathCount: number;
    hitlReviewCount: number;
    batchItemsCount: number;
  };
}

export function computeWorkspaceAnalytics(
  threads: readonly WorkspaceThread[],
  skuPrecedents: readonly SkuPrecedent[]
): WorkspaceAnalyticsSummary {
  let totalClassifications = 0;
  let approvedDossiers = 0;
  let hitlInterventions = 0;
  let latencySum = 0;
  let latencyCount = 0;
  let fastPathCount = 0;
  let hitlReviewCount = 0;
  let batchItemsCount = 0;
  const chapterCounts = new Map<string, number>();

  for (const thread of threads) {
    for (const msg of thread.messages) {
      if (msg.role !== 'assistant' || !msg.envelope) continue;
      totalClassifications += 1;

      if (typeof msg.latencyMs === 'number' && msg.latencyMs > 0) {
        latencySum += msg.latencyMs;
        latencyCount += 1;
      }

      const env = msg.envelope;
      if (env.classificationStatus !== 'classified' || env.workflowState === 'needs_input') {
        hitlInterventions += 1;
        hitlReviewCount += 1;
      } else {
        fastPathCount += 1;
      }

      for (const comp of env.canvasComponents) {
        if (comp.type === 'dossier') {
          if (comp.reviewStatus === 'approved') approvedDossiers += 1;
          const chapter = comp.hsCode.replace(/\D/g, '').slice(0, 2);
          if (chapter.length === 2) {
            chapterCounts.set(chapter, (chapterCounts.get(chapter) ?? 0) + 1);
          }
        }
        if (comp.type === 'batch_manifest') {
          batchItemsCount += comp.items.length;
          for (const item of comp.items) {
            const chapter = item.hsCode.replace(/\D/g, '').slice(0, 2);
            if (chapter.length === 2) {
              chapterCounts.set(chapter, (chapterCounts.get(chapter) ?? 0) + 1);
            }
          }
        }
      }
    }
  }

  const totalChapters = Array.from(chapterCounts.values()).reduce((sum, n) => sum + n, 0);
  const chapterDistribution: ChapterMetric[] = Array.from(chapterCounts.entries())
    .map(([chapter, count]) => ({
      chapter: `Cap. ${chapter}`,
      count,
      sharePct: totalChapters > 0 ? Math.round((count / totalChapters) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    totalClassifications,
    approvedDossiers,
    hitlInterventions,
    avgLatencyMs: latencyCount > 0 ? Math.round(latencySum / latencyCount) : 0,
    skuPrecedentsCount: skuPrecedents.length,
    chapterDistribution,
    hitlBreakdown: { fastPathCount, hitlReviewCount, batchItemsCount },
  };
}
