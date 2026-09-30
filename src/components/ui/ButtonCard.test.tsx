// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "./Button";
import { Card, CardTitle, CardDescription, CardContent } from "./Card";
import { PublicSection } from "@/components/public/PublicSection";

afterEach(cleanup);

describe("brand buttons and cards", () => {
  it("retains clicks, accessible name and disabled loading behavior", () => {
    const click = vi.fn();
    const { rerender } = render(<Button onClick={click}>Bewaar je fit</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Bewaar je fit" }));
    expect(click).toHaveBeenCalledOnce();
    rerender(<Button isLoading onClick={click}>Bewaar je fit</Button>);
    const button = screen.getByRole("button", { name: "Bewaar je fit" });
    expect(button.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(button);
    expect(click).toHaveBeenCalledOnce();
  });

  it("preserves link composition and pill sizing", () => {
    render(<Button render={<a href="/nl/fit" />} role="link">Start bike fit</Button>);
    const link = screen.getByRole("link", { name: "Start bike fit" });
    expect(link.getAttribute("href")).toBe("/nl/fit");
    expect(link.className).toContain("min-h-12");
    expect(link.className).toContain("rounded-full");
  });

  it("keeps card headings and content semantics with a brand border", () => {
    const { container } = render(<Card variant="bordered"><CardTitle>Je startpunt</CardTitle><CardDescription>Pas één maat tegelijk aan.</CardDescription><CardContent>742 mm</CardContent></Card>);
    expect(screen.getByRole("heading", { level: 3 }).textContent).toBe("Je startpunt");
    expect(screen.getByText("742 mm")).toBeTruthy();
    expect(container.querySelector('[data-slot="card"]')?.className).toContain("border-border");
  });

  it("avoids invalid raw color tuples on public section borders", () => {
    const { container } = render(<PublicSection header={{title:"Eerst een veilige basis"}}>Meet zorgvuldig.</PublicSection>);
    const card = container.querySelector('[data-slot="card"]');
    expect(card?.className).toContain("border-border/80");
    expect(card?.className).not.toContain("var(--border)");
    expect(screen.getByRole("heading", { name:"Eerst een veilige basis" })).toBeTruthy();
  });
});
