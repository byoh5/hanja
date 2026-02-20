import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCharsByGrade, saveQuizOutcome } from '../services/progress';
import { seedBaseData, ensureGradeProgress } from '../services/seed';
import { trackEvent } from '../services/analytics';
import { generateQuestions } from '../services/quiz';
import { useAppStore } from '../store/useAppStore';
import type { QuizAnswer, QuizMode, QuizQuestion, QuizResult } from '../types';

interface QuizConfig {
  mode: QuizMode;
  questionCount: number;
  timed: boolean;
  timeLimitSec: number;
}

interface RetryLocationState {
  retryQuestions?: QuizQuestion[];
}

function formatTime(seconds: number): string {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function QuizPage() {
  const grade = useAppStore((state) => state.selectedGrade);
  const navigate = useNavigate();
  const location = useLocation();

  const retryState = location.state as RetryLocationState | null;

  const [config, setConfig] = useState<QuizConfig>({
    mode: 'mixed',
    questionCount: 20,
    timed: false,
    timeLimitSec: 600
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({});
  const [remainingSec, setRemainingSec] = useState(config.timeLimitSec);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const current = questions[currentIndex] ?? null;
  const isLastQuestion = currentIndex === questions.length - 1;

  useEffect(() => {
    const retryQuestions = retryState?.retryQuestions;
    if (!retryQuestions || retryQuestions.length === 0 || running) {
      return;
    }

    setQuestions(retryQuestions);
    setStartedAt(new Date());
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswerMap({});
    setRunning(true);
    setConfig((prev) => ({ ...prev, timed: false, questionCount: retryQuestions.length }));

    trackEvent('quiz_retry_started', { count: retryQuestions.length });
  }, [retryState, running]);

  const finishQuiz = useCallback(
    async (finalAnswers: Record<string, string>) => {
      if (!grade || !startedAt || questions.length === 0) {
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
        grade,
        mode: config.mode,
        startedAt,
        endedAt,
        answers
      });

      const correctCount = answers.filter((answer) => answer.isCorrect).length;
      const total = answers.length;
      const wrongQuestions = answers.filter((answer) => !answer.isCorrect).map((answer) => answer.question);
      const score = total === 0 ? 0 : Math.round((correctCount / total) * 100);

      const result: QuizResult = {
        mode: config.mode,
        score,
        total,
        correctCount,
        wrongCount: total - correctCount,
        durationSec: Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 1000)),
        answers,
        wrongQuestions
      };

      trackEvent('quiz_completed', {
        grade,
        score,
        total,
        wrongCount: result.wrongCount,
        mode: config.mode
      });

      setSubmitting(false);
      setRunning(false);
      navigate('/result', { state: { result } });
    },
    [config.mode, grade, navigate, questions, startedAt]
  );

  useEffect(() => {
    if (!running || !config.timed) {
      return;
    }

    if (remainingSec <= 0) {
      void finishQuiz(answerMap);
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSec((prev) => prev - 1);
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [answerMap, config.timed, finishQuiz, remainingSec, running]);

  const progressText = useMemo(() => {
    if (!running || questions.length === 0) {
      return '0 / 0';
    }

    return `${currentIndex + 1} / ${questions.length}`;
  }, [currentIndex, questions.length, running]);

  async function startQuiz(): Promise<void> {
    if (!grade) {
      return;
    }

    await seedBaseData();
    await ensureGradeProgress(grade);

    const chars = await getCharsByGrade(grade);
    const generated = generateQuestions(chars, config.questionCount, config.mode);

    setQuestions(generated);
    setStartedAt(new Date());
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswerMap({});
    setRemainingSec(config.timeLimitSec);
    setRunning(true);

    trackEvent('quiz_started', {
      grade,
      mode: config.mode,
      count: generated.length,
      timed: config.timed
    });
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

    if (isLastQuestion) {
      void finishQuiz(updated);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  }

  if (!grade) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-700">대시보드에서 먼저 급수를 선택해주세요.</p>
        <Link to="/" className="mt-3 inline-block rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white">
          대시보드로 이동
        </Link>
      </section>
    );
  }

  if (!running) {
    return (
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">시험 모드 설정</h1>

        <label className="block space-y-1">
          <span className="text-sm font-semibold text-slate-700">문제 유형</span>
          <select
            value={config.mode}
            onChange={(event) => {
              setConfig((prev) => ({ ...prev, mode: event.target.value as QuizMode }));
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="mixed">혼합</option>
            <option value="meaning">뜻 맞추기</option>
            <option value="reading">음 맞추기</option>
            <option value="character">한자 선택</option>
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-semibold text-slate-700">문제 수</span>
          <select
            value={config.questionCount}
            onChange={(event) => {
              setConfig((prev) => ({ ...prev, questionCount: Number(event.target.value) }));
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value={10}>10문제</option>
            <option value={20}>20문제</option>
            <option value={50}>50문제</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.timed}
            onChange={(event) => {
              setConfig((prev) => ({ ...prev, timed: event.target.checked }));
            }}
            className="h-4 w-4"
          />
          <span className="text-sm font-semibold text-slate-700">시간 제한 사용</span>
        </label>

        {config.timed && (
          <label className="block space-y-1">
            <span className="text-sm font-semibold text-slate-700">제한 시간(초)</span>
            <input
              type="number"
              min={60}
              step={30}
              value={config.timeLimitSec}
              onChange={(event) => {
                setConfig((prev) => ({ ...prev, timeLimitSec: Number(event.target.value) || 600 }));
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
        )}

        <button
          type="button"
          onClick={() => {
            void startQuiz();
          }}
          className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
        >
          시험 시작
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">실전 시험</h1>
        <div className="text-right text-sm text-slate-600">
          <p>{progressText}</p>
          {config.timed && <p className="font-semibold text-amber-700">남은 시간 {formatTime(remainingSec)}</p>}
        </div>
      </header>

      {current && (
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-brand-700">{current.type.toUpperCase()}</p>
          <h2 className="mt-2 text-xl font-semibold">{current.prompt}</h2>

          <div className="mt-5 grid gap-2">
            {current.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setSelectedOption(option);
                }}
                className={`rounded-lg border px-4 py-2 text-left ${
                  selectedOption === option
                    ? 'border-brand-500 bg-brand-50 text-brand-800'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={!selectedOption || submitting}
            onClick={handleNext}
            className="mt-5 rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLastQuestion ? '제출하기' : '다음 문제'}
          </button>
        </article>
      )}
    </section>
  );
}
