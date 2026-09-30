// @vitest-environment jsdom
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Slider } from "./Slider";
import { SegmentedControl, SegmentedControlItem } from "./SegmentedControl";
import { OptionCard } from "./OptionCard";
import { StepCard } from "./StepCard";

afterEach(cleanup);

function SliderExample() {
  const [value, setValue] = useState(80);
  return <Slider label="Binnenbeenlengte" min={55} max={105} step={0.5} value={value} onChange={setValue} unit="cm" helperText="Meet zonder schoenen." ticks={[{ value: 55 }, { value: 105 }]} />;
}

function SegmentsExample() {
  const [value, setValue] = useState("road");
  return <SegmentedControl aria-label="Fietstype" variant="strong" value={value} onValueChange={(next) => setValue(String(next))}>
    <SegmentedControlItem value="road">Race</SegmentedControlItem>
    <SegmentedControlItem value="gravel">Gravel</SegmentedControlItem>
    <SegmentedControlItem value="mtb" disabled>MTB</SegmentedControlItem>
  </SegmentedControl>;
}

describe("brand inputs", () => {
  it("labels the slider with its unit and updates by keyboard, respecting bounds", () => {
    render(<SliderExample />);
    const slider = screen.getByRole("slider", { name: "Binnenbeenlengte" });
    expect(slider.getAttribute("aria-valuetext")).toBe("80 cm");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider.getAttribute("aria-valuetext")).toBe("80.5 cm");
    fireEvent.keyDown(slider, { key: "End" });
    expect(slider.getAttribute("aria-valuetext")).toBe("105 cm");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider.getAttribute("aria-valuetext")).toBe("105 cm");
    fireEvent.keyDown(slider, { key: "Home" });
    expect(slider.getAttribute("aria-valuetext")).toBe("55 cm");
    const description = slider.getAttribute("aria-describedby") ?? "";
    expect(description).toContain("-helper");
    expect(screen.getByText("Meet zonder schoenen.")).toBeDefined();
  });

  it("keeps help out of the slider name and associates an invalid message", () => {
    render(<Slider label="Zadelhoogte" value={740} valueLabel="740 mm" onChange={() => {}} tooltip="Meet vanaf de trapas." error="Controleer je maat." required />);
    const slider = screen.getByRole("slider", { name: "Zadelhoogte" });
    expect(slider.getAttribute("aria-valuetext")).toBe("740 mm");
    expect(slider.getAttribute("aria-invalid")).toBe("true");
    expect(slider.getAttribute("aria-describedby")).toContain("-error");
    expect(screen.getByText("mm").className).toContain("text-sm");
  });

  it("keeps slider labels unique and makes disabled sliders noninteractive", () => {
    const onChange = vi.fn();
    render(<><Slider label="Waarde" value={5} onChange={onChange} disabled /><Slider label="Waarde" value={6} onChange={onChange} /></>);
    const sliders = screen.getAllByRole("slider", { name: "Waarde" });
    expect(sliders[0].getAttribute("aria-labelledby")).not.toBe(sliders[1].getAttribute("aria-labelledby"));
    expect((sliders[0] as HTMLInputElement).disabled).toBe(true);
    fireEvent.keyDown(sliders[0], { key: "ArrowRight" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("uses named radio semantics and arrow-key selection for segments", async () => {
    render(<SegmentsExample />);
    expect(screen.getByRole("radiogroup", { name: "Fietstype" })).toBeDefined();
    const road = screen.getByRole("radio", { name: "Race" });
    const gravel = screen.getByRole("radio", { name: "Gravel" });
    expect(road.getAttribute("aria-checked")).toBe("true");
    act(() => road.focus());
    fireEvent.keyDown(road, { key: "ArrowRight" });
    await waitFor(() => expect(gravel.getAttribute("aria-checked")).toBe("true"));
    expect(document.activeElement).toBe(gravel);
    // The next option is disabled, so ArrowRight wraps to the first item.
    fireEvent.keyDown(gravel, { key: "ArrowRight" });
    await waitFor(() => expect(road.getAttribute("aria-checked")).toBe("true"));
  });

  it("OptionCard retains selection, disabled and click contracts and optional check", () => {
    const onClick = vi.fn();
    const { rerender } = render(<OptionCard label="Comfort" description="Voor langere ritten." selected onClick={onClick} />);
    const option = screen.getByRole("button", { name: "Comfort Voor langere ritten." });
    expect(option.getAttribute("aria-pressed")).toBe("true");
    expect(option.className).toContain("bg-[var(--bbf-lime-zacht)]");
    fireEvent.click(option);
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(<OptionCard label="Comfort" showCheck={false} disabled onClick={onClick} />);
    const disabled = screen.getByRole("button", { name: "Comfort" });
    expect(disabled.querySelector("svg")).toBeNull();
    fireEvent.click(disabled);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("StepCard provides a named section, heading, step and child controls", () => {
    render(<StepCard number={1} title="Jouw lichaam" description="Meet zonder schoenen."><button>Meet verder</button></StepCard>);
    expect(screen.getByRole("region", { name: "Jouw lichaam" })).toBeDefined();
    expect(screen.getByRole("heading", { level: 2, name: "Jouw lichaam" })).toBeDefined();
    expect(screen.getByText("1").className).toContain("font-mono");
    expect(screen.getByRole("button", { name: "Meet verder" })).toBeDefined();
  });
});
