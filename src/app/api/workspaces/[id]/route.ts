import type { NextRequest } from "next/server";
import { db } from "@/server/db";
import {
	requireAuth, isAuthError,
	validateBody, isErrorResponse,
	ok, notFound, forbidden, noContent, serverError,
} from "@/server/api";
import { updateWorkspaceSchema } from "@/server/api/schemas/workspace";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/workspaces/[id] — update workspace */
export async function PATCH(request: NextRequest, { params }: Params) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const { id } = await params;
	const data = await validateBody(request, updateWorkspaceSchema);
	if (isErrorResponse(data)) return data;

	try {
		const workspace = await db.workspace.findUnique({ where: { id } });
		if (!workspace) return notFound("Workspace");
		if (workspace.ownerId !== auth.userId) return forbidden();

		const updated = await db.workspace.update({
			where: { id },
			data,
		});

		return ok(updated);
	} catch {
		return serverError();
	}
}

/** DELETE /api/workspaces/[id] — delete workspace (owner only) */
export async function DELETE(request: NextRequest, { params }: Params) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const { id } = await params;

	try {
		const workspace = await db.workspace.findUnique({ where: { id } });
		if (!workspace) return notFound("Workspace");
		if (workspace.ownerId !== auth.userId) return forbidden();

		await db.workspace.delete({ where: { id } });
		return noContent();
	} catch {
		return serverError();
	}
}
