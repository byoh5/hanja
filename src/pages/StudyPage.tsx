import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MeaningReadingPanel } from '../components/MeaningReadingPanel';
import { trackEvent } from '../services/analytics';
import { applyStudyAction, getCharsByGrade, getStudyQueue } from '../services/progress';
import { ensureGradeProgress, seedBaseData } from '../services/seed';
import { resolveStudyPace } from '../services/studyPlan';
import { speakMeaningReadingRepeated, stopSpeaking } from '../services/tts';
import { buildVocabularyLearningContent } from '../services/vocabulary';
import { useAppStore } from '../store/useAppStore';
import type { HanjaChar, StudyAction, StudyCardItem } from '../types';

type CardMotion = 'idle' | 'good' | 'again';
const RETRY_GAP = 1;
const HARD_GAP = 3;

function insertAfterGap(queue: StudyCardItem[], card: StudyCardItem, gap: number): StudyCardItem[] {
  const next = [...queue];
  const insertIndex = Math.min(next.length, Math.max(0, Math.floor(gap)));
  next.splice(insertIndex, 0, card);
  return next;
}

export function StudyPage() {
  const grade = useAppStore((state) => state.selectedGrade);
  const speechEnabled = useAppStore((state) => state.speechEnabled);
  const dailyStudyTarget = useAppStore((state) => state.dailyStudyTarget);
  const memoryBoostEnabled = useAppStore((state) => state.memoryBoostEnabled);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [motion, setMotion] = useState<CardMotion>('idle');
  const [items, setItems] = useState<StudyCardItem[]>([]);
  const [gradeChars, setGradeChars] = useState<HanjaChar[]>([]);
  const [revealed, setRevealed] = useState(!memoryBoostEnabled);
  const [vocabularyAnswerId, setVocabularyAnswerId] = useState<string | null>(null);

  const actionTimerRef = useRef<number | null>(null);
  const autoSpeakTimerRef = useRef<number | null>(null);
  const current = items[0] ?? null;

  useEffect(() => {
    if (!grade) {
      setLoading(false);
      return;
    }

    const pace = resolveStudyPace(dailyStudyTarget);
    void loadQueue(grade, pace.target, pace.newLimit);
  }, [dailyStudyTarget, grade]);

  useEffect(() => {
    return () => {
      if (actionTimerRef.current !== null) {
        window.clearTimeout(actionTimerRef.current);
      }
      if (autoSpeakTimerRef.current !== null) {
        window.clearTimeout(autoSpeakTimerRef.current);
      }
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    setRevealed(!memoryBoostEnabled);
  }, [current?.charInfo.char, memoryBoostEnabled]);

  useEffect(() => {
    setVocabularyAnswerId(null);
  }, [current?.charInfo.char]);

  useEffect(() => {
    if (!current) {
      return;
    }

    if (!speechEnabled || (memoryBoostEnabled && !revealed)) {
      stopSpeaking();
      return;
    }

    if (autoSpeakTimerRef.current !== null) {
      window.clearTimeout(autoSpeakTimerRef.current);
    }

    autoSpeakTimerRef.current = window.setTimeout(() => {
      speakMeaningReadingRepeated(current.charInfo.meaning, current.charInfo.reading, current.charInfo.char, 2, 360);
    }, 220);

    return () => {
      if (autoSpeakTimerRef.current !== null) {
        window.clearTimeout(autoSpeakTimerRef.current);
      }
      stopSpeaking();
    };
  }, [current?.charInfo.char, memoryBoostEnabled, revealed, speechEnabled]);

  async function loadQueue(targetGrade: number, maxItems: number, newLimit: number): Promise<void> {
    setLoading(true);
    await seedBaseData();
    await ensureGradeProgress(targetGrade);

    const [queue, allGradeChars] = await Promise.all([
      getStudyQueue(targetGrade, { newLimit, maxItems }),
      getCharsByGrade(targetGrade)
    ]);
    setItems(queue);
    setGradeChars(allGradeChars);
    setLoading(false);
  }

  const remainCount = useMemo(() => {
    if (items.length === 0) {
      return 0;
    }
    return items.length - 1;
  }, [items.length]);

  const vocabularyContent = useMemo(() => {
    if (!current) {
      return null;
    }
    return buildVocabularyLearningContent(current.charInfo, gradeChars);
  }, [current?.charInfo.char, gradeChars]);

  async function applyAction(action: StudyAction): Promise<void> {
    if (!grade || !current || busy) {
      return;
    }

    setBusy(true);

    const updated = await applyStudyAction(current.charInfo.char, grade, action);

    if (updated) {
      const eventName = action === 'known' ? 'card_known' : action === 'hard' ? 'card_hard' : 'card_retry';
      trackEvent(eventName, {
        char: current.charInfo.char,
        grade
      });

      if (action === 'known') {
        setItems((prev) => prev.slice(1));
      } else {
        setItems((prev) => {
          if (prev.length === 0) {
            return prev;
          }

          const [first, ...rest] = prev;
          const nextCard = { ...first, progress: updated };
          const gap = action === 'hard' ? HARD_GAP : RETRY_GAP;
          return insertAfterGap(rest, nextCard, gap);
        });
      }
    }

    setBusy(false);
  }

  function queueAction(action: StudyAction): void {
    if (!current || busy || animating || (memoryBoostEnabled && !revealed)) {
      return;
    }

    if (actionTimerRef.current !== null) {
      window.clearTimeout(actionTimerRef.current);
    }
    if (autoSpeakTimerRef.current !== null) {
      window.clearTimeout(autoSpeakTimerRef.current);
    }
    stopSpeaking();

    setAnimating(true);
    setMotion(action === 'known' ? 'good' : 'again');

    actionTimerRef.current = window.setTimeout(() => {
      void applyAction(action).finally(() => {
        setMotion('idle');
        setAnimating(false);
        setRevealed(!memoryBoostEnabled);
      });
    }, action === 'known' ? 260 : action === 'hard' ? 300 : 320);
  }

  if (!grade) {
    return (
      <section className="surface-card p-6">
        <p className="text-slate-700">먼저 홈에서 급수를 선택해 주세요.</p>
        <Link to="/" className="btn-primary mt-4 inline-flex px-4 py-2">
          홈으로 이동
        </Link>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="surface-card p-6">
        <p className="text-sm text-slate-600">학습 큐를 준비하는 중...</p>
      </section>
    );
  }

  if (!current) {
    return (
      <section className="surface-card space-y-4 p-7 text-center">
        <p className="text-sm font-medium text-slate-500">오늘 학습 완료</p>
        <h1 className="text-2xl font-semibold tracking-tight">오늘 수고했어요.</h1>
        <p className="text-slate-600">복습 큐가 비었습니다. 내일 다시 이어가요.</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link to="/" className="btn-muted px-4 py-2">
            홈
          </Link>
          <Link to="/quiz" className="btn-primary px-4 py-2">
            퀴즈 풀기
          </Link>
        </div>
      </section>
    );
  }

  const cardMotionClass =
    motion === 'good' ? 'study-card--good' : motion === 'again' ? 'study-card--again' : '';
  const vocabularyQuiz = vocabularyContent?.quiz ?? null;
  const vocabularyAnsweredCorrectly =
    vocabularyAnswerId !== null && vocabularyQuiz?.correctOptionId === vocabularyAnswerId;

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight text-ink">
          한자 학습
          {memoryBoostEnabled && <span className="ml-2 text-xs font-medium text-calm-600">암기 강화</span>}
        </h1>
        <p className="text-sm text-slate-500">남은 카드 {remainCount}개</p>
      </header>

      <article className={`surface-card p-6 sm:p-8 ${cardMotionClass}`}>
        <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center text-center">
          <p
            key={current.charInfo.char}
            className="animate-hanja-appear text-[clamp(6.5rem,34vw,13rem)] font-semibold leading-none tracking-[0.1em] text-ink"
          >
            {current.charInfo.char}
          </p>

          {memoryBoostEnabled && !revealed && (
            <div className="mt-6 w-full max-w-md rounded-[18px] border border-calm-100 bg-calm-50 px-4 py-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-calm-700">Active Recall</p>
              <p className="mt-1 text-sm text-slate-700">뜻과 음을 먼저 떠올린 뒤 정답을 확인하세요.</p>
              <button
                type="button"
                onClick={() => {
                  setRevealed(true);
                  trackEvent('study_recall_revealed', { char: current.charInfo.char, grade });
                }}
                className="btn-primary mt-3 w-full px-4 py-2"
              >
                정답 확인
              </button>
            </div>
          )}

          {(!memoryBoostEnabled || revealed) && (
            <>
              <MeaningReadingPanel
                className="mx-auto mt-6 w-full max-w-md"
                char={current.charInfo.char}
                meaning={current.charInfo.meaning}
                reading={current.charInfo.reading}
                speechEnabled={speechEnabled}
              />

              <div className="my-6 h-px w-full max-w-sm bg-slate-200" />

              {vocabularyContent && (
                <section className="w-full space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-ink">어휘 확장 학습</h2>
                    <p className="text-xs text-slate-500">실사용 어휘 {vocabularyContent.entries.length}개</p>
                  </div>

                  {vocabularyContent.entries.length === 0 && (
                    <p className="rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                      이 한자는 실사용 어휘 데이터가 아직 부족합니다. 자동 생성 어휘는 표시하지 않습니다.
                    </p>
                  )}

                  {vocabularyContent.entries.length > 0 && (
                    <ul className="space-y-2">
                      {vocabularyContent.entries.map((entry) => {
                        const sourceLabel = entry.source === 'curated' ? '추천' : '기본';

                        return (
                          <li
                            key={entry.id}
                            className="rounded-[14px] border border-slate-200 bg-white/90 px-4 py-3 shadow-[0_4px_16px_rgba(15,23,42,0.04)]"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-ink">{entry.word}</p>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                                {sourceLabel}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-700">{entry.meaning}</p>
                            <p className="mt-1 text-xs text-slate-600">예문: {entry.sentence}</p>
                            <p className="mt-1 text-[11px] text-calm-700">{entry.usageNote}</p>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {vocabularyQuiz && (
                    <div className="rounded-[16px] border border-calm-100 bg-calm-50 px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-calm-700">활동 문제</p>
                      <p className="mt-1 text-sm font-medium text-ink">{vocabularyQuiz.prompt}</p>

                      <div className="mt-3 grid gap-2">
                        {vocabularyQuiz.options.map((option) => {
                          const isSelected = vocabularyAnswerId === option.id;
                          const isCorrect = option.id === vocabularyQuiz.correctOptionId;

                          const className =
                            vocabularyAnswerId === null
                              ? 'btn-muted w-full justify-between px-3 py-2 text-left'
                              : isCorrect
                                ? 'w-full rounded-[12px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-left'
                                : isSelected
                                  ? 'w-full rounded-[12px] border border-coral-300 bg-coral-100 px-3 py-2 text-left'
                                  : 'w-full rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-left opacity-70';

                          return (
                            <button
                              key={option.id}
                              type="button"
                              disabled={vocabularyAnswerId !== null}
                              onClick={() => {
                                setVocabularyAnswerId(option.id);
                                trackEvent('study_vocab_quiz_answered', {
                                  char: current.charInfo.char,
                                  grade,
                                  isCorrect: option.id === vocabularyQuiz.correctOptionId
                                });
                              }}
                              className={className}
                            >
                              <span className="block text-sm font-medium text-ink">{option.word}</span>
                              <span className="mt-1 block text-[11px] text-slate-500">{option.meaningHint}</span>
                              <span className="mt-0.5 block text-[11px] text-slate-500">음: {option.readingHint}</span>
                            </button>
                          );
                        })}
                      </div>

                      {vocabularyAnswerId !== null && (
                        <div
                          className={`mt-3 rounded-[12px] px-3 py-3 text-xs ${vocabularyAnsweredCorrectly ? 'border border-emerald-200 bg-emerald-50 text-emerald-800' : 'border border-coral-200 bg-coral-100 text-coral-600'}`}
                        >
                          <p className="font-semibold">{vocabularyAnsweredCorrectly ? '정답입니다.' : '오답입니다.'}</p>
                          <p className="mt-1">{vocabularyQuiz.explanation}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setVocabularyAnswerId(null);
                            }}
                            className="mt-2 text-[11px] font-semibold text-calm-700 underline underline-offset-2"
                          >
                            다시 풀기
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {!vocabularyQuiz && vocabularyContent.entries.length > 0 && (
                    <p className="rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                      같은 음(동음) 실사용 어휘가 부족하면 활동 문제를 만들지 않습니다.
                    </p>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </article>

      {memoryBoostEnabled && !revealed && (
        <p className="text-center text-sm text-slate-500">정답을 확인한 뒤 평가 버튼이 활성화됩니다.</p>
      )}

      {(!memoryBoostEnabled || revealed) && (
        <div className={`grid gap-3 ${memoryBoostEnabled ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
          <button
            type="button"
            disabled={busy || animating}
            onClick={() => {
              queueAction('retry');
            }}
            className="btn-muted px-5 py-4 disabled:cursor-not-allowed disabled:opacity-60"
          >
            모르겠어요
          </button>

          {memoryBoostEnabled && (
            <button
              type="button"
              disabled={busy || animating}
              onClick={() => {
                queueAction('hard');
              }}
              className="btn-muted px-5 py-4 disabled:cursor-not-allowed disabled:opacity-60"
            >
              헷갈려요
            </button>
          )}

          <button
            type="button"
            disabled={busy || animating}
            onClick={() => {
              queueAction('known');
            }}
            className="btn-primary px-5 py-4 disabled:cursor-not-allowed disabled:opacity-60"
          >
            알겠어요
          </button>
        </div>
      )}
    </section>
  );
}
