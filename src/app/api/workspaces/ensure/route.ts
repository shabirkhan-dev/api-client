import type { NextRequest } from "next/server";
import {
	requireAuth, isAuthError,
	ok, serverError,
} from "@/server/api";
import { ensureDefaultWorkspace } from "@/server/workspace";

/**
 * POST /api/workspaces/ensure
 * Ensure the authenticated user has at least one workspace.
 * Creates a default "Personal" workspace if none exists.
 * Returns the workspace ID.
 */
export async function POST(request: NextRequest) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	try {
		const workspaceId = await ensureDefaultWorkspace(auth.userId);
		return ok({ workspaceId });
	} catch {
		return serverError();
	}
}
