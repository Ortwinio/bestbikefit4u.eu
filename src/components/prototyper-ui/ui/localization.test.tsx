// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NumberFieldGroup, NumberFieldInput, NumberFieldRoot, NumberFieldSteppers } from "./numberfield";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "./dialog";
import { AccessibleDialog } from "./accessible-dialog";

const context = vi.hoisted(() => ({ path: "/nl/test" }));
vi.mock("next/navigation", () => ({ usePathname: () => context.path }));
afterEach(cleanup);

describe.each([
  { locale: "nl", increase: "Verhoog", decrease: "Verlaag", value: "waarde", close: "Sluiten", dialog: "Dialoog sluiten" },
  { locale: "en", increase: "Increase", decrease: "Decrease", value: "value", close: "Close", dialog: "Close dialog" },
])("shared UI in $locale", ({ locale, increase, decrease, value, close, dialog }) => {
  it.each([undefined, "Hoogte"])("labels working number steppers for %s", (label) => {
    context.path = `/${locale}/test`;
    render(<NumberFieldRoot defaultValue={5}><NumberFieldGroup>
      <NumberFieldInput aria-label="Measurement" /><NumberFieldSteppers label={label} />
    </NumberFieldGroup></NumberFieldRoot>);
    const up = screen.getByRole("button", { name: `${increase} ${label ?? value}` });
    const down = screen.getByRole("button", { name: `${decrease} ${label ?? value}` });
    fireEvent.click(up);
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("6");
    fireEvent.click(down);
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("5");
  });
  it("labels both dialog close controls", () => {
    context.path = `/${locale}/test`;
    render(<Dialog defaultOpen><DialogContent>
      <DialogTitle>Test</DialogTitle><DialogFooter showCloseButton />
    </DialogContent></Dialog>);
    expect(screen.getAllByRole("button", { name: close })).toHaveLength(2);
  });
  it("labels the accessible dialog close control and closes it", () => {
    context.path = `/${locale}/test`;
    const onClose = vi.fn();
    render(<AccessibleDialog open title="Test" onClose={onClose}>Content</AccessibleDialog>);
    fireEvent.click(screen.getByRole("button", { name: dialog }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
