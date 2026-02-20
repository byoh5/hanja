import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '../services/analytics';
import { applyStudyAction, getStudyQueue } from '../services/progress';
import { ensureGradeProgress, seedBaseData } from '../services/seed';
import { useAppStore } from '../store/useAppStore';
import type { StudyCardItem } from '../types';

type CardMotion = 'idle' | 'good' | 'again';

export function StudyPage() {
  const grade = useAppStore((state) => state.selectedGrade);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [motion, setMotion] = useState<CardMotion>('idle');
  const [items, setItems] = useState<StudyCardItem[]>([]);

  const actionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!grade) {
      setLoading(false);
      return;
    }

    void loadQueue(grade);
  }, [grade]);

  useEffect(() => {
    return () => {
      if (actionTimerRef.current !== null) {
        window.clearTimeout(actionTimerRef.current);
      }
    };
  }, []);

  async function loadQueue(targetGrade: number): Promise<void> {
    setLoading(true);
    await seedBaseData();
    await ensureGradeProgress(targetGrade);

    const queue = await getStudyQueue(targetGrade, { newLimit: 20, maxItems: 50 });
    setItems(queue);
    setLoading(false);
  }

  const current = items[0] ?? null;

  const remainCount = useMemo(() => {
    if (items.length === 0) {
      return 0;
    }
    return items.length - 1;
  }, [items.length]);

  async function applyAction(action: 'known' | 'retry'): Promise<void> {
    if (!grade || !current || busy) {
      return;
    }

    setBusy(true);

    const updated = await applyStudyAction(current.charInfo.char, grade, action);

    if (updated) {
      trackEvent(action === 'known' ? 'card_known' : 'card_retry', {
        char: current.charInfo.char,
        grade
      });

      if (action === 'known') {
        setItems((prev) => prev.slice(1));
      } else {
        setItems((prev) => {
          if (prev.length <= 1) {
            return [{ ...prev[0], progress: updated }];
          }

          const [first, ...rest] = prev;
          return [...rest, { ...first, progress: updated }];
        });
      }
    }

    setBusy(false);
  }

  function queueAction(action: 'known' | 'retry'): void {
    if (!current || busy || animating) {
      return;
    }

    if (actionTimerRef.current !== null) {
      window.clearTimeout(actionTimerRef.current);
    }

    setAnimating(true);
    setMotion(action === 'known' ? 'good' : 'again');

    actionTimerRef.current = window.setTimeout(() => {
      void applyAction(action).finally(() => {
        setMotion('idle');
        setAnimating(false);
      });
    }, action === 'known' ? 260 : 320);
  }

  if (!grade) {
    return (
      <section className="surface-card p-6">
        <p className="text-slate-700">먼저 홈에서 급수를 선택해 주세요.</p>
        <Link to="/" className="btn-primary mt-4 inline-flex px-4 py-2">
          홈으로 이동
        </Link>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="surface-card p-6">
        <p className="text-sm text-slate-600">학습 큐를 준비하는 중...</p>
      </section>
    );
  }

  if (!current) {
    return (
      <section className="surface-card space-y-4 p-7 text-center">
        <p className="text-sm font-medium text-slate-500">오늘 학습 완료</p>
        <h1 className="text-2xl font-semibold tracking-tight">오늘 수고했어요.</h1>
        <p className="text-slate-600">복습 큐가 비었습니다. 내일 다시 이어가요.</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link to="/" className="btn-muted px-4 py-2">
            홈
          </Link>
          <Link to="/quiz" className="btn-primary px-4 py-2">
            퀴즈 풀기
          </Link>
        </div>
      </section>
    );
  }

  const cardMotionClass =
    motion === 'good' ? 'study-card--good' : motion === 'again' ? 'study-card--again' : '';

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight text-ink">한자 학습</h1>
        <p className="text-sm text-slate-500">남은 카드 {remainCount}개</p>
      </header>

      <article className={`surface-card p-6 sm:p-8 ${cardMotionClass}`}>
        <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center text-center">
          <p
            key={current.charInfo.char}
            className="animate-hanja-appear text-[clamp(6.5rem,34vw,13rem)] font-semibold leading-none tracking-[0.1em] text-ink"
          >
            {current.charInfo.char}
          </p>

          <p className="mt-6 text-base text-slate-500">
            {current.charInfo.reading} / {current.charInfo.meaning}
          </p>

          <div className="my-6 h-px w-full max-w-sm bg-slate-200" />

          <p className="text-sm text-slate-600">예시: {current.charInfo.examples[0]}</p>
        </div>
      </article>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={busy || animating}
          onClick={() => {
            queueAction('retry');
          }}
          className="btn-muted px-5 py-4 disabled:cursor-not-allowed disabled:opacity-60"
        >
          다시보기
        </button>
        <button
          type="button"
          disabled={busy || animating}
          onClick={() => {
            queueAction('known');
          }}
          className="btn-primary px-5 py-4 disabled:cursor-not-allowed disabled:opacity-60"
        >
          알겠어요
        </button>
      </div>
    </section>
  );
}
