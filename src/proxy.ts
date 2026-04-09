import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { BRAND } from "@/config/brand";
import {
  LOCALE_COOKIE_NAME,
  LOCALE_HEADER_NAME,
  type Locale,
} from "@/i18n/config";
import { decideProxyAction } from "@/i18n/proxyDecision";
import { extractLocaleFromPathname, stripLocalePrefix } from "@/i18n/navigation";

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

function rewriteToLocalizedInternalPath(
  request: NextRequest,
  pathname: string,
  locale: Locale
): NextResponse {
  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = stripLocalePrefix(pathname);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER_NAME, locale);

  const response = NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders,
    },
  });

  setLocaleCookie(response, locale);
  return response;
}

function shouldApplyNoIndexHeader(hostname: string): boolean {
  return hostname !== BRAND.host;
}

function applyDeploymentHeaders(request: NextRequest, response: NextResponse): NextResponse {
  if (shouldApplyNoIndexHeader(request.nextUrl.hostname)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  return response;
}

const convexAuthProxy = convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    const rawPathname = new URL(request.url).pathname;

    // Admin paths: protected, non-locale-prefixed — let the (dashboard) layout handle auth
    if (rawPathname.startsWith("/admin")) {
      const isAuthenticated = await convexAuth.isAuthenticated();
      if (!isAuthenticated) {
        return applyDeploymentHeaders(request, redirectToPath(request, "/login"));
      }
      return applyDeploymentHeaders(request, NextResponse.next());
    }

    const isAuthenticated = await convexAuth.isAuthenticated();
    const decision = decideProxyAction({
      pathname: rawPathname,
      cookieLocale: request.cookies.get(LOCALE_COOKIE_NAME)?.value,
      acceptLanguageHeader: request.headers.get("accept-language"),
      isAuthenticated,
    });

    if (decision.type === "bypass") {
      return applyDeploymentHeaders(request, NextResponse.next());
    }

    if (decision.type === "redirect" || decision.type === "auth_redirect") {
      if (decision.pathname === rawPathname) {
        const locale = extractLocaleFromPathname(rawPathname) ?? decision.locale;
        const response = rewriteToLocalizedInternalPath(request, rawPathname, locale);
        return applyDeploymentHeaders(request, response);
      }

      const response = redirectToPath(request, decision.pathname);
      setLocaleCookie(response, decision.locale);
      return applyDeploymentHeaders(request, response);
    }

    const response = rewriteToLocalizedInternalPath(
      request,
      decision.pathname,
      decision.locale
    );
    return applyDeploymentHeaders(request, response);
  }
);

export function proxy(...args: Parameters<typeof convexAuthProxy>) {
  return convexAuthProxy(...args);
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
