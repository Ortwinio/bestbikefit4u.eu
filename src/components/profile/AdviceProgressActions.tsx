"use client";

import { useId, useRef, useState } from "react";
import type { AdviceItem } from "../../../shared/advice/types";
import type { Locale } from "@/i18n/config";
import { getAdviceProgressCopy } from "@/i18n/account/adviceProgress";
import { Button, Input, Select, Textarea } from "@/components/ui";

export type PerformedInput = { performedAt: number; note?: string };
export type FeedbackInput = { result: "better" | "same" | "worse"; note?: string; rideFeedbackId?: string };
export type AdviceProgressHandlers = {
  onMarkPerformed?: (item: AdviceItem, input: PerformedInput) => Promise<unknown>;
  onSubmitFeedback?: (item: AdviceItem, input: FeedbackInput) => Promise<unknown>;
};

export function AdviceProgressActions({ item, locale, onMarkPerformed, onSubmitFeedback }: {
  item: AdviceItem; locale: Locale;
} & AdviceProgressHandlers) {
  const copy = getAdviceProgressCopy(locale);
  const [form, setForm] = useState<"performed" | "feedback" | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [result, setResult] = useState<FeedbackInput["result"] | "">("");
  const [ride, setRide] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const id = useId();
  const progress = item.progress;
  const available = item.value !== null && item.status !== "needs_calculation" && item.source !== undefined
    && item.adviceRevision !== undefined && Number.isFinite(item.adviceRevision);
  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString(locale === "nl" ? "nl-NL" : "en-GB", { timeZone: "UTC" });
  const open = (kind: "performed" | "feedback") => { setForm(kind); setNote(""); setResult(""); setRide(""); setError(""); };
  async function save() {
    if (busy.current || !form || !available) return;
    setError("");
    const performedAt = Date.parse(`${date}T00:00:00.000Z`);
    const today = Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`);
    const earliest = Date.parse(`${new Date(item.date).toISOString().slice(0, 10)}T00:00:00.000Z`);
    if (note.trim().length > 500) { setError(copy.errors.INVALID_NOTE); return; }
    if (form === "performed" && (!Number.isFinite(performedAt) || performedAt < earliest || performedAt > today
      || new Date(performedAt).toISOString().slice(0, 10) !== date)) { setError(copy.errors.INVALID_DATE); return; }
    if (form === "feedback" && !result) { setError(copy.errors.INVALID_FEEDBACK); return; }
    busy.current = true; setPending(true);
    try {
      if (form === "performed") await onMarkPerformed?.(item, { performedAt, ...(note.trim() ? { note: note.trim() } : {}) });
      else if (result) await onSubmitFeedback?.(item, { result, ...(note.trim() ? { note: note.trim() } : {}), ...(ride ? { rideFeedbackId: ride } : {}) });
      setForm(null);
    } catch (failure) {
      const message = failure instanceof Error ? failure.message : "";
      const code = Object.keys(copy.errors).find(key => key !== "generic" && message.includes(key));
      setError(code ? copy.errors[code as keyof typeof copy.errors] : copy.errors.generic);
    } finally { busy.current = false; setPending(false); }
  }
  return <div className="col-span-full min-w-0 space-y-3">
    {progress && <div className="space-y-1 text-sm">
      <p><strong>{progress.feedback ? copy.performed : copy.waiting}</strong></p>
      <p>{copy.performedDate}: <time dateTime={new Date(progress.performedAt).toISOString()}>{formatDate(progress.performedAt)}</time></p>
      {progress.note && <p className="whitespace-pre-wrap break-words">{progress.note}</p>}
      {progress.feedback ? <><p>{copy.outcome}: {copy[progress.feedback.result]}</p>
        {progress.feedback.note && <p className="whitespace-pre-wrap break-words">{progress.feedback.note}</p>}</> : <p>{copy.awaiting}</p>}
    </div>}
    {!form && available && (!progress && onMarkPerformed
      ? <Button variant="outline" className="min-h-11 whitespace-normal" onClick={() => open("performed")}>{copy.mark}</Button>
      : progress && !progress.feedback && onSubmitFeedback
        ? <Button variant="outline" className="min-h-11 whitespace-normal" onClick={() => open("feedback")}>{copy.feedback}</Button> : null)}
    {form && <form aria-label={form === "performed" ? copy.markTitle : copy.feedbackTitle} className="space-y-4 rounded-2xl border border-border p-4"
      onSubmit={event => { event.preventDefault(); void save(); }}>
      <h4 className="font-semibold">{form === "performed" ? copy.markTitle : copy.feedbackTitle}</h4>
      {form === "performed" ? <Input id={`${id}-date`} type="date" label={copy.date} aria-label={copy.date} tooltip={copy.dateHelp} helperText={copy.dateHelp}
        value={date} max={new Date().toISOString().slice(0, 10)} min={new Date(item.date).toISOString().slice(0, 10)}
        disabled={pending} onChange={event => setDate(event.target.value)} />
        : <><fieldset disabled={pending}><legend className="mb-2 text-sm font-semibold">{copy.feedbackTitle}</legend>
          <div className="flex flex-wrap gap-2">{(["better", "same", "worse"] as const).map(value =>
            <label key={value} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border px-3">
              <input type="radio" name={`${id}-result`} value={value} checked={result === value} onChange={() => setResult(value)} />{copy[value]}
            </label>)}</div></fieldset>
          {!!item.eligibleRideFeedback?.length && <Select label={copy.ride} tooltip={copy.rideHelp} value={ride} disabled={pending}
            options={[{ value: "", label: copy.noRide }, ...item.eligibleRideFeedback.map(feedback => ({ value: feedback.id, label: formatDate(feedback.date) }))]}
            onChange={event => setRide(event.target.value)} />}
          {ride && item.eligibleRideFeedback?.find(feedback => feedback.id === ride)?.note && <p className="whitespace-pre-wrap break-words text-sm">
            {copy.rideNote}: {item.eligibleRideFeedback.find(feedback => feedback.id === ride)?.note}</p>}
        </>}
      <Textarea id={`${id}-note`} label={copy.note} aria-label={copy.note} tooltip={copy.noteHelp} value={note} maxLength={500} readOnly={pending} onChange={event => setNote(event.target.value)} />
      {error && <p role="alert" className="text-sm text-destructive-text">{error}</p>}
      <div className="flex flex-wrap gap-2"><Button type="submit" className="min-h-11 whitespace-normal" disabled={pending} isPending={pending}>
        {pending ? copy.saving : form === "performed" ? copy.save : copy.saveFeedback}</Button>
        <Button type="button" variant="ghost" className="min-h-11" disabled={pending} onClick={() => setForm(null)}>{copy.cancel}</Button></div>
    </form>}
  </div>;
}
