import { describe, expect, it } from 'vitest';
import type { QuizQuestion } from '../types';
import { createRetryQuestion, getBaseQuestionId, insertQuestionAfterGap } from './quizReinforcement';

function sampleQuestion(id: string): QuizQuestion {
  return {
    id,
    char: '學',
    type: 'meaning',
    prompt: '學의 뜻은?',
    options: ['배울', '물', '불', '나무'],
    correctAnswer: '배울'
  };
}

describe('quizReinforcement', () => {
  it('재출제 문항 id는 원문항 id를 기반으로 생성된다', () => {
    const retry = createRetryQuestion(sampleQuestion('學-meaning-1'), 3);

    expect(retry.id).toBe('學-meaning-1__retry__3');
    expect(getBaseQuestionId(retry.id)).toBe('學-meaning-1');
  });

  it('이미 재출제 suffix가 있는 id도 원문항 id를 유지한다', () => {
    expect(getBaseQuestionId('學-meaning-1__retry__2')).toBe('學-meaning-1');
  });

  it('재출제 문항은 지정한 간격 이후에 삽입된다', () => {
    const questions = [sampleQuestion('q1'), sampleQuestion('q2'), sampleQuestion('q3'), sampleQuestion('q4')];
    const retryQuestion = sampleQuestion('q1__retry__1');

    const inserted = insertQuestionAfterGap(questions, 0, retryQuestion, 2);

    expect(inserted.map((item) => item.id)).toEqual(['q1', 'q2', 'q3', 'q1__retry__1', 'q4']);
  });
});
