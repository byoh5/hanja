import type { QuizQuestion } from '../types';

const RETRY_MARKER = '__retry__';

export function getBaseQuestionId(questionId: string): string {
  const [baseId] = questionId.split(RETRY_MARKER);
  return baseId ?? questionId;
}

export function createRetryQuestion(question: QuizQuestion, retryIndex: number): QuizQuestion {
  const baseId = getBaseQuestionId(question.id);
  return {
    ...question,
    id: `${baseId}${RETRY_MARKER}${retryIndex}`
  };
}

export function insertQuestionAfterGap(
  questions: QuizQuestion[],
  currentIndex: number,
  retryQuestion: QuizQuestion,
  gap: number
): QuizQuestion[] {
  const next = [...questions];
  const safeGap = Math.max(1, Math.floor(gap));
  const insertIndex = Math.min(next.length, currentIndex + safeGap + 1);
  next.splice(insertIndex, 0, retryQuestion);
  return next;
}
