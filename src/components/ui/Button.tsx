import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { Loader2 } from "lucide-react";
import { Button as PrototyperButton } from "@/components/prototyper-ui/ui/button";

type PrototyperButtonProps = ComponentPropsWithoutRef<typeof PrototyperButton>;
type ButtonVariant = NonNullable<PrototyperButtonProps["variant"]> | "primary";
type ButtonSize = NonNullable<PrototyperButtonProps["size"]> | "md";

export interface ButtonProps
  extends Omit<PrototyperButtonProps, "variant" | "size"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

function resolveVariant(variant: ButtonVariant | undefined) {
  if (!variant || variant === "primary") {
    return "default";
  }

  return variant;
}

function resolveSize(size: ButtonSize | undefined) {
  if (!size || size === "md") {
    return "default";
  }

  return size;
}

export const Button = forwardRef<HTMLElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      isPending = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const pending = isLoading || isPending;

    return (
      <PrototyperButton
        ref={ref as never}
        variant={resolveVariant(variant)}
        size={resolveSize(size)}
        isPending={pending}
        disabled={disabled || pending}
        aria-disabled={disabled || pending ? true : undefined}
        className={className}
        {...props}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {children}
      </PrototyperButton>
    );
  }
);

Button.displayName = "Button";

export { buttonVariants } from "@/components/prototyper-ui/ui/button";
