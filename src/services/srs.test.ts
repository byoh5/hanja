import { describe, expect, it } from 'vitest';
import type { ProgressItem } from '../types';
import { buildDailyQueue, markKnown, markRetry, toISODate } from './srs';

function baseProgress(partial?: Partial<ProgressItem>): ProgressItem {
  return {
    char: '大',
    grade: 8,
    state: 'NEW',
    interval: 0,
    streak: 0,
    dueDate: '2026-02-20',
    wrongCount: 0,
    lastReviewedAt: null,
    ...partial
  };
}

describe('srs', () => {
  it('정답 처리 시 간격과 상태를 올린다', () => {
    const today = new Date('2026-02-20T00:00:00Z');
    const next = markKnown(baseProgress(), today);

    expect(next.streak).toBe(1);
    expect(next.interval).toBe(1);
    expect(next.state).toBe('LEARNING');
    expect(next.dueDate).toBe('2026-02-21');
  });

  it('오답 처리 시 streak를 초기화하고 dueDate를 오늘로 둔다', () => {
    const today = new Date('2026-02-20T00:00:00Z');
    const next = markRetry(
      baseProgress({
        state: 'REVIEW',
        streak: 3,
        interval: 4,
        wrongCount: 2,
        dueDate: '2026-02-25'
      }),
      today
    );

    expect(next.streak).toBe(0);
    expect(next.interval).toBe(1);
    expect(next.state).toBe('LEARNING');
    expect(next.wrongCount).toBe(3);
    expect(next.dueDate).toBe('2026-02-20');
  });

  it('일일 큐에서 REVIEW를 NEW보다 우선한다', () => {
    const today = toISODate(new Date('2026-02-20T00:00:00Z'));

    const queue = buildDailyQueue(
      [
        baseProgress({ char: '學', state: 'NEW' }),
        baseProgress({ char: '校', state: 'REVIEW', dueDate: '2026-02-19', wrongCount: 1 }),
        baseProgress({ char: '生', state: 'REVIEW', dueDate: '2026-02-18', wrongCount: 0 })
      ],
      today,
      20
    );

    expect(queue[0]?.char).toBe('生');
    expect(queue[1]?.char).toBe('校');
    expect(queue[2]?.char).toBe('學');
  });
});
