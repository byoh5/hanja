import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { applyStudyAction, getStudyQueue } from '../services/progress';
import { seedBaseData, ensureGradeProgress } from '../services/seed';
import { trackEvent } from '../services/analytics';
import { speak } from '../services/tts';
import { useAppStore } from '../store/useAppStore';
import type { StudyCardItem } from '../types';

export function StudyPage() {
  const grade = useAppStore((state) => state.selectedGrade);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<StudyCardItem[]>([]);
  const [ttsFailed, setTtsFailed] = useState(false);

  useEffect(() => {
    if (!grade) {
      setLoading(false);
      return;
    }

    void loadQueue(grade);
  }, [grade]);

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
  }, [items]);

  async function handleAction(action: 'known' | 'retry'): Promise<void> {
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

  function playTts(): void {
    if (!current) {
      return;
    }

    const ok = speak(`${current.charInfo.char}, ${current.charInfo.reading}, ${current.charInfo.meaning}`);
    setTtsFailed(!ok);
  }

  if (!grade) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-700">먼저 급수를 선택해야 학습을 시작할 수 있습니다.</p>
        <Link to="/" className="mt-3 inline-block rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white">
          대시보드로 이동
        </Link>
      </section>
    );
  }

  if (loading) {
    return <p className="text-sm text-slate-600">학습 큐를 준비하는 중...</p>;
  }

  if (!current) {
    return (
      <section className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <h1 className="text-xl font-bold text-emerald-900">오늘 학습이 완료되었습니다.</h1>
        <p className="text-emerald-800">복습 큐가 비었습니다. 내일 다시 학습하거나 시험 모드를 진행해보세요.</p>
        <div className="flex gap-2">
          <Link to="/" className="rounded-lg bg-white px-4 py-2 font-semibold text-emerald-900">
            대시보드
          </Link>
          <Link to="/quiz" className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white">
            시험 모드
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">학습 카드</h1>
        <p className="text-sm text-slate-600">남은 카드 {remainCount}개</p>
      </header>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4 text-center">
          <p className="text-sm font-medium text-brand-700">{current.progress.state}</p>
          <p className="text-7xl font-bold leading-none text-slate-900">{current.charInfo.char}</p>
          <p className="text-lg text-slate-700">
            음: <strong>{current.charInfo.reading}</strong> / 훈: <strong>{current.charInfo.meaning}</strong>
          </p>
          <p className="text-sm text-slate-600">예시: {current.charInfo.examples.join(', ')}</p>

          <button
            type="button"
            onClick={playTts}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            발음 듣기
          </button>

          {ttsFailed && <p className="text-xs text-amber-700">브라우저 TTS를 사용할 수 없습니다.</p>}
        </div>
      </article>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            void handleAction('known');
          }}
          className="rounded-lg bg-brand-600 px-4 py-3 font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          알겠어요
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            void handleAction('retry');
          }}
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          다시보기
        </button>
      </div>
    </section>
  );
}
