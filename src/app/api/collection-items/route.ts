import type { NextRequest } from "next/server";
import { db } from "@/server/db";
import {
	requireAuth, isAuthError,
	validateBody, isErrorResponse,
	ok, created, badRequest, forbidden, serverError,
} from "@/server/api";
import { createCollectionItemSchema } from "@/server/api/schemas/collection";

/** GET /api/collection-items?collectionId=xxx — list items in a collection */
export async function GET(request: NextRequest) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const collectionId = request.nextUrl.searchParams.get("collectionId");
	if (!collectionId) return badRequest("collectionId query param is required");

	try {
		const collection = await db.collection.findUnique({
			where: { id: collectionId },
			select: { workspaceId: true },
		});
		if (!collection) return badRequest("Collection not found");

		const member = await db.workspaceMember.findUnique({
			where: {
				workspaceId_userId: {
					workspaceId: collection.workspaceId,
					userId: auth.userId,
				},
			},
		});
		if (!member) return forbidden();

		const items = await db.collectionItem.findMany({
			where: { collectionId },
			orderBy: { sortOrder: "asc" },
		});

		return ok(items);
	} catch {
		return serverError();
	}
}

/** POST /api/collection-items — create a new item in a collection */
export async function POST(request: NextRequest) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const data = await validateBody(request, createCollectionItemSchema);
	if (isErrorResponse(data)) return data;

	try {
		const collection = await db.collection.findUnique({
			where: { id: data.collectionId },
			select: { workspaceId: true },
		});
		if (!collection) return badRequest("Collection not found");

		const member = await db.workspaceMember.findUnique({
			where: {
				workspaceId_userId: {
					workspaceId: collection.workspaceId,
					userId: auth.userId,
				},
			},
		});
		if (!member) return forbidden();

		const item = await db.collectionItem.create({
			data: {
				collectionId: data.collectionId,
				parentId: data.parentId ?? null,
				type: data.type,
				name: data.name,
				method: data.method,
				url: data.url,
				headers: data.headers ?? undefined,
				body: data.body,
				params: data.params,
				auth: (data.auth as Record<string, string>) ?? undefined,
			},
		});

		return created(item);
	} catch {
		return serverError();
	}
}
