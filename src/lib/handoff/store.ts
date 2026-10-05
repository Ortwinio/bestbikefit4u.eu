import { COOKIE_CONSENT_EVENT, COOKIE_CONSENT_KEY } from "../cookieConsent";

export const HANDOFF_KEY = "bbf.handoff";
export const HANDOFF_MAX_BYTES = 16_384;
export const HANDOFF_MAX_ENTRIES = 64;
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
  powerWatts: "W",
  speedKph: "km/h",
  bikeWeightKg: "kg",
  gradientPercent: "%",
  distanceKm: "km",
  durationMinutes: "min",
  temperatureC: "°C",
  bottleSizeMl: "ml",
  twentyMinuteWatts: "W",
  rampWatts: "W",
  intensity: "none",
  hipCircumferenceCm: "cm",
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
  kind?: "measured" | "declared" | "derived" | "estimated";
  measurementMethod?: string;
  repeatCount?: number;
  withinTolerance?: boolean;
  unresolvedWarning?: boolean;
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
    && (entry.kind === undefined || ["measured", "declared", "derived", "estimated"].includes(entry.kind))
    && (entry.measurementMethod === undefined
      || (typeof entry.measurementMethod === "string" && entry.measurementMethod.trim().length > 0
        && entry.measurementMethod.length <= 100))
    && (entry.repeatCount === undefined
      || (Number.isSafeInteger(entry.repeatCount) && entry.repeatCount > 0 && entry.repeatCount <= 100))
    && (entry.withinTolerance === undefined || typeof entry.withinTolerance === "boolean")
    && (entry.unresolvedWarning === undefined || typeof entry.unresolvedWarning === "boolean")
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

export function getHandoffRetention(): "session" {
  return "session";
}

function cleanEntry(entry: HandoffEntry): HandoffEntry {
  const { field, value, unit, calculator, method, touchedAt, kind, measurementMethod,
    repeatCount, withinTolerance, unresolvedWarning } = entry;
  return { field, value, unit, calculator, method, touchedAt,
    ...(kind === undefined ? {} : { kind }),
    ...(measurementMethod === undefined ? {} : { measurementMethod }),
    ...(repeatCount === undefined ? {} : { repeatCount }),
    ...(withinTolerance === undefined ? {} : { withinTolerance }),
    ...(unresolvedWarning === undefined ? {} : { unresolvedWarning }) };
}

export function mergeHandoffEntries(existing: HandoffEntry[], incoming: HandoffEntry[]): HandoffEntry[] {
  const quality = (entry: HandoffEntry) => {
    const kind = entry.kind ?? entry.method;
    return kind === "measured" ? 4 : kind === "declared" || kind === "bike" ? 3 : kind === "estimated" ? 2 : 1;
  };
  const merged = new Map<HandoffField, HandoffEntry>();
  for (const entry of [...existing, ...incoming]) {
    if (!validEntry(entry)) continue;
    const previous = merged.get(entry.field);
    if (!previous || quality(entry) > quality(previous)
      || (quality(entry) === quality(previous) && entry.touchedAt > previous.touchedAt)) {
      merged.set(entry.field, cleanEntry(entry));
    }
  }
  return [...merged.values()].sort((first, second) => first.touchedAt - second.touchedAt)
    .slice(-HANDOFF_MAX_ENTRIES);
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
      .map(cleanEntry);
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
  remove(storage("persistent"));
  return readStorage(storage("session"), true);
}

const notify = () => listeners.forEach(listener => listener());

export function syncHandoffConsent(_choice: "accepted" | "essential" | null): void {
  readHandoff();
  notify();
}

function writeRecord(record: HandoffRecord): void {
  if (new TextEncoder().encode(JSON.stringify(record)).byteLength > HANDOFF_MAX_BYTES) return;
  remove(storage("persistent"));
  persist(storage("session"), record);
  notify();
}

export function writeHandoffEntry(entry: HandoffEntry): void {
  if (!validEntry(entry)) return;
  if (entry.touchedAt > Date.now() || Date.now() - entry.touchedAt >= HANDOFF_MAX_AGE_MS) return;
  const record = readHandoff();
  writeRecord({ version: 1, entries: mergeHandoffEntries(record.entries, [entry]) });
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
  const onConsent = onChange;
  const onStorage = (event: StorageEvent) => {
    if (event.key === COOKIE_CONSENT_KEY) onConsent();
    else if (event.key === HANDOFF_KEY || event.key === null) {
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
