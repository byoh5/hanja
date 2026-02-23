import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ProgressBar } from '../components/ProgressBar';
import type { QuestionType, QuizMode, QuizResult } from '../types';

interface ResultLocationState {
  result?: QuizResult;
}

function modeLabel(mode: QuizMode): string {
  if (mode === 'meaning') {
    return '뜻 고르기';
  }
  if (mode === 'reading') {
    return '음 고르기';
  }
  if (mode === 'character') {
    return '한자 고르기';
  }
  if (mode === 'mixed') {
    return '혼합';
  }
  if (mode === 'inputCharacter') {
    return '입력(한자)';
  }
  if (mode === 'inputReading') {
    return '입력(음)';
  }
  return '오답 집중';
}

function typeLabel(type: QuestionType): string {
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

export function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultLocationState | null;

  const result = state?.result;

  if (!result) {
    return (
      <section className="surface-card p-6">
        <p className="text-slate-700">표시할 퀴즈 결과가 없습니다.</p>
        <Link to="/quiz" className="btn-primary mt-4 inline-flex px-4 py-2">
          퀴즈 화면으로 이동
        </Link>
      </section>
    );
  }

  const typeStats = result.typeStats ?? [];

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <p className="text-sm text-slate-500">
          {modeLabel(result.mode)} · 소요 시간 {result.durationSec}초
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">오늘 퀴즈를 마쳤어요</h1>
      </header>

      <article className="surface-card p-6 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Score</p>
        <p className="mt-1 text-5xl font-semibold tracking-tight text-ink">{result.score}</p>
        <p className="mt-2 text-sm text-slate-600">
          정답 {result.correctCount} / {result.total}
        </p>

        <div className="mt-4">
          <ProgressBar value={result.correctCount} max={result.total} label="정확도" />
        </div>
      </article>

      {typeStats.length > 0 && (
        <article className="surface-card p-5 sm:p-6">
          <h2 className="text-base font-semibold text-ink">유형별 정답률</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {typeStats.map((stat) => (
              <li key={stat.type} className="rounded-[16px] border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs text-slate-500">{typeLabel(stat.type)}</p>
                <p className="mt-1 text-xl font-semibold text-ink">{stat.accuracy}%</p>
                <p className="text-xs text-slate-500">
                  {stat.correct} / {stat.total}
                </p>
              </li>
            ))}
          </ul>
        </article>
      )}

      {result.wrongQuestions.length > 0 && (
        <article className="surface-card bg-coral-100/70 p-5">
          <h2 className="font-semibold text-coral-500">다시 보면 좋아요</h2>
          <ul className="mt-2 grid gap-2 text-sm text-coral-500 sm:grid-cols-2">
            {result.wrongQuestions.map((question) => (
              <li key={question.id} className="rounded-[16px] bg-white/80 px-3 py-2">
                {question.char} · {question.prompt}
              </li>
            ))}
          </ul>
        </article>
      )}

      <div className="flex flex-wrap gap-2">
        <Link to="/" className="btn-muted px-4 py-2">
          홈
        </Link>
        <Link to="/quiz" className="btn-muted px-4 py-2">
          새 퀴즈
        </Link>
        {result.wrongQuestions.length > 0 && (
          <button
            type="button"
            onClick={() => {
              void navigate('/quiz', {
                state: {
                  retryQuestions: result.wrongQuestions
                }
              });
            }}
            className="btn-primary px-4 py-2"
          >
            오답 다시 풀기
          </button>
        )}
      </div>
    </section>
  );
}
