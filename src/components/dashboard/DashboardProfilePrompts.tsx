"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { Button, Input, Select, Slider } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { getProfilePromptsCopy } from "@/i18n/account/profilePrompts";
import { formatProfileBirthDate } from "@/i18n/account/profileProvenance";
import { validateProfileObservationValue } from "../../../shared/profileObservationFields";
import styles from "./DashboardProfilePrompts.module.css";

export type PromptQuestion = {
  key: string; field: string; bikeId?: string; bikeName?: string; value: number | string | null;
  unit: string; kind: "measured" | "estimated" | "declared"; range?: readonly [number, number]; options?: readonly string[];
  effects: string[]; gain: number; completenessGain: number; effort: "quick" | "measure";
  stale: boolean; status: "pending" | "answered" | "skipped";
};
export type PromptView = { cardId: string | null; shownAt: number | null; hiddenUntil: number | null; questions: PromptQuestion[] };
type Method = "single_measurement" | "self_assessment" | "self_report" | "ftp_test";
type Answer = { cardId: string; key: string; value: number | string; expectedCurrentValue: number | string | null; method: Method; measurePoint?: "bb_center_to_saddle_top" };
type AnswerResult = { status: "saved"; field: string } | { status: "conflict"; field: string; currentValue: number | string | null; incomingValue: number | string };
const nextPrompts = makeFunctionReference<"query", Record<string, never>, PromptView>("profiles/queries:nextPrompts");
const openPromptCard = makeFunctionReference<"mutation", Record<string, never>, PromptView>("profiles/mutations:openPromptCard");
const dismissPromptCard = makeFunctionReference<"mutation", { cardId: string }, null>("profiles/mutations:dismissPromptCard");
const skipProfilePrompt = makeFunctionReference<"mutation", { cardId: string; key: string }, null>("profiles/mutations:skipProfilePrompt");
const answerProfilePrompt = makeFunctionReference<"mutation", Answer, AnswerResult>("profiles/mutations:answerProfilePrompt");

export function DashboardProfilePrompts({ locale }: { locale: Locale }) {
  const query = useQuery(nextPrompts, {});
  const open = useMutation(openPromptCard);
  const dismiss = useMutation(dismissPromptCard);
  const copy = getProfilePromptsCopy(locale);
  const attempted = useRef(false);
  const busy = useRef(false);
  const [opened, setOpened] = useState<PromptView | null>(null);
  const [state, setState] = useState<"idle" | "opening" | "error" | "dismissing" | "waiting">("idle");
  const view = query?.cardId || query?.hiddenUntil ? query : opened ?? query;
  const openCard = useCallback(async () => {
    if (busy.current) return;
    attempted.current = true;
    busy.current = true;
    setState("opening");
    try { setOpened(await open({})); setState("idle"); }
    catch { setState("error"); }
    finally { busy.current = false; }
  }, [open]);
  useEffect(() => {
    if (query !== undefined && !attempted.current && !query.cardId && (!query.hiddenUntil || query.hiddenUntil <= Date.now())) void openCard();
  }, [query, openCard]);
  async function hide() {
    if (!view?.cardId || busy.current) return;
    busy.current = true;
    setState("dismissing");
    try { await dismiss({ cardId: view.cardId }); setState("waiting"); }
    catch { setState("error"); }
    finally { busy.current = false; }
  }
  const profileLink = <Link href={withLocalePrefix("/profile", locale)} className={styles.link}>{copy.profile}</Link>;
  if (view?.hiddenUntil && view.hiddenUntil > Date.now()) return <section className={styles.hidden} aria-label={copy.title}>
    <p>{copy.hidden} <time dateTime={new Date(view.hiddenUntil).toISOString()}>{new Date(view.hiddenUntil).toLocaleDateString(locale === "nl" ? "nl-NL" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}</time>. {copy.hiddenHint}</p>{profileLink}
  </section>;
  if (query === undefined || state === "opening") return <p role="status">{copy.loading}</p>;
  if (!view?.cardId || !view.questions.length) return state === "error" ? <section className={styles.card}><p role="alert">{copy.error}</p><Button onClick={() => void openCard()}>{copy.retry}</Button>{profileLink}</section> : null;
  return <section className={styles.card} aria-label={copy.title}>
    <header className={styles.header}><div><p className={styles.eyebrow}>{copy.eyebrow}</p><h2>{copy.title}</h2><p>{copy.introduction}</p></div><Button variant="ghost" disabled={state === "dismissing" || state === "waiting"} onClick={() => void hide()}>{copy.dismiss}</Button></header>
    {state === "error" && <p role="alert">{copy.error}</p>}
    {state === "dismissing" || state === "waiting" ? <p role="status">{copy.dismissing}</p> : <div className={styles.questions}>
      {view.questions.slice(0, 2).map((question, index) => <Question key={`${view.cardId}:${question.key}`} cardId={view.cardId!} question={question} index={index} locale={locale} />)}
    </div>}
    <footer><p>{copy.footer}</p>{profileLink}</footer>
  </section>;
}

function Question({ question, cardId, index, locale }: { question: PromptQuestion; cardId: string; index: number; locale: Locale }) {
  const copy = getProfilePromptsCopy(locale);
  const answer = useMutation(answerProfilePrompt);
  const skip = useMutation(skipProfilePrompt);
  const [text, setText] = useState(question.value === null ? "" : String(question.value));
  const [expected, setExpected] = useState(question.value);
  const defaultMethod: Method = question.field === "ftpWatts" || question.kind === "declared"
    ? "self_report" : question.kind === "estimated" ? "self_assessment" : "single_measurement";
  const [method, setMethod] = useState<Method | "unknown" | "">(defaultMethod);
  const [measurePoint, setMeasurePoint] = useState<"bb_center_to_saddle_top" | "">("");
  const [status, setStatus] = useState<"saved" | "skipped" | "error" | "discarded" | null>(null);
  const [conflict, setConflict] = useState<Extract<AnswerResult, { status: "conflict" }> | null>(null);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const label = (question.bikeId ? copy.bikeFields[question.field as keyof typeof copy.bikeFields] : undefined) ?? copy.fields[question.field as keyof typeof copy.fields] ?? copy.unknownField;
  const demographic = question.field === "sex" || question.field === "birthDate";
  const unit = ["none", "score", "date"].includes(question.unit) ? "" : question.unit;
  const labelValue = (value: number | string | null) => question.field === "birthDate" ? formatProfileBirthDate(value, locale) ?? "—" : value === null ? "—" : typeof value === "number" ? value.toLocaleString(locale) : copy.bikeValues[value as keyof typeof copy.bikeValues] ?? copy.values[value as keyof typeof copy.values] ?? copy.protocols[value as keyof typeof copy.protocols] ?? value;
  const effects = [...new Set(question.effects.map(effect => copy.effects[effect as keyof typeof copy.effects] ?? copy.genericEffect))].join(", ") || copy.genericEffect;
  const saddle = question.field === "currentSetup.saddleHeightMm";
  const methods: Method[] = question.field === "ftpWatts" ? ["self_report", "ftp_test", "single_measurement", "self_assessment"] : question.kind === "declared" ? ["self_report"] : question.kind === "estimated" ? ["self_assessment"] : ["single_measurement", "self_assessment"];
  async function save(current = expected) {
    if (busy.current || !method || method === "unknown" || !text.trim() || (saddle && !measurePoint)) return;
    const value = question.range ? Number(text) : text.trim();
    if (demographic) {
      try { validateProfileObservationValue(question.field, value); }
      catch { setStatus("error"); return; }
    }
    if (question.range && (typeof value !== "number" || !Number.isFinite(value) || value < question.range[0] || value > question.range[1])) { setStatus("error"); return; }
    busy.current = true;
    setPending(true);
    setStatus(null);
    try {
      const result = await answer({ cardId, key: question.key, value, expectedCurrentValue: current, method, ...(saddle && measurePoint ? { measurePoint } : {}) });
      if (result.status === "conflict") setConflict(result);
      else { setConflict(null); setStatus("saved"); }
    } catch { setStatus("error"); }
    finally { busy.current = false; setPending(false); }
  }
  async function skipQuestion() {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    try { await skip({ cardId, key: question.key }); setStatus("skipped"); setConflict(null); }
    catch { setStatus("error"); }
    finally { busy.current = false; setPending(false); }
  }
  function discard() {
    if (!conflict) return;
    setExpected(conflict.currentValue);
    setText("");
    setMethod(defaultMethod);
    setMeasurePoint("");
    setConflict(null);
    setStatus("discarded");
  }
  const saved = status === "saved" || question.status === "answered";
  const skipped = status === "skipped" || question.status === "skipped";
  return <article className={`${styles.question} ${saved ? styles.answered : ""}`} aria-label={label}>
    <header className={styles.questionHeader}><span className={styles.number}>{index + 1}</span><h3>{label}</h3></header>
    {question.bikeName && <p>{copy.bike}: <strong>{question.bikeName}</strong></p>}
    {demographic && <p>{copy.demographicReasons[question.field as keyof typeof copy.demographicReasons]} {copy.demographicNote}</p>}
    {!saved && !skipped && !demographic && <><div className={styles.gains}>{question.completenessGain > 0 && <span>+{question.completenessGain.toLocaleString(locale, { maximumFractionDigits: 1 })} {copy.completeness}</span>}<span>{question.effort === "quick" ? copy.quick : copy.measure}</span></div>
    <p>{copy.effect}: <strong>{effects}</strong>. {question.gain > 0 && <>{copy.upTo} +{question.gain.toLocaleString(locale, { maximumFractionDigits: 1 })} {copy.reliability}.</>}</p></>}
    {saved ? <p role="status">{demographic ? question.field === "sex" && (status === "saved" ? text : question.value) === "prefer_not_to_say" ? copy.demographicDeclined : copy.demographicSaved : `${copy.saved} ${effects}.`}</p> : skipped ? <p role="status">{copy.skipped}</p> : <>
      {question.stale && <p className={styles.stale}>{copy.stale} <strong>{labelValue(question.value)} {unit}</strong></p>}
      {status === "error" && <p role="alert">{copy.error}</p>}
      {status === "discarded" && <p role="status">{copy.discarded}</p>}
      {conflict && <div className={styles.conflict} role="alert"><h4>{copy.conflict}</h4><p>{copy.current}: {labelValue(conflict.currentValue)} {unit} · {copy.incoming}: {labelValue(conflict.incomingValue)} {unit}</p><p>{copy.conflictHint}</p><div className={styles.actions}><Button disabled={pending} variant="outline" onClick={discard}>{copy.keep}</Button><Button disabled={pending} onClick={() => void save(conflict.currentValue)}>{copy.today}</Button><Button disabled={pending} variant="outline" onClick={discard}>{copy.remeasure}</Button></div></div>}
      <form onSubmit={event => { event.preventDefault(); if (!conflict) void save(); }} className={styles.form}>
        {question.field === "armLengthCm" && <p>{copy.armInstruction}</p>}
        {method !== "unknown" && (question.options ? <Select label={label} tooltip={copy.valueHelp} tooltipLabel={label} placeholder={copy.choose} options={question.options.map(value => ({ value, label: labelValue(value) }))} value={text} disabled={pending || Boolean(conflict)} onChange={event => setText(event.target.value)} />
          : question.range ? <div data-usability={!text ? "example" : undefined}>
            <Slider label={`${label}${unit ? ` (${unit})` : ""}`} unit={unit}
              tooltip={copy.valueHelp} tooltipLabel={label} min={question.range[0]} max={question.range[1]}
              step={question.unit === "cm" || question.unit === "kg" ? 0.5 : 1}
              value={text ? Number(text) : (question.range[0] + question.range[1]) / 2}
              valueLabel={text || copy.example} disabled={pending || Boolean(conflict)}
              onChange={value => setText(String(value))} />
            {!text && <p className="text-sm text-muted-foreground">{copy.exampleHint}</p>}
          </div>
          : <Input label={label} tooltip={question.field === "birthDate" ? copy.dateHelp : copy.valueHelp}
              tooltipLabel={label} type={question.field === "birthDate" ? "date" : "text"}
              maxLength={100} required value={text} disabled={pending || Boolean(conflict)}
              onChange={event => setText(event.target.value)} />)}
        {question.field === "ftpWatts" && <p>{copy.ftpHint}</p>}
        <div data-usability="measurement-kind"><Select label={copy.methods} tooltip={copy.methodHelp} tooltipLabel={copy.methods} placeholder={copy.choose} options={[...methods.map(value => ({ value, label: question.field === "ftpWatts" ? copy.ftpMethods[value] : copy.saveMethods[value] })), ...(question.field === "ftpWatts" ? [{ value: "unknown", label: copy.unknownFtp }] : [])]} value={method} disabled={pending || Boolean(conflict)} onChange={event => setMethod(event.target.value as Method | "unknown")} /></div>
        {method === "unknown" && <div role="status"><p>{copy.unknownFtpHint}</p><Link className={styles.link} href={withLocalePrefix("/tools/ftp-wkg", locale)}>{copy.ftpLink}</Link></div>}
        {saddle && <><p>{copy.saddleInstruction}</p><Select label={copy.measurePoint} tooltip={copy.saddleInstruction} tooltipLabel={copy.measurePoint} placeholder={copy.choose} options={[{ value: "bb_center_to_saddle_top", label: copy.saddlePoint }]} value={measurePoint} disabled={pending || Boolean(conflict)} onChange={event => setMeasurePoint(event.target.value as "bb_center_to_saddle_top")} /></>}
        <div className={styles.actions}>{method !== "unknown" && <Button type="submit" isPending={pending} disabled={!text.trim() || !method || Boolean(conflict) || (saddle && !measurePoint)}>{question.stale && text === String(question.value) ? copy.confirm : copy.save}</Button>}<Button type="button" variant="ghost" disabled={pending || Boolean(conflict)} onClick={() => void skipQuestion()}>{copy.skip}</Button></div>
      </form>
    </>}
  </article>;
}
