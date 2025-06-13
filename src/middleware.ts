import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

  const { userId, sessionClaims } = await auth();

  if (!userId) {
    if (pathname === '/onboard') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  const publicMetadata = sessionClaims?.publicMetadata as { onboarded?: boolean };
  const isOnboarded = publicMetadata?.onboarded === true;

  if (isOnboarded) {
    if (pathname === '/onboard') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  } else {
    if (pathname !== '/onboard') {
      return NextResponse.redirect(new URL('/onboard', req.url));
    }
    return NextResponse.next();
  }

});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};;
