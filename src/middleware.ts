import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((request) => {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !request.auth) {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
