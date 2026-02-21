import { useEffect, useMemo, useState } from 'react';
import { GRADE_CHARS_BY_GRADE, SUPPORTED_GRADES } from '../data';
import { getProgressByGrade } from '../services/progress';
import { ensureGradeProgress, seedBaseData } from '../services/seed';
import { useAppStore } from '../store/useAppStore';
import type { StudyState } from '../types';
import type { SupportedGrade } from '../data';

type CellStatus = 'NEW' | 'LEARNED' | 'MASTERED';

function getCellStatus(state?: StudyState): CellStatus {
  if (state === 'MASTERED') {
    return 'MASTERED';
  }
  if (state && state !== 'NEW') {
    return 'LEARNED';
  }
  return 'NEW';
}

function statusLabel(status: CellStatus): string {
  if (status === 'MASTERED') {
    return '기억함';
  }
  if (status === 'LEARNED') {
    return '학습함';
  }
  return '미학습';
}

function statusClass(status: CellStatus): string {
  if (status === 'MASTERED') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  }
  if (status === 'LEARNED') {
    return 'border-calm-200 bg-calm-50 text-calm-700';
  }
  return 'border-slate-200 bg-white text-slate-500';
}

function indicatorClass(status: CellStatus): string {
  if (status === 'MASTERED') {
    return 'bg-emerald-500';
  }
  if (status === 'LEARNED') {
    return 'bg-calm-500';
  }
  return 'bg-slate-300';
}

export function CharListPage() {
  const selectedGrade = useAppStore((state) => state.selectedGrade);
  const setSelectedGrade = useAppStore((state) => state.setSelectedGrade);

  const grade = (selectedGrade ?? SUPPORTED_GRADES[0]) as SupportedGrade;

  const [loading, setLoading] = useState(true);
  const [statesByChar, setStatesByChar] = useState<Record<string, StudyState>>({});

  const chars = GRADE_CHARS_BY_GRADE[grade];

  useEffect(() => {
    void load(grade);
  }, [grade]);

  async function load(targetGrade: number): Promise<void> {
    setLoading(true);
    await seedBaseData();
    await ensureGradeProgress(targetGrade);

    const progress = await getProgressByGrade(targetGrade);
    setStatesByChar(Object.fromEntries(progress.map((item) => [item.char, item.state])));

    setLoading(false);
  }

  const stats = useMemo(() => {
    let learned = 0;
    let mastered = 0;

    for (const item of chars) {
      const status = getCellStatus(statesByChar[item.char]);
      if (status !== 'NEW') {
        learned += 1;
      }
      if (status === 'MASTERED') {
        mastered += 1;
      }
    }

    return {
      total: chars.length,
      learned,
      mastered
    };
  }, [chars, statesByChar]);

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">급수별 전체 목록</h1>
        <p className="text-sm text-slate-600">작은 칸으로 전체 한자를 보고 학습/기억 상태를 확인하세요.</p>
      </header>

      <article className="surface-card space-y-5 p-5 sm:p-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">급수</p>
          <div className="segment-control overflow-x-auto">
            {SUPPORTED_GRADES.map((option) => {
              const isActive = option === grade;
              const className = ['segment-btn', isActive ? 'segment-btn-active' : ''].filter(Boolean).join(' ');

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSelectedGrade(option);
                  }}
                  className={className}
                >
                  {option}급
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">전체</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{stats.total}</p>
          </div>
          <div className="rounded-[18px] border border-calm-100 bg-calm-50 px-4 py-3">
            <p className="text-xs text-calm-700">학습함</p>
            <p className="mt-1 text-2xl font-semibold text-calm-700">{stats.learned}</p>
          </div>
          <div className="rounded-[18px] border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-xs text-emerald-700">기억함</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-700">{stats.mastered}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <p className="font-medium">상태</p>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-300" /> 미학습
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-calm-500" /> 학습함
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> 기억함
          </div>
        </div>

        {loading && <p className="text-sm text-slate-500">한자 목록을 불러오는 중...</p>}

        {!loading && (
          <ul className="grid grid-cols-8 gap-1 sm:grid-cols-10 md:grid-cols-12">
            {chars.map((item) => {
              const status = getCellStatus(statesByChar[item.char]);
              return (
                <li key={item.char}>
                  <div
                    title={`${item.char} · ${item.reading}/${item.meaning} · ${statusLabel(status)}`}
                    className={`flex h-10 w-full flex-col items-center justify-center rounded-[10px] border text-[13px] font-semibold leading-none ${statusClass(status)}`}
                  >
                    <span>{item.char}</span>
                    <span className={`mt-1 h-1 w-4 rounded-full ${indicatorClass(status)}`} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </article>
    </section>
  );
}
