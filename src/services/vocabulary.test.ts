import { describe, expect, it } from 'vitest';
import type { HanjaChar } from '../types';
import { buildVocabularyLearningContent, createVocabularyDiscriminationQuiz, getVocabularyEntriesForChar } from './vocabulary';
import allCharsJson from '../../shared/data/hanja_chars.json';
import { VOCABULARY_MATERIALS } from '../data/vocabularyMaterials';

const SAMPLE_CHARS: HanjaChar[] = [
  { char: '小', grade: 8, reading: '소', meaning: '작을', examples: ['소형', '소식'] },
  { char: '少', grade: 8, reading: '소', meaning: '적을', examples: ['감소', '최소'] },
  { char: '人', grade: 8, reading: '인', meaning: '사람', examples: ['인간', '인구'] },
  { char: '學', grade: 8, reading: '학', meaning: '배울', examples: ['학교', '학습'] },
  { char: '日', grade: 8, reading: '일', meaning: '날', examples: ['일기', '일요일'] }
];

function stripAnnotation(word: string): string {
  return word.replace(/\([^)]*\)/g, '').trim();
}

describe('vocabulary service', () => {
  it('어휘 자료가 없는 한자는 출제하지 않는다', () => {
    const target: HanjaChar = { char: '甲', grade: 3, reading: '갑', meaning: '갑옷', examples: ['갑옷'] };
    const entries = getVocabularyEntriesForChar(target, SAMPLE_CHARS);

    expect(entries).toHaveLength(0);
  });

  it('小는 어휘 자료의 실사용 어휘를 제공한다', () => {
    const entries = getVocabularyEntriesForChar(SAMPLE_CHARS[0], SAMPLE_CHARS);
    const words = entries.map((item) => item.word);

    expect(words).toContain('소규모(小規模)');
    expect(words).toContain('최소(最小)');
    expect(entries.every((item) => item.source === 'curated')).toBe(true);
  });

  it('다른 한자 쓰임 찾기 문제는 정답 1개(비목표 어휘)를 포함한다', () => {
    const target = SAMPLE_CHARS[0];
    const entries = getVocabularyEntriesForChar(target, SAMPLE_CHARS);
    const quiz = createVocabularyDiscriminationQuiz(target, entries, SAMPLE_CHARS);
    expect(quiz).not.toBeNull();
    if (!quiz) {
      return;
    }

    expect(quiz.options.length).toBeGreaterThanOrEqual(3);
    expect(quiz.options.filter((option) => !option.containsTargetChar)).toHaveLength(1);
    expect(quiz.options.some((option) => option.id === quiz.correctOptionId && !option.containsTargetChar)).toBe(true);
  });

  it('실사용 어휘가 부족하면 퀴즈를 생성하지 않는다', () => {
    const target: HanjaChar = { char: '甲', grade: 3, reading: '갑', meaning: '갑옷', examples: ['갑옷'] };
    const entries = getVocabularyEntriesForChar(target, SAMPLE_CHARS);
    const quiz = createVocabularyDiscriminationQuiz(target, entries, SAMPLE_CHARS);

    expect(entries).toHaveLength(0);
    expect(quiz).toBeNull();
  });

  it('"같은 음" 문제는 보기의 음 힌트가 모두 동일하다', () => {
    const target = SAMPLE_CHARS[0];
    const entries = getVocabularyEntriesForChar(target, SAMPLE_CHARS);
    const quiz = createVocabularyDiscriminationQuiz(target, entries, SAMPLE_CHARS);
    expect(quiz).not.toBeNull();
    if (!quiz) {
      return;
    }

    if (!quiz.prompt.includes('음 "')) {
      expect(true).toBe(true);
      return;
    }

    const hintSet = new Set(quiz.options.map((option) => option.readingHint));
    expect(hintSet.size).toBe(1);
  });

  it('모든 보기는 음 힌트를 제공한다', () => {
    const target = SAMPLE_CHARS[0];
    const entries = getVocabularyEntriesForChar(target, SAMPLE_CHARS);
    const quiz = createVocabularyDiscriminationQuiz(target, entries, SAMPLE_CHARS);
    expect(quiz).not.toBeNull();
    if (!quiz) {
      return;
    }

    expect(quiz.options.every((option) => option.readingHint.length > 0)).toBe(true);
  });

  it('학습 콘텐츠는 어휘 목록과 문제를 함께 반환한다', () => {
    const content = buildVocabularyLearningContent(SAMPLE_CHARS[0], SAMPLE_CHARS);

    expect(content.entries.length).toBeGreaterThanOrEqual(2);
    expect(content.quiz).not.toBeNull();
  });

  it('전체 데이터셋에서 실사용 어휘는 단일 글자 예시를 포함하지 않는다', () => {
    const allChars = allCharsJson as HanjaChar[];
    const byGrade = new Map<number, HanjaChar[]>();

    for (const item of allChars) {
      const existing = byGrade.get(item.grade) ?? [];
      existing.push(item);
      byGrade.set(item.grade, existing);
    }

    for (const target of allChars) {
      const gradeChars = byGrade.get(target.grade) ?? [target];
      const entries = getVocabularyEntriesForChar(target, gradeChars);
      const quiz = createVocabularyDiscriminationQuiz(target, entries, gradeChars);

      for (const entry of entries) {
        expect(Array.from(stripAnnotation(entry.word)).length).toBeGreaterThanOrEqual(2);
      }

      if (!quiz) {
        continue;
      }

      const distractorCount = quiz.options.filter((option) => !option.containsTargetChar).length;
      expect(distractorCount).toBe(1);
      expect(quiz.options.every((option) => option.readingHint.length > 0)).toBe(true);
      expect(quiz.prompt.includes('음 "')).toBe(true);

      const hintSet = new Set(quiz.options.map((option) => option.readingHint));
      expect(hintSet.size).toBe(1);

      const onlyHint = quiz.options[0]?.readingHint ?? '';
      const targetVariants = target.reading
        .split(/[\/,|]/g)
        .map((value) => value.trim())
        .filter((value) => value.length > 0);
      expect(targetVariants.includes(onlyHint)).toBe(true);
    }
  });

  it('어휘 자료는 한자당 최소 5개 어휘를 준비한다', () => {
    for (const material of Object.values(VOCABULARY_MATERIALS)) {
      expect(material.entries.length).toBeGreaterThanOrEqual(5);
    }
  });
});
