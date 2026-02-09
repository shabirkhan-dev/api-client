import type { NextRequest } from "next/server";
import { db } from "@/server/db";
import {
	requireAuth, isAuthError,
	validateBody, isErrorResponse,
	ok, notFound, forbidden, noContent, serverError,
} from "@/server/api";
import { updateEnvironmentSchema } from "@/server/api/schemas/environment";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/environments/[id] — update environment */
export async function PATCH(request: NextRequest, { params }: Params) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const { id } = await params;
	const data = await validateBody(request, updateEnvironmentSchema);
	if (isErrorResponse(data)) return data;

	try {
		const env = await db.environment.findUnique({ where: { id } });
		if (!env) return notFound("Environment");

		const member = await db.workspaceMember.findUnique({
			where: {
				workspaceId_userId: {
					workspaceId: env.workspaceId,
					userId: auth.userId,
				},
			},
		});
		if (!member) return forbidden();

		// If setting this as active, deactivate others first
		if (data.isActive) {
			await db.environment.updateMany({
				where: { workspaceId: env.workspaceId, isActive: true, id: { not: id } },
				data: { isActive: false },
			});
		}

		const updated = await db.environment.update({
			where: { id },
			data: {
				...data,
				variables: data.variables as Record<string, string> | undefined,
			},
		});
		return ok(updated);
	} catch {
		return serverError();
	}
}

/** DELETE /api/environments/[id] — delete environment */
export async function DELETE(request: NextRequest, { params }: Params) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const { id } = await params;

	try {
		const env = await db.environment.findUnique({ where: { id } });
		if (!env) return notFound("Environment");

		const member = await db.workspaceMember.findUnique({
			where: {
				workspaceId_userId: {
					workspaceId: env.workspaceId,
					userId: auth.userId,
				},
			},
		});
		if (!member) return forbidden();

		await db.environment.delete({ where: { id } });
		return noContent();
	} catch {
		return serverError();
	}
}
