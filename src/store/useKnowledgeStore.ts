import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { KnowledgeEntry, GovernanceRecord } from '@/types';
import { knowledgeEntries as initialEntries } from '@/data/knowledge';

function getMissingItems(entry: KnowledgeEntry): string[] {
  const items: string[] = [];
  if (!entry.hasManualReference) items.push('手册依据');
  if (!entry.hasReleaseConclusion) items.push('放行结论');
  if (!entry.hasFollowUp) items.push('后续跟踪');
  return items;
}

interface KnowledgeStore {
  entries: KnowledgeEntry[];
  governanceRecords: GovernanceRecord[];
  setReviewStatus: (entryId: string, status: KnowledgeEntry['reviewStatus']) => void;
  setReviewer: (entryId: string, reviewer: string) => void;
  setReviewSuggestion: (entryId: string, suggestion: string) => void;
  markForReview: (entryId: string) => void;
  completeReview: (entryId: string, suggestion: string) => void;
  getEntryRecords: (entryId: string) => GovernanceRecord[];
}

export const useKnowledgeStore = create<KnowledgeStore>()(
  persist(
    (set, get) => ({
      entries: initialEntries,
      governanceRecords: [],

      setReviewStatus: (entryId, status) =>
        set((state) => {
          const entry = state.entries.find((e) => e.id === entryId);
          if (!entry) return state;

          const record: GovernanceRecord = {
            id: `GR${Date.now()}`,
            entryId,
            fromStatus: entry.reviewStatus,
            toStatus: status,
            fromSuccessRate: entry.successRate,
            toSuccessRate: entry.successRate,
            fromReferenceCount: entry.referenceCount,
            toReferenceCount: entry.referenceCount,
            fromMissingItems: getMissingItems(entry),
            toMissingItems: getMissingItems(entry),
            reviewer: entry.reviewer,
            suggestion: entry.reviewSuggestion,
            changedAt: new Date().toISOString().split('T')[0],
          };

          return {
            entries: state.entries.map((e) =>
              e.id === entryId ? { ...e, reviewStatus: status } : e
            ),
            governanceRecords: [...state.governanceRecords, record],
          };
        }),

      setReviewer: (entryId, reviewer) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId ? { ...e, reviewer } : e
          ),
        })),

      setReviewSuggestion: (entryId, suggestion) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId ? { ...e, reviewSuggestion: suggestion } : e
          ),
        })),

      markForReview: (entryId) =>
        set((state) => {
          const entry = state.entries.find((e) => e.id === entryId);
          if (!entry) return state;

          const record: GovernanceRecord = {
            id: `GR${Date.now()}`,
            entryId,
            fromStatus: entry.reviewStatus,
            toStatus: 'pending',
            fromSuccessRate: entry.successRate,
            toSuccessRate: entry.successRate,
            fromReferenceCount: entry.referenceCount,
            toReferenceCount: entry.referenceCount,
            fromMissingItems: getMissingItems(entry),
            toMissingItems: getMissingItems(entry),
            reviewer: entry.reviewer,
            suggestion: entry.reviewSuggestion,
            changedAt: new Date().toISOString().split('T')[0],
          };

          return {
            entries: state.entries.map((e) =>
              e.id === entryId ? { ...e, reviewStatus: 'pending' } : e
            ),
            governanceRecords: [...state.governanceRecords, record],
          };
        }),

      completeReview: (entryId, suggestion) =>
        set((state) => {
          const entry = state.entries.find((e) => e.id === entryId);
          if (!entry) return state;

          const improvedSuccessRate = Math.min(100, entry.successRate + Math.floor(Math.random() * 15) + 5);
          const improvedRefCount = entry.referenceCount + Math.floor(Math.random() * 5) + 1;

          const toEntry = {
            ...entry,
            reviewStatus: 'completed' as const,
            reviewSuggestion: suggestion,
            lastReviewedAt: new Date().toISOString().split('T')[0],
            successRate: improvedSuccessRate,
            referenceCount: improvedRefCount,
          };

          const record: GovernanceRecord = {
            id: `GR${Date.now()}`,
            entryId,
            fromStatus: entry.reviewStatus,
            toStatus: 'completed',
            fromSuccessRate: entry.successRate,
            toSuccessRate: improvedSuccessRate,
            fromReferenceCount: entry.referenceCount,
            toReferenceCount: improvedRefCount,
            fromMissingItems: getMissingItems(entry),
            toMissingItems: getMissingItems(toEntry),
            reviewer: entry.reviewer,
            suggestion,
            changedAt: new Date().toISOString().split('T')[0],
          };

          return {
            entries: state.entries.map((e) =>
              e.id === entryId ? toEntry : e
            ),
            governanceRecords: [...state.governanceRecords, record],
          };
        }),

      getEntryRecords: (entryId) => {
        return get().governanceRecords.filter((r) => r.entryId === entryId);
      },
    }),
    {
      name: 'knowledge-entries-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
