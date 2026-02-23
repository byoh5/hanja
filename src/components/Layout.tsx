import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { trackEvent } from '../services/analytics';
import { useAppStore } from '../store/useAppStore';

type SocialChannel = 'x' | 'facebook' | 'line' | 'telegram' | 'whatsapp' | 'email';
type ShareIconChannel = SocialChannel | 'native' | 'copy';

interface SocialLink {
  key: SocialChannel;
  label: string;
  href: string;
}

const SHARE_TITLE = 'HanjaStep';
const SHARE_TEXT = '한자 학습 앱 HanjaStep 같이 해요!';

function navClass(isActive: boolean): string {
  return isActive ? 'segment-btn segment-btn-active' : 'segment-btn';
}

function iconBadgeClass(channel: ShareIconChannel): string {
  if (channel === 'x') {
    return 'bg-black text-white';
  }
  if (channel === 'facebook') {
    return 'bg-[#1877F2] text-white';
  }
  if (channel === 'line') {
    return 'bg-[#06C755] text-white';
  }
  if (channel === 'telegram') {
    return 'bg-[#229ED9] text-white';
  }
  if (channel === 'whatsapp') {
    return 'bg-[#25D366] text-white';
  }
  if (channel === 'email') {
    return 'bg-slate-500 text-white';
  }
  if (channel === 'native') {
    return 'bg-calm-500 text-white';
  }
  return 'bg-slate-700 text-white';
}

function buildShareUrl(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  return `${window.location.origin}${window.location.pathname}#/`;
}

function fallbackCopyText(text: string): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }

  document.body.removeChild(textarea);
  return copied;
}

async function copyText(text: string): Promise<boolean> {
  if (!text) {
    return false;
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    return fallbackCopyText(text);
  }

  return fallbackCopyText(text);
}

function buildSocialShareLinks(url: string): SocialLink[] {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(SHARE_TEXT);
  const encodedMailBody = encodeURIComponent(`${SHARE_TEXT}\n${url}`);

  return [
    {
      key: 'x',
      label: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
    },
    {
      key: 'facebook',
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    },
    {
      key: 'line',
      label: 'LINE',
      href: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`
    },
    {
      key: 'telegram',
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`
    },
    {
      key: 'email',
      label: 'Email',
      href: `mailto:?subject=${encodeURIComponent('HanjaStep 추천')}&body=${encodedMailBody}`
    }
  ];
}

function ShareBrandIcon({ channel }: { channel: ShareIconChannel }) {
  if (channel === 'copy') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <rect x="4" y="4" width="11" height="11" rx="2" />
      </svg>
    );
  }

  if (channel === 'native') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="18" cy="5" r="2" fill="currentColor" />
        <circle cx="6" cy="12" r="2" fill="currentColor" />
        <circle cx="18" cy="19" r="2" fill="currentColor" />
        <path d="M8 12l8-6M8 12l8 6" />
      </svg>
    );
  }

  if (channel === 'x') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
        <path d="M5 4l14 16" />
        <path d="M19 4L5 20" />
      </svg>
    );
  }

  if (channel === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v6h4v-6h3l1-4h-4V9c0-.6.4-1 1-1z" />
      </svg>
    );
  }

  if (channel === 'line') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 5.5h16a2 2 0 012 2v8a2 2 0 01-2 2h-6l-3.8 2.8.8-2.8H4a2 2 0 01-2-2v-8a2 2 0 012-2z" />
        <path d="M8 12h8" />
      </svg>
    );
  }

  if (channel === 'telegram') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M21.3 4.7L3.6 11.5a1 1 0 00.05 1.9l4.6 1.4 1.5 4.6a1 1 0 001.8.3l10.2-14a1 1 0 00-.4-1.4zM10 13.4l7.8-6.2-6.1 7.6-.4 2.5-1.3-4z" />
      </svg>
    );
  }

  if (channel === 'whatsapp') {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M12 3a9 9 0 00-7.7 13.7L3 21l4.5-1.2A9 9 0 1012 3z" />
        <path d="M9 8.8c0 2.8 2.3 5.2 5.2 5.2h.7l1.1 2-2 .8-.4-.1A9 9 0 018.3 11l-.1-.4.8-2 2 1.2z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

export function Layout() {
  const location = useLocation();
  const isOnline = useOnlineStatus();
  const speechEnabled = useAppStore((state) => state.speechEnabled);
  const toggleSpeechEnabled = useAppStore((state) => state.toggleSpeechEnabled);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const sharePanelRef = useRef<HTMLDivElement | null>(null);
  const shareUrl = useMemo(() => buildShareUrl(), [location.pathname]);
  const socialLinks = useMemo(() => buildSocialShareLinks(shareUrl), [shareUrl]);

  useEffect(() => {
    setShareMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!shareMenuOpen) {
      return;
    }

    function onOutsideClick(event: MouseEvent): void {
      const target = event.target;
      if (!sharePanelRef.current || !(target instanceof Node)) {
        return;
      }

      if (!sharePanelRef.current.contains(target)) {
        setShareMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', onOutsideClick);
    return () => {
      document.removeEventListener('mousedown', onOutsideClick);
    };
  }, [shareMenuOpen]);

  useEffect(() => {
    if (!shareNotice) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setShareNotice(null);
    }, 2400);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [shareNotice]);

  async function handleCopyRecommendationLink(): Promise<void> {
    const copied = await copyText(shareUrl);
    setShareNotice(copied ? '추천 링크를 복사했어요.' : '자동 복사에 실패했습니다. 아래 버튼을 사용해 주세요.');
    setShareMenuOpen(true);
    trackEvent('recommend_link_copied', { copied });
  }

  async function handleNativeShare(): Promise<void> {
    if (!navigator.share) {
      setShareNotice('이 브라우저는 공유 시트를 지원하지 않습니다.');
      return;
    }

    try {
      await navigator.share({
        title: SHARE_TITLE,
        text: SHARE_TEXT,
        url: shareUrl
      });
      setShareNotice('공유를 완료했어요.');
      trackEvent('recommend_native_shared');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      setShareNotice('공유에 실패했습니다. 링크 복사를 이용해 주세요.');
    }
  }

  return (
    <div className="min-h-screen text-ink">
      {!isOnline && (
        <div className="bg-amber-100/90 px-4 py-2 text-center text-sm font-medium text-amber-900">
          오프라인 모드입니다. 저장된 학습 데이터로 계속할 수 있습니다.
        </div>
      )}

      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 pb-10 pt-6 sm:px-6">
        <header className="mb-6 flex items-end justify-between">
          <Link to="/" className="inline-flex min-h-10 items-center py-1 text-2xl font-semibold tracking-tight text-ink">
            HanjaStep
          </Link>
          <div className="relative flex items-center gap-2" ref={sharePanelRef}>
            <button
              type="button"
              onClick={() => {
                void handleCopyRecommendationLink();
              }}
              className="btn-primary px-3 py-1.5 text-xs"
            >
              친구 추천
            </button>
            <button type="button" onClick={toggleSpeechEnabled} className="btn-muted px-3 py-1.5 text-xs">
              음성 {speechEnabled ? 'ON' : 'OFF'}
            </button>

            {shareNotice && (
              <p className="absolute right-0 top-[calc(100%+6px)] whitespace-nowrap text-xs font-medium text-calm-700">
                {shareNotice}
              </p>
            )}

            {shareMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+26px)] z-30 w-[min(92vw,340px)] rounded-[16px] border border-slate-200 bg-white p-3 shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">친구에게 공유하기</p>
                <p className="mt-1 break-all text-xs text-slate-500">{shareUrl}</p>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void handleCopyRecommendationLink();
                    }}
                    className="flex flex-col items-center rounded-[12px] border border-slate-200 bg-white px-2 py-2 text-[11px] font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${iconBadgeClass('copy')}`}
                      aria-hidden="true"
                    >
                      <ShareBrandIcon channel="copy" />
                    </span>
                    <span className="mt-1">링크 복사</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleNativeShare();
                    }}
                    className="flex flex-col items-center rounded-[12px] border border-slate-200 bg-white px-2 py-2 text-[11px] font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${iconBadgeClass('native')}`}
                      aria-hidden="true"
                    >
                      <ShareBrandIcon channel="native" />
                    </span>
                    <span className="mt-1">기기 공유</span>
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-4 gap-2">
                  {socialLinks.map((item) => (
                    <a
                      key={item.key}
                      href={item.href}
                      target={item.key === 'email' ? undefined : '_blank'}
                      rel={item.key === 'email' ? undefined : 'noopener noreferrer'}
                      onClick={() => {
                        trackEvent('recommend_social_share_clicked', { channel: item.key });
                      }}
                      className="flex flex-col items-center rounded-[12px] border border-slate-200 bg-white px-2 py-2 text-[11px] font-medium text-slate-700 transition hover:bg-slate-50"
                      aria-label={`${item.label} 공유`}
                    >
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${iconBadgeClass(item.key)}`}
                        aria-hidden="true"
                      >
                        <ShareBrandIcon channel={item.key} />
                      </span>
                      <span className="mt-1">{item.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
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
            <NavLink to="/placement" className={({ isActive }) => navClass(isActive)}>
              레벨
            </NavLink>
            <NavLink to="/chars" className={({ isActive }) => navClass(isActive)}>
              목록
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
