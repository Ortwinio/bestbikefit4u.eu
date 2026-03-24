"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { XIcon } from "lucide-react"

import { cn } from "@/components/lib/utils"
import { Button } from "@/components/prototyper-ui/ui/button"

export const DIALOG_OVERLAY_CLASSNAME =
  "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 panel-backdrop duration-200 fixed inset-0 isolate z-50 transition motion-reduce:animate-none motion-reduce:transition-none"

export const DIALOG_PANEL_CLASSNAME =
  "panel-surface-base panel-theme-context shadow-overlay"

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        DIALOG_OVERLAY_CLASSNAME,
        className
      )}
      {...props}
    />
  )
}

const sheetVariants = cva(
  [
    "fixed z-50 gap-4 transition ease-out-fluid",
    DIALOG_PANEL_CLASSNAME,
    "data-open:animate-in data-open:duration-300",
    "data-closed:animate-out data-closed:duration-200",
    "data-entering:will-change-[opacity,transform] data-exiting:will-change-[opacity,transform]",
    "motion-reduce:animate-none motion-reduce:transition-none",
  ],
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b border-border-light data-open:slide-in-from-top data-closed:slide-out-to-top",
        bottom:
          "inset-x-0 bottom-0 border-t border-border-light data-open:slide-in-from-bottom data-closed:slide-out-to-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r border-border-light data-open:slide-in-from-left data-closed:slide-out-to-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l border-border-light data-open:slide-in-from-right data-closed:slide-out-to-right sm:max-w-sm",
      },
    },
  }
)

function DialogContent({
  className,
  children,
  showCloseButton = true,
  side,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
} & VariantProps<typeof sheetVariants>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          side
            ? sheetVariants({ side, className: "h-full overflow-y-auto p-6" })
            : [
                DIALOG_PANEL_CLASSNAME,
                "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-[0.98] data-open:zoom-in-[1.02] grid max-w-[calc(100%-2rem)] gap-6 rounded-2xl p-6 text-sm duration-200 ease-out-fluid sm:max-w-md fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 outline-none overflow-hidden transition data-entering:will-change-[opacity,transform] data-exiting:will-change-[opacity,transform] motion-reduce:animate-none motion-reduce:transition-none",
              ],
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-4 right-4"
                size="icon-sm"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("gap-2 flex flex-col", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("leading-none font-medium", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-muted-foreground [&_a]:hover:text-foreground text-sm [&_a]:underline [&_a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
