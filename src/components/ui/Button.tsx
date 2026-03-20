import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { Button as PrototyperButton } from "@/components/prototyper-ui/ui/button";
import { cn } from "@/utils/cn";

const variantClassMap = {
  primary:
    "bg-[color:var(--primary)] text-[color:var(--primary-foreground)] shadow-sm hover:brightness-110",
  secondary:
    "bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)] hover:bg-[color:var(--accent)]",
  outline:
    "border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)] hover:bg-[color:var(--accent)]",
  ghost:
    "bg-transparent text-[color:var(--muted-foreground)] hover:bg-[color:var(--accent)] hover:text-[color:var(--foreground)] shadow-none",
  destructive:
    "bg-[color:var(--destructive)] text-[color:var(--destructive-foreground)] shadow-sm hover:brightness-110",
} as const;

const sizeClassMap = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClassMap;
  size?: keyof typeof sizeClassMap;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => (
    <PrototyperButton
      nativeButton
      ref={ref as never}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading ? true : undefined}
      variant="ghost"
      size="default"
      className={cn(
        "no-highlight inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] font-medium transition-all duration-200 motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50 focus-ring",
        sizeClassMap[size],
        variantClassMap[variant],
        className
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </PrototyperButton>
  )
);

Button.displayName = "Button";
