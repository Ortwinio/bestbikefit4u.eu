import { renderPressureDisplay, type PressureDisplayData } from "../../../../shared/pressure/display";

/** Shared with the printed PDF. All markup is generated from validated numbers and fixed localized labels. */
export function PressureDisplay({ className, ...data }: PressureDisplayData & { className?: string }) {
  return <div className={className}>
    <div dangerouslySetInnerHTML={{ __html: renderPressureDisplay(data) }} />
  </div>;
}
