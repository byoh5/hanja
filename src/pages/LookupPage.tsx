import { useEffect, useState } from 'react';
import { lookupChar } from '../services/progress';
import { seedBaseData } from '../services/seed';
import type { HanjaChar } from '../types';

export function LookupPage() {
  const [query, setQuery] = useState('');
  const [ready, setReady] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<HanjaChar | null>(null);

  useEffect(() => {
    void (async () => {
      await seedBaseData();
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const target = Array.from(query.trim())[0] ?? '';
    if (!target) {
      setSearching(false);
      setSearched(false);
      setResult(null);
      return;
    }

    let cancelled = false;

    void (async () => {
      setSearching(true);
      const found = await lookupChar(target);

      if (cancelled) {
        return;
      }

      setResult(found);
      setSearched(true);
      setSearching(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [query, ready]);

  return (
    <section className="space-y-5">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">급수 조회</h1>
        <p className="text-sm text-slate-600">한자를 입력하세요</p>
      </header>

      <article className="surface-card mx-auto w-full max-w-xl p-6 sm:p-8">
        <div className="mx-auto max-w-sm space-y-4 text-center">
          <input
            value={query}
            maxLength={1}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder="學"
            className="w-full rounded-[20px] border border-slate-200 bg-white px-4 py-4 text-center text-4xl font-semibold tracking-[0.08em] text-ink focus:border-calm-300 focus:outline-none"
          />

          {searching && <p className="text-sm text-slate-500">조회 중...</p>}

          {!searching && searched && result && (
            <div className="rounded-[20px] bg-calm-50 px-5 py-6">
              <p className="text-6xl font-semibold tracking-[0.1em] text-ink">{result.char}</p>
              <p className="mt-3 text-base text-slate-700">{result.grade}급 배정 한자입니다.</p>
              <p className="mt-2 text-sm text-slate-600">
                {result.reading} / {result.meaning}
              </p>
            </div>
          )}

          {!searching && searched && !result && (
            <p className="rounded-[16px] bg-coral-100 px-4 py-3 text-sm text-coral-500">
              등록된 배정 한자를 찾지 못했습니다.
            </p>
          )}
        </div>
      </article>
    </section>
  );
}
