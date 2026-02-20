import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/progress';
import { trackEvent } from '../services/analytics';
import { ensureGradeProgress, seedBaseData } from '../services/seed';
import { useAppStore } from '../store/useAppStore';
import type { DashboardStats } from '../types';

const GRADE_OPTIONS = [8, 7, 6] as const;

function formatToday(now: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(now);
}

function buildGreeting(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) {
    return '좋은 아침이에요';
  }
  if (hour < 18) {
    return '집중하기 좋은 시간이에요';
  }
  return '오늘 마무리도 가볍게 해봐요';
}

export function HomePage() {
  const selectedGrade = useAppStore((state) => state.selectedGrade);
  const setSelectedGrade = useAppStore((state) => state.setSelectedGrade);
  const resetGrade = useAppStore((state) => state.resetGrade);
  const navigate = useNavigate();

  const effectiveGrade = selectedGrade ?? 8;

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    void initialize(effectiveGrade);
  }, [effectiveGrade]);

  async function initialize(grade: number): Promise<void> {
    setLoading(true);
    await seedBaseData();
    await ensureGradeProgress(grade);
    const nextStats = await getDashboardStats(grade);
    setStats(nextStats);
    setLoading(false);
  }

  async function pickGrade(grade: number): Promise<void> {
    if (grade !== 8) {
      return;
    }
    setSelectedGrade(grade);
    trackEvent('grade_selected', { grade });
    await initialize(grade);
  }

  function startStudy(): void {
    setSelectedGrade(effectiveGrade);
    void navigate('/study');
  }

  const dateLabel = useMemo(() => formatToday(new Date()), []);
  const greeting = useMemo(() => buildGreeting(new Date()), []);

  const todayNewCount = Math.min(stats?.newCount ?? 0, 10);
  const reviewCount = Math.min(stats?.reviewDue ?? 0, 3);
  const masteredRatio = (stats?.mastered ?? 0) / Math.max(stats?.total ?? 1, 1);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-slate-500">{dateLabel}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">{greeting}</h1>
        <p className="text-sm text-slate-600">오늘도 10분이면 충분해요.</p>
        <div className="h-1.5 rounded-full bg-slate-200/80">
          <div
            className="h-full rounded-full bg-calm-500 transition-all duration-500"
            style={{ width: `${Math.round(masteredRatio * 100)}%` }}
          />
        </div>
      </header>

      <article className="surface-card p-6 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Today Learning</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{effectiveGrade}급 학습하기</h2>

        {loading && <p className="mt-4 text-sm text-slate-500">학습 카드를 준비하는 중...</p>}

        {!loading && (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[20px] bg-calm-50 p-4">
                <p className="text-sm text-slate-500">오늘 10자</p>
                <p className="mt-1 text-2xl font-semibold text-ink">{todayNewCount}자</p>
              </div>
              <div className="rounded-[20px] bg-slate-100 p-4">
                <p className="text-sm text-slate-500">복습 3자</p>
                <p className="mt-1 text-2xl font-semibold text-ink">{reviewCount}자</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={startStudy} className="btn-primary px-5 py-3">
                오늘 학습 시작
              </button>
              <Link to="/quiz" className="btn-muted px-5 py-3">
                짧은 퀴즈
              </Link>
            </div>
          </>
        )}
      </article>

      <footer className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">급수 선택</p>
        <div className="segment-control">
          {GRADE_OPTIONS.map((grade) => {
            const isActive = grade === effectiveGrade;
            const isAvailable = grade === 8;
            const className = [
              'segment-btn',
              isActive ? 'segment-btn-active' : '',
              !isAvailable ? 'segment-btn-disabled' : ''
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={grade}
                type="button"
                onClick={() => {
                  void pickGrade(grade);
                }}
                disabled={!isAvailable}
                className={className}
              >
                {grade}급
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to="/review" className="btn-muted px-4 py-2 text-sm">
            오늘 복습 보기
          </Link>
          <Link to="/lookup" className="btn-muted px-4 py-2 text-sm">
            급수 조회
          </Link>
          <button type="button" onClick={resetGrade} className="btn-muted px-4 py-2 text-sm">
            선택 초기화
          </button>
        </div>
      </footer>
    </section>
  );
}
