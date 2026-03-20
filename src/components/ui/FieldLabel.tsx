import { cn } from "@/utils/cn";
import { Label as PrototyperLabel } from "@/components/prototyper-ui/ui/label";
import { Tooltip } from "./Tooltip";

export interface FieldLabelProps {
  label: string;
  htmlFor?: string;
  tooltip?: string;
  tooltipLabel?: string;
  tooltipDescriptionId?: string;
  className?: string;
}

export function FieldLabel({
  label,
  htmlFor,
  tooltip,
  tooltipLabel,
  tooltipDescriptionId,
  className,
}: FieldLabelProps) {
  return (
    <div className={cn("mb-1.5 flex items-center gap-1.5", className)}>
      <PrototyperLabel
        htmlFor={htmlFor}
        className="block text-sm font-medium text-[color:var(--foreground)]"
      >
        {label}
      </PrototyperLabel>
      {tooltip && (
        <Tooltip
          content={tooltip}
          label={tooltipLabel ?? `${label} help`}
          descriptionId={tooltipDescriptionId}
        />
      )}
    </div>
  );
}
