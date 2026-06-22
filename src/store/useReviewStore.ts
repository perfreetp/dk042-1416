import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ReviewTask } from '@/types';
import { reviewTasks as initialTasks } from '@/data/reviews';

interface ReviewStore {
  tasks: ReviewTask[];
  assignTask: (taskId: string, assignee: string) => void;
  updateTaskStatus: (taskId: string, status: ReviewTask['status']) => void;
  updateRootCause: (taskId: string, cause: string) => void;
  updateTroubleshootingTip: (taskId: string, tip: string) => void;
  setTrainingRequired: (taskId: string, required: boolean) => void;
  updateTrainingStatus: (taskId: string, status: ReviewTask['trainingStatus']) => void;
}

export const useReviewStore = create<ReviewStore>()(
  persist(
    (set) => ({
      tasks: initialTasks,
      assignTask: (taskId, assignee) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, assignee, status: 'assigned' as const } : t
          ),
        })),
      updateTaskStatus: (taskId, status) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, status } : t
          ),
        })),
      updateRootCause: (taskId, cause) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, rootCause: cause } : t
          ),
        })),
      updateTroubleshootingTip: (taskId, tip) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, troubleshootingTip: tip } : t
          ),
        })),
      setTrainingRequired: (taskId, required) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, trainingRequired: required, trainingStatus: required ? 'pending' : 'none' }
              : t
          ),
        })),
      updateTrainingStatus: (taskId, status) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, trainingStatus: status } : t
          ),
        })),
    }),
    {
      name: 'review-tasks-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
