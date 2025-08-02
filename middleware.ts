import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/home",
  "/sign-in",
  "/sign-up",
]);

const isPublicApiRoute = createRouteMatcher([
  "/api/videos", // Only this API is public
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const pathname = new URL(req.url).pathname;
  const isApiRequest = pathname.startsWith("/api");
  const isHomePage = pathname === "/home";

  // 🔐 If user is signed in and visits a public auth route (except home), redirect to /home
  if (userId && isPublicRoute(req) && !isHomePage) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // 🔒 If not signed in and trying to access a private route
  if (!userId) {
    const tryingToAccessPrivatePage = !isPublicRoute(req) && !isApiRequest;
    const tryingToAccessPrivateApi = isApiRequest && !isPublicApiRoute(req);

    if (tryingToAccessPrivatePage || tryingToAccessPrivateApi) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all non-static routes and all API routes
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};
