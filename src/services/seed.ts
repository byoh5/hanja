import { db } from '../db';
import { GRADE8_CHARS } from '../data/grade8';
import { toISODate } from './srs';
import type { ProgressItem } from '../types';

const SEED_VERSION = '1';

export async function seedBaseData(): Promise<void> {
  const storageKey = `hanja-step-seed-${SEED_VERSION}`;
  const done = localStorage.getItem(storageKey);

  if (done === 'done') {
    return;
  }

  const count = await db.chars.count();
  if (count === 0) {
    await db.chars.bulkAdd(GRADE8_CHARS);
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
    await db.progress.bulkAdd(missing);
  }
}
