function canUseSpeechSynthesis(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }
  return true;
}

export function isSpeechSynthesisSupported(): boolean {
  return canUseSpeechSynthesis();
}

let activeSpeechTaskId = 0;

function startSpeechTask(): number {
  activeSpeechTaskId += 1;
  return activeSpeechTaskId;
}

function createUtterance(text: string): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  return utterance;
}

export function stopSpeaking(): void {
  if (!canUseSpeechSynthesis()) {
    return;
  }

  startSpeechTask();
  window.speechSynthesis.cancel();
}

export function speak(text: string): boolean {
  if (!canUseSpeechSynthesis()) {
    return false;
  }

  const taskId = startSpeechTask();
  const utterance = createUtterance(text);
  window.speechSynthesis.cancel();

  if (taskId === activeSpeechTaskId) {
    window.speechSynthesis.speak(utterance);
  }

  return true;
}

export function speakRepeated(text: string, repeatCount = 2, gapMs = 280): boolean {
  if (!canUseSpeechSynthesis()) {
    return false;
  }

  const safeRepeatCount = Math.max(1, Math.floor(repeatCount));
  const safeGapMs = Math.max(0, Math.floor(gapMs));
  const taskId = startSpeechTask();
  const synth = window.speechSynthesis;
  synth.cancel();

  const speakNext = (remaining: number): void => {
    if (taskId !== activeSpeechTaskId || remaining <= 0) {
      return;
    }

    const utterance = createUtterance(text);
    utterance.onend = () => {
      if (taskId !== activeSpeechTaskId || remaining <= 1) {
        return;
      }

      window.setTimeout(() => {
        speakNext(remaining - 1);
      }, safeGapMs);
    };

    synth.speak(utterance);
  };

  speakNext(safeRepeatCount);
  return true;
}

function buildMeaningReadingText(meaning: string, reading: string, char?: string): string {
  const prefix = char ? `${char}. ` : '';
  return `${prefix}${meaning} ${reading}`.trim();
}

export function speakMeaningReading(meaning: string, reading: string, char?: string): boolean {
  return speak(buildMeaningReadingText(meaning, reading, char));
}

export function speakMeaningReadingRepeated(
  meaning: string,
  reading: string,
  char?: string,
  repeatCount = 2,
  gapMs = 280
): boolean {
  return speakRepeated(buildMeaningReadingText(meaning, reading, char), repeatCount, gapMs);
}

export function speakMeaning(meaning: string, reading?: string, char?: string): boolean {
  if (reading) {
    return speakMeaningReading(meaning, reading, char);
  }

  const prefix = char ? `${char}. ` : '';
  return speak(`${prefix}${meaning}`);
}

export function speakReading(reading: string, meaning?: string, char?: string): boolean {
  if (meaning) {
    return speak(buildMeaningReadingText(meaning, reading, char));
  }

  const prefix = char ? `${char}. ` : '';
  return speak(`${prefix}${reading}`);
}
