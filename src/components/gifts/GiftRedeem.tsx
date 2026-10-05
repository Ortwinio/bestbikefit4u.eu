"use client";

import { useState } from "react";
import Link from "next/link";
import { Gift } from "lucide-react";
import { Button, Card, CardContent, Select } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { giftsCopy } from "@/i18n/account/gifts";
import { giftError } from "./giftHelpers";

export type GiftRedemptionState =
  | "valid"
  | "soon"
  | "expired"
  | "redeemed"
  | "invalid";

export function GiftRedeem({
  locale,
  state,
  expiresAt,
  message,
  authenticated,
  bikes,
  onRedeem,
}: {
  locale: Locale;
  state: GiftRedemptionState;
  expiresAt?: number;
  message?: string;
  authenticated: boolean;
  bikes: { id: string; name: string }[];
  onRedeem: (bikeId: string) => Promise<unknown>;
}) {
  const copy = giftsCopy[locale];
  const [bikeId, setBikeId] = useState("");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = state === "valid" || state === "soon";
  const loginHref = `${withLocalePrefix("/login", locale)}?gift=1`;
  const addBikeHref = `${withLocalePrefix("/bikes/new/manual", locale)}?gift=1`;
  async function redeem() {
    if (pending) return;
    if (!bikes.some((bike) => bike.id === bikeId)) {
      setError(copy.errors.bike);
      return;
    }
    setPending(true);
    setError(null);
    try {
      await onRedeem(bikeId);
      setSuccess(true);
    } catch (failure) {
      setError(giftError(failure, locale));
    } finally {
      setPending(false);
    }
  }
  const title = success
    ? copy.success
    : valid
      ? copy.receive
      : state === "expired"
        ? copy.expired
        : state === "redeemed"
          ? copy.redeemed
          : copy.invalid;
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 sm:py-16">
      <section className="grid gap-8 rounded-3xl bg-[var(--bbf-lime)] p-6 text-[var(--bbf-inkt)] sm:p-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Gift aria-hidden size={24} />
            {copy.eyebrow}
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p>
            {valid || success
              ? copy.receiveDescription
              : state === "expired"
                ? copy.expiredBody
                : state === "invalid"
                  ? copy.invalidBody
                  : copy.privacy}
          </p>
          {valid && !success && (
            <>
              <p className="font-semibold">{copy.free}</p>
              {message && (
                <blockquote className="break-words whitespace-pre-wrap border-l-2 border-current pl-4">
                  {message}
                </blockquote>
              )}
              {expiresAt && (
                <p className="text-sm">
                  {copy.expires}{" "}
                  {new Intl.DateTimeFormat(locale, {
                    dateStyle: "long",
                    timeZone: "Europe/Amsterdam",
                  }).format(expiresAt)}
                </p>
              )}
              {state === "soon" && (
                <p
                  role="status"
                  className="rounded-xl bg-background p-3 font-semibold text-foreground"
                >
                  {copy.soon}
                </p>
              )}
            </>
          )}
        </div>
        <Card>
          <CardContent className="space-y-5 p-6 text-foreground">
            {success ? (
              <>
                <p role="status">{copy.success}</p>
                <Button
                  render={<Link href={withLocalePrefix("/bikes", locale)} />}
                  nativeButton={false}
                  className="min-h-11"
                >
                  {copy.start}
                </Button>
              </>
            ) : !valid ? (
              <Button
                render={<Link href={withLocalePrefix("/pricing", locale)} />}
                nativeButton={false}
                className="min-h-11"
              >
                {copy.prices}
              </Button>
            ) : !authenticated ? (
              <Button
                render={<Link href={loginHref} />}
                nativeButton={false}
                className="min-h-11 whitespace-normal"
              >
                {copy.login}
              </Button>
            ) : bikes.length === 0 ? (
              <>
                <p>{copy.noBikes}</p>
                <Button
                  render={<Link href={addBikeHref} />}
                  nativeButton={false}
                  className="min-h-11"
                >
                  {copy.addBike}
                </Button>
              </>
            ) : (
              <>
                <Select
                  label={copy.bike}
                  placeholder={copy.bikePlaceholder}
                  options={bikes.map((bike) => ({
                    value: bike.id,
                    label: bike.name,
                  }))}
                  value={bikeId}
                  onChange={(event) => setBikeId(event.target.value)}
                  disabled={pending}
                  className="min-h-11"
                />
                <Button
                  onClick={redeem}
                  disabled={pending}
                  className="min-h-11"
                >
                  {pending ? copy.redeeming : copy.redeem}
                </Button>
                {error && (
                  <p role="alert" className="text-sm text-destructive-text">
                    {error}
                  </p>
                )}
              </>
            )}
            <p className="text-sm text-muted-foreground">{copy.privacy}</p>
          </CardContent>
        </Card>
      </section>
      {(valid || success) && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="font-display text-xl font-bold">{copy.value}</h2>
              <p>{copy.benefits}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-6">
              <p>{copy.upgrade}</p>
              <Link
                href={withLocalePrefix("/pricing", locale)}
                className="inline-flex min-h-11 items-center font-semibold text-primary underline"
              >
                {copy.prices}
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
