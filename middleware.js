import { NextResponse } from "next/server";

// Runs on the server before a page renders. This is what actually
// enforces "only logged-in users can open the product pages" —
// checking in a React component would still briefly render the page
// before redirecting; middleware blocks it before any HTML is sent.
export function middleware(request) {
  const token = request.cookies.get("pad_token")?.value;
  const { pathname } = request.nextUrl;

  const isProtected = pathname.startsWith("/products");
  const isLoginPage = pathname === "/login";

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/products", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/products/:path*", "/login"],
};
