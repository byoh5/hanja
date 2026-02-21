import { useState } from 'react';
import { isSpeechSynthesisSupported, speakMeaningReading } from '../services/tts';

interface MeaningReadingPanelProps {
  meaning: string;
  reading: string;
  char?: string;
  speechEnabled?: boolean;
  className?: string;
}

export function MeaningReadingPanel({
  meaning,
  reading,
  char,
  speechEnabled = true,
  className
}: MeaningReadingPanelProps) {
  const [ttsError, setTtsError] = useState<string | null>(null);
  const panelClass = ['hanja-meta-grid', className ?? ''].filter(Boolean).join(' ');

  function handleSpeak(): void {
    if (!speechEnabled) {
      setTtsError('음성 기능이 꺼져 있습니다.');
      return;
    }

    const ok = speakMeaningReading(meaning, reading, char);
    if (!ok) {
      setTtsError('이 브라우저에서는 음성 읽기를 지원하지 않습니다.');
      return;
    }
    setTtsError(null);
  }

  const ttsSupported = isSpeechSynthesisSupported();

  return (
    <>
      <div className="hanja-meta-toolbar">
        <button
          type="button"
          onClick={handleSpeak}
          className="hanja-tts-btn"
          disabled={!ttsSupported || !speechEnabled}
          aria-label="뜻과 음 음성 듣기"
        >
          뜻·음 듣기
        </button>
      </div>

      <div className={panelClass}>
        <div className="hanja-meta-card hanja-meta-meaning" aria-label="뜻(훈)">
          <p className="hanja-meta-kicker">뜻 (훈)</p>
          <p className="hanja-meta-text">{meaning}</p>
        </div>

        <div className="hanja-meta-card hanja-meta-reading" aria-label="음(독음)">
          <p className="hanja-meta-kicker">음 (독음)</p>
          <p className="hanja-meta-text">{reading}</p>
        </div>
      </div>

      {!ttsSupported && (
        <p className="mt-2 text-xs text-slate-500">음성 읽기는 브라우저의 음성 합성 기능이 필요한 기능입니다.</p>
      )}
      {!speechEnabled && <p className="mt-2 text-xs text-slate-500">음성 기능이 꺼져 있습니다.</p>}

      {ttsError && <p className="mt-2 text-xs text-coral-500">{ttsError}</p>}
    </>
  );
}
