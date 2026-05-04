import { cn } from "@/utils/cn";

type BikePassportFooterLogoProps = {
  className?: string;
};

export function BikePassportFooterLogo({ className }: BikePassportFooterLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-xl border border-black/10 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary)_18%,white_82%)_0%,color-mix(in_oklch,var(--secondary)_24%,white_76%)_100%)] text-[color:color-mix(in_oklch,var(--primary)_90%,black_10%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_12px_24px_-18px_rgba(15,23,42,0.4)]",
        className
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <rect x="4.5" y="5.5" width="15" height="13" rx="3.2" />
        <path d="M8 10h8.2" />
        <path d="M8 13h4.5" />
        <circle cx="9" cy="17" r="1.6" />
        <circle cx="15.3" cy="17" r="1.6" />
        <path d="M10.4 17h3.3" />
        <path d="M15.8 8.2l1.6 1.6 2.4-2.8" />
      </svg>
    </span>
  );
}
