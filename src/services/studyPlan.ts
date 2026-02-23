export interface StudyPaceOption {
  target: number;
  newLimit: number;
  label: string;
}

export const STUDY_PACE_OPTIONS: StudyPaceOption[] = [
  { target: 10, newLimit: 5, label: '가볍게' },
  { target: 20, newLimit: 10, label: '보통' },
  { target: 30, newLimit: 15, label: '집중' },
  { target: 50, newLimit: 20, label: '몰입' }
];

export function resolveStudyPace(target: number): StudyPaceOption {
  return STUDY_PACE_OPTIONS.find((option) => option.target === target) ?? STUDY_PACE_OPTIONS[1];
}

