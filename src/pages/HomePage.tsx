import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SUPPORTED_GRADES } from '../data';
import { getDashboardStats } from '../services/progress';
import { trackEvent } from '../services/analytics';
import { ensureGradeProgress, seedBaseData } from '../services/seed';
import { useAppStore } from '../store/useAppStore';
import type { DashboardStats } from '../types';

const GRADE_OPTIONS = SUPPORTED_GRADES;

interface GradeOverview {
  grade: number;
  total: number;
  learned: number;
  mastered: number;
  newCount: number;
  reviewDue: number;
  percent: number;
}

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

  const effectiveGrade = selectedGrade ?? GRADE_OPTIONS[0];

  const [loading, setLoading] = useState(true);
  const [gradeOverviews, setGradeOverviews] = useState<GradeOverview[]>([]);

  useEffect(() => {
    void initialize();
  }, [effectiveGrade]);

  async function initialize(): Promise<void> {
    setLoading(true);
    await seedBaseData();

    await Promise.all(
      GRADE_OPTIONS.map(async (targetGrade) => {
        await ensureGradeProgress(targetGrade);
      })
    );

    const nextOverviews = await Promise.all(
      GRADE_OPTIONS.map(async (targetGrade) => {
        const nextStats: DashboardStats = await getDashboardStats(targetGrade);
        const learned = nextStats.total - nextStats.newCount;
        const percent = nextStats.total === 0 ? 0 : Math.round((learned / nextStats.total) * 100);

        return {
          grade: targetGrade,
          total: nextStats.total,
          learned,
          mastered: nextStats.mastered,
          newCount: nextStats.newCount,
          reviewDue: nextStats.reviewDue,
          percent
        };
      })
    );

    setGradeOverviews(nextOverviews);
    setLoading(false);
  }

  async function pickGrade(grade: number): Promise<void> {
    setSelectedGrade(grade);
    trackEvent('grade_selected', { grade });
    await initialize();
  }

  function startStudy(): void {
    setSelectedGrade(effectiveGrade);
    void navigate('/study');
  }

  const dateLabel = useMemo(() => formatToday(new Date()), []);
  const greeting = useMemo(() => buildGreeting(new Date()), []);
  const selectedOverview = gradeOverviews.find((item) => item.grade === effectiveGrade) ?? null;

  const todayNewCount = Math.min(selectedOverview?.newCount ?? 0, 10);
  const reviewCount = Math.min(selectedOverview?.reviewDue ?? 0, 3);
  const masteredRatio = (selectedOverview?.mastered ?? 0) / Math.max(selectedOverview?.total ?? 1, 1);

  const overallTotal = gradeOverviews.reduce((sum, item) => sum + item.total, 0);
  const overallLearned = gradeOverviews.reduce((sum, item) => sum + item.learned, 0);
  const overallMastered = gradeOverviews.reduce((sum, item) => sum + item.mastered, 0);
  const overallPercent = overallTotal === 0 ? 0 : Math.round((overallLearned / overallTotal) * 100);

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

      <article className="apple-overview p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Learning Overview</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">전체 학습 현황</h2>
          </div>
          <div className="apple-chip">
            {effectiveGrade}급 진행 {selectedOverview?.learned ?? 0}/{selectedOverview?.total ?? 0}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="apple-metric">
            <p className="text-xs text-slate-500">전체 학습률</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">{overallPercent}%</p>
            <p className="mt-1 text-xs text-slate-500">
              {overallLearned} / {overallTotal} 학습
            </p>
          </div>
          <div className="apple-metric">
            <p className="text-xs text-slate-500">기억한 한자</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">{overallMastered}</p>
            <p className="mt-1 text-xs text-slate-500">MASTERED 기준</p>
          </div>
          <div className="apple-metric">
            <p className="text-xs text-slate-500">현재 급수</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-ink">{effectiveGrade}급</p>
            <p className="mt-1 text-xs text-slate-500">{selectedOverview?.percent ?? 0}% 완료</p>
          </div>
        </div>

        {loading && <p className="mt-4 text-sm text-slate-500">급수별 진행 현황을 계산하는 중...</p>}

        {!loading && (
          <ul className="mt-4 space-y-2">
            {gradeOverviews.map((item) => {
              const rowClassName = ['apple-grade-row', item.grade === effectiveGrade ? 'apple-grade-row-active' : '']
                .filter(Boolean)
                .join(' ');

              return (
                <li key={item.grade} className={rowClassName}>
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium text-ink">{item.grade}급</p>
                    <p className="text-slate-600">
                      {item.learned}/{item.total} 학습 · {item.percent}%
                    </p>
                  </div>
                  <div className="apple-progress-track mt-2">
                    <div className="apple-progress-fill" style={{ width: `${item.percent}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </article>

      <footer className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">급수 선택</p>
        <div className="segment-control">
          {GRADE_OPTIONS.map((grade) => {
            const isActive = grade === effectiveGrade;
            const className = ['segment-btn', isActive ? 'segment-btn-active' : '']
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={grade}
                type="button"
                onClick={() => {
                  void pickGrade(grade);
                }}
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
          <Link to="/chars" className="btn-muted px-4 py-2 text-sm">
            전체 목록
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
