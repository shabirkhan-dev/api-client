import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";

export interface AuthContext {
	userId: string;
	user: { id: string; name: string | null; email: string };
}

/**
 * Validate the session from request headers.
 * Returns the authenticated user context or a 401 response.
 */
export async function requireAuth(
	request: NextRequest,
): Promise<AuthContext | NextResponse> {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 },
			);
		}

		return {
			userId: session.user.id,
			user: {
				id: session.user.id,
				name: session.user.name ?? null,
				email: session.user.email,
			},
		};
	} catch {
		return NextResponse.json(
			{ error: "Unauthorized" },
			{ status: 401 },
		);
	}
}

/** Type guard: true when `requireAuth` returned a NextResponse (i.e. auth failed) */
export function isAuthError(
	result: AuthContext | NextResponse,
): result is NextResponse {
	return result instanceof NextResponse;
}
