import { db } from '../db';
import type {
  DashboardStats,
  HanjaChar,
  ProgressItem,
  QuizAnswer,
  QuizMode,
  SessionRecord,
  StudyCardItem
} from '../types';
import { buildDailyQueue, markKnown, markRetry, toISODate } from './srs';

export async function getCharsByGrade(grade: number): Promise<HanjaChar[]> {
  return db.chars.where('grade').equals(grade).toArray();
}

export async function getDashboardStats(grade: number): Promise<DashboardStats> {
  const progressRows = await db.progress.where('grade').equals(grade).toArray();
  const today = toISODate(new Date());

  return {
    total: progressRows.length,
    mastered: progressRows.filter((item) => item.state === 'MASTERED').length,
    reviewDue: progressRows.filter((item) => item.dueDate <= today && item.state !== 'NEW').length,
    newCount: progressRows.filter((item) => item.state === 'NEW').length
  };
}

export async function getStudyQueue(
  grade: number,
  options?: { newLimit?: number; maxItems?: number }
): Promise<StudyCardItem[]> {
  const newLimit = options?.newLimit ?? 20;
  const maxItems = options?.maxItems ?? 50;

  const today = toISODate(new Date());
  const progressRows = await db.progress.where('grade').equals(grade).toArray();
  const queued = buildDailyQueue(progressRows, today, newLimit).slice(0, maxItems);

  const chars = await db.chars.where('grade').equals(grade).toArray();
  const charMap = new Map(chars.map((item) => [item.char, item]));

  return queued
    .map((progress) => {
      const charInfo = charMap.get(progress.char);
      if (!charInfo) {
        return null;
      }

      return { charInfo, progress };
    })
    .filter((item): item is StudyCardItem => item !== null);
}

export async function applyStudyAction(
  char: string,
  grade: number,
  action: 'known' | 'retry'
): Promise<ProgressItem | null> {
  const current = await db.progress.get([char, grade]);
  if (!current) {
    return null;
  }

  const updated = action === 'known' ? markKnown(current) : markRetry(current);
  await db.progress.put(updated);

  return updated;
}

export async function saveQuizOutcome(params: {
  grade: number;
  mode: QuizMode;
  startedAt: Date;
  endedAt: Date;
  answers: QuizAnswer[];
}): Promise<SessionRecord> {
  const { grade, mode, startedAt, endedAt, answers } = params;
  const updates: ProgressItem[] = [];

  for (const answer of answers) {
    const progress = await db.progress.get([answer.question.char, grade]);
    if (!progress) {
      continue;
    }

    const next = answer.isCorrect ? markKnown(progress) : markRetry(progress);
    updates.push(next);
  }

  if (updates.length > 0) {
    await db.progress.bulkPut(updates);
  }

  const correctCount = answers.filter((answer) => answer.isCorrect).length;
  const total = answers.length;
  const score = total === 0 ? 0 : Math.round((correctCount / total) * 100);

  const session: SessionRecord = {
    grade,
    mode,
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    score,
    total,
    correctCount
  };

  const id = await db.sessions.add(session);
  return { ...session, id };
}
