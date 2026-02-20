import type { ProgressItem } from '../types';

const SRS_INTERVALS = [1, 2, 4, 7, 14, 30] as const;

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromISODate(value: string): Date {
  const [year, month, day] = value.split('-').map((x) => Number(x));
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function nextInterval(streak: number): number {
  const idx = Math.min(Math.max(streak - 1, 0), SRS_INTERVALS.length - 1);
  return SRS_INTERVALS[idx];
}

export function isDue(dueDate: string, todayISO: string): boolean {
  return dueDate <= todayISO;
}

export function markKnown(item: ProgressItem, today = new Date()): ProgressItem {
  const streak = item.streak + 1;
  const interval = nextInterval(streak);
  const dueDate = toISODate(addDays(today, interval));

  let state: ProgressItem['state'] = 'LEARNING';

  if (streak >= 6) {
    state = 'MASTERED';
  } else if (streak >= 2) {
    state = 'REVIEW';
  }

  return {
    ...item,
    state,
    streak,
    interval,
    dueDate,
    lastReviewedAt: today.toISOString()
  };
}

export function markRetry(item: ProgressItem, today = new Date()): ProgressItem {
  return {
    ...item,
    state: 'LEARNING',
    streak: 0,
    interval: 1,
    dueDate: toISODate(today),
    wrongCount: item.wrongCount + 1,
    lastReviewedAt: today.toISOString()
  };
}

export function buildDailyQueue(
  items: ProgressItem[],
  todayISO: string,
  newLimit: number
): ProgressItem[] {
  const dueItems = items.filter((item) => isDue(item.dueDate, todayISO));

  const reviewItems = dueItems
    .filter((item) => item.state !== 'NEW')
    .sort((a, b) => {
      if (a.dueDate !== b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }
      return b.wrongCount - a.wrongCount;
    });

  const newItems = dueItems
    .filter((item) => item.state === 'NEW')
    .sort((a, b) => b.wrongCount - a.wrongCount)
    .slice(0, newLimit);

  return [...reviewItems, ...newItems];
}
