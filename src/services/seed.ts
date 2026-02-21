import { db } from '../db';
import { GRADE_CHARS_BY_GRADE, SUPPORTED_GRADES } from '../data';
import { toISODate } from './srs';
import type { HanjaChar, ProgressItem } from '../types';

const SEED_VERSION = '2';

async function syncGradeChars(grade: number, chars: HanjaChar[]): Promise<void> {
  const sourceSet = new Set(chars.map((item) => item.char));
  const existing = await db.chars.where('grade').equals(grade).toArray();
  const staleChars = existing
    .filter((item) => !sourceSet.has(item.char))
    .map((item) => item.char);

  if (staleChars.length > 0) {
    await db.chars.bulkDelete(staleChars);
    await db.progress.bulkDelete(staleChars.map((char) => [char, grade] as [string, number]));
  }

  await db.chars.bulkPut(chars);
}

export async function seedBaseData(): Promise<void> {
  const storageKey = `hanja-step-seed-${SEED_VERSION}`;
  const alreadySeeded = localStorage.getItem(storageKey) === 'done';
  const hasAnyData = (await db.chars.count()) > 0;

  if (alreadySeeded && hasAnyData) {
    return;
  }

  for (const grade of SUPPORTED_GRADES) {
    await syncGradeChars(grade, GRADE_CHARS_BY_GRADE[grade]);
  }

  localStorage.setItem(storageKey, 'done');
}

export async function ensureGradeProgress(grade: number): Promise<void> {
  const today = toISODate(new Date());
  const chars = await db.chars.where('grade').equals(grade).toArray();

  if (chars.length === 0) {
    return;
  }

  const missing: ProgressItem[] = [];

  for (const charInfo of chars) {
    const existing = await db.progress.get([charInfo.char, grade]);
    if (!existing) {
      missing.push({
        char: charInfo.char,
        grade,
        state: 'NEW',
        interval: 0,
        streak: 0,
        dueDate: today,
        wrongCount: 0,
        lastReviewedAt: null
      });
    }
  }

  if (missing.length > 0) {
    await db.progress.bulkPut(missing);
  }
}
