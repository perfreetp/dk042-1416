import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { KnowledgeEntry } from '@/types';
import { knowledgeEntries as initialEntries } from '@/data/knowledge';

interface KnowledgeStore {
  entries: KnowledgeEntry[];
  setReviewStatus: (entryId: string, status: KnowledgeEntry['reviewStatus']) => void;
  setReviewer: (entryId: string, reviewer: string) => void;
  setReviewSuggestion: (entryId: string, suggestion: string) => void;
  markForReview: (entryId: string) => void;
  completeReview: (entryId: string, suggestion: string) => void;
}

export const useKnowledgeStore = create<KnowledgeStore>()(
  persist(
    (set) => ({
      entries: initialEntries,
      setReviewStatus: (entryId, status) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId ? { ...e, reviewStatus: status } : e
          ),
        })),
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
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId ? { ...e, reviewStatus: 'pending' } : e
          ),
        })),
      completeReview: (entryId, suggestion) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  reviewStatus: 'completed',
                  reviewSuggestion: suggestion,
                  lastReviewedAt: new Date().toISOString().split('T')[0],
                }
              : e
          ),
        })),
    }),
    {
      name: 'knowledge-entries-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
