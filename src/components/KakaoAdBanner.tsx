import { useEffect } from 'react';

const KAKAO_AD_SCRIPT_SRC = 'https://t1.daumcdn.net/kas/static/ba.min.js';

export function KakaoAdBanner() {
  useEffect(() => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-kakao-adfit-script="true"]');
    if (existingScript) {
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = KAKAO_AD_SCRIPT_SRC;
    script.async = true;
    script.dataset.kakaoAdfitScript = 'true';
    document.body.appendChild(script);
  }, []);

  return (
    <div className="mb-6 flex justify-center overflow-hidden" aria-label="카카오 광고">
      <ins
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit="DAN-Blil5UyPxKSACsgC"
        data-ad-width="320"
        data-ad-height="100"
      />
    </div>
  );
}
