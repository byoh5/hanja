import type { HanjaChar, QuestionType, QuizMode, QuizQuestion } from '../types';

function shuffle<T>(items: T[]): T[] {
  const cloned = [...items];

  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }

  return cloned;
}

function makeOptions(correct: string, pool: string[], optionCount: number): string[] {
  const wrong = shuffle(pool.filter((value) => value !== correct)).slice(0, optionCount - 1);
  return shuffle([correct, ...wrong]);
}

function pickType(mode: QuizMode): QuestionType {
  if (mode !== 'mixed') {
    return mode;
  }

  const types: QuestionType[] = ['meaning', 'reading', 'character'];
  return types[Math.floor(Math.random() * types.length)];
}

function createQuestion(char: HanjaChar, allChars: HanjaChar[], type: QuestionType, index: number): QuizQuestion {
  if (type === 'meaning') {
    return {
      id: `${char.char}-meaning-${index}`,
      char: char.char,
      type,
      prompt: `${char.char}의 뜻(훈)은?`,
      options: makeOptions(char.meaning, allChars.map((item) => item.meaning), 4),
      correctAnswer: char.meaning
    };
  }

  if (type === 'reading') {
    return {
      id: `${char.char}-reading-${index}`,
      char: char.char,
      type,
      prompt: `${char.char}의 음은?`,
      options: makeOptions(char.reading, allChars.map((item) => item.reading), 4),
      correctAnswer: char.reading
    };
  }

  return {
    id: `${char.char}-character-${index}`,
    char: char.char,
    type,
    prompt: `"${char.meaning}" 뜻을 가진 한자는?`,
    options: makeOptions(char.char, allChars.map((item) => item.char), 4),
    correctAnswer: char.char
  };
}

export function generateQuestions(chars: HanjaChar[], count: number, mode: QuizMode): QuizQuestion[] {
  const sampled = shuffle(chars).slice(0, Math.min(count, chars.length));

  return sampled.map((char, index) => {
    const questionType = pickType(mode);
    return createQuestion(char, chars, questionType, index);
  });
}
