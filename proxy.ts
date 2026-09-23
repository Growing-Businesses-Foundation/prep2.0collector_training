import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    /*
     * Pass the requested pathname to the server layout.
     */
    const requestHeaders = new Headers(request.headers);

    requestHeaders.set("x-prep2-pathname", pathname);

    /*
     * These routes must always remain accessible.
     */

    // Maintenance page itself.
    if (pathname === "/maintenance") {
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    // Authentication endpoints.
    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    // Login page.
    if (pathname === "/login") {
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    /*
     * Static assets and Next.js internal resources.
     */
    if (
        pathname.startsWith("/_next") ||
        pathname === "/favicon.ico" ||
        pathname.startsWith("/images") ||
        pathname.startsWith("/icons")
    ) {
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    /*
     * Maintenance enforcement for application pages is handled
     * by app/layout.tsx.
     *
     * API maintenance enforcement will be handled separately so
     * APIs return JSON instead of HTML redirects.
     */
    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};