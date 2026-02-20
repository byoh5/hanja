import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProgressBar } from '../components/ProgressBar';
import { StatCard } from '../components/StatCard';
import { getDashboardStats } from '../services/progress';
import { seedBaseData, ensureGradeProgress } from '../services/seed';
import { trackEvent } from '../services/analytics';
import { useAppStore } from '../store/useAppStore';
import type { DashboardStats } from '../types';

export function HomePage() {
  const selectedGrade = useAppStore((state) => state.selectedGrade);
  const setSelectedGrade = useAppStore((state) => state.setSelectedGrade);
  const resetGrade = useAppStore((state) => state.resetGrade);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    void initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGrade]);

  async function initialize(): Promise<void> {
    setLoading(true);
    await seedBaseData();

    if (selectedGrade) {
      await ensureGradeProgress(selectedGrade);
      const nextStats = await getDashboardStats(selectedGrade);
      setStats(nextStats);
    }

    setLoading(false);
  }

  async function startGrade(grade: number): Promise<void> {
    setSelectedGrade(grade);
    await ensureGradeProgress(grade);
    trackEvent('grade_selected', { grade });
    const nextStats = await getDashboardStats(grade);
    setStats(nextStats);
  }

  if (loading) {
    return <p className="text-sm text-slate-600">초기 데이터를 준비하는 중...</p>;
  }

  if (!selectedGrade) {
    return (
      <section className="space-y-5">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">급수를 선택해 학습을 시작하세요</h1>
          <p className="mt-2 text-slate-600">MVP에서는 한국어문회 8급 학습을 우선 제공합니다.</p>
        </header>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">8급</h2>
              <p className="text-sm text-slate-600">배정 한자 50자</p>
            </div>
            <button
              type="button"
              onClick={() => {
                void startGrade(8);
              }}
              className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
            >
              8급 시작
            </button>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium text-brand-700">목표 급수: {selectedGrade}급</p>
        <h1 className="text-2xl font-bold">오늘 학습 루프를 진행하세요</h1>
      </header>

      {stats && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="총 한자" value={stats.total} />
            <StatCard label="복습 필요" value={stats.reviewDue} />
            <StatCard label="신규 남음" value={stats.newCount} />
            <StatCard label="마스터" value={stats.mastered} />
          </div>

          <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <ProgressBar value={stats.mastered} max={stats.total} />
          </article>
        </>
      )}

      <div className="flex flex-wrap gap-2">
        <Link to="/study" className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700">
          오늘 학습 시작
        </Link>
        <Link to="/quiz" className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">
          시험 모드 이동
        </Link>
        <button
          type="button"
          onClick={resetGrade}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
        >
          급수 재선택
        </button>
      </div>
    </section>
  );
}
