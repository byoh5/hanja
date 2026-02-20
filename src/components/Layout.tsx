import { Link, NavLink, Outlet } from 'react-router-dom';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

function navClass(isActive: boolean): string {
  return isActive
    ? 'rounded-lg bg-brand-100 px-3 py-1.5 text-sm font-semibold text-brand-700'
    : 'rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100';
}

export function Layout() {
  const isOnline = useOnlineStatus();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {!isOnline && (
        <div className="bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-900">
          오프라인 모드입니다. 캐시된 데이터로 학습을 계속할 수 있습니다.
        </div>
      )}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-brand-900">
            HanjaStep
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/" className={({ isActive }) => navClass(isActive)}>
              대시보드
            </NavLink>
            <NavLink to="/study" className={({ isActive }) => navClass(isActive)}>
              학습
            </NavLink>
            <NavLink to="/quiz" className={({ isActive }) => navClass(isActive)}>
              시험
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
