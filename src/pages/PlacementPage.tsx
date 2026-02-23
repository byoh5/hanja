import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SUPPORTED_GRADES } from '../data';
import type { SupportedGrade } from '../data';
import { trackEvent } from '../services/analytics';
import { getCharsByGrade } from '../services/progress';
import { generateQuestions } from '../services/quiz';
import { seedBaseData } from '../services/seed';
import { useAppStore } from '../store/useAppStore';
import type { QuizQuestion } from '../types';

interface PlacementQuestion extends QuizQuestion {
  sourceGrade: SupportedGrade;
}

interface GradeAccuracy {
  grade: SupportedGrade;
  total: number;
  correct: number;
  accuracy: number;
}

interface PlacementResult {
  total: number;
  correct: number;
  weightedRatio: number;
  recommendedGrade: SupportedGrade;
  gradeAccuracies: GradeAccuracy[];
}

const QUESTION_OPTIONS = [8, 16, 24] as const;
const CORRECT_AUTO_ADVANCE_DELAY_MS = 800;
const WRONG_AUTO_ADVANCE_DELAY_MS = 1800;

function shuffle<T>(items: T[]): T[] {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

function buildQuestionDistribution(totalQuestions: number): Record<SupportedGrade, number> {
  const distribution = {} as Record<SupportedGrade, number>;
  const base = Math.floor(totalQuestions / SUPPORTED_GRADES.length);
  const remainder = totalQuestions % SUPPORTED_GRADES.length;

  SUPPORTED_GRADES.forEach((grade, index) => {
    distribution[grade] = base + (index < remainder ? 1 : 0);
  });

  return distribution;
}

function gradeWeight(grade: SupportedGrade): number {
  return 9 - grade;
}

function recommendGrade(weightedRatio: number, grade8Accuracy: number): SupportedGrade {
  if (grade8Accuracy < 50) {
    return 8;
  }
  if (weightedRatio < 0.14) {
    return 8;
  }
  if (weightedRatio < 0.26) {
    return 7;
  }
  if (weightedRatio < 0.38) {
    return 6;
  }
  if (weightedRatio < 0.5) {
    return 5;
  }
  if (weightedRatio < 0.62) {
    return 4;
  }
  if (weightedRatio < 0.74) {
    return 3;
  }
  if (weightedRatio < 0.86) {
    return 2;
  }
  return 1;
}

function levelComment(grade: SupportedGrade): string {
  if (grade >= 7) {
    return '기초 급수부터 시작해 안정적으로 기반을 쌓는 것이 좋습니다.';
  }
  if (grade >= 5) {
    return '기본기가 있으니 중간 난이도부터 시작하면 효율적입니다.';
  }
  if (grade >= 3) {
    return '응용 학습이 가능한 수준입니다. 실전형 복습을 병행해 보세요.';
  }
  return '상위 급수 도전이 가능한 상태입니다. 혼합/입력형 중심으로 학습해 보세요.';
}

export function PlacementPage() {
  const setSelectedGrade = useAppStore((state) => state.setSelectedGrade);
  const navigate = useNavigate();

  const [questionCount, setQuestionCount] = useState<number>(16);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [correctMap, setCorrectMap] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<PlacementResult | null>(null);

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
    return () => {
      clearAutoAdvanceTimer();
    };
  }, []);

  async function startPlacementTest(): Promise<void> {
    setLoading(true);
    setErrorMessage(null);
    setResult(null);

    await seedBaseData();

    const distribution = buildQuestionDistribution(questionCount);
    const nextQuestions: PlacementQuestion[] = [];

    for (const grade of SUPPORTED_GRADES) {
      const count = distribution[grade];
      if (count <= 0) {
        continue;
      }

      const chars = await getCharsByGrade(grade);
      if (chars.length === 0) {
        continue;
      }

      const generated = generateQuestions(chars, count, 'mixed');
      generated.forEach((question, index) => {
        nextQuestions.push({
          ...question,
          id: `placement-${grade}-${question.id}-${index}`,
          sourceGrade: grade
        });
      });
    }

    if (nextQuestions.length === 0) {
      setLoading(false);
      setErrorMessage('레벨 테스트 문항을 준비할 수 없습니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    const shuffled = shuffle(nextQuestions).slice(0, questionCount);

    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedOption(null);
    setCorrectMap({});
    setRunning(true);
    setLoading(false);

    trackEvent('placement_test_started', { questionCount: shuffled.length });
  }

  function finalizeTest(finalCorrectMap: Record<string, boolean>): void {
    setSubmitting(true);

    const total = questions.length;
    const correct = questions.filter((question) => finalCorrectMap[question.id]).length;

    const totalWeight = questions.reduce((sum, question) => sum + gradeWeight(question.sourceGrade), 0);
    const earnedWeight = questions.reduce(
      (sum, question) => sum + (finalCorrectMap[question.id] ? gradeWeight(question.sourceGrade) : 0),
      0
    );

    const weightedRatio = totalWeight === 0 ? 0 : earnedWeight / totalWeight;

    const gradeAccuracies: GradeAccuracy[] = SUPPORTED_GRADES.map((grade) => {
      const gradeQuestions = questions.filter((question) => question.sourceGrade === grade);
      const gradeTotal = gradeQuestions.length;
      const gradeCorrect = gradeQuestions.filter((question) => finalCorrectMap[question.id]).length;
      const accuracy = gradeTotal === 0 ? 0 : Math.round((gradeCorrect / gradeTotal) * 100);

      return {
        grade,
        total: gradeTotal,
        correct: gradeCorrect,
        accuracy
      };
    }).filter((item) => item.total > 0);

    const grade8Accuracy = gradeAccuracies.find((item) => item.grade === 8)?.accuracy ?? 0;
    const recommendedGrade = recommendGrade(weightedRatio, grade8Accuracy);

    setResult({
      total,
      correct,
      weightedRatio,
      recommendedGrade,
      gradeAccuracies
    });

    trackEvent('placement_test_completed', {
      total,
      correct,
      weightedRatio: Number(weightedRatio.toFixed(3)),
      recommendedGrade
    });

    setSubmitting(false);
    setRunning(false);
  }

  function handleOptionSelect(option: string): void {
    if (!current || selectedOption || submitting) {
      return;
    }

    const isCorrect = option === current.correctAnswer;
    const updated = {
      ...correctMap,
      [current.id]: isCorrect
    };

    setSelectedOption(option);
    setCorrectMap(updated);

    clearAutoAdvanceTimer();
    const delay = isCorrect ? CORRECT_AUTO_ADVANCE_DELAY_MS : WRONG_AUTO_ADVANCE_DELAY_MS;

    autoAdvanceTimerRef.current = window.setTimeout(() => {
      autoAdvanceTimerRef.current = null;

      if (isLastQuestion) {
        finalizeTest(updated);
        return;
      }

      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    }, delay);
  }

  function applyRecommendedGrade(targetGrade: SupportedGrade): void {
    setSelectedGrade(targetGrade);
    trackEvent('placement_grade_applied', { grade: targetGrade });
    void navigate('/study');
  }

  const progressText = useMemo(() => {
    if (!running || questions.length === 0) {
      return '0 / 0';
    }
    return `${currentIndex + 1} / ${questions.length}`;
  }, [currentIndex, questions.length, running]);

  if (result) {
    return (
      <section className="space-y-5">
        <header className="space-y-1">
          <p className="text-sm text-slate-500">레벨 테스트 결과</p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">추천 시작 급수는 {result.recommendedGrade}급입니다</h1>
          <p className="text-sm text-slate-600">{levelComment(result.recommendedGrade)}</p>
        </header>

        <article className="surface-card p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Overall</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight text-ink">
            {result.correct} / {result.total}
          </p>
          <p className="mt-2 text-sm text-slate-600">난이도 가중 점수 {Math.round(result.weightedRatio * 100)}%</p>

          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {result.gradeAccuracies.map((item) => (
              <li key={item.grade} className="rounded-[14px] border border-slate-200 bg-white px-3 py-2">
                <p className="text-xs text-slate-500">{item.grade}급 문항</p>
                <p className="text-lg font-semibold text-ink">{item.accuracy}%</p>
                <p className="text-xs text-slate-500">
                  {item.correct}/{item.total}
                </p>
              </li>
            ))}
          </ul>
        </article>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              applyRecommendedGrade(result.recommendedGrade);
            }}
            className="btn-primary px-4 py-2"
          >
            {result.recommendedGrade}급으로 학습 시작
          </button>
          <button
            type="button"
            onClick={() => {
              setResult(null);
            }}
            className="btn-muted px-4 py-2"
          >
            다시 테스트
          </button>
          <Link to="/" className="btn-muted px-4 py-2">
            홈
          </Link>
        </div>
      </section>
    );
  }

  if (running && current) {
    return (
      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight text-ink">레벨 테스트</h1>
          <p className="text-sm text-slate-500">{progressText}</p>
        </header>

        <article className="surface-card p-6 sm:p-7">
          <p className="text-sm font-medium text-slate-500">문제</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{current.prompt}</h2>

          <div className="mt-5 grid gap-3">
            {(current.options ?? []).map((option) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === current.correctAnswer;

              const className = !selectedOption
                ? 'w-full rounded-[20px] border border-slate-200 bg-white px-5 py-4 text-left text-lg text-ink transition hover:bg-slate-50'
                : isSelected && isCorrect
                  ? 'w-full rounded-[20px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-left text-lg text-emerald-800'
                  : isSelected && !isCorrect
                    ? 'w-full rounded-[20px] border border-coral-500 bg-coral-100 px-5 py-4 text-left text-lg text-coral-500'
                    : isCorrect
                      ? 'w-full rounded-[20px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-left text-lg text-emerald-800'
                      : 'w-full rounded-[20px] border border-slate-200 bg-white px-5 py-4 text-left text-lg text-slate-500';

              return (
                <button
                  key={option}
                  type="button"
                  disabled={Boolean(selectedOption) || submitting}
                  onClick={() => {
                    handleOptionSelect(option);
                  }}
                  className={`${className} disabled:cursor-not-allowed disabled:opacity-90`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {selectedOption && selectedOption === current.correctAnswer && (
            <p className="mt-4 text-sm font-medium text-emerald-700">정답입니다. 다음 문제로 이동합니다.</p>
          )}
          {selectedOption && selectedOption !== current.correctAnswer && (
            <p className="mt-4 text-sm font-medium text-coral-500">
              정답은 {current.correctAnswer}입니다. 다음 문제로 이동합니다.
            </p>
          )}
        </article>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">레벨 테스트</h1>
        <p className="text-sm text-slate-600">
          빠른 진단으로 현재 수준을 확인하고 시작 급수를 추천받으세요.
        </p>
      </header>

      <article className="surface-card space-y-4 p-6 sm:p-7">
        {errorMessage && <p className="rounded-[16px] bg-coral-100 px-4 py-3 text-sm text-coral-500">{errorMessage}</p>}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">문항 수</p>
          <div className="segment-control">
            {QUESTION_OPTIONS.map((option) => {
              const className = questionCount === option ? 'segment-btn segment-btn-active' : 'segment-btn';
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setQuestionCount(option);
                  }}
                  className={className}
                >
                  {option}문항
                </button>
              );
            })}
          </div>
        </div>

        <ul className="space-y-1 text-sm text-slate-600">
          <li>뜻/음/한자 선택 문제가 혼합 출제됩니다.</li>
          <li>테스트 결과로 추천 급수를 제시하고 바로 적용할 수 있습니다.</li>
        </ul>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              void startPlacementTest();
            }}
            className="btn-primary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? '문항 준비 중...' : '레벨 테스트 시작'}
          </button>
          <Link to="/" className="btn-muted px-4 py-2">
            홈
          </Link>
        </div>
      </article>
    </section>
  );
}
