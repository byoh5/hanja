import { SUPPORTED_GRADES } from '../data';
import { VOCABULARY_MATERIALS } from '../data/vocabularyMaterials';
import type { HanjaChar } from '../types';

export type VocabularyDictionarySource = 'curated' | 'wiktionary' | 'seed';

export interface VocabularyDictionaryEntry {
  id: string;
  grade: number | null;
  char: string;
  charReading: string;
  charMeaning: string;
  word: string;
  plainWord: string;
  readingToken: string;
  meaning: string;
  sentence: string;
  usageNote: string;
  source: VocabularyDictionarySource;
  sourceUrl: string | null;
}

export interface VocabularyCoverageSummary {
  grade: number;
  totalChars: number;
  coveredChars: number;
  words: number;
  coverageRate: number;
}

export interface VocabularySentenceExercise {
  answer: string;
  blankSentence: string;
  originalSentence: string;
  hint: string;
}

export interface VocabularyBankEntryInput {
  word: string;
  readingToken: string;
  meaning: string;
  sentence: string;
  usageNote: string;
  sourceUrl?: string;
}

export interface VocabularyBankCharInput {
  char: string;
  reading: string;
  meaning: string;
  entries: VocabularyBankEntryInput[];
}

const GRADE_ORDER = new Map<number, number>(SUPPORTED_GRADES.map((grade, index) => [grade, index]));

function stripAnnotation(value: string): string {
  return value.replace(/\([^)]*\)/g, '').trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function compareEntries(a: VocabularyDictionaryEntry, b: VocabularyDictionaryEntry): number {
  const aGradeRank = a.grade === null ? Number.MAX_SAFE_INTEGER : (GRADE_ORDER.get(a.grade) ?? Number.MAX_SAFE_INTEGER - 1);
  const bGradeRank = b.grade === null ? Number.MAX_SAFE_INTEGER : (GRADE_ORDER.get(b.grade) ?? Number.MAX_SAFE_INTEGER - 1);

  if (aGradeRank !== bGradeRank) {
    return aGradeRank - bGradeRank;
  }

  if (a.char !== b.char) {
    return a.char.localeCompare(b.char, 'ko-KR');
  }

  return a.plainWord.localeCompare(b.plainWord, 'ko-KR');
}

function buildDictionaryFromMaterialSource(
  allChars: HanjaChar[],
  sourceMaterials: Record<string, VocabularyBankCharInput>,
  source: VocabularyDictionarySource
): VocabularyDictionaryEntry[] {
  const charByValue = new Map(allChars.map((item) => [item.char, item]));
  const rows: VocabularyDictionaryEntry[] = [];

  for (const material of Object.values(sourceMaterials)) {
    const charInfo = charByValue.get(material.char);

    material.entries.forEach((entry, index) => {
      rows.push({
        id: `${source}-${material.char}-${index}-${stripAnnotation(entry.word)}`,
        grade: charInfo?.grade ?? null,
        char: material.char,
        charReading: material.reading,
        charMeaning: material.meaning,
        word: entry.word,
        plainWord: stripAnnotation(entry.word),
        readingToken: entry.readingToken.trim(),
        meaning: entry.meaning,
        sentence: entry.sentence,
        usageNote: entry.usageNote,
        source,
        sourceUrl: entry.sourceUrl ?? null
      });
    });
  }

  return rows.sort(compareEntries);
}

export function buildVocabularyDictionary(allChars: HanjaChar[]): VocabularyDictionaryEntry[] {
  return buildDictionaryFromMaterialSource(allChars, VOCABULARY_MATERIALS, 'curated');
}

export function buildVocabularyDictionaryFromWebBank(
  allChars: HanjaChar[],
  sourceMaterials: Record<string, VocabularyBankCharInput>
): VocabularyDictionaryEntry[] {
  const rows = buildDictionaryFromMaterialSource(allChars, sourceMaterials, 'wiktionary');

  return rows.map((entry) => ({
    ...entry,
    source: entry.sourceUrl === 'shared/data/hanja_chars.json' ? 'seed' : 'wiktionary'
  }));
}

function makeMergeKey(entry: VocabularyDictionaryEntry): string {
  return `${entry.char}::${entry.plainWord}`;
}

export function mergeVocabularyDictionaryEntries(
  preferred: VocabularyDictionaryEntry[],
  fallback: VocabularyDictionaryEntry[]
): VocabularyDictionaryEntry[] {
  const map = new Map<string, VocabularyDictionaryEntry>();

  for (const item of preferred) {
    map.set(makeMergeKey(item), item);
  }

  for (const item of fallback) {
    const key = makeMergeKey(item);
    if (!map.has(key)) {
      map.set(key, item);
    }
  }

  return [...map.values()].sort(compareEntries);
}

export function buildVocabularyCoverageSummary(
  allChars: HanjaChar[],
  dictionary: VocabularyDictionaryEntry[]
): VocabularyCoverageSummary[] {
  const totalCharsByGrade = new Map<number, number>();
  const coveredCharsByGrade = new Map<number, Set<string>>();
  const wordsByGrade = new Map<number, number>();

  for (const charInfo of allChars) {
    totalCharsByGrade.set(charInfo.grade, (totalCharsByGrade.get(charInfo.grade) ?? 0) + 1);
  }

  for (const entry of dictionary) {
    if (entry.grade === null) {
      continue;
    }

    const covered = coveredCharsByGrade.get(entry.grade) ?? new Set<string>();
    covered.add(entry.char);
    coveredCharsByGrade.set(entry.grade, covered);

    wordsByGrade.set(entry.grade, (wordsByGrade.get(entry.grade) ?? 0) + 1);
  }

  return SUPPORTED_GRADES.map((grade) => {
    const totalChars = totalCharsByGrade.get(grade) ?? 0;
    const coveredChars = coveredCharsByGrade.get(grade)?.size ?? 0;
    const words = wordsByGrade.get(grade) ?? 0;
    const coverageRate = totalChars === 0 ? 0 : Math.round((coveredChars / totalChars) * 100);

    return {
      grade,
      totalChars,
      coveredChars,
      words,
      coverageRate
    };
  });
}

export function createSentenceBlank(sentence: string, answer: string): string {
  const normalizedAnswer = answer.trim();
  if (!normalizedAnswer) {
    return sentence;
  }

  const fullWordPattern = new RegExp(escapeRegExp(normalizedAnswer));
  if (fullWordPattern.test(sentence)) {
    return sentence.replace(fullWordPattern, '____');
  }

  const compactAnswer = normalizedAnswer.replace(/\s+/g, '');
  if (compactAnswer && compactAnswer !== normalizedAnswer) {
    const compactPattern = new RegExp(escapeRegExp(compactAnswer));
    if (compactPattern.test(sentence)) {
      return sentence.replace(compactPattern, '____');
    }
  }

  return sentence;
}

export function buildSentenceExercise(entry: VocabularyDictionaryEntry): VocabularySentenceExercise {
  return {
    answer: entry.plainWord,
    blankSentence: createSentenceBlank(entry.sentence, entry.plainWord),
    originalSentence: entry.sentence,
    hint: `${entry.char}(${entry.charMeaning}) · 음 ${entry.charReading} · 뜻 ${entry.meaning}`
  };
}

export function getReadingTokenOptions(entries: VocabularyDictionaryEntry[]): string[] {
  const set = new Set(entries.map((entry) => entry.readingToken).filter((token) => token.length > 0));
  return [...set].sort((a, b) => a.localeCompare(b, 'ko-KR'));
}
