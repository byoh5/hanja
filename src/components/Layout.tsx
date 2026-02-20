import { Link, NavLink, Outlet } from 'react-router-dom';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

function navClass(isActive: boolean): string {
  return isActive ? 'segment-btn segment-btn-active' : 'segment-btn';
}

export function Layout() {
  const isOnline = useOnlineStatus();

  return (
    <div className="min-h-screen text-ink">
      {!isOnline && (
        <div className="bg-amber-100/90 px-4 py-2 text-center text-sm font-medium text-amber-900">
          오프라인 모드입니다. 저장된 학습 데이터로 계속할 수 있습니다.
        </div>
      )}

      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 pb-10 pt-6 sm:px-6">
        <header className="mb-6 flex items-end justify-between">
          <Link to="/" className="text-2xl font-semibold tracking-tight text-ink">
            HanjaStep
          </Link>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">Focus</p>
        </header>

        <nav className="mb-6 overflow-x-auto pb-1">
          <div className="segment-control min-w-max">
            <NavLink to="/" className={({ isActive }) => navClass(isActive)} end>
              홈
            </NavLink>
            <NavLink to="/study" className={({ isActive }) => navClass(isActive)}>
              학습
            </NavLink>
            <NavLink to="/quiz" className={({ isActive }) => navClass(isActive)}>
              퀴즈
            </NavLink>
            <NavLink to="/review" className={({ isActive }) => navClass(isActive)}>
              복습
            </NavLink>
            <NavLink to="/lookup" className={({ isActive }) => navClass(isActive)}>
              조회
            </NavLink>
          </div>
        </nav>

        <main className="flex-1 animate-gentle-fade">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
