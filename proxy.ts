import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, authEnabled, sessionToken } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  if (!authEnabled()) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/login") ||
    pathname.startsWith("/api/logout")
  ) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  if (cookie && cookie === (await sessionToken())) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
