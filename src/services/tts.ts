export function speak(text: string): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}
