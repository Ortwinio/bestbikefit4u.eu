"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Gift } from "lucide-react";
import { Button, Card, CardContent, Input, Textarea } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { giftsCopy } from "@/i18n/account/gifts";
import { giftError, validateGift } from "./giftHelpers";

export type GiftListItem = {
  id: string;
  recipientEmail?: string;
  status: "pending" | "sent" | "redeemed" | "expired" | "cancelled";
  expiresAt: number;
};

export function GiftGive({
  locale,
  available,
  eligible,
  gifts,
  onSend,
}: {
  locale: Locale;
  available: number;
  eligible: boolean;
  gifts: GiftListItem[];
  onSend: (input: {
    recipientEmail: string;
    message?: string;
  }) => Promise<unknown>;
}) {
  const copy = giftsCopy[locale];
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    setSent(false);
    const invalid = validateGift(email, message, locale);
    setError(invalid);
    if (invalid) return;
    setPending(true);
    try {
      await onSend({
        recipientEmail: email.trim(),
        message: message.trim() || undefined,
      });
      setEmail("");
      setMessage("");
      setSent(true);
    } catch (failure) {
      setError(giftError(failure, locale));
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="space-y-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Gift aria-hidden size={20} />
          {copy.eyebrow}
        </p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          {copy.title}
        </h1>
        <p className="max-w-2xl text-muted-foreground">{copy.description}</p>
      </header>
      {eligible ? (
        <>
          <Card>
            <CardContent className="flex flex-wrap items-center gap-3 p-5">
              <Gift aria-hidden className="text-primary" />
              <p>
                <strong className="font-number text-xl">{available} / 2</strong>{" "}
                {copy.credits}
              </p>
              <p className="text-sm text-muted-foreground">{copy.renewal}</p>
            </CardContent>
          </Card>
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <form onSubmit={submit} noValidate className="space-y-5">
                  <h2 className="font-display text-xl font-bold">
                    {copy.formTitle}
                  </h2>
                  <Input
                    id="gift-email"
                    label={copy.email}
                    type="email"
                    autoComplete="off"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    helperText={copy.emailHint}
                    required
                    maxLength={254}
                  readOnly={pending || available === 0}
                    className="min-h-11"
                  />
                  <Textarea
                  id="gift-message"
                  label={copy.message}
                  aria-label={copy.message}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    maxLength={500}
                    rows={4}
                  readOnly={pending || available === 0}
                  />
                  {available === 0 ? (
                    <p className="text-sm text-muted-foreground">{copy.used}</p>
                  ) : (
                    <Button
                      type="submit"
                      disabled={pending}
                      className="min-h-11"
                    >
                      {pending ? copy.sending : copy.send}
                    </Button>
                  )}
                  {error && (
                    <p role="alert" className="text-sm text-destructive-text">
                      {error}
                    </p>
                  )}
                  {sent && (
                    <p role="status" className="text-sm text-primary">
                      {copy.sent}
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
            <section className="space-y-4 rounded-3xl bg-[var(--bbf-lime)] p-6 text-[var(--bbf-inkt)] sm:p-8">
              <Gift aria-hidden size={32} />
              <h2 className="font-display text-2xl font-bold">
                {copy.preview}
              </h2>
              <p className="text-xl font-semibold">{copy.value}</p>
              <p>{copy.benefits}</p>
              {message.trim() && (
                <blockquote className="break-words whitespace-pre-wrap border-l-2 border-current pl-4">
                  {message}
                </blockquote>
              )}
              <p className="text-sm">{copy.privacy}</p>
            </section>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="font-display text-xl font-bold">
              {copy.unavailable}
            </h2>
            <p>{copy.annual}</p>
            <Button
              render={<Link href={withLocalePrefix("/pricing", locale)} />}
              nativeButton={false}
              className="min-h-11"
            >
              {copy.prices}
            </Button>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="font-display text-xl font-bold">{copy.list}</h2>
          {gifts.length ? (
            <ul className="divide-y divide-border">
              {gifts.map((gift) => (
                <li
                  key={gift.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4"
                >
                  <div className="min-w-0">
                    <p className="break-all font-medium">
                      {gift.status === "expired"
                        ? copy.removed
                        : gift.recipientEmail || copy.eyebrow}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {copy.expires}{" "}
                      {new Intl.DateTimeFormat(locale, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        timeZone: "Europe/Amsterdam",
                      }).format(gift.expiresAt)}
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-sm">
                    {copy.statuses[gift.status]}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">{copy.empty}</p>
          )}
          <p className="text-sm text-muted-foreground">{copy.rules}</p>
          <p className="text-sm text-muted-foreground">{copy.privacy}</p>
        </CardContent>
      </Card>
    </div>
  );
}
