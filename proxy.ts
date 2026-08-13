import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (request.nextUrl.pathname === "/" && code) {
    const callback = new URL("/auth/callback", request.url);
    callback.searchParams.set("code", code);
    callback.searchParams.set("next", "/update-password");
    return NextResponse.redirect(callback);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
