import { describe, expect, it } from 'vitest';
import type { HanjaChar } from '../types';
import { generateQuestions } from './quiz';

const SAMPLE_CHARS: HanjaChar[] = [
  { char: '學', grade: 8, reading: '학', meaning: '배울', examples: ['학교'] },
  { char: '校', grade: 8, reading: '교', meaning: '학교', examples: ['학교'] },
  { char: '生', grade: 8, reading: '생', meaning: '날', examples: ['학생'] },
  { char: '水', grade: 8, reading: '수', meaning: '물', examples: ['수영'] },
  { char: '山', grade: 8, reading: '산', meaning: '메', examples: ['등산'] },
  { char: '火', grade: 8, reading: '화', meaning: '불', examples: ['화재'] },
  { char: '土', grade: 8, reading: '토', meaning: '흙', examples: ['토지'] },
  { char: '木', grade: 8, reading: '목', meaning: '나무', examples: ['목재'] }
];

describe('generateQuestions', () => {
  it('혼합 모드는 객관식 타입(뜻/음/한자)만 생성한다', () => {
    const questions = generateQuestions(SAMPLE_CHARS, 6, 'mixed');

    expect(questions).toHaveLength(6);
    for (const question of questions) {
      expect(['meaning', 'reading', 'character']).toContain(question.type);
      expect(question.options?.includes(question.correctAnswer)).toBe(true);
    }
  });

  it('입력(한자) 모드는 입력형 문항을 생성한다', () => {
    const questions = generateQuestions(SAMPLE_CHARS, 4, 'inputCharacter');

    expect(questions).toHaveLength(4);
    for (const question of questions) {
      expect(question.type).toBe('inputCharacter');
      expect(question.options).toBeUndefined();
      expect(question.acceptedAnswers).toEqual([question.correctAnswer]);
    }
  });

  it('입력(음) 모드는 slash 표기를 허용 정답으로 포함한다', () => {
    const withVariant: HanjaChar[] = [
      { char: '露', grade: 6, reading: '로/노', meaning: '이슬', examples: ['노천'] },
      { char: '路', grade: 6, reading: '로', meaning: '길', examples: ['도로'] }
    ];

    const questions = generateQuestions(withVariant, 2, 'inputReading');
    const question = questions.find((item) => item.char === '露');

    expect(question).toBeDefined();
    expect(question?.type).toBe('inputReading');
    expect(question?.acceptedAnswers).toContain('로/노');
    expect(question?.acceptedAnswers).toContain('로');
    expect(question?.acceptedAnswers).toContain('노');
  });

  it('오답 집중 모드는 객관식 문항을 생성한다', () => {
    const questions = generateQuestions(SAMPLE_CHARS, 5, 'weakness', {
      wrongCountByChar: {
        學: 5,
        校: 4,
        生: 3
      }
    });

    expect(questions).toHaveLength(5);
    for (const question of questions) {
      expect(['meaning', 'reading', 'character']).toContain(question.type);
      expect(question.options?.includes(question.correctAnswer)).toBe(true);
    }
  });
});
