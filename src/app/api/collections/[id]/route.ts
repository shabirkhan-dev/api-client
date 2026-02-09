import type { NextRequest } from "next/server";
import { db } from "@/server/db";
import {
	requireAuth, isAuthError,
	validateBody, isErrorResponse,
	ok, notFound, forbidden, noContent, serverError,
} from "@/server/api";
import { updateCollectionSchema } from "@/server/api/schemas/collection";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/collections/[id] — update collection */
export async function PATCH(request: NextRequest, { params }: Params) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const { id } = await params;
	const data = await validateBody(request, updateCollectionSchema);
	if (isErrorResponse(data)) return data;

	try {
		const collection = await db.collection.findUnique({
			where: { id },
			include: { workspace: { select: { ownerId: true } } },
		});
		if (!collection) return notFound("Collection");

		const member = await db.workspaceMember.findUnique({
			where: {
				workspaceId_userId: {
					workspaceId: collection.workspaceId,
					userId: auth.userId,
				},
			},
		});
		if (!member) return forbidden();

		const updated = await db.collection.update({ where: { id }, data });
		return ok(updated);
	} catch {
		return serverError();
	}
}

/** DELETE /api/collections/[id] — delete collection and all items */
export async function DELETE(request: NextRequest, { params }: Params) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const { id } = await params;

	try {
		const collection = await db.collection.findUnique({ where: { id } });
		if (!collection) return notFound("Collection");

		const member = await db.workspaceMember.findUnique({
			where: {
				workspaceId_userId: {
					workspaceId: collection.workspaceId,
					userId: auth.userId,
				},
			},
		});
		if (!member) return forbidden();

		await db.collection.delete({ where: { id } });
		return noContent();
	} catch {
		return serverError();
	}
}
