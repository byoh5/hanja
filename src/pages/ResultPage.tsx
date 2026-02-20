import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ProgressBar } from '../components/ProgressBar';
import { StatCard } from '../components/StatCard';
import type { QuizResult } from '../types';

interface ResultLocationState {
  result?: QuizResult;
}

export function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultLocationState | null;

  const result = state?.result;

  if (!result) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-700">표시할 시험 결과가 없습니다.</p>
        <Link to="/quiz" className="mt-3 inline-block rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white">
          시험 모드로 이동
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">시험 결과</h1>
        <p className="text-sm text-slate-600">소요 시간: {result.durationSec}초</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="점수" value={`${result.score}점`} />
        <StatCard label="총 문제" value={result.total} />
        <StatCard label="정답" value={result.correctCount} />
        <StatCard label="오답" value={result.wrongCount} />
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <ProgressBar value={result.correctCount} max={result.total} />
      </article>

      {result.wrongQuestions.length > 0 && (
        <article className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <h2 className="font-semibold text-rose-900">오답 목록</h2>
          <ul className="mt-2 grid gap-1 text-sm text-rose-800 sm:grid-cols-2">
            {result.wrongQuestions.map((question) => (
              <li key={question.id} className="rounded bg-white/70 px-2 py-1">
                {question.char} - {question.prompt}
              </li>
            ))}
          </ul>
        </article>
      )}

      <div className="flex flex-wrap gap-2">
        <Link to="/" className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">
          대시보드
        </Link>
        <Link to="/quiz" className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">
          새 시험 시작
        </Link>
        {result.wrongQuestions.length > 0 && (
          <button
            type="button"
            onClick={() => {
              navigate('/quiz', {
                state: {
                  retryQuestions: result.wrongQuestions
                }
              });
            }}
            className="rounded-lg bg-rose-700 px-4 py-2 font-semibold text-white hover:bg-rose-800"
          >
            오답만 다시 풀기
          </button>
        )}
      </div>
    </section>
  );
}
