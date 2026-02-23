import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SUPPORTED_GRADES } from '../data';
import { trackEvent } from '../services/analytics';
import { getCharsByGrade, getProgressByGrade, saveQuizOutcome } from '../services/progress';
import { generateQuestions } from '../services/quiz';
import { ensureGradeProgress, seedBaseData } from '../services/seed';
import { useAppStore } from '../store/useAppStore';
import type { QuestionType, QuizAnswer, QuizMode, QuizQuestion, QuizResult, QuizTypeStat } from '../types';

interface RetryLocationState {
  retryQuestions?: QuizQuestion[];
}

type QuizFeedback = 'idle' | 'correct' | 'retry';

const GRADE_OPTIONS = SUPPORTED_GRADES;
const QUESTION_OPTIONS = [10, 20, 50] as const;
const CORRECT_AUTO_ADVANCE_DELAY_MS = 850;
const WRONG_AUTO_ADVANCE_DELAY_MS = 2200;

const MODE_OPTIONS: Array<{ mode: QuizMode; label: string; description: string }> = [
  { mode: 'meaning', label: '뜻 고르기', description: '한자 -> 뜻 4지선다' },
  { mode: 'reading', label: '음 고르기', description: '한자 -> 음 4지선다' },
  { mode: 'character', label: '한자 고르기', description: '뜻 -> 한자 4지선다' },
  { mode: 'mixed', label: '혼합', description: '뜻/음/한자를 섞어서 출제' },
  { mode: 'inputCharacter', label: '입력(한자)', description: '뜻+음을 보고 한자 입력' },
  { mode: 'inputReading', label: '입력(음)', description: '한자를 보고 음 입력' },
  { mode: 'weakness', label: '오답 집중', description: '자주 틀린 한자를 우선 출제' }
];

function normalizeAnswer(value: string): string {
  return value.trim().replace(/\s+/g, '').toLowerCase();
}

function isAnswerCorrect(question: QuizQuestion, selectedAnswer: string): boolean {
  const accepted = question.acceptedAnswers && question.acceptedAnswers.length > 0
    ? question.acceptedAnswers
    : [question.correctAnswer];

  const normalizedSelected = normalizeAnswer(selectedAnswer);
  return accepted.some((answer) => normalizeAnswer(answer) === normalizedSelected);
}

function modeLabel(mode: QuizMode): string {
  const found = MODE_OPTIONS.find((option) => option.mode === mode);
  return found?.label ?? mode;
}

function questionTypeLabel(type: QuestionType): string {
  if (type === 'meaning') {
    return '뜻 고르기';
  }
  if (type === 'reading') {
    return '음 고르기';
  }
  if (type === 'character') {
    return '한자 고르기';
  }
  if (type === 'inputCharacter') {
    return '입력(한자)';
  }
  return '입력(음)';
}

function buildTypeStats(answers: QuizAnswer[]): QuizTypeStat[] {
  const types: QuestionType[] = ['meaning', 'reading', 'character', 'inputCharacter', 'inputReading'];

  return types
    .map((type) => {
      const typeAnswers = answers.filter((answer) => answer.question.type === type);
      if (typeAnswers.length === 0) {
        return null;
      }

      const correct = typeAnswers.filter((answer) => answer.isCorrect).length;
      return {
        type,
        total: typeAnswers.length,
        correct,
        accuracy: Math.round((correct / typeAnswers.length) * 100)
      };
    })
    .filter((item): item is QuizTypeStat => item !== null);
}

export function QuizPage() {
  const grade = useAppStore((state) => state.selectedGrade);
  const setSelectedGrade = useAppStore((state) => state.setSelectedGrade);
  const navigate = useNavigate();
  const location = useLocation();

  const retryState = location.state as RetryLocationState | null;

  const [configuredGrade, setConfiguredGrade] = useState<number>(grade ?? GRADE_OPTIONS[0]);
  const [configuredMode, setConfiguredMode] = useState<QuizMode>('mixed');
  const [activeMode, setActiveMode] = useState<QuizMode | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(10);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<QuizFeedback>('idle');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const autoAdvanceTimerRef = useRef<number | null>(null);

  const current = questions[currentIndex] ?? null;
  const isLastQuestion = currentIndex === questions.length - 1;

  function clearAutoAdvanceTimer(): void {
    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }

  useEffect(() => {
    if (grade) {
      setConfiguredGrade(grade);
    }
  }, [grade]);

  useEffect(() => {
    const retryQuestions = retryState?.retryQuestions;
    if (!retryQuestions || retryQuestions.length === 0 || running) {
      return;
    }

    clearAutoAdvanceTimer();

    setQuestions(retryQuestions);
    setStartedAt(new Date());
    setCurrentIndex(0);
    setSelectedOption(null);
    setFeedback('idle');
    setAnswerMap({});
    setQuestionCount(retryQuestions.length);
    setErrorMessage(null);
    setInputValue('');
    setConfiguredMode('mixed');
    setActiveMode('mixed');
    setRunning(true);

    trackEvent('quiz_retry_started', { count: retryQuestions.length, mode: 'mixed' });
  }, [retryState, running]);

  useEffect(() => {
    return () => {
      clearAutoAdvanceTimer();
    };
  }, []);

  const finishQuiz = useCallback(
    async (finalAnswers: Record<string, string>) => {
      const targetGrade = grade ?? configuredGrade;
      const targetMode = activeMode ?? configuredMode;

      if (!targetGrade || !startedAt || questions.length === 0) {
        return;
      }

      setSubmitting(true);

      const endedAt = new Date();
      const answers: QuizAnswer[] = questions.map((question) => {
        const selectedAnswer = finalAnswers[question.id] ?? '';
        return {
          question,
          selectedAnswer,
          isCorrect: isAnswerCorrect(question, selectedAnswer)
        };
      });

      await saveQuizOutcome({
        grade: targetGrade,
        mode: targetMode,
        startedAt,
        endedAt,
        answers
      });

      const correctCount = answers.filter((answer) => answer.isCorrect).length;
      const total = answers.length;
      const wrongQuestions = answers.filter((answer) => !answer.isCorrect).map((answer) => answer.question);
      const score = total === 0 ? 0 : Math.round((correctCount / total) * 100);
      const typeStats = buildTypeStats(answers);

      const result: QuizResult = {
        mode: targetMode,
        score,
        total,
        correctCount,
        wrongCount: total - correctCount,
        durationSec: Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 1000)),
        answers,
        wrongQuestions,
        typeStats
      };

      trackEvent('quiz_completed', {
        grade: targetGrade,
        score,
        total,
        wrongCount: result.wrongCount,
        mode: targetMode
      });

      setSubmitting(false);
      setRunning(false);
      setActiveMode(null);
      void navigate('/result', { state: { result } });
    },
    [activeMode, configuredGrade, configuredMode, grade, navigate, questions, startedAt]
  );

  const progressText = useMemo(() => {
    if (!running || questions.length === 0) {
      return '0 / 0';
    }

    return `${currentIndex + 1} / ${questions.length}`;
  }, [currentIndex, questions.length, running]);

  async function startQuiz(): Promise<void> {
    const targetGrade = configuredGrade;
    setSelectedGrade(targetGrade);
    clearAutoAdvanceTimer();

    setErrorMessage(null);
    await seedBaseData();
    await ensureGradeProgress(targetGrade);

    const [chars, progressRows] = await Promise.all([getCharsByGrade(targetGrade), getProgressByGrade(targetGrade)]);

    if (chars.length === 0) {
      setRunning(false);
      setActiveMode(null);
      setErrorMessage('해당 급수의 한자 데이터가 없어 퀴즈를 시작할 수 없습니다.');
      return;
    }

    const wrongCountByChar: Record<string, number> = Object.fromEntries(
      progressRows.map((item) => [item.char, item.wrongCount])
    );

    const generated = generateQuestions(chars, questionCount, configuredMode, { wrongCountByChar });
    if (generated.length === 0) {
      setRunning(false);
      setActiveMode(null);
      setErrorMessage('출제할 문제가 없습니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    setQuestions(generated);
    setStartedAt(new Date());
    setCurrentIndex(0);
    setSelectedOption(null);
    setFeedback('idle');
    setAnswerMap({});
    setInputValue('');
    setActiveMode(configuredMode);
    setRunning(true);

    trackEvent('quiz_started', {
      grade: targetGrade,
      mode: configuredMode,
      count: generated.length,
      timed: false
    });
  }

  function queueAdvance(isCorrect: boolean, updatedAnswers: Record<string, string>): void {
    clearAutoAdvanceTimer();

    const autoAdvanceDelay = isCorrect ? CORRECT_AUTO_ADVANCE_DELAY_MS : WRONG_AUTO_ADVANCE_DELAY_MS;
    autoAdvanceTimerRef.current = window.setTimeout(() => {
      autoAdvanceTimerRef.current = null;

      if (isLastQuestion) {
        void finishQuiz(updatedAnswers);
        return;
      }

      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setFeedback('idle');
      setInputValue('');
    }, autoAdvanceDelay);
  }

  function handleOptionSelect(option: string): void {
    if (submitting || !current || selectedOption) {
      return;
    }

    const isCorrect = isAnswerCorrect(current, option);
    const updated = {
      ...answerMap,
      [current.id]: option
    };

    setSelectedOption(option);
    setFeedback(isCorrect ? 'correct' : 'retry');
    setAnswerMap(updated);
    queueAdvance(isCorrect, updated);
  }

  function handleInputSubmit(): void {
    if (submitting || !current || selectedOption) {
      return;
    }

    const submitted = inputValue.trim();
    if (!submitted) {
      return;
    }

    const isCorrect = isAnswerCorrect(current, submitted);
    const updated = {
      ...answerMap,
      [current.id]: submitted
    };

    setSelectedOption(submitted);
    setFeedback(isCorrect ? 'correct' : 'retry');
    setAnswerMap(updated);
    queueAdvance(isCorrect, updated);
  }

  function optionClass(option: string): string {
    const baseClass =
      'w-full rounded-[20px] border px-5 py-4 text-left text-lg transition focus:outline-none focus:ring-2 focus:ring-calm-100';

    if (!selectedOption) {
      return `${baseClass} border-slate-200 bg-white text-ink hover:bg-slate-50`;
    }

    if (feedback === 'correct') {
      if (option === selectedOption) {
        return `${baseClass} border-emerald-200 bg-emerald-50 text-emerald-800`;
      }
      return `${baseClass} border-slate-200 bg-white text-slate-500`;
    }

    if (option === current?.correctAnswer) {
      return `${baseClass} border-emerald-200 bg-emerald-50 text-emerald-800`;
    }

    if (option === selectedOption) {
      return `${baseClass} border-coral-500 bg-coral-100 text-coral-500`;
    }

    return `${baseClass} border-slate-200 bg-white text-slate-500`;
  }

  if (!running) {
    return (
      <section className="space-y-4">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">다중 모드 퀴즈</h1>
          <p className="text-sm text-slate-600">학습 상태에 맞는 모드를 선택해 회상 훈련을 진행하세요.</p>
        </header>

        <article className="surface-card p-6 sm:p-7">
          {errorMessage && <p className="rounded-[16px] bg-coral-100 px-4 py-3 text-sm text-coral-500">{errorMessage}</p>}

          <div className="mt-2 space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">급수</p>
              <div className="overflow-x-auto pb-1">
                <div className="segment-control min-w-max">
                  {GRADE_OPTIONS.map((option) => {
                    const isActive = configuredGrade === option;
                    const className = ['segment-btn', isActive ? 'segment-btn-active' : '']
                      .filter(Boolean)
                      .join(' ');

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setConfiguredGrade(option);
                        }}
                        className={className}
                      >
                        {option}급
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">모드</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {MODE_OPTIONS.map((option) => {
                  const isActive = configuredMode === option.mode;
                  return (
                    <button
                      key={option.mode}
                      type="button"
                      onClick={() => {
                        setConfiguredMode(option.mode);
                      }}
                      className={`rounded-[16px] border px-4 py-3 text-left transition ${
                        isActive
                          ? 'border-calm-200 bg-calm-50 text-calm-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-sm font-semibold">{option.label}</p>
                      <p className="mt-1 text-xs text-slate-500">{option.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">문제 수</p>
              <div className="overflow-x-auto pb-1">
                <div className="segment-control min-w-max">
                  {QUESTION_OPTIONS.map((option) => {
                    const className = option === questionCount ? 'segment-btn segment-btn-active' : 'segment-btn';
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setQuestionCount(option);
                        }}
                        className={className}
                      >
                        {option}문제
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              void startQuiz();
            }}
            className="btn-primary mt-6 px-5 py-3"
          >
            {modeLabel(configuredMode)} 시작
          </button>
        </article>
      </section>
    );
  }

  if (!current) {
    return (
      <section className="surface-card space-y-4 p-7">
        <h1 className="text-xl font-semibold tracking-tight text-ink">문제를 불러오지 못했습니다.</h1>
        <p className="text-sm text-slate-600">퀴즈 화면을 닫고 다시 시작해 주세요.</p>
        <button
          type="button"
          onClick={() => {
            setRunning(false);
            setActiveMode(null);
            setErrorMessage('문제를 준비하지 못했습니다. 다시 시도해 주세요.');
          }}
          className="btn-primary px-4 py-2"
        >
          설정으로 돌아가기
        </button>
      </section>
    );
  }

  const hasOptions = (current.options?.length ?? 0) > 0;
  const correctAnswerLabel = current.acceptedAnswers && current.acceptedAnswers.length > 0
    ? current.acceptedAnswers.join(' / ')
    : current.correctAnswer;

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight text-ink">{modeLabel(activeMode ?? configuredMode)}</h1>
        <p className="text-sm text-slate-500">{progressText}</p>
      </header>

      <article className="surface-card p-6 sm:p-7">
        <p className="text-sm font-medium text-slate-500">{questionTypeLabel(current.type)}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{current.prompt}</h2>

        {hasOptions && (
          <div className="mt-5 grid gap-3">
            {(current.options ?? []).map((option) => (
              <button
                key={option}
                type="button"
                disabled={Boolean(selectedOption) || submitting}
                onClick={() => {
                  handleOptionSelect(option);
                }}
                className={`${optionClass(option)} disabled:cursor-not-allowed disabled:opacity-90`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {!hasOptions && (
          <div className="mt-5 space-y-3">
            <input
              value={inputValue}
              disabled={Boolean(selectedOption) || submitting}
              onChange={(event) => {
                setInputValue(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleInputSubmit();
                }
              }}
              placeholder="정답 입력"
              className="w-full rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-lg text-ink focus:border-calm-300 focus:outline-none"
            />
            <button
              type="button"
              disabled={Boolean(selectedOption) || submitting || inputValue.trim().length === 0}
              onClick={handleInputSubmit}
              className="btn-primary px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
            >
              정답 제출
            </button>
          </div>
        )}

        {selectedOption && feedback === 'correct' && (
          <p className="mt-4 text-sm font-medium text-emerald-700">정답입니다. 자동으로 다음 문제로 이동합니다.</p>
        )}
        {selectedOption && feedback === 'retry' && (
          <p className="mt-4 text-sm font-medium text-coral-500">
            정답은 {correctAnswerLabel}입니다. 자동으로 다음 문제로 이동합니다.
          </p>
        )}
        {selectedOption && current.explanation && (
          <p className="mt-2 text-sm text-slate-600">{current.explanation}</p>
        )}
      </article>
    </section>
  );
}
