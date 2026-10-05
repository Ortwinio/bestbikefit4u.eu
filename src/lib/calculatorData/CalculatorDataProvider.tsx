"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { usePathname } from "next/navigation";
import type { Id } from "../../../convex/_generated/dataModel";
import type { HandoffCalculator, HandoffEntry, HandoffField } from "@/lib/handoff/store";
import { calculatorDataKey, isProfileCalculatorField } from "../../../shared/calculatorDataScope";
import { mergeProfileCalculatorEntries } from "./scopedEntries";
import { usePublicHandoff } from "@/lib/handoff/usePublicHandoff";
import { CalculatorDataContext, type CalculatorDataContextValue } from "./context";
import { LeaveDataNotice } from "@/components/calculators/LeaveDataNotice";
import { AutosaveStatus } from "@/components/ui/AutosaveStatus";
import { useAutosave } from "@/components/ui/useAutosave";
import { autosaveMessages } from "@/i18n/account/autosave";
import { dataReuseMessages } from "@/i18n/calculators/dataReuse";
import { handoffMessages } from "@/i18n/calculators/handoff";
import { Button } from "@/components/ui/Button";
import { extractLocaleFromPathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";

type ProfileData = { userId: Id<"users">; entries: HandoffEntry[] };
type Confirmation = { field: string; expectedValue: number | string; expectedTouchedAt: number };
type Removal = { field: HandoffField; calculator: HandoffCalculator };
type SaveData = {
  expectedUserId: Id<"users">; entries: HandoffEntry[]; removedFields?: HandoffField[]; inseamConfirmed?: boolean;
  calculator?: string; confirmedProfileFields?: Confirmation[];
};
const getData = makeFunctionReference<"query", Record<string, never>, ProfileData>("calculatorData/queries:get");
const saveData = makeFunctionReference<"mutation", SaveData,
  { acceptedFields: string[]; retainedFields: string[] }>("calculatorData/mutations:save");
const noop = () => undefined;
const pending: CalculatorDataContextValue = {
  source: "session", ready: false, entries: [], identity: "pending", save: noop, remove: noop,
};

export function CalculatorDataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const data = useQuery(getData, isAuthenticated ? {} : "skip");
  const pathname = usePathname();
  const locale = extractLocaleFromPathname(pathname ?? "") ?? "nl";
  const activeUser = useRef<string | null>(null);
  useLayoutEffect(() => {
    activeUser.current = !isLoading && isAuthenticated && data ? data.userId : null;
    return () => { activeUser.current = null; };
  }, [isLoading, isAuthenticated, data]);
  const isCurrentUser = useCallback((userId: string) => activeUser.current === userId, []);
  if (isLoading || (isAuthenticated && !data)) {
    return <CalculatorDataContext.Provider value={pending}>{children}</CalculatorDataContext.Provider>;
  }
  if (isAuthenticated && data) {
    return <ProfileDataProvider key={data.userId} data={data} locale={locale}
      isCurrentUser={isCurrentUser}>{children}</ProfileDataProvider>;
  }
  return <SessionDataProvider locale={locale}>{children}</SessionDataProvider>;
}

function SessionDataProvider({ children, locale }: { children: ReactNode; locale: Locale }) {
  const session = usePublicHandoff("bike-fit");
  const value = useMemo<CalculatorDataContextValue>(() => ({
    source: "session", ready: session.ready, entries: session.entries, identity: "session", save: noop, remove: noop,
  }), [session.ready, session.entries]);
  return (
    <CalculatorDataContext.Provider value={value}>
      {children}
      <LeaveDataNotice locale={locale} hasEnteredData={session.entries.length > 0} isAuthenticated={false} />
    </CalculatorDataContext.Provider>
  );
}

function ProfileDataProvider({ children, data, locale, isCurrentUser }: {
  children: ReactNode; data: ProfileData; locale: Locale; isCurrentUser: (userId: string) => boolean;
}) {
  const mutate = useMutation(saveData);
  const consumedConfirmations = useRef(new WeakSet<Confirmation>());
  const [retained, setRetained] = useState<HandoffEntry[]>([]);
  const [changes, setChanges] = useState<{
    entries: HandoffEntry[]; removals: Removal[]; inseamConfirmed?: boolean; confirmedProfileFields: Confirmation[];
  }>({
    entries: [], removals: [], confirmedProfileFields: [],
  });
  const autosave = useAutosave({
    value: changes,
    debounceMs: 500,
    onSave: useCallback(async (value: typeof changes) => {
      if (!isCurrentUser(data.userId)) return;
      const calculators = new Set([...value.entries, ...value.removals].map(entry => entry.calculator));
      const protectedEntries: HandoffEntry[] = [];
      for (const calculator of calculators) {
        if (!isCurrentUser(data.userId)) return;
        const entries = value.entries.filter(entry => entry.calculator === calculator);
        const confirmations = value.confirmedProfileFields.filter(confirmation =>
          !consumedConfirmations.current.has(confirmation)
          && entries.some(entry => entry.field === confirmation.field));
        const result = await mutate({ entries, calculator, expectedUserId: data.userId,
          removedFields: value.removals.filter(entry => entry.calculator === calculator).map(entry => entry.field),
          ...(value.inseamConfirmed === undefined ? {} : { inseamConfirmed: value.inseamConfirmed }),
          ...(confirmations.length ? { confirmedProfileFields: confirmations } : {}),
        });
        for (const confirmation of confirmations) consumedConfirmations.current.add(confirmation);
        for (const incoming of entries) {
          const current = data.entries.find(entry => calculatorDataKey(entry) === calculatorDataKey(incoming));
          if (isProfileCalculatorField(incoming.field) && result.retainedFields.includes(incoming.field)
            && incoming.value !== current?.value) protectedEntries.push(incoming);
        }
      }
      if (isCurrentUser(data.userId)) setRetained(protectedEntries);
    }, [mutate, data.userId, data.entries, isCurrentUser]),
  });
  const save = useCallback((entry: HandoffEntry, options?: { inseamConfirmed?: boolean }) => {
    setChanges(previous => ({
      ...previous,
      entries: [...previous.entries.filter(item => calculatorDataKey(item) !== calculatorDataKey(entry)), entry],
      removals: previous.removals.filter(item => calculatorDataKey(item) !== calculatorDataKey(entry)),
      confirmedProfileFields: previous.confirmedProfileFields.filter(item => item.field !== entry.field),
      ...(entry.field === "inseamCm" ? { inseamConfirmed: options?.inseamConfirmed ?? false } : {}),
    }));
  }, []);
  const remove = useCallback((field: HandoffField, calculator?: HandoffCalculator) => {
    if (!calculator) return;
    const removal = { field, calculator };
    setChanges(previous => ({
      ...previous,
      entries: previous.entries.filter(item => calculatorDataKey(item) !== calculatorDataKey(removal)),
      removals: [...previous.removals.filter(item => calculatorDataKey(item) !== calculatorDataKey(removal)), removal],
      confirmedProfileFields: previous.confirmedProfileFields.filter(item => item.field !== field),
      ...(field === "inseamCm" ? { inseamConfirmed: false } : {}),
    }));
  }, []);
  const value = useMemo<CalculatorDataContextValue>(() => ({
    source: "profile", ready: true,
    entries: mergeProfileCalculatorEntries(data.entries, changes.entries).filter(entry =>
      isProfileCalculatorField(entry.field)
      || !changes.removals.some(removal => calculatorDataKey(removal) === calculatorDataKey(entry))),
    identity: data.userId, save, remove,
  }), [data, changes, save, remove]);
  return (
    <CalculatorDataContext.Provider value={value}>
      {children}
      {(autosave.state !== "idle" || retained.length > 0) && (
        <div className="fixed bottom-4 right-4 z-40 rounded-xl border border-border bg-background p-3 shadow-sm">
          <AutosaveStatus state={autosave.state} messages={autosaveMessages[locale]} onRetry={autosave.retry} />
          {retained.length > 0 && <div className="max-w-xs space-y-2">
            <p className="text-sm text-muted-foreground">{dataReuseMessages[locale].retained}</p>
            <ul className="text-sm">{retained.map(entry => <li key={entry.field}>
              {handoffMessages[locale].fields[entry.field]}: {typeof entry.value === "number"
                ? new Intl.NumberFormat(locale).format(entry.value) : entry.value} {entry.unit === "none" ? "" : entry.unit}
            </li>)}</ul>
            <Button onClick={() => setChanges(previous => ({ ...previous,
              confirmedProfileFields: retained.flatMap(entry => {
                const current = data.entries.find(item => item.field === entry.field);
                return current ? [{ field: entry.field, expectedValue: current.value, expectedTouchedAt: current.touchedAt }] : [];
              }),
            }))}>{dataReuseMessages[locale].useProfile}</Button>
          </div>}
        </div>
      )}
    </CalculatorDataContext.Provider>
  );
}
