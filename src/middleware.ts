import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "@/i18n/config";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip API routes and static files
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // Check if pathname already has a locale
  const hasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (hasLocale) return NextResponse.next();

  // Detect locale from Accept-Language header or cookie
  const cookieLocale = request.cookies.get("locale")?.value;
  const acceptLang = request.headers.get("accept-language") || "";
  const detectedLocale =
    cookieLocale ||
    locales.find((l) => acceptLang.toLowerCase().includes(l)) ||
    defaultLocale;

  const url = request.nextUrl.clone();
  url.pathname = `/${detectedLocale}${pathname}`;
  const response = NextResponse.redirect(url);
  response.cookies.set("locale", detectedLocale, { maxAge: 60 * 60 * 24 * 365 });
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
