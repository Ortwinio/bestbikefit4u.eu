import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "./Button";
import { Select } from "./Select";
import { ErrorState, LoadingState } from "./States";
import { Progress } from "./Progress";
import { AccessibleDialog } from "./AccessibleDialog";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { CheckboxGroup, CheckboxGroupItem } from "./CheckboxGroup";
import { SegmentedControl, SegmentedControlItem } from "./SegmentedControl";
import { RadioGroup, RadioGroupItem } from "./RadioGroup";
import { Selectable } from "./Selectable";

describe("ui primitive compatibility wrappers", () => {
  it("renders loading buttons as disabled and pending", () => {
    const html = renderToStaticMarkup(
      <Button variant="primary" size="md" isLoading>
        Save
      </Button>
    );

    expect(html).toContain("disabled");
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain("Save");
    expect(html).toContain('data-slot="button"');
  });

  it("maps compatibility button aliases to the same upstream output", () => {
    const compatHtml = renderToStaticMarkup(
      <Button variant="primary" size="md">
        Launch
      </Button>
    );
    const upstreamHtml = renderToStaticMarkup(
      <Button variant="default" size="default">
        Launch
      </Button>
    );

    expect(compatHtml).toBe(upstreamHtml);
  });

  it("supports render-based link composition", () => {
    const html = renderToStaticMarkup(
      <Button render={<a href="/fit" />}>Start fit</Button>
    );

    expect(html).toContain('<a href="/fit"');
    expect(html).not.toContain("<button");
    expect(html).toContain("Start fit");
  });

  it("keeps select label, helper, error, and tooltip wiring intact", () => {
    const html = renderToStaticMarkup(
      <Select
        label="Bike type"
        tooltip="Choose the bike category."
        tooltipLabel="Bike type help"
        helperText="Used to narrow fit recommendations."
        error="Bike type is required."
        placeholder="Choose one"
        id="bike-type"
        aria-describedby="custom-note"
        value=""
        onChange={() => {}}
        options={[
          { value: "road", label: "Road" },
          { value: "gravel", label: "Gravel" },
        ]}
      />
    );

    expect(html).toContain("Bike type");
    expect(html).toContain('aria-label="Bike type help"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(
      'aria-describedby="custom-note bike-type-tooltip-description bike-type-error"'
    );
    expect(html).toContain("Choose the bike category.");
    expect(html).toContain("Choose one");
    expect(html).toContain("Bike type is required.");
    expect(html).not.toContain("Used to narrow fit recommendations.");
  });

  it("keeps error and loading states accessible", () => {
    const loadingHtml = renderToStaticMarkup(<LoadingState label="Loading profile" />);
    const errorHtml = renderToStaticMarkup(
      <ErrorState title="Failed" description="Please retry." />
    );

    expect(loadingHtml).toContain("Loading profile");
    expect(loadingHtml).toContain("progressbar");
    expect(errorHtml).toContain('role="alert"');
    expect(errorHtml).toContain("Please retry.");
  });

  it("renders progress with progressbar semantics", () => {
    const html = renderToStaticMarkup(<Progress value={40} max={100} label="Completion" />);

    expect(html).toContain("progressbar");
    expect(html).toContain('aria-label="Completion"');
    expect(html).toContain('aria-valuenow="40"');
    expect(html).toContain('aria-valuemax="100"');
    expect(html).toContain('data-slot="progress"');
    expect(html).toContain('data-slot="progress-track"');
    expect(html).toContain('data-slot="progress-indicator"');
  });

  it("preserves the bordered card alias while using the upstream card surface", () => {
    const html = renderToStaticMarkup(
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Card title</CardTitle>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>
    );

    expect(html).toContain('data-slot="card"');
    expect(html).toContain("Card title");
    expect(html).toContain("Body");
    expect(html).toContain("border");
  });

  it("renders accessible dialog with title and description", () => {
    const html = renderToStaticMarkup(
      <AccessibleDialog
        open={true}
        title="Confirm action"
        description="This action cannot be undone."
        onClose={() => {}}
      >
        <p>Dialog content</p>
      </AccessibleDialog>
    );

    expect(html).toContain('data-slot="dialog-content"');
    expect(html).toContain("Confirm action");
    expect(html).toContain("This action cannot be undone.");
    expect(html).toContain("Dialog content");
    expect(html).toContain("Close dialog");
  });

  it("renders segmented control semantics and checked state", () => {
    const html = renderToStaticMarkup(
      <SegmentedControl aria-label="Theme selection" defaultValue="dark">
        <SegmentedControlItem value="light">Light</SegmentedControlItem>
        <SegmentedControlItem value="dark">Dark</SegmentedControlItem>
      </SegmentedControl>
    );

    expect(html).toContain('data-slot="segmented-control"');
    expect(html).toContain('data-slot="segmented-control-item"');
    expect(html).toContain('role="radiogroup"');
    expect(html).toContain('aria-checked="true"');
  });

  it("renders radio group wrappers with the expected slots", () => {
    const html = renderToStaticMarkup(
      <RadioGroup value="weekly" onValueChange={() => {}}>
        <RadioGroupItem value="daily">Daily</RadioGroupItem>
        <RadioGroupItem value="weekly">Weekly</RadioGroupItem>
      </RadioGroup>
    );

    expect(html).toContain('data-slot="radio-group"');
    expect(html).toContain('data-slot="radio-group-item"');
    expect(html).toContain("Weekly");
  });

  it("renders checkbox group wrappers with the expected slots", () => {
    const html = renderToStaticMarkup(
      <CheckboxGroup value={["road"]} onValueChange={() => {}}>
        <CheckboxGroupItem value="road">Road</CheckboxGroupItem>
        <CheckboxGroupItem value="gravel">Gravel</CheckboxGroupItem>
      </CheckboxGroup>
    );

    expect(html).toContain('data-slot="checkbox-group"');
    expect(html).toContain('data-slot="checkbox-group-item"');
    expect(html).toContain("Road");
  });

  it("keeps selectable selection modes on the same primitives", () => {
    const radioHtml = renderToStaticMarkup(
      <Selectable mode="radio" value="road" selected={false} label="Road" />
    );
    const checkboxHtml = renderToStaticMarkup(
      <Selectable mode="checkbox" value="gravel" selected={false} label="Gravel" />
    );

    expect(radioHtml).toContain('data-slot="selectable"');
    expect(radioHtml).toContain("Road");
    expect(checkboxHtml).toContain('data-slot="selectable"');
    expect(checkboxHtml).toContain("Gravel");
  });
});
