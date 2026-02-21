import type { HanjaChar } from '../types';
import { GRADE1_CHARS } from './grade1';
import { GRADE2_CHARS } from './grade2';
import { GRADE3_CHARS } from './grade3';
import { GRADE4_CHARS } from './grade4';
import { GRADE5_CHARS } from './grade5';
import { GRADE6_CHARS } from './grade6';
import { GRADE7_CHARS } from './grade7';
import { GRADE8_CHARS } from './grade8';

export const SUPPORTED_GRADES = [8, 7, 6, 5, 4, 3, 2, 1] as const;

export type SupportedGrade = (typeof SUPPORTED_GRADES)[number];

export const GRADE_CHARS_BY_GRADE: Record<SupportedGrade, HanjaChar[]> = {
  8: GRADE8_CHARS,
  7: GRADE7_CHARS,
  6: GRADE6_CHARS,
  5: GRADE5_CHARS,
  4: GRADE4_CHARS,
  3: GRADE3_CHARS,
  2: GRADE2_CHARS,
  1: GRADE1_CHARS
};
