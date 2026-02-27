import type { HanjaChar, VocabularyEntry, VocabularyQuiz, VocabularyQuizOption } from '../types';
import {
  getVocabularyMaterialByChar,
  getVocabularyMaterialsByReadingToken,
  type VocabularyMaterialEntry
} from '../data/vocabularyMaterials';

interface VocabularyLearningContent {
  entries: VocabularyEntry[];
  quiz: VocabularyQuiz | null;
}

const MAX_VOCABULARY_COUNT = 5;
const MIN_TARGET_OPTIONS_FOR_QUIZ = 2;
const QUIZ_OPTION_COUNT = 4;

function shuffle<T>(items: T[]): T[] {
  const cloned = [...items];

  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[swapIndex]] = [cloned[swapIndex], cloned[index]];
  }

  return cloned;
}

function splitReadingVariants(reading: string): string[] {
  return reading
    .split(/[\/,|]/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function normalizeWord(word: string): string {
  return word.trim().replace(/\s+/g, '');
}

function stripAnnotation(word: string): string {
  return normalizeWord(word.replace(/\([^)]*\)/g, ''));
}

function wordMatchesReadingToken(word: string, readingToken: string): boolean {
  if (!readingToken) {
    return false;
  }

  const plain = stripAnnotation(word);
  return plain.includes(readingToken);
}

function withUniqueWords(entries: VocabularyMaterialEntry[]): VocabularyMaterialEntry[] {
  const map = new Map<string, VocabularyMaterialEntry>();

  for (const entry of entries) {
    const key = normalizeWord(entry.word);
    if (!key || map.has(key)) {
      continue;
    }
    map.set(key, entry);
  }

  return [...map.values()];
}

function toVocabularyEntry(target: HanjaChar, item: VocabularyMaterialEntry, index: number): VocabularyEntry {
  return {
    id: `${target.char}-material-${index}`,
    word: item.word,
    meaning: item.meaning,
    sentence: item.sentence,
    usageNote: item.usageNote,
    containsTargetChar: true,
    source: 'curated'
  };
}

export function getVocabularyEntriesForChar(target: HanjaChar, _gradeChars: HanjaChar[]): VocabularyEntry[] {
  const material = getVocabularyMaterialByChar(target.char);
  if (!material) {
    return [];
  }

  return withUniqueWords(material.entries)
    .slice(0, MAX_VOCABULARY_COUNT)
    .map((item, index) => toVocabularyEntry(target, item, index));
}

function buildTargetQuizOptions(entries: VocabularyEntry[], target: HanjaChar, readingHint: string): VocabularyQuizOption[] {
  return entries
    .filter((item) => item.containsTargetChar && wordMatchesReadingToken(item.word, readingHint))
    .slice(0, Math.max(1, QUIZ_OPTION_COUNT - 1))
    .map((item, index) => ({
      id: `${target.char}-quiz-target-${index}`,
      word: item.word,
      meaningHint: `${target.char}(${target.meaning}) 계열`,
      containsTargetChar: true,
      readingHint
    }));
}

function buildDistractorOption(
  target: HanjaChar,
  _gradeChars: HanjaChar[],
  readingToken: string,
  excludedWords: Set<string>
): { option: VocabularyQuizOption; explanation: string } | null {
  const sameReadingMaterials = getVocabularyMaterialsByReadingToken(readingToken).filter((item) => item.char !== target.char);

  for (const material of sameReadingMaterials) {
    const word = material.entries
      .map((entry) => entry.word)
      .find((entryWord) => !excludedWords.has(normalizeWord(entryWord)) && wordMatchesReadingToken(entryWord, readingToken));

    if (!word) {
      continue;
    }

    const explanation = `"${word}"은(는) ${material.char}(${material.meaning}) 계열 어휘이며 음은 "${readingToken}"입니다. ${target.char}와 음은 같지만 뜻이 다릅니다.`;
    return {
      option: {
        id: `${target.char}-quiz-distractor`,
        word,
        meaningHint: `${material.char}(${material.meaning}) 계열`,
        containsTargetChar: false,
        readingHint: readingToken
      },
      explanation
    };
  }

  return null;
}

export function createVocabularyDiscriminationQuiz(
  target: HanjaChar,
  entries: VocabularyEntry[],
  gradeChars: HanjaChar[]
): VocabularyQuiz | null {
  const targetReadingTokens = splitReadingVariants(target.reading);

  for (const homophoneReading of targetReadingTokens) {
    const targetOptions = buildTargetQuizOptions(entries, target, homophoneReading);
    if (targetOptions.length < MIN_TARGET_OPTIONS_FOR_QUIZ) {
      continue;
    }

    const excluded = new Set(targetOptions.map((item) => normalizeWord(item.word)));
    const distractor = buildDistractorOption(target, gradeChars, homophoneReading, excluded);
    if (!distractor) {
      continue;
    }

    const options = shuffle([...targetOptions, distractor.option]).slice(0, QUIZ_OPTION_COUNT);
    return {
      prompt: `다음 중 음 "${homophoneReading}"은 같지만 ${target.char}(${target.meaning})이 아닌 한자가 쓰인 어휘는?`,
      options,
      correctOptionId: distractor.option.id,
      explanation: distractor.explanation
    };
  }

  return null;
}

export function buildVocabularyLearningContent(target: HanjaChar, gradeChars: HanjaChar[]): VocabularyLearningContent {
  const entries = getVocabularyEntriesForChar(target, gradeChars);
  const quiz = entries.length >= MIN_TARGET_OPTIONS_FOR_QUIZ ? createVocabularyDiscriminationQuiz(target, entries, gradeChars) : null;

  return { entries, quiz };
}
