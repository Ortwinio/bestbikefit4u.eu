"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { useMutation, usePaginatedQuery } from "convex/react";
import { Trash2, X } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button, Input, useToast } from "@/components/ui";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/prototyper-ui/ui/dialog";
import { getBikeDeletionCopy } from "@/i18n/account/bikeDeletion";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { withLocalePrefix } from "@/i18n/navigation";

export function DeleteBikeAction({ bikeId, bikeName, onPendingChange }: {
  bikeId: string;
  bikeName: string;
  onPendingChange?: (pending: boolean) => void;
}) {
  const { locale } = useDashboardMessages();
  const copy = getBikeDeletionCopy(locale);
  const router = useRouter();
  const toast = useToast();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [pending, setPending] = useState(false);
  const [confirmedSessionCount, setConfirmedSessionCount] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const removeBike = useMutation(api.bikes.mutations.remove);
  const { results, status, loadMore } = usePaginatedQuery(
    api.bikes.deletion.preview,
    open && !pending ? { bikeId: bikeId as Id<"bikes"> } : "skip",
    { initialNumItems: 100 },
  );

  useEffect(() => {
    if (open && !pending && status === "CanLoadMore") loadMore(100);
  }, [open, pending, status, loadMore]);

  function changeOpen(nextOpen: boolean) {
    if (pending) return;
    setOpen(nextOpen);
    setConfirmName("");
    setError(false);
    setConfirmedSessionCount(null);
  }

  async function handleDelete() {
    if (pending || status !== "Exhausted" || confirmName !== bikeName) return;
    flushSync(() => {
      setConfirmedSessionCount(results.length);
      setPending(true);
      setError(false);
      onPendingChange?.(true);
    });
    try {
      await removeBike({ bikeId: bikeId as Id<"bikes">, confirmName });
      setOpen(false);
      toast.success({ description: copy.success });
      router.replace(withLocalePrefix("/bikes", locale));
    } catch {
      setError(true);
      setPending(false);
      onPendingChange?.(false);
    }
  }

  return (
    <>
      <Button ref={triggerRef} variant="ghost" className="min-h-11" onClick={() => changeOpen(true)}>
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        {copy.action}
      </Button>
      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogContent
          showCloseButton={false}
          initialFocus={inputRef}
          finalFocus={triggerRef}
          className="max-h-[calc(100dvh-2rem)] gap-4 overflow-y-auto"
        >
          <DialogHeader className="relative pr-12">
            <Button
              variant="ghost"
              className="absolute right-0 top-0 min-h-11 min-w-11 px-0"
              aria-label={copy.close}
              disabled={pending}
              onClick={() => changeOpen(false)}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Button>
            <DialogTitle>{copy.title}</DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </DialogHeader>
          <p className="break-words text-lg font-semibold text-foreground">{bikeName}</p>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            <li>{copy.settings}</li>
            <li>{copy.photos}</li>
            <li>{copy.rides}</li>
            <li aria-live="polite">
              {pending && confirmedSessionCount !== null
                ? copy.sessions(confirmedSessionCount)
                : status === "Exhausted" ? copy.sessions(results.length) : copy.loading}
            </li>
          </ul>
          <p className="font-semibold text-destructive-text">{copy.warning}</p>
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void handleDelete(); }}>
            <Input
              ref={inputRef}
              label={copy.nameLabel}
              helperText={copy.nameHint}
              value={confirmName}
              onChange={(event) => setConfirmName(event.target.value)}
              disabled={pending}
              autoComplete="off"
              spellCheck={false}
              className="min-h-11"
            />
            {error && <p role="alert" className="text-sm text-destructive-text">{copy.error}</p>}
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" className="min-h-11" disabled={pending} onClick={() => changeOpen(false)}>
                {copy.cancel}
              </Button>
              <Button
                type="submit"
                variant="destructive"
                className="min-h-11"
                disabled={pending || status !== "Exhausted" || confirmName !== bikeName}
                isLoading={pending}
              >
                {copy.confirm}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
