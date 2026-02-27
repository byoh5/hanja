import type { HanjaChar } from '../types';

export const SUPPORTED_GRADES = [8, 7, 6, 5, 4, 3, 2, 1] as const;

export type SupportedGrade = (typeof SUPPORTED_GRADES)[number];

let groupedByGradeCache: Record<SupportedGrade, HanjaChar[]> | null = null;

function createEmptyGroups(): Record<SupportedGrade, HanjaChar[]> {
  return SUPPORTED_GRADES.reduce<Record<SupportedGrade, HanjaChar[]>>((acc, grade) => {
    acc[grade] = [];
    return acc;
  }, {} as Record<SupportedGrade, HanjaChar[]>);
}

function groupByGrade(allChars: HanjaChar[]): Record<SupportedGrade, HanjaChar[]> {
  const grouped = createEmptyGroups();
  for (const item of allChars) {
    if (SUPPORTED_GRADES.includes(item.grade as SupportedGrade)) {
      grouped[item.grade as SupportedGrade].push(item);
    }
  }
  return grouped;
}

export async function getGroupedCharsByGrade(): Promise<Record<SupportedGrade, HanjaChar[]>> {
  if (groupedByGradeCache) {
    return groupedByGradeCache;
  }

  const module = await import('../../shared/data/hanja_chars.json');
  groupedByGradeCache = groupByGrade(module.default as HanjaChar[]);

  return groupedByGradeCache;
}

export async function getSourceCharsByGrade(grade: SupportedGrade): Promise<HanjaChar[]> {
  const grouped = await getGroupedCharsByGrade();
  return grouped[grade];
}
