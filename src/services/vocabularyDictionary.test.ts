import { describe, expect, it } from 'vitest';
import type { HanjaChar } from '../types';
import {
  buildSentenceExercise,
  buildVocabularyCoverageSummary,
  buildVocabularyDictionary,
  buildVocabularyDictionaryFromWebBank,
  createSentenceBlank,
  getReadingTokenOptions,
  mergeVocabularyDictionaryEntries
} from './vocabularyDictionary';

const SAMPLE_CHARS: HanjaChar[] = [
  { char: '小', grade: 8, reading: '소', meaning: '작을', examples: ['소형'] },
  { char: '少', grade: 8, reading: '소', meaning: '적을', examples: ['감소'] },
  { char: '火', grade: 8, reading: '화', meaning: '불', examples: ['화재'] }
];

describe('vocabularyDictionary service', () => {
  it('어휘 사전 항목은 단어/뜻/예문/한자 정보를 포함한다', () => {
    const dictionary = buildVocabularyDictionary(SAMPLE_CHARS);
    const target = dictionary.find((item) => item.word === '소규모(小規模)');

    expect(target).toBeDefined();
    expect(target?.plainWord).toBe('소규모');
    expect(target?.grade).toBe(8);
    expect(target?.char).toBe('小');
    expect(target?.meaning.length).toBeGreaterThan(0);
    expect(target?.sentence.length).toBeGreaterThan(0);
    expect(target?.source).toBe('curated');
  });

  it('웹 수집 데이터는 사전 형식으로 변환되고 병합 시 중복을 제거한다', () => {
    const webBank = {
      小: {
        char: '小',
        reading: '소',
        meaning: '작을',
        entries: [
          {
            word: '소설(小說)',
            readingToken: '소',
            meaning: '꾸며 쓴 이야기.',
            sentence: '',
            usageNote: '웹 수집 예시',
            sourceUrl: 'https://ko.wiktionary.org/wiki/%EC%86%8C%EC%84%A4'
          },
          {
            word: '소규모(小規模)',
            readingToken: '소',
            meaning: '규모가 작음.',
            sentence: '',
            usageNote: '중복 예시',
            sourceUrl: 'https://ko.wiktionary.org/wiki/%EC%86%8C%EA%B7%9C%EB%AA%A8'
          }
        ]
      }
    };

    const curated = buildVocabularyDictionary(SAMPLE_CHARS);
    const webRows = buildVocabularyDictionaryFromWebBank(SAMPLE_CHARS, webBank);
    const merged = mergeVocabularyDictionaryEntries(curated, webRows);

    const novel = merged.find((item) => item.word === '소설(小說)');
    const duplicated = merged.filter((item) => item.word === '소규모(小規模)');

    expect(novel?.source).toBe('wiktionary');
    expect(novel?.sourceUrl).toContain('wiktionary');
    expect(duplicated).toHaveLength(1);
  });

  it('급수별 커버리지 요약은 준비된 한자 수와 어휘 수를 계산한다', () => {
    const dictionary = buildVocabularyDictionary(SAMPLE_CHARS);
    const summary = buildVocabularyCoverageSummary(SAMPLE_CHARS, dictionary);
    const grade8 = summary.find((item) => item.grade === 8);

    expect(grade8).toBeDefined();
    expect(grade8?.totalChars).toBe(3);
    expect(grade8?.coveredChars).toBe(3);
    expect(grade8?.words).toBeGreaterThanOrEqual(15);
    expect(grade8?.coverageRate).toBe(100);
  });

  it('빈칸 문장은 어휘를 ____ 로 치환한다', () => {
    const blank = createSentenceBlank('여름에는 수영을 하며 체력을 꾸준히 관리한다.', '수영');

    expect(blank).toContain('____');
    expect(blank.includes('수영')).toBe(false);
  });

  it('문장 활용 연습은 정답/힌트/원문을 함께 제공한다', () => {
    const dictionary = buildVocabularyDictionary(SAMPLE_CHARS);
    const entry = dictionary.find((item) => item.word === '수영(水泳)');
    expect(entry).toBeDefined();
    if (!entry) {
      return;
    }

    const exercise = buildSentenceExercise(entry);

    expect(exercise.answer).toBe('수영');
    expect(exercise.hint).toContain('水(물)');
    expect(exercise.blankSentence).toContain('____');
    expect(exercise.originalSentence).toContain('체력을 꾸준히 관리한다.');
  });

  it('음 필터 옵션은 중복 없이 정렬되어 반환된다', () => {
    const dictionary = buildVocabularyDictionary(SAMPLE_CHARS);
    const tokens = getReadingTokenOptions(dictionary);

    expect(tokens.includes('소')).toBe(true);
    expect(tokens.includes('화')).toBe(true);
    expect(tokens[0] <= tokens[tokens.length - 1]).toBe(true);
  });
});
