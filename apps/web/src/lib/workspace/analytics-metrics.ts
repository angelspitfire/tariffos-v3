import type { SkuPrecedent } from '@tariffos/shared-types';
import type { WorkspaceThread } from './types';

export interface ChapterMetric {
  chapter: string;
  count: number;
  sharePct: number;
}

export interface MonthlyClassificationMetric {
  monthKey: string;
  total: number;
  approved: number;
}

export interface RecentRulingItem {
  id: string;
  threadTitle: string;
  hsCode: string;
  title: string;
  jurisdictionName: string;
  reviewStatus: string;
  adValoremPercent?: number;
  vatPercent?: number;
  createdAt: string;
}

export interface WorkspaceAnalyticsSummary {
  totalClassifications: number;
  approvedDossiers: number;
  approvalRatePct: number;
  fastPathRatePct: number;
  hitlInterventions: number;
  avgLatencyMs: number;
  skuPrecedentsCount: number;
  chapterDistribution: ChapterMetric[];
  monthlyTrend: MonthlyClassificationMetric[];
  recentRulings: RecentRulingItem[];
  hitlBreakdown: {
    fastPathCount: number;
    hitlReviewCount: number;
    batchItemsCount: number;
  };
}

export function computeWorkspaceAnalytics(
  threads: readonly WorkspaceThread[],
  skuPrecedents: readonly SkuPrecedent[],
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
  const monthlyMap = new Map<string, { total: number; approved: number }>();
  const recentRulings: RecentRulingItem[] = [];

  for (const thread of threads) {
    for (const msg of thread.messages) {
      if (msg.role !== 'assistant' || !msg.envelope) continue;
      totalClassifications += 1;
      const monthKey = (msg.createdAt || thread.createdAt || '').slice(0, 7) || '2026-01';
      const mBucket = monthlyMap.get(monthKey) ?? { total: 0, approved: 0 };
      mBucket.total += 1;

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

      const calc = env.canvasComponents.find((c) => c.type === 'calculator');
      for (const comp of env.canvasComponents) {
        if (comp.type === 'dossier') {
          if (comp.reviewStatus === 'approved') {
            approvedDossiers += 1;
            mBucket.approved += 1;
          }
          const chapter = comp.hsCode.replace(/\D/g, '').slice(0, 2);
          if (chapter.length === 2) {
            chapterCounts.set(chapter, (chapterCounts.get(chapter) ?? 0) + 1);
          }
          recentRulings.push({
            id: msg.id,
            threadTitle: thread.title,
            hsCode: comp.hsCode,
            title: comp.title,
            jurisdictionName: comp.jurisdictionName,
            reviewStatus: comp.reviewStatus ?? 'draft_ai',
            adValoremPercent: calc?.type === 'calculator' ? calc.adValoremPercent : undefined,
            vatPercent: calc?.type === 'calculator' ? calc.vatPercent : undefined,
            createdAt: msg.createdAt,
          });
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
      monthlyMap.set(monthKey, mBucket);
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

  const monthlyTrend: MonthlyClassificationMetric[] = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([monthKey, val]) => ({ monthKey, total: val.total, approved: val.approved }));

  return {
    totalClassifications,
    approvedDossiers,
    approvalRatePct: totalClassifications > 0 ? Math.round((approvedDossiers / totalClassifications) * 100) : 0,
    fastPathRatePct: totalClassifications > 0 ? Math.round((fastPathCount / totalClassifications) * 100) : 0,
    hitlInterventions,
    avgLatencyMs: latencyCount > 0 ? Math.round(latencySum / latencyCount) : 0,
    skuPrecedentsCount: skuPrecedents.length,
    chapterDistribution,
    monthlyTrend,
    recentRulings: recentRulings.slice(-12).reverse(),
    hitlBreakdown: { fastPathCount, hitlReviewCount, batchItemsCount },
  };
}
