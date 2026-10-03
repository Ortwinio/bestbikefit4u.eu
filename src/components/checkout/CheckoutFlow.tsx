"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { BRAND } from "@/config/brand";
import { ArrowLeft, Check, LockKeyhole } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { checkoutCopy } from "@/i18n/marketing/checkout";
import { stripeNotImplemented } from "@/lib/billing/stripeStub";
import { checkoutPrice, checkoutProductId, readCheckoutSelection, saveCheckoutSelection, type CheckoutPreview, type CheckoutProduct, type CheckoutSelection } from "./checkout-state";
import styles from "./CheckoutFlow.module.css";
import { AppointmentBlock } from "./AppointmentBlock";

export type CheckoutFlowProps = {
  locale: Locale;
  initialSelection?: CheckoutSelection;
  authenticated: boolean;
  authLoading?: boolean;
  accountEmail?: string;
  accountId?: string;
  bikes?: { id: string; name: string }[];
  introEligible?: boolean;
  preview?: CheckoutPreview;
  agendaUrl?: string;
  appointmentRequested?: boolean;
  appointmentAvailable?: boolean;
  signIn: (email: string, code: string | undefined, redirectTo: string) => Promise<void>;
};

export function CheckoutFlow({ locale, initialSelection, authenticated, authLoading = false, accountEmail, accountId, bikes, introEligible = false, preview = null, agendaUrl, appointmentRequested = false, appointmentAvailable = false, signIn }: CheckoutFlowProps) {
  const text = checkoutCopy[locale];
  const [selection, setSelection] = useState<CheckoutSelection>(initialSelection ?? { product: "annual", bikeId: "" });
  const [step, setStep] = useState(appointmentRequested ? 1 : 0);
  const [previewResult, setResult] = useState(preview);
  const result = previewResult ?? (authenticated && appointmentRequested && appointmentAvailable ? "appointment" : null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [consentFor, setConsentFor] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const product = result === "appointment" ? "personal" : selection.product;
  const eligible = authenticated && introEligible;
  const confirmationKey = JSON.stringify([authenticated, accountId, accountEmail, checkoutProductId(product, eligible), checkoutPrice(product, eligible), selection.bikeId]);
  const consent = consentFor === confirmationKey;
  const priceFor = (plan: CheckoutProduct) => new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-IE", { style: "currency", currency: "EUR" }).format(checkoutPrice(plan, eligible));
  const benefitsFor = (plan: CheckoutProduct) => plan === "single" ? text.singleBenefits : plan === "personal" ? text.personalBenefits : eligible ? text.introBenefits : text.annualBenefits;
  const bike = bikes?.find(item => item.id === selection.bikeId);
  const price = priceFor(product);
  const activeStep = step === 2 && !authenticated ? 1 : step;
  const link = (path: string) => withLocalePrefix(path, locale);

  useEffect(() => {
    const saved = initialSelection ?? readCheckoutSelection();
    if (saved) setSelection(saved);
    setConsentFor(null);
    setMessage("");
    setReady(true);
  }, [initialSelection]);

  useEffect(() => {
    setConsentFor(null);
    setMessage("");
  }, [confirmationKey]);

  function setConsent(checked: boolean) {
    setConsentFor(checked ? confirmationKey : null);
  }

  useEffect(() => {
    heading.current?.focus();
  }, [activeStep, result]);

  function persist(next = selection) {
    if (!saveCheckoutSelection(next, eligible)) {
      setError(text.storageError);
      return false;
    }
    setError("");
    return true;
  }

  function choose(next: CheckoutSelection) {
    setSelection(next);
    setConsent(false);
    setMessage("");
    persist(next);
  }

  function advance() {
    if (!persist()) return;
    setConsent(false);
    setStep(activeStep === 0 ? 1 : 2);
  }

  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (codeSent && !/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{7}$/.test(code)) {
      setError(text.authError);
      return;
    }
    if (busy || authLoading || !persist()) return;
    setBusy(true);
    setError("");
    try {
      const query = new URLSearchParams({ product: checkoutProductId(product, eligible), ...(selection.bikeId ? { bikeId: selection.bikeId } : {}), ...(appointmentRequested ? { appointment: "1" } : {}) });
      await signIn(email.trim(), codeSent ? code : undefined, `${link("/checkout")}?${query}`);
      if (!codeSent) {
        setEmail(email.trim());
        setCodeSent(true);
      } else {
        setStep(2);
      }
    } catch {
      setError(text.authError);
    } finally {
      setBusy(false);
    }
  }

  function pay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authenticated || authLoading || !consent || (product === "single" && !bike) || !persist()) return;
    setMessage(stripeNotImplemented(locale).message);
  }

  const benefitList = (plan: CheckoutProduct) => <ul className={styles.benefits}>{benefitsFor(plan).map(item => <li key={item}><Check size={19} aria-hidden="true" /><span>{item}</span></li>)}</ul>;
  const summary = <aside className={styles.summary} aria-label={text.choice}>
    <details open className={styles.summaryDetails}>
      <summary>{text.choice}: {text[product]} <span className={styles.summaryInlinePrice}>{price} {text.vat}</span></summary>
      {bike && product === "single" && <p>{bike.name}</p>}
      <p className={styles.summaryPrice}>{price}<small>{product === "single" ? text.once : text.firstYear}</small></p>
      {benefitList(product)}
      {product !== "single" && <p className={styles.renewal}>{product === "personal" ? text.personalRenewal : text.renewal}</p>}
      <p className={styles.small}>{text.data}</p>
    </details>
  </aside>;

  return <div className={styles.shell}>
    <header className={styles.header}>
      <div className={styles.brandRow}>
        {activeStep === 0 || result ? <Link className={styles.back} href={link("/pricing")}><ArrowLeft size={18} aria-hidden="true" />{text.back}</Link> : <button className={styles.back} type="button" onClick={() => { setStep(activeStep - 1); setConsent(false); setMessage(""); setError(""); }}><ArrowLeft size={18} aria-hidden="true" />{text.back}</button>}
        <span className={styles.brand}>
          <Image src={BRAND.assets.logoPrimary} alt={BRAND.name} width={184} height={32} priority />
        </span>
      </div>
      {!result && <ol className={styles.steps} aria-label={text.secure}>{text.steps.map((label, index) => <li key={label} aria-current={activeStep === index ? "step" : undefined} data-complete={index < activeStep}><span>{index < activeStep ? <Check size={16} aria-hidden="true" /> : index + 1}</span><b>{label}</b></li>)}</ol>}
      <span className={styles.secure}><LockKeyhole size={18} aria-hidden="true" /><span>{text.secure}</span></span>
    </header>
    <main id="main-content" className={`${styles.main} ${activeStep === 0 && !result ? styles.chooseMain : ""}`}>
      {preview && <p className={styles.preview} role="note">{text.preview}</p>}
      {result ? <div className={`${styles.columns} ${result === "success" ? styles.successColumns : ""}`}>
        <section className={result === "success" ? styles.success : styles.panel}>
          <h1 ref={heading} tabIndex={-1}>{result === "appointment" ? text.planAppointment : result === "failure" ? text.failureTitle : product === "personal" ? text.personalSuccess : product === "annual" ? text.annualSuccess : text.successTitle}</h1>
          {result === "failure" ? <p>{text.failureLead}</p> : product !== "personal" && <p>{text.successLead}</p>}
          {result === "failure" ? <button type="button" className={styles.primary} onClick={() => { setResult(null); setStep(authenticated ? 2 : 1); setConsent(false); }}>{text.retry}</button> : product === "personal" ? <>
            <AppointmentBlock locale={locale} agendaUrl={agendaUrl} showHeading={result !== "appointment"} />
            <Link className={styles.textLink} href={link("/dashboard")}>{text.openPlan}</Link>
          </> : <Link className={`${styles.primary} ${styles.pinnedAction}`} href={link("/dashboard")}>{text.openPlan}</Link>}
        </section>{summary}
      </div> : activeStep === 0 ? <>
        <div className={styles.intro}><h1 ref={heading} tabIndex={-1}>{text.title}</h1><p>{text.lead}</p></div>
        <fieldset className={styles.plans}><legend className={styles.srOnly}>{text.choice}</legend>
          {(["single", "annual", "personal"] as const).map(plan => <label key={plan} className={`${styles.plan} ${plan === "annual" ? styles.featured : ""}`} data-selected={product === plan}>
            {plan === "annual" && <span className={styles.badge}>{text.favorite}</span>}
            <div className={styles.planTop}><h2>{text[plan]}</h2><input type="radio" name="product" value={plan} checked={product === plan} onChange={() => choose({ ...selection, product: plan })} /></div>
            <div className={styles.price}>{priceFor(plan)}<small>{plan === "single" ? text.once : text.firstYear}</small></div>
            <p className={styles.meta}>{plan === "single" ? text.singleMeta : plan === "annual" ? text.annualMeta : text.personalMeta}</p>
            {benefitList(plan)}
            {plan !== "single" && <p className={styles.small}>{plan === "personal" ? text.personalRenewal : text.renewal}</p>}
            <span className={styles.pick}>{product === plan ? text.selected : `${text.select} ${text[plan]}`}</span>
          </label>)}
        </fieldset>
        <div className={styles.actions}><button className={styles.primary} type="button" disabled={!ready || authLoading} onClick={advance}>{text.continue} · {price}</button><p className={styles.small}>{text.free}</p></div>
      </> : <div className={styles.columns}>
        <section>
          <h1 ref={heading} tabIndex={-1}>{activeStep === 1 ? text.accountTitle : text.confirmTitle}</h1>
          {activeStep === 1 ? <>
            {authenticated ? <div className={styles.panel}><p>{text.signedIn}<br /><strong>{accountEmail ?? text.loading}</strong></p><button type="button" className={styles.primary} disabled={authLoading} onClick={advance}>{text.continue}</button></div> : <form className={styles.panel} onSubmit={authenticate}>
              {codeSent ? <><p>{text.codeSent} <strong>{email}</strong></p><label className={styles.field}>{text.code}<input key="code" autoFocus required type="text" autoCapitalize="characters" spellCheck={false} autoComplete="one-time-code" pattern="[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{7}" maxLength={7} value={code} onChange={event => setCode(event.target.value.toUpperCase().replace(/\s/g, "").slice(0, 7))} /></label></> : <label className={styles.field}>{text.email}<input key="email" type="email" required autoComplete="email" autoCapitalize="none" spellCheck={false} value={email} onChange={event => setEmail(event.target.value)} /></label>}
              <button className={styles.primary} type="submit" disabled={busy || authLoading}>{busy ? text.loading : codeSent ? text.verify : text.sendCode}</button>
              {codeSent && <button className={styles.textLink} type="button" disabled={busy} onClick={() => { setCodeSent(false); setCode(""); setError(""); }}>{text.otherEmail}</button>}
            </form>}
            <p className={styles.small}>{text.accountHelp}</p>
          </> : <form onSubmit={pay}>
            <dl className={styles.rows}>
              <div><dt>{text.product}</dt><dd>{text[product]}{eligible && product === "annual" && <small>{text.intro}</small>}</dd></div>
              {product === "single" && <div><dt><label htmlFor="checkout-bike">{text.bike}</label></dt><dd><select id="checkout-bike" value={bike?.id ?? ""} required onChange={event => choose({ ...selection, bikeId: event.target.value })}><option value="">{bikes ? text.chooseBike : text.loading}</option>{bikes?.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></dd></div>}
              <div><dt>{text.term}</dt><dd>{product === "single" ? text.singleTerm : text.annualTerm}</dd></div>
              {product === "personal" && <div><dt>{text.appointment}</dt><dd>{text.appointmentDetails}</dd></div>}
              <div><dt>{text.total}</dt><dd className={styles.total}>{price}</dd></div>
            </dl>
            {product === "single" && bikes?.length === 0 && <p>{text.noBikes} <Link className={styles.textLink} href={link("/bikes/new")}>{text.addBike}</Link></p>}
            {product !== "single" && <p className={styles.renewal}>{product === "personal" ? text.personalRenewal : text.renewal}</p>}
            <label className={styles.consent}><input type="checkbox" required checked={consent} onChange={event => { setConsent(event.target.checked); setMessage(""); }} /><span>{text.withdrawal}</span></label>
            {product === "personal" && <p className={styles.small}>{text.appointmentTerms}</p>}
            <div className={styles.actions}><button className={styles.primary} type="submit" disabled={!consent || authLoading || (product === "single" && !bike)}>{text.pay} {price}</button><p className={styles.small}>{text.paymentHint}</p></div>
          </form>}
        </section>{summary}
      </div>}
      {error && <p className={styles.notice} role="alert">{error}</p>}
      {message && <p className={styles.notice} role="status" ref={element => { element?.scrollIntoView?.({ block: "end", behavior: "instant" }); }}>{message}</p>}
    </main>
    <footer className={styles.footer}><Link href={link("/terms")}>{text.terms}</Link><span aria-hidden="true">·</span><Link href={link("/privacy")}>{text.privacy}</Link><span aria-hidden="true">·</span><a href={`mailto:${BRAND.supportEmail}`}>{text.help} {BRAND.supportEmail}</a></footer>
  </div>;
}
