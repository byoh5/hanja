import Dexie, { type Table } from 'dexie';
import type { HanjaChar, ProgressItem, SessionRecord } from '../types';

class HanjaStepDB extends Dexie {
  chars!: Table<HanjaChar, string>;
  progress!: Table<ProgressItem, [string, number]>;
  sessions!: Table<SessionRecord, number>;

  constructor() {
    super('hanja-step');

    this.version(1).stores({
      chars: 'char, grade, reading, meaning',
      progress: '[char+grade], char, grade, state, dueDate, wrongCount',
      sessions: '++id, grade, mode, startedAt, endedAt, score'
    });
  }
}

export const db = new HanjaStepDB();
