import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getUpcomingReviews } from '../services/progress';
import { ensureGradeProgress, seedBaseData } from '../services/seed';
import { useAppStore } from '../store/useAppStore';
import type { DashboardStats, ReviewListItem } from '../types';

function dueLabel(daysUntil: number): string {
  if (daysUntil <= 0) {
    return '오늘';
  }
  if (daysUntil === 1) {
    return '내일';
  }
  return `${daysUntil}일 후`;
}

export function ReviewPage() {
  const selectedGrade = useAppStore((state) => state.selectedGrade);
  const grade = selectedGrade ?? 8;

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [items, setItems] = useState<ReviewListItem[]>([]);

  useEffect(() => {
    void load(grade);
  }, [grade]);

  async function load(targetGrade: number): Promise<void> {
    setLoading(true);
    await seedBaseData();
    await ensureGradeProgress(targetGrade);

    const [nextStats, nextItems] = await Promise.all([
      getDashboardStats(targetGrade),
      getUpcomingReviews(targetGrade, 3)
    ]);

    setStats(nextStats);
    setItems(nextItems);
    setLoading(false);
  }

  const completionRatio = (stats?.mastered ?? 0) / Math.max(stats?.total ?? 1, 1);
  const angle = Math.round(completionRatio * 360);

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">오늘 복습 3개</h1>
        <p className="text-sm text-slate-600">필요한 항목만 조용하게 확인해요.</p>
      </header>

      <article className="surface-card p-6 sm:p-7">
        {loading && <p className="text-sm text-slate-500">복습 항목을 불러오는 중...</p>}

        {!loading && (
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex flex-col items-center">
              <div
                role="img"
                aria-label="전체 진행률"
                className="relative h-24 w-24 rounded-full"
                style={{
                  background: `conic-gradient(var(--color-primary) ${angle}deg, #e5eaf1 ${angle}deg 360deg)`
                }}
              >
                <div className="absolute inset-[10px] rounded-full bg-white" />
              </div>
              <p className="mt-3 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">진행률</p>
            </div>

            <div className="flex-1 space-y-2">
              {items.length === 0 && <p className="text-sm text-slate-600">복습할 한자가 없습니다.</p>}

              {items.map((item) => (
                <div
                  key={item.char}
                  className="flex items-center justify-between rounded-[18px] border border-slate-200 bg-white px-4 py-3"
                >
                  <p className="text-3xl font-semibold tracking-[0.08em] text-ink">{item.char}</p>
                  <p className="text-sm font-medium text-slate-600">{dueLabel(item.daysUntil)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>

      <div className="flex flex-wrap gap-2">
        <Link to="/study" className="btn-primary px-4 py-2">
          복습 시작
        </Link>
        <Link to="/" className="btn-muted px-4 py-2">
          홈
        </Link>
      </div>
    </section>
  );
}
