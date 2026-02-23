import type { HanjaChar, QuestionType, QuizMode, QuizQuestion } from '../types';

interface OptionCandidate {
  value: string;
  score: number;
}

export interface GenerateQuestionsOptions {
  wrongCountByChar?: Record<string, number>;
}

function shuffle<T>(items: T[]): T[] {
  const cloned = [...items];

  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }

  return cloned;
}

function weightedPick<T>(items: T[], getWeight: (item: T) => number): T | null {
  const totalWeight = items.reduce((sum, item) => sum + Math.max(0, getWeight(item)), 0);
  if (totalWeight <= 0) {
    return null;
  }

  let target = Math.random() * totalWeight;
  for (const item of items) {
    target -= Math.max(0, getWeight(item));
    if (target <= 0) {
      return item;
    }
  }

  return items[items.length - 1] ?? null;
}

function sampleWeightedUnique<T>(items: T[], count: number, getWeight: (item: T) => number): T[] {
  const pool = [...items];
  const picked: T[] = [];

  while (picked.length < count && pool.length > 0) {
    const selected = weightedPick(pool, getWeight);
    if (!selected) {
      picked.push(...shuffle(pool).slice(0, count - picked.length));
      break;
    }

    picked.push(selected);
    const index = pool.indexOf(selected);
    if (index >= 0) {
      pool.splice(index, 1);
    }
  }

  return picked;
}

function splitReadingVariants(reading: string): string[] {
  return reading
    .split(/[\/,|]/g)
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function normalizeForCompare(value: string): string {
  return value.trim().replace(/\s+/g, '').toLowerCase();
}

function meaningSimilarity(a: string, b: string): number {
  const x = normalizeForCompare(a);
  const y = normalizeForCompare(b);

  if (!x || !y) {
    return 0;
  }

  let score = 0;
  if (x[0] === y[0]) {
    score += 2;
  }
  if (x.includes(y.slice(0, 1)) || y.includes(x.slice(0, 1))) {
    score += 1;
  }
  if (x.length === y.length) {
    score += 0.5;
  }

  return score;
}

function readingSimilarity(a: string, b: string): number {
  const tokensA = splitReadingVariants(a);
  const tokensB = splitReadingVariants(b);

  if (tokensA.length === 0 || tokensB.length === 0) {
    return 0;
  }

  let score = 0;
  const exactOverlap = tokensA.some((token) => tokensB.includes(token));
  if (exactOverlap) {
    score += 3;
  }

  const prefixOverlap = tokensA.some((tokenA) => tokensB.some((tokenB) => tokenA[0] === tokenB[0]));
  if (prefixOverlap) {
    score += 1.5;
  }

  if (Math.abs(tokensA[0].length - tokensB[0].length) <= 1) {
    score += 0.5;
  }

  return score;
}

function toUniqueCandidates(candidates: OptionCandidate[]): OptionCandidate[] {
  const map = new Map<string, number>();

  for (const candidate of candidates) {
    const current = map.get(candidate.value);
    if (current === undefined || candidate.score > current) {
      map.set(candidate.value, candidate.score);
    }
  }

  return [...map.entries()].map(([value, score]) => ({ value, score }));
}

function makeOptions(correct: string, candidates: OptionCandidate[], optionCount: number, hardDistractors: boolean): string[] {
  const uniqueCandidates = toUniqueCandidates(candidates).filter((candidate) => candidate.value !== correct);
  const neededWrong = Math.max(1, optionCount - 1);

  if (uniqueCandidates.length === 0) {
    return [correct];
  }

  const sorted = hardDistractors
    ? [...uniqueCandidates].sort((a, b) => b.score - a.score)
    : shuffle(uniqueCandidates);

  const primaryPool = hardDistractors
    ? sorted.slice(0, Math.max(neededWrong * 3, neededWrong))
    : sorted;

  const wrongValues = shuffle(primaryPool)
    .slice(0, neededWrong)
    .map((candidate) => candidate.value);

  if (wrongValues.length < neededWrong) {
    const selectedSet = new Set(wrongValues);
    const fallback = shuffle(uniqueCandidates)
      .filter((candidate) => !selectedSet.has(candidate.value))
      .slice(0, neededWrong - wrongValues.length)
      .map((candidate) => candidate.value);
    wrongValues.push(...fallback);
  }

  return shuffle([correct, ...wrongValues]);
}

function pickMixedType(previousTypes: QuestionType[]): QuestionType {
  const available: QuestionType[] = ['meaning', 'reading', 'character'];

  if (previousTypes.length >= 2) {
    const last = previousTypes[previousTypes.length - 1];
    const beforeLast = previousTypes[previousTypes.length - 2];
    if (last === beforeLast && available.includes(last)) {
      const filtered = available.filter((type) => type !== last);
      return filtered[Math.floor(Math.random() * filtered.length)] ?? 'meaning';
    }
  }

  return available[Math.floor(Math.random() * available.length)] ?? 'meaning';
}

function pickWeaknessType(previousTypes: QuestionType[]): QuestionType {
  const available: Array<{ type: QuestionType; weight: number }> = [
    { type: 'meaning', weight: 2 },
    { type: 'reading', weight: 3 },
    { type: 'character', weight: 3 }
  ];

  if (previousTypes.length >= 2) {
    const last = previousTypes[previousTypes.length - 1];
    const beforeLast = previousTypes[previousTypes.length - 2];
    if (last === beforeLast) {
      const filtered = available.filter((item) => item.type !== last);
      const picked = weightedPick(filtered, (item) => item.weight);
      return picked?.type ?? 'reading';
    }
  }

  const picked = weightedPick(available, (item) => item.weight);
  return picked?.type ?? 'reading';
}

function pickType(mode: QuizMode, previousTypes: QuestionType[]): QuestionType {
  if (mode === 'mixed') {
    return pickMixedType(previousTypes);
  }
  if (mode === 'inputCharacter') {
    return 'inputCharacter';
  }
  if (mode === 'inputReading') {
    return 'inputReading';
  }
  if (mode === 'weakness') {
    return pickWeaknessType(previousTypes);
  }

  return mode;
}

function createQuestion(
  char: HanjaChar,
  allChars: HanjaChar[],
  type: QuestionType,
  index: number,
  hardDistractors: boolean
): QuizQuestion {
  if (type === 'meaning') {
    return {
      id: `${char.char}-meaning-${index}`,
      char: char.char,
      type,
      prompt: `${char.char}의 뜻(훈)은?`,
      options: makeOptions(
        char.meaning,
        allChars
          .filter((item) => item.char !== char.char && item.meaning !== char.meaning)
          .map((item) => ({
            value: item.meaning,
            score: meaningSimilarity(char.meaning, item.meaning) + readingSimilarity(char.reading, item.reading) * 0.4
          })),
        4,
        hardDistractors
      ),
      correctAnswer: char.meaning,
      explanation: `음은 ${char.reading}입니다.`
    };
  }

  if (type === 'reading') {
    return {
      id: `${char.char}-reading-${index}`,
      char: char.char,
      type,
      prompt: `${char.char}의 음은?`,
      options: makeOptions(
        char.reading,
        allChars
          .filter((item) => item.char !== char.char && item.reading !== char.reading)
          .map((item) => ({
            value: item.reading,
            score: readingSimilarity(char.reading, item.reading) + meaningSimilarity(char.meaning, item.meaning) * 0.2
          })),
        4,
        hardDistractors
      ),
      correctAnswer: char.reading,
      explanation: `뜻(훈)은 ${char.meaning}입니다.`
    };
  }

  if (type === 'character') {
    return {
      id: `${char.char}-character-${index}`,
      char: char.char,
      type,
      prompt: `"${char.meaning}" 뜻을 가진 한자는?`,
      options: makeOptions(
        char.char,
        allChars
          .filter((item) => item.char !== char.char)
          .map((item) => ({
            value: item.char,
            score: readingSimilarity(char.reading, item.reading) * 1.2 + meaningSimilarity(char.meaning, item.meaning)
          })),
        4,
        hardDistractors
      ),
      correctAnswer: char.char,
      explanation: `음은 ${char.reading}입니다.`
    };
  }

  if (type === 'inputCharacter') {
    return {
      id: `${char.char}-input-character-${index}`,
      char: char.char,
      type,
      prompt: `뜻 "${char.meaning}", 음 "${char.reading}"인 한자를 입력하세요.`,
      correctAnswer: char.char,
      acceptedAnswers: [char.char],
      explanation: `${char.char} (뜻: ${char.meaning}, 음: ${char.reading})`
    };
  }

  return {
    id: `${char.char}-input-reading-${index}`,
    char: char.char,
    type,
    prompt: `${char.char}의 음을 입력하세요.`,
    correctAnswer: char.reading,
    acceptedAnswers: Array.from(new Set([char.reading, ...splitReadingVariants(char.reading)])),
    explanation: `뜻(훈)은 ${char.meaning}입니다.`
  };
}

function generateWeaknessQuestions(
  chars: HanjaChar[],
  count: number,
  wrongCountByChar: Record<string, number>
): QuizQuestion[] {
  const sortedByWrong = [...chars].sort((a, b) => {
    const wrongA = wrongCountByChar[a.char] ?? 0;
    const wrongB = wrongCountByChar[b.char] ?? 0;
    return wrongB - wrongA;
  });

  const candidatePoolSize = Math.min(sortedByWrong.length, Math.max(count * 3, 40));
  const candidates = sortedByWrong.slice(0, candidatePoolSize);

  const sampled = sampleWeightedUnique(
    candidates,
    Math.min(count, chars.length),
    (item) => 1 + (wrongCountByChar[item.char] ?? 0) * 4
  );

  if (sampled.length < Math.min(count, chars.length)) {
    const sampledSet = new Set(sampled.map((item) => item.char));
    const fallback = shuffle(chars)
      .filter((item) => !sampledSet.has(item.char))
      .slice(0, Math.min(count, chars.length) - sampled.length);
    sampled.push(...fallback);
  }

  const previousTypes: QuestionType[] = [];
  return sampled.map((char, index) => {
    const type = pickWeaknessType(previousTypes);
    previousTypes.push(type);
    return createQuestion(char, chars, type, index, true);
  });
}

export function generateQuestions(
  chars: HanjaChar[],
  count: number,
  mode: QuizMode,
  options?: GenerateQuestionsOptions
): QuizQuestion[] {
  const safeCount = Math.max(0, Math.floor(count));
  if (chars.length === 0 || safeCount === 0) {
    return [];
  }

  if (mode === 'weakness') {
    return generateWeaknessQuestions(chars, safeCount, options?.wrongCountByChar ?? {});
  }

  const sampled = shuffle(chars).slice(0, Math.min(safeCount, chars.length));
  const previousTypes: QuestionType[] = [];

  return sampled.map((char, index) => {
    const questionType = pickType(mode, previousTypes);
    previousTypes.push(questionType);
    return createQuestion(char, chars, questionType, index, false);
  });
}
