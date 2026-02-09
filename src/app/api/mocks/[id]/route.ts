import type { NextRequest } from "next/server";
import { db } from "@/server/db";
import {
	requireAuth, isAuthError,
	validateBody, isErrorResponse,
	ok, notFound, forbidden, noContent, serverError,
} from "@/server/api";
import { updateMockRouteSchema } from "@/server/api/schemas/mock-route";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/mocks/[id] — update a mock route */
export async function PATCH(request: NextRequest, { params }: Params) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const { id } = await params;
	const data = await validateBody(request, updateMockRouteSchema);
	if (isErrorResponse(data)) return data;

	try {
		const mock = await db.mockRoute.findUnique({ where: { id } });
		if (!mock) return notFound("Mock route");

		const member = await db.workspaceMember.findUnique({
			where: {
				workspaceId_userId: {
					workspaceId: mock.workspaceId,
					userId: auth.userId,
				},
			},
		});
		if (!member) return forbidden();

		const updated = await db.mockRoute.update({ where: { id }, data });
		return ok(updated);
	} catch {
		return serverError();
	}
}

/** DELETE /api/mocks/[id] — delete a mock route */
export async function DELETE(request: NextRequest, { params }: Params) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const { id } = await params;

	try {
		const mock = await db.mockRoute.findUnique({ where: { id } });
		if (!mock) return notFound("Mock route");

		const member = await db.workspaceMember.findUnique({
			where: {
				workspaceId_userId: {
					workspaceId: mock.workspaceId,
					userId: auth.userId,
				},
			},
		});
		if (!member) return forbidden();

		await db.mockRoute.delete({ where: { id } });
		return noContent();
	} catch {
		return serverError();
	}
}
