import { COOKIE_CONSENT_EVENT, COOKIE_CONSENT_KEY, readCookieConsent } from "../cookieConsent";

export const HANDOFF_KEY = "bbf.handoff";
export const HANDOFF_MAX_BYTES = 16_384;
export const HANDOFF_MAX_ENTRIES = 32;
export const HANDOFF_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export const HANDOFF_FIELD_UNITS = {
  heightCm: "cm",
  inseamCm: "cm",
  flexibilityScore: "score",
  coreStabilityScore: "score",
  ridingGoal: "none",
  weightKg: "kg",
  ftpWatts: "W",
  ftpMethod: "none",
  sitBoneWidthMm: "mm",
  sweatProfile: "none",
  bikeCategory: "none",
  currentSaddleHeightMm: "mm",
  currentCrankLengthMm: "mm",
  currentSaddleWidthMm: "mm",
  currentSaddleModel: "none",
  tireWidthFrontMm: "mm",
  tireWidthRearMm: "mm",
  rimType: "none",
  surface: "none",
  outerChainringTeeth: "teeth",
  innerChainringTeeth: "teeth",
  cassetteSmallestCogTeeth: "teeth",
  cassetteLargestCogTeeth: "teeth",
} as const;

export type HandoffField = keyof typeof HANDOFF_FIELD_UNITS;
export type HandoffUnit = (typeof HANDOFF_FIELD_UNITS)[HandoffField];
export type HandoffMethod = "measured" | "estimated" | "declared" | "bike";
export type HandoffCalculator =
  | "bike-fit" | "saddle-height" | "frame-size" | "crank-length" | "saddle-width"
  | "tire-pressure" | "gearing" | "power-speed" | "climb-planner" | "ftp-wkg" | "fuel-hydration";

export interface HandoffEntry {
  field: HandoffField;
  value: number | string;
  unit: HandoffUnit;
  calculator: HandoffCalculator;
  method: HandoffMethod;
  touchedAt: number;
}
export interface HandoffRecord {
  version: 1;
  entries: HandoffEntry[];
}

const calculators = new Set<HandoffCalculator>([
  "bike-fit", "saddle-height", "frame-size", "crank-length", "saddle-width", "tire-pressure",
  "gearing", "power-speed", "climb-planner", "ftp-wkg", "fuel-hydration",
]);
const methods = new Set<HandoffMethod>(["measured", "estimated", "declared", "bike"]);
const listeners = new Set<() => void>();
const emptyRecord = (): HandoffRecord => ({ version: 1, entries: [] });

function validEntry(value: unknown): value is HandoffEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as HandoffEntry;
  if (!Object.hasOwn(HANDOFF_FIELD_UNITS, entry.field)) return false;
  return entry.unit === HANDOFF_FIELD_UNITS[entry.field]
    && calculators.has(entry.calculator)
    && methods.has(entry.method)
    && Number.isSafeInteger(entry.touchedAt) && entry.touchedAt > 0
    && (entry.unit === "none"
      ? typeof entry.value === "string" && entry.value.trim().length > 0 && entry.value.length <= 120
      : typeof entry.value === "number" && Number.isFinite(entry.value));
}

function storage(mode: "session" | "persistent"): Storage | undefined {
  try {
    return typeof window === "undefined" ? undefined
      : mode === "persistent" ? window.localStorage : window.sessionStorage;
  } catch {
    return undefined;
  }
}

export function getHandoffRetention(): "session" | "persistent" {
  try {
    if (readCookieConsent() === "accepted" && storage("persistent")) return "persistent";
  } catch { /* Storage and consent are optional. */ }
  return "session";
}

function remove(target: Storage | undefined): void {
  try { target?.removeItem(HANDOFF_KEY); } catch { /* Storage can be disabled. */ }
}

function persist(target: Storage | undefined, record: HandoffRecord): boolean {
  if (!target) return false;
  try {
    if (!record.entries.length) target.removeItem(HANDOFF_KEY);
    else target.setItem(HANDOFF_KEY, JSON.stringify(record));
    return true;
  } catch { return false; }
}

function readStorage(target: Storage | undefined, expires: boolean): HandoffRecord {
  try {
    const raw = target?.getItem(HANDOFF_KEY);
    if (!raw) return emptyRecord();
    if (new TextEncoder().encode(raw).byteLength > HANDOFF_MAX_BYTES) {
      remove(target);
      return emptyRecord();
    }
    const record = JSON.parse(raw) as HandoffRecord;
    if (record?.version !== 1 || !Array.isArray(record.entries)
      || record.entries.length > HANDOFF_MAX_ENTRIES || !record.entries.every(validEntry)
      || new Set(record.entries.map(entry => entry.field)).size !== record.entries.length) {
      remove(target);
      return emptyRecord();
    }
    const now = Date.now();
    const entries = record.entries.filter(entry => !expires
      || (entry.touchedAt <= now && now - entry.touchedAt < HANDOFF_MAX_AGE_MS))
      .map(({ field, value, unit, calculator, method, touchedAt }) => ({
        field, value, unit, calculator, method, touchedAt,
      }));
    const clean: HandoffRecord = { version: 1, entries };
    if (entries.length !== record.entries.length) persist(target, clean);
    return clean;
  } catch {
    remove(target);
    return emptyRecord();
  }
}

/** All browser data is untrusted; account import still requires server validation. */
export function readHandoff(): HandoffRecord {
  const session = storage("session");
  const local = storage("persistent");
  if (getHandoffRetention() === "session") {
    remove(local);
    return readStorage(session, true);
  }
  const remembered = readStorage(local, true);
  const current = readStorage(session, true);
  if (!current.entries.length) return remembered;
  const merged = new Map(remembered.entries.map(entry => [entry.field, entry]));
  for (const entry of current.entries) {
    if ((merged.get(entry.field)?.touchedAt ?? 0) <= entry.touchedAt) merged.set(entry.field, entry);
  }
  const record: HandoffRecord = { version: 1,
    entries: [...merged.values()].sort((a, b) => a.touchedAt - b.touchedAt).slice(-HANDOFF_MAX_ENTRIES) };
  // Only remove the session copy after promotion succeeds; never refresh touchedAt.
  if (persist(local, record)) remove(session);
  return record;
}

const notify = () => listeners.forEach(listener => listener());

export function syncHandoffConsent(choice: "accepted" | "essential" | null): void {
  if (choice !== "accepted") clearHandoff();
  else {
    readHandoff();
    notify();
  }
}

function writeRecord(record: HandoffRecord): void {
  if (new TextEncoder().encode(JSON.stringify(record)).byteLength > HANDOFF_MAX_BYTES) return;
  const mode = getHandoffRetention();
  if (!persist(storage(mode), record) && mode === "persistent") {
    // A stale persistent record must not resurrect a field removed from the fallback session copy.
    remove(storage("persistent"));
    persist(storage("session"), record);
  }
  notify();
}

export function writeHandoffEntry(entry: HandoffEntry): void {
  if (!validEntry(entry)) return;
  if (entry.touchedAt > Date.now() || Date.now() - entry.touchedAt >= HANDOFF_MAX_AGE_MS) return;
  const record = readHandoff();
  const previous = record.entries.find(item => item.field === entry.field);
  if (previous && previous.touchedAt > entry.touchedAt) return;
  const { field, value, unit, calculator, method, touchedAt } = entry;
  const entries = record.entries.filter(item => item.field !== field);
  entries.push({ field, value, unit, calculator, method, touchedAt });
  entries.sort((a, b) => a.touchedAt - b.touchedAt);
  writeRecord({ version: 1, entries: entries.slice(-HANDOFF_MAX_ENTRIES) });
}

export function removeHandoffEntry(field: HandoffField): void {
  const record = readHandoff();
  const entries = record.entries.filter(entry => entry.field !== field);
  if (entries.length === record.entries.length) return;
  // Remove stale fallback copies too, otherwise a cleared optional field could reappear.
  remove(storage("session"));
  writeRecord({ version: 1, entries });
}

export function clearHandoff(): void {
  remove(storage("session"));
  remove(storage("persistent"));
  notify();
}

export function subscribeHandoff(listener: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const schedule = () => {
    if (timer !== undefined) clearTimeout(timer);
    const entries = readHandoff().entries;
    if (!entries.length) return;
    const nextExpiry = Math.min(...entries.map(entry => entry.touchedAt + HANDOFF_MAX_AGE_MS));
    timer = setTimeout(onChange, Math.max(1, Math.min(nextExpiry - Date.now(), 2_147_483_647)));
  };
  const onChange = () => { schedule(); listener(); };
  listeners.add(onChange);
  const onConsent = () => {
    if (getHandoffRetention() === "session") clearHandoff();
    else onChange();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === COOKIE_CONSENT_KEY) onConsent();
    else if (event.key === HANDOFF_KEY || event.key === null) {
      if (event.newValue === null && event.storageArea === storage("persistent")) remove(storage("session"));
      onChange();
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
    window.addEventListener(COOKIE_CONSENT_EVENT, onConsent);
    window.addEventListener("focus", onChange);
    document.addEventListener("visibilitychange", onChange);
    schedule();
  }
  return () => {
    if (timer !== undefined) clearTimeout(timer);
    listeners.delete(onChange);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(COOKIE_CONSENT_EVENT, onConsent);
      window.removeEventListener("focus", onChange);
      document.removeEventListener("visibilitychange", onChange);
    }
  };
}
