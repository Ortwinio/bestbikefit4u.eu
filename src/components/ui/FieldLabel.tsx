import { cn } from "@/utils/cn";
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
    <div className={cn("mb-1 flex items-center gap-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
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
