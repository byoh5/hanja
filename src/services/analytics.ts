export function trackEvent(eventName: string, payload?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('[analytics]', eventName, payload ?? {});
  }
}
