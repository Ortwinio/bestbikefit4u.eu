import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "./Button";
import { Select } from "./Select";
import { ErrorState, LoadingState } from "./States";
import { Progress } from "./Progress";
import { AccessibleDialog } from "./AccessibleDialog";

describe("ui primitive compatibility wrappers", () => {
  it("renders loading buttons as disabled", () => {
    const html = renderToStaticMarkup(<Button isLoading>Save</Button>);

    expect(html).toContain("disabled");
    expect(html).toContain("Save");
  });

  it("supports render-based link composition", () => {
    const html = renderToStaticMarkup(
      <Button render={<a href="/fit" />}>Start fit</Button>
    );

    expect(html).toContain('<a href="/fit"');
    expect(html).toContain("Start fit");
  });

  it("keeps select label and tooltip wiring intact", () => {
    const html = renderToStaticMarkup(
      <Select
        label="Bike type"
        tooltip="Choose the bike category."
        tooltipLabel="Bike type help"
        placeholder="Choose one"
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
    expect(html).toContain("Choose the bike category.");
    expect(html).toContain("Choose one");
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

    expect(html).toContain("Confirm action");
    expect(html).toContain("This action cannot be undone.");
    expect(html).toContain("Dialog content");
  });
});
