import { type NextRequest, NextResponse } from "next/server";

import CreateOrSetupDB from "./models/dbSetup";
import { AuthSession } from "./utils/AuthSession";

// all he sub paths of the protected paths will be protected
export const protectedPaths = ["/dashboard","/onboarding","/pending-request"];

export const NotAuthenticatedPath = ["/auth"];

export default async function Middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const isAuthenticated = await AuthSession.isAuthenticated();

  // console.log("isAuthenticated", isAuthenticated);
  await CreateOrSetupDB();

  if (protectedPaths.includes(pathname) && !isAuthenticated) {
    // console.log("redirecting to login");
    return NextResponse.redirect(new URL("/auth", req.nextUrl));
  }

  if (NotAuthenticatedPath.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // now the below code will even force it if the pathname starts with any of the protected paths

  const protectedPath = protectedPaths.find((path) =>
    pathname.startsWith(path)
  );
  if (protectedPath && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth", req.nextUrl));
  }

  // same for the not authenticated paths
  const notAuthenticatedPath = NotAuthenticatedPath.find((path) =>
    pathname.startsWith(path)
  );
  if (notAuthenticatedPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  /* match all request paths except for the the ones that starts with:
  - api
  - _next/static
  - _next/image
  - favicon.ico

  */
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
