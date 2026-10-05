// Short-lived session marker the homepage saddle widget leaves for the saddle-height calculator. After a
// client-side navigation the calculator can render before "#inseam" is in the URL, so the hash alone misses it.
export const HOME_SADDLE_START_KEY = "bbf.homeSaddleStart";
const HOME_SADDLE_START_MAX_AGE_MS = 60_000;

export function markHomeSaddleStart(): void {
  try { window.sessionStorage.setItem(HOME_SADDLE_START_KEY, String(Date.now())); } catch { /* Storage is optional. */ }
}

export function hasFreshHomeSaddleStart(): boolean {
  try {
    const startedAt = Number(window.sessionStorage.getItem(HOME_SADDLE_START_KEY));
    return Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < HOME_SADDLE_START_MAX_AGE_MS;
  } catch {
    return false;
  }
}

export function clearHomeSaddleStart(): void {
  try { window.sessionStorage.removeItem(HOME_SADDLE_START_KEY); } catch { /* Storage is optional. */ }
}
