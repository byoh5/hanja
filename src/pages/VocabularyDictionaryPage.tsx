import { useEffect, useMemo, useState } from 'react';
import { SUPPORTED_GRADES, getGroupedCharsByGrade } from '../data';
import { trackEvent } from '../services/analytics';
import { seedBaseData } from '../services/seed';
import {
  buildSentenceExercise,
  buildVocabularyCoverageSummary,
  buildVocabularyDictionary,
  buildVocabularyDictionaryFromWebBank,
  getReadingTokenOptions,
  mergeVocabularyDictionaryEntries,
  type VocabularyBankCharInput,
  type VocabularyDictionaryEntry
} from '../services/vocabularyDictionary';
import { useAppStore } from '../store/useAppStore';
import type { HanjaChar } from '../types';

const INITIAL_VISIBLE_COUNT = 60;
const LOAD_MORE_COUNT = 60;

type GradeFilter = 'all' | number;
type ExerciseFeedback = 'idle' | 'correct' | 'wrong';

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, '').toLowerCase();
}

function pickRandomEntry(entries: VocabularyDictionaryEntry[], currentEntryId: string | null): VocabularyDictionaryEntry | null {
  if (entries.length === 0) {
    return null;
  }

  if (entries.length === 1) {
    return entries[0];
  }

  const candidates = entries.filter((item) => item.id !== currentEntryId);
  const pool = candidates.length > 0 ? candidates : entries;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index] ?? pool[0] ?? null;
}

export function VocabularyDictionaryPage() {
  const selectedGrade = useAppStore((state) => state.selectedGrade);

  const [loading, setLoading] = useState(true);
  const [allChars, setAllChars] = useState<HanjaChar[]>([]);
  const [dictionary, setDictionary] = useState<VocabularyDictionaryEntry[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>(selectedGrade ?? 'all');
  const [readingFilter, setReadingFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const [exerciseEntryId, setExerciseEntryId] = useState<string | null>(null);
  const [exerciseInput, setExerciseInput] = useState('');
  const [exerciseFeedback, setExerciseFeedback] = useState<ExerciseFeedback>('idle');
  const [exerciseChecked, setExerciseChecked] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await seedBaseData();
      const grouped = await getGroupedCharsByGrade();
      const chars = SUPPORTED_GRADES.flatMap((grade) => grouped[grade]);
      const curatedRows = buildVocabularyDictionary(chars);
      let rows = curatedRows;

      try {
        const bankUrl = `${import.meta.env.BASE_URL}data/vocabulary_web_bank.json`;
        const response = await fetch(bankUrl);

        if (response.ok) {
          const webBankJson = (await response.json()) as { chars?: Record<string, VocabularyBankCharInput> };
          const webBankChars = webBankJson.chars ?? {};
          const webRows = buildVocabularyDictionaryFromWebBank(chars, webBankChars);
          rows = mergeVocabularyDictionaryEntries(curatedRows, webRows);
        }
      } catch {
        rows = curatedRows;
      }

      setAllChars(chars);
      setDictionary(rows);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [searchQuery, gradeFilter, readingFilter]);

  const readingOptions = useMemo(() => getReadingTokenOptions(dictionary), [dictionary]);

  const filteredEntries = useMemo(() => {
    const normalizedQuery = normalizeText(searchQuery);

    return dictionary.filter((entry) => {
      if (gradeFilter !== 'all' && entry.grade !== gradeFilter) {
        return false;
      }

      if (readingFilter !== 'all' && entry.readingToken !== readingFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        entry.word,
        entry.plainWord,
        entry.meaning,
        entry.sentence,
        entry.usageNote,
        entry.char,
        entry.charReading,
        entry.charMeaning,
        entry.readingToken
      ]
        .map((item) => normalizeText(item))
        .join('|');

      return haystack.includes(normalizedQuery);
    });
  }, [dictionary, gradeFilter, readingFilter, searchQuery]);

  const visibleEntries = useMemo(() => filteredEntries.slice(0, visibleCount), [filteredEntries, visibleCount]);
  const coverage = useMemo(() => buildVocabularyCoverageSummary(allChars, dictionary), [allChars, dictionary]);

  const exercisePool = useMemo(() => {
    const baseEntries = filteredEntries.length > 0 ? filteredEntries : dictionary;
    const withSentence = baseEntries.filter((entry) => entry.sentence.trim().length > 0);

    if (withSentence.length > 0) {
      return withSentence;
    }
    return [];
  }, [dictionary, filteredEntries]);

  useEffect(() => {
    if (exercisePool.length === 0) {
      setExerciseEntryId(null);
      return;
    }

    const exists = exerciseEntryId !== null && exercisePool.some((item) => item.id === exerciseEntryId);
    if (!exists) {
      setExerciseEntryId(exercisePool[0]?.id ?? null);
      setExerciseInput('');
      setExerciseChecked(false);
      setExerciseFeedback('idle');
    }
  }, [exerciseEntryId, exercisePool]);

  const exerciseEntry = useMemo(
    () => exercisePool.find((item) => item.id === exerciseEntryId) ?? null,
    [exerciseEntryId, exercisePool]
  );

  const exercise = useMemo(() => (exerciseEntry ? buildSentenceExercise(exerciseEntry) : null), [exerciseEntry]);

  const totalWords = dictionary.length;
  const totalCoveredChars = useMemo(() => new Set(dictionary.map((item) => item.char)).size, [dictionary]);

  function handleRandomExercise(): void {
    const randomEntry = pickRandomEntry(exercisePool, exerciseEntryId);
    if (!randomEntry) {
      return;
    }

    setExerciseEntryId(randomEntry.id);
    setExerciseInput('');
    setExerciseChecked(false);
    setExerciseFeedback('idle');
    trackEvent('vocabulary_sentence_exercise_refreshed', { word: randomEntry.plainWord });
  }

  function checkExerciseAnswer(): void {
    if (!exercise) {
      return;
    }

    const isCorrect = normalizeText(exerciseInput) === normalizeText(exercise.answer);
    setExerciseChecked(true);
    setExerciseFeedback(isCorrect ? 'correct' : 'wrong');

    trackEvent('vocabulary_sentence_exercise_checked', {
      isCorrect,
      answer: exercise.answer,
      submitted: exerciseInput
    });
  }

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">어휘 사전</h1>
        <p className="text-sm text-slate-600">현재 보유한 실사용 어휘와 뜻, 예문을 한 번에 확인하고 문장으로 연습하세요.</p>
      </header>

      <article className="surface-card space-y-4 p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">보유 어휘</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{totalWords}</p>
          </div>
          <div className="rounded-[18px] border border-calm-100 bg-calm-50 px-4 py-3">
            <p className="text-xs text-calm-700">어휘가 준비된 한자</p>
            <p className="mt-1 text-2xl font-semibold text-calm-700">{totalCoveredChars}</p>
          </div>
          <div className="rounded-[18px] border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-xs text-emerald-700">현재 필터 결과</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-700">{filteredEntries.length}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">급수 필터</p>
          <div className="overflow-x-auto pb-1">
            <div className="segment-control min-w-max">
              <button
                type="button"
                onClick={() => {
                  setGradeFilter('all');
                }}
                className={gradeFilter === 'all' ? 'segment-btn segment-btn-active' : 'segment-btn'}
              >
                전체
              </button>
              {SUPPORTED_GRADES.map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => {
                    setGradeFilter(grade);
                  }}
                  className={gradeFilter === grade ? 'segment-btn segment-btn-active' : 'segment-btn'}
                >
                  {grade}급
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">검색</span>
            <input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
              }}
              placeholder="어휘/뜻/예문/한자/음"
              className="w-full rounded-[14px] border border-slate-200 bg-white px-3 py-2 text-sm text-ink focus:border-calm-300 focus:outline-none"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-slate-600">음 필터</span>
            <select
              value={readingFilter}
              onChange={(event) => {
                setReadingFilter(event.target.value);
              }}
              className="w-full rounded-[14px] border border-slate-200 bg-white px-3 py-2 text-sm text-ink focus:border-calm-300 focus:outline-none"
            >
              <option value="all">전체</option>
              {readingOptions.map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-2 sm:grid-cols-4">
          {coverage.map((item) => (
            <div key={item.grade} className="rounded-[14px] border border-slate-200 bg-white px-3 py-2">
              <p className="text-xs text-slate-500">{item.grade}급</p>
              <p className="mt-1 text-sm font-semibold text-ink">{item.words}어휘</p>
              <p className="text-[11px] text-slate-500">
                한자 {item.coveredChars}/{item.totalChars} ({item.coverageRate}%)
              </p>
            </div>
          ))}
        </div>
      </article>

      <article className="surface-card space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-ink">문장 활용 연습</h2>
          <button
            type="button"
            disabled={exercisePool.length === 0}
            onClick={handleRandomExercise}
            className="btn-muted px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
          >
            랜덤 문제
          </button>
        </div>

        {exercise && (
          <div className="space-y-3 rounded-[16px] border border-calm-100 bg-calm-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-calm-700">빈칸 채우기</p>
            <p className="text-sm text-slate-700">{exercise.blankSentence}</p>
            <p className="text-xs text-calm-700">힌트: {exercise.hint}</p>

            <div className="flex flex-wrap gap-2">
              <input
                value={exerciseInput}
                onChange={(event) => {
                  setExerciseInput(event.target.value);
                }}
                placeholder="빈칸에 들어갈 어휘"
                className="min-w-[180px] flex-1 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-sm text-ink focus:border-calm-300 focus:outline-none"
              />
              <button type="button" onClick={checkExerciseAnswer} className="btn-primary px-4 py-2 text-sm">
                채점
              </button>
            </div>

            {exerciseChecked && (
              <div
                className={`rounded-[12px] border px-3 py-2 text-xs ${
                  exerciseFeedback === 'correct'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-coral-200 bg-coral-100 text-coral-600'
                }`}
              >
                {exerciseFeedback === 'correct' ? (
                  <p className="font-medium">정답입니다. 원문 예문까지 소리 내어 읽어 보세요.</p>
                ) : (
                  <p className="font-medium">오답입니다. 정답은 {exercise.answer} 입니다.</p>
                )}
                <p className="mt-1">원문: {exercise.originalSentence}</p>
              </div>
            )}
          </div>
        )}

        {!exercise && <p className="text-sm text-slate-500">연습 가능한 어휘가 아직 없습니다.</p>}
      </article>

      <article className="surface-card p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-ink">어휘 목록</h2>
          <p className="text-xs text-slate-500">
            {loading ? '불러오는 중...' : `${visibleEntries.length}/${filteredEntries.length} 표시`}
          </p>
        </div>

        {loading && <p className="text-sm text-slate-500">어휘 사전을 준비하는 중...</p>}

        {!loading && filteredEntries.length === 0 && (
          <p className="rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            검색 조건에 맞는 어휘가 없습니다.
          </p>
        )}

        {!loading && filteredEntries.length > 0 && (
          <>
            <ul className="space-y-2">
              {visibleEntries.map((entry) => (
                <li key={entry.id} className="rounded-[14px] border border-slate-200 bg-white px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">{entry.word}</p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5">{entry.grade ? `${entry.grade}급` : '급수 미상'}</span>
                      <span className="rounded-full bg-calm-50 px-2 py-0.5 text-calm-700">
                        {entry.char}({entry.charMeaning})
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5">음: {entry.readingToken}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5">
                        출처: {entry.source === 'curated' ? '수동선별' : entry.source === 'wiktionary' ? '위키낱말사전' : '기본예시'}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-slate-700">뜻: {entry.meaning}</p>
                  {entry.sentence && <p className="mt-1 text-xs text-slate-600">예문: {entry.sentence}</p>}
                  {!entry.sentence && <p className="mt-1 text-xs text-slate-500">예문: 사전 예문 없음</p>}
                  <p className="mt-1 text-[11px] text-calm-700">한자 쓰임: {entry.usageNote}</p>
                  {entry.sourceUrl && entry.sourceUrl.startsWith('http') && (
                    <a
                      href={entry.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex text-[11px] text-calm-700 underline underline-offset-2"
                    >
                      사전 원문 보기
                    </a>
                  )}
                </li>
              ))}
            </ul>

            {visibleEntries.length < filteredEntries.length && (
              <button
                type="button"
                onClick={() => {
                  setVisibleCount((prev) => prev + LOAD_MORE_COUNT);
                }}
                className="btn-muted mt-3 w-full px-4 py-2 text-sm"
              >
                더 보기 ({filteredEntries.length - visibleEntries.length}개 남음)
              </button>
            )}
          </>
        )}
      </article>
    </section>
  );
}
