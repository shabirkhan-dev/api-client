import type { NextRequest } from "next/server";
import {
	forbidden,
	isAuthError,
	isErrorResponse,
	noContent,
	notFound,
	ok,
	requireAuth,
	serverError,
	validateBody,
} from "@/server/api";
import { updateCollectionItemSchema } from "@/server/api/schemas/collection";
import { db } from "@/server/db";

type Params = { params: Promise<{ id: string }> };

/** GET /api/collection-items/[id] — get a single item */
export async function GET(request: NextRequest, { params }: Params) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const { id } = await params;

	try {
		const item = await db.collectionItem.findUnique({
			where: { id },
			include: { collection: { select: { workspaceId: true } } },
		});
		if (!item) return notFound("Collection item");

		const member = await db.workspaceMember.findUnique({
			where: {
				workspaceId_userId: {
					workspaceId: item.collection.workspaceId,
					userId: auth.userId,
				},
			},
		});
		if (!member) return forbidden();

		return ok(item);
	} catch {
		return serverError();
	}
}

/** PATCH /api/collection-items/[id] — update a collection item */
export async function PATCH(request: NextRequest, { params }: Params) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const { id } = await params;
	const data = await validateBody(request, updateCollectionItemSchema);
	if (isErrorResponse(data)) return data;

	try {
		const item = await db.collectionItem.findUnique({
			where: { id },
			include: { collection: { select: { workspaceId: true } } },
		});
		if (!item) return notFound("Collection item");

		const member = await db.workspaceMember.findUnique({
			where: {
				workspaceId_userId: {
					workspaceId: item.collection.workspaceId,
					userId: auth.userId,
				},
			},
		});
		if (!member) return forbidden();

		const updateData: Record<string, unknown> = { ...data };
		// Prisma needs explicit handling for nullable relations
		if ("parentId" in data) {
			updateData.parent = data.parentId ? { connect: { id: data.parentId } } : { disconnect: true };
			delete updateData.parentId;
		}

		const updated = await db.collectionItem.update({ where: { id }, data: updateData });
		return ok(updated);
	} catch {
		return serverError();
	}
}

/** DELETE /api/collection-items/[id] — delete an item (and its children via cascade) */
export async function DELETE(request: NextRequest, { params }: Params) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const { id } = await params;

	try {
		const item = await db.collectionItem.findUnique({
			where: { id },
			include: { collection: { select: { workspaceId: true } } },
		});
		if (!item) return notFound("Collection item");

		const member = await db.workspaceMember.findUnique({
			where: {
				workspaceId_userId: {
					workspaceId: item.collection.workspaceId,
					userId: auth.userId,
				},
			},
		});
		if (!member) return forbidden();

		await db.collectionItem.delete({ where: { id } });
		return noContent();
	} catch {
		return serverError();
	}
}
