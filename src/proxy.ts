import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import {
  LOCALE_COOKIE_NAME,
  LOCALE_HEADER_NAME,
  type Locale,
} from "@/i18n/config";
import { isProtectedDashboardPath } from "@/i18n/navigation";
import { decideProxyAction } from "@/i18n/proxyDecision";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

function setLocaleCookie(response: NextResponse, locale: Locale) {
  response.cookies.set({
    name: LOCALE_COOKIE_NAME,
    value: locale,
    path: "/",
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function redirectToPath(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

const convexAuthProxy = convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    const { pathname } = request.nextUrl;
    const isAuthenticated = isProtectedDashboardPath(pathname)
      ? await convexAuth.isAuthenticated()
      : true;
    const decision = decideProxyAction({
      pathname,
      cookieLocale: request.cookies.get(LOCALE_COOKIE_NAME)?.value,
      acceptLanguageHeader: request.headers.get("accept-language"),
      isAuthenticated,
    });

    if (decision.type === "bypass") {
      return;
    }

    if (decision.type === "redirect" || decision.type === "auth_redirect") {
      const response = redirectToPath(request, decision.pathname);
      setLocaleCookie(response, decision.locale);
      return response;
    }

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = decision.pathname;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(LOCALE_HEADER_NAME, decision.locale);

    const response = NextResponse.rewrite(rewriteUrl, {
      request: {
        headers: requestHeaders,
      },
    });

    setLocaleCookie(response, decision.locale);
    return response;
  }
);

export function proxy(...args: Parameters<typeof convexAuthProxy>) {
  return convexAuthProxy(...args);
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
