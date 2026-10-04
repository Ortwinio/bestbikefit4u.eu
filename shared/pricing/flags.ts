export function isPaidAccessEnforced(): boolean {
  return typeof window === "undefined"
    ? process.env.PAID_ACCESS_ENFORCED === "true"
    : process.env.NEXT_PUBLIC_PAID_ACCESS_ENFORCED === "true";
}
