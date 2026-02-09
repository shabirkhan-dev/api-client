import { type NextRequest, NextResponse } from "next/server";

// Routes that don't require authentication
const publicRoutes = [
	"/sign-in",
	"/sign-up",
	"/invite",
	"/api/auth",
];

function isPublicRoute(pathname: string): boolean {
	return publicRoutes.some((route) => pathname.startsWith(route));
}

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Allow public routes and static assets
	if (isPublicRoute(pathname) || pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
		return NextResponse.next();
	}

	// Check for session cookie (Better Auth uses __session or better-auth.session_token)
	const sessionCookie =
		request.cookies.get("better-auth.session_token") ??
		request.cookies.get("__session");

	if (!sessionCookie?.value) {
		const signInUrl = new URL("/sign-in", request.url);
		signInUrl.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(signInUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		// Match all routes except static files
		"/((?!_next/static|_next/image|favicon.ico).*)",
	],
};
