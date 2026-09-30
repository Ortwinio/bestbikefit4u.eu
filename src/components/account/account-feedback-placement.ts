import { isProtectedAppPath, stripLocalePrefix } from "@/i18n/navigation";

export function accountFeedbackPlacement(pathname: string) {
  const internalPath = stripLocalePrefix(pathname);
  const hasAccountTabs = isProtectedAppPath(pathname) || ["/gearing", "/shoe-cleat-fit", "/app"].some((root) => internalPath === root || internalPath.startsWith(`${root}/`));
  return hasAccountTabs
    ? "bottom-[calc(92px+env(safe-area-inset-bottom))] sm:bottom-[calc(92px+env(safe-area-inset-bottom))] md:bottom-6 lg:bottom-8"
    : undefined;
}
