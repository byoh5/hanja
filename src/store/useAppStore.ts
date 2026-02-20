import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStore {
  selectedGrade: number | null;
  setSelectedGrade: (grade: number) => void;
  resetGrade: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      selectedGrade: null,
      setSelectedGrade: (grade) => {
        set({ selectedGrade: grade });
      },
      resetGrade: () => {
        set({ selectedGrade: null });
      }
    }),
    {
      name: 'hanja-step-store',
      partialize: (state) => ({ selectedGrade: state.selectedGrade })
    }
  )
);
