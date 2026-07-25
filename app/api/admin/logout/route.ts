import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "../../../../lib/adminAuth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin-login", request.url));
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
