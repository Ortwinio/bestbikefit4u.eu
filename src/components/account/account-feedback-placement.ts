import { isProtectedAppPath, stripLocalePrefix } from "@/i18n/navigation";

export function accountFeedbackPlacement(pathname: string) {
  const internalPath = stripLocalePrefix(pathname);
  const hasAccountTabs = isProtectedAppPath(pathname)
    || ["/gearing", "/shoe-cleat-fit", "/app"].some((root) =>
      internalPath === root || internalPath.startsWith(`${root}/`));
  // Keep feedback after account content: a fixed desktop button can cover actions too.
  return hasAccountTabs
    ? "mb-[calc(92px+env(safe-area-inset-bottom))] md:static md:flex md:w-fit md:ml-auto md:mr-8 md:mb-8"
    : undefined;
}
