import { db } from '../db';
import { toISODate } from './srs';
import type { ProgressItem, StudyState } from '../types';

const CSV_COLUMNS = [
  'grade',
  'char',
  'reading',
  'meaning',
  'study_state',
  'is_learned',
  'is_mastered',
  'due_date',
  'streak',
  'interval',
  'wrong_count',
  'last_reviewed_at'
] as const;

const VALID_STATES: ReadonlyArray<StudyState> = ['NEW', 'LEARNING', 'REVIEW', 'MASTERED'];

interface CsvExportResult {
  csv: string;
  rowCount: number;
}

export interface LearningStateImportResult {
  totalRows: number;
  importedCount: number;
  skippedCount: number;
}

function formatTimestampForFile(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}-${hour}${minute}${second}`;
}

function escapeCsvValue(value: string): string {
  const escaped = value.replace(/"/g, '""');
  if (/[",\n\r]/.test(escaped)) {
    return `"${escaped}"`;
  }
  return escaped;
}

function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map((cell) => escapeCsvValue(cell)).join(',')).join('\r\n');
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let index = 0;
  let inQuotes = false;

  while (index < text.length) {
    const ch = text[index];

    if (inQuotes) {
      if (ch === '"') {
        const next = text[index + 1];
        if (next === '"') {
          value += '"';
          index += 2;
          continue;
        }

        inQuotes = false;
        index += 1;
        continue;
      }

      value += ch;
      index += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      index += 1;
      continue;
    }

    if (ch === ',') {
      row.push(value);
      value = '';
      index += 1;
      continue;
    }

    if (ch === '\n') {
      row.push(value);
      rows.push(row);
      row = [];
      value = '';
      index += 1;
      continue;
    }

    if (ch === '\r') {
      index += 1;
      continue;
    }

    value += ch;
    index += 1;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

function normalizeState(value: string): StudyState | null {
  const upper = value.trim().toUpperCase();
  if (VALID_STATES.includes(upper as StudyState)) {
    return upper as StudyState;
  }
  return null;
}

function parseNonNegativeInt(value: string, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(0, Math.floor(parsed));
}

function isISODate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeLastReviewedAt(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function statusFlags(state: StudyState): { learned: string; mastered: string } {
  return {
    learned: state === 'NEW' ? 'N' : 'Y',
    mastered: state === 'MASTERED' ? 'Y' : 'N'
  };
}

async function buildLearningStateCsv(): Promise<CsvExportResult> {
  const [chars, progressRows] = await Promise.all([db.chars.toArray(), db.progress.toArray()]);
  const progressMap = new Map(progressRows.map((item) => [`${item.grade}:${item.char}`, item]));

  const todayISO = toISODate(new Date());

  const sortedChars = [...chars].sort((a, b) => {
    if (a.grade !== b.grade) {
      return b.grade - a.grade;
    }
    return a.char.localeCompare(b.char, 'ko-KR');
  });

  const rows: string[][] = [Array.from(CSV_COLUMNS)];

  for (const charInfo of sortedChars) {
    const key = `${charInfo.grade}:${charInfo.char}`;
    const progress = progressMap.get(key);

    const state: StudyState = progress?.state ?? 'NEW';
    const { learned, mastered } = statusFlags(state);

    rows.push([
      String(charInfo.grade),
      charInfo.char,
      charInfo.reading,
      charInfo.meaning,
      state,
      learned,
      mastered,
      progress?.dueDate ?? todayISO,
      String(progress?.streak ?? 0),
      String(progress?.interval ?? 0),
      String(progress?.wrongCount ?? 0),
      progress?.lastReviewedAt ?? ''
    ]);
  }

  return {
    csv: toCsv(rows),
    rowCount: sortedChars.length
  };
}

export async function downloadLearningStateCsv(): Promise<{ fileName: string; rowCount: number }> {
  const now = new Date();
  const { csv, rowCount } = await buildLearningStateCsv();

  const fileName = `hanja-step-learning-state-${formatTimestampForFile(now)}.csv`;
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';

  document.body.append(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);

  return { fileName, rowCount };
}

export async function importLearningStateFromCsv(text: string): Promise<LearningStateImportResult> {
  const rows = parseCsv(text)
    .map((row) => row.map((value) => value.trim()))
    .filter((row) => row.some((value) => value.length > 0));

  if (rows.length < 2) {
    throw new Error('CSV 파일에 데이터가 없습니다.');
  }

  const header = rows[0].map((value) => value.toLowerCase());
  const indexMap = new Map<string, number>(header.map((value, idx) => [value, idx]));

  const requiredColumns: string[] = ['grade', 'char', 'study_state', 'due_date', 'streak', 'interval', 'wrong_count'];
  for (const column of requiredColumns) {
    if (!indexMap.has(column)) {
      throw new Error(`필수 컬럼이 없습니다: ${column}`);
    }
  }

  const [chars] = await Promise.all([db.chars.toArray()]);
  const validCharKeys = new Set(chars.map((item) => `${item.grade}:${item.char}`));
  const todayISO = toISODate(new Date());

  const deduped = new Map<string, ProgressItem>();
  let skippedCount = 0;

  for (const row of rows.slice(1)) {
    const gradeIdx = indexMap.get('grade');
    const charIdx = indexMap.get('char');
    const stateIdx = indexMap.get('study_state');
    const dueDateIdx = indexMap.get('due_date');
    const streakIdx = indexMap.get('streak');
    const intervalIdx = indexMap.get('interval');
    const wrongCountIdx = indexMap.get('wrong_count');
    const lastReviewedIdx = indexMap.get('last_reviewed_at');

    if (
      gradeIdx === undefined ||
      charIdx === undefined ||
      stateIdx === undefined ||
      dueDateIdx === undefined ||
      streakIdx === undefined ||
      intervalIdx === undefined ||
      wrongCountIdx === undefined
    ) {
      skippedCount += 1;
      continue;
    }

    const grade = Number(row[gradeIdx]);
    const char = row[charIdx] ?? '';

    if (!Number.isInteger(grade) || !char) {
      skippedCount += 1;
      continue;
    }

    const state = normalizeState(row[stateIdx] ?? '');
    if (!state) {
      skippedCount += 1;
      continue;
    }

    const validKey = `${grade}:${char}`;
    if (!validCharKeys.has(validKey)) {
      skippedCount += 1;
      continue;
    }

    const dueDateRaw = row[dueDateIdx] ?? '';
    const dueDate = isISODate(dueDateRaw) ? dueDateRaw : todayISO;

    const streak = parseNonNegativeInt(row[streakIdx] ?? '', 0);
    const interval = parseNonNegativeInt(row[intervalIdx] ?? '', 0);
    const wrongCount = parseNonNegativeInt(row[wrongCountIdx] ?? '', 0);
    const lastReviewedAt = normalizeLastReviewedAt(lastReviewedIdx === undefined ? '' : row[lastReviewedIdx] ?? '');

    deduped.set(validKey, {
      char,
      grade,
      state,
      dueDate,
      streak,
      interval,
      wrongCount,
      lastReviewedAt
    });
  }

  const progressRows = [...deduped.values()];
  if (progressRows.length > 0) {
    await db.progress.bulkPut(progressRows);
  }

  return {
    totalRows: rows.length - 1,
    importedCount: progressRows.length,
    skippedCount
  };
}
