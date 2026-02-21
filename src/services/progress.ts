import { db } from '../db';
import type {
  DashboardStats,
  HanjaChar,
  ProgressItem,
  QuizAnswer,
  QuizMode,
  ReviewListItem,
  SessionRecord,
  StudyCardItem
} from '../types';
import { buildDailyQueue, fromISODate, markKnown, markRetry, toISODate } from './srs';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function toStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export async function getCharsByGrade(grade: number): Promise<HanjaChar[]> {
  return db.chars.where('grade').equals(grade).toArray();
}

export async function getProgressByGrade(grade: number): Promise<ProgressItem[]> {
  return db.progress.where('grade').equals(grade).toArray();
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

export async function getUpcomingReviews(grade: number, limit = 3): Promise<ReviewListItem[]> {
  const rows = await db.progress.where('grade').equals(grade).toArray();
  const today = toStartOfDay(new Date());

  return rows
    .filter((item) => item.state !== 'MASTERED')
    .sort((a, b) => {
      if (a.dueDate !== b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }
      return b.wrongCount - a.wrongCount;
    })
    .slice(0, limit)
    .map((item) => {
      const due = toStartOfDay(fromISODate(item.dueDate));
      const daysUntil = Math.round((due.getTime() - today.getTime()) / ONE_DAY_MS);
      return {
        char: item.char,
        dueDate: item.dueDate,
        daysUntil
      };
    });
}

export async function lookupChar(query: string): Promise<HanjaChar | null> {
  const target = Array.from(query.trim())[0] ?? '';
  if (!target) {
    return null;
  }
  const found = await db.chars.get(target);
  return found ?? null;
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
