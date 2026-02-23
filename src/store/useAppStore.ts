import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStore {
  selectedGrade: number | null;
  speechEnabled: boolean;
  dailyStudyTarget: number;
  setSelectedGrade: (grade: number) => void;
  toggleSpeechEnabled: () => void;
  setDailyStudyTarget: (target: number) => void;
  resetGrade: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      selectedGrade: null,
      speechEnabled: true,
      dailyStudyTarget: 20,
      setSelectedGrade: (grade) => {
        set({ selectedGrade: grade });
      },
      toggleSpeechEnabled: () => {
        set((state) => ({ speechEnabled: !state.speechEnabled }));
      },
      setDailyStudyTarget: (target) => {
        set({ dailyStudyTarget: target });
      },
      resetGrade: () => {
        set({ selectedGrade: null });
      }
    }),
    {
      name: 'hanja-step-store',
      partialize: (state) => ({
        selectedGrade: state.selectedGrade,
        speechEnabled: state.speechEnabled,
        dailyStudyTarget: state.dailyStudyTarget
      })
    }
  )
);
