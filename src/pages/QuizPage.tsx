import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { trackEvent } from '../services/analytics';
import { getCharsByGrade, saveQuizOutcome } from '../services/progress';
import { generateQuestions } from '../services/quiz';
import { ensureGradeProgress, seedBaseData } from '../services/seed';
import { useAppStore } from '../store/useAppStore';
import type { QuizAnswer, QuizMode, QuizQuestion, QuizResult } from '../types';

interface RetryLocationState {
  retryQuestions?: QuizQuestion[];
}

type QuizFeedback = 'idle' | 'correct' | 'retry';

const QUIZ_MODE: QuizMode = 'meaning';
const GRADE_OPTIONS = [8, 7, 6] as const;
const QUESTION_OPTIONS = [10, 20] as const;

export function QuizPage() {
  const grade = useAppStore((state) => state.selectedGrade);
  const setSelectedGrade = useAppStore((state) => state.setSelectedGrade);
  const navigate = useNavigate();
  const location = useLocation();

  const retryState = location.state as RetryLocationState | null;

  const [configuredGrade, setConfiguredGrade] = useState<number>(grade ?? 8);
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

  const current = questions[currentIndex] ?? null;
  const isLastQuestion = currentIndex === questions.length - 1;

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

    setQuestions(retryQuestions);
    setStartedAt(new Date());
    setCurrentIndex(0);
    setSelectedOption(null);
    setFeedback('idle');
    setAnswerMap({});
    setQuestionCount(retryQuestions.length);
    setErrorMessage(null);
    setRunning(true);

    trackEvent('quiz_retry_started', { count: retryQuestions.length });
  }, [retryState, running]);

  const finishQuiz = useCallback(
    async (finalAnswers: Record<string, string>) => {
      const targetGrade = grade ?? configuredGrade;
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
          isCorrect: selectedAnswer === question.correctAnswer
        };
      });

      await saveQuizOutcome({
        grade: targetGrade,
        mode: QUIZ_MODE,
        startedAt,
        endedAt,
        answers
      });

      const correctCount = answers.filter((answer) => answer.isCorrect).length;
      const total = answers.length;
      const wrongQuestions = answers.filter((answer) => !answer.isCorrect).map((answer) => answer.question);
      const score = total === 0 ? 0 : Math.round((correctCount / total) * 100);

      const result: QuizResult = {
        mode: QUIZ_MODE,
        score,
        total,
        correctCount,
        wrongCount: total - correctCount,
        durationSec: Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 1000)),
        answers,
        wrongQuestions
      };

      trackEvent('quiz_completed', {
        grade: targetGrade,
        score,
        total,
        wrongCount: result.wrongCount,
        mode: QUIZ_MODE
      });

      setSubmitting(false);
      setRunning(false);
      void navigate('/result', { state: { result } });
    },
    [configuredGrade, grade, navigate, questions, startedAt]
  );

  const progressText = useMemo(() => {
    if (!running || questions.length === 0) {
      return '0 / 0';
    }

    return `${currentIndex + 1} / ${questions.length}`;
  }, [currentIndex, questions.length, running]);

  async function startQuiz(): Promise<void> {
    if (configuredGrade !== 8) {
      return;
    }

    const targetGrade = configuredGrade;
    setSelectedGrade(targetGrade);

    setErrorMessage(null);
    await seedBaseData();
    await ensureGradeProgress(targetGrade);

    const chars = await getCharsByGrade(targetGrade);
    if (chars.length === 0) {
      setRunning(false);
      setErrorMessage('해당 급수의 한자 데이터가 없어 퀴즈를 시작할 수 없습니다.');
      return;
    }

    const generated = generateQuestions(chars, questionCount, QUIZ_MODE);
    if (generated.length === 0) {
      setRunning(false);
      setErrorMessage('출제할 문제가 없습니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    setQuestions(generated);
    setStartedAt(new Date());
    setCurrentIndex(0);
    setSelectedOption(null);
    setFeedback('idle');
    setAnswerMap({});
    setRunning(true);

    trackEvent('quiz_started', {
      grade: targetGrade,
      mode: QUIZ_MODE,
      count: generated.length,
      timed: false
    });
  }

  function handleOptionSelect(option: string): void {
    if (submitting || !current) {
      return;
    }

    setSelectedOption(option);
    setFeedback(option === current.correctAnswer ? 'correct' : 'retry');
  }

  function handleNext(): void {
    if (!current || !selectedOption || submitting) {
      return;
    }

    const updated = {
      ...answerMap,
      [current.id]: selectedOption
    };

    setAnswerMap(updated);
    setSelectedOption(null);
    setFeedback('idle');

    if (isLastQuestion) {
      void finishQuiz(updated);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
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
          <h1 className="text-2xl font-semibold tracking-tight text-ink">뜻 고르기 퀴즈</h1>
          <p className="text-sm text-slate-600">부담 없이 한 문제씩 집중해요.</p>
        </header>

        <article className="surface-card p-6 sm:p-7">
          {errorMessage && <p className="rounded-[16px] bg-coral-100 px-4 py-3 text-sm text-coral-500">{errorMessage}</p>}

          <div className="mt-2 space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">급수</p>
              <div className="segment-control">
                {GRADE_OPTIONS.map((option) => {
                  const isAvailable = option === 8;
                  const isActive = configuredGrade === option;
                  const className = [
                    'segment-btn',
                    isActive ? 'segment-btn-active' : '',
                    !isAvailable ? 'segment-btn-disabled' : ''
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={!isAvailable}
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

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">문제 수</p>
              <div className="segment-control">
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

          <button
            type="button"
            onClick={() => {
              void startQuiz();
            }}
            className="btn-primary mt-6 px-5 py-3"
          >
            퀴즈 시작
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
            setErrorMessage('문제를 준비하지 못했습니다. 다시 시도해 주세요.');
          }}
          className="btn-primary px-4 py-2"
        >
          설정으로 돌아가기
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight text-ink">뜻 고르기</h1>
        <p className="text-sm text-slate-500">{progressText}</p>
      </header>

      <article className="surface-card p-6 sm:p-7">
        <p className="text-sm font-medium text-slate-500">문제</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{current.prompt}</h2>

        <div className="mt-5 grid gap-3">
          {current.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                handleOptionSelect(option);
              }}
              className={optionClass(option)}
            >
              {option}
            </button>
          ))}
        </div>

        {selectedOption && feedback === 'correct' && (
          <p className="mt-4 text-sm font-medium text-emerald-700">좋아요. 정확해요.</p>
        )}
        {selectedOption && feedback === 'retry' && (
          <p className="mt-4 text-sm font-medium text-coral-500">한번 더 볼까요?</p>
        )}

        <button
          type="button"
          disabled={!selectedOption || submitting}
          onClick={handleNext}
          className="btn-primary mt-5 px-5 py-3 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLastQuestion ? '제출하기' : '다음 문제'}
        </button>
      </article>
    </section>
  );
}
