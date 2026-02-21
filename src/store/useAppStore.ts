import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStore {
  selectedGrade: number | null;
  speechEnabled: boolean;
  setSelectedGrade: (grade: number) => void;
  toggleSpeechEnabled: () => void;
  resetGrade: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      selectedGrade: null,
      speechEnabled: true,
      setSelectedGrade: (grade) => {
        set({ selectedGrade: grade });
      },
      toggleSpeechEnabled: () => {
        set((state) => ({ speechEnabled: !state.speechEnabled }));
      },
      resetGrade: () => {
        set({ selectedGrade: null });
      }
    }),
    {
      name: 'hanja-step-store',
      partialize: (state) => ({
        selectedGrade: state.selectedGrade,
        speechEnabled: state.speechEnabled
      })
    }
  )
);
