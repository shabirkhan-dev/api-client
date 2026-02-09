import type { NextRequest } from "next/server";
import { db } from "@/server/db";
import {
	requireAuth, isAuthError,
	validateBody, isErrorResponse,
	ok, created, badRequest, forbidden, serverError,
} from "@/server/api";
import { createCollectionSchema } from "@/server/api/schemas/collection";

/** GET /api/collections?workspaceId=xxx — list collections with nested items */
export async function GET(request: NextRequest) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const workspaceId = request.nextUrl.searchParams.get("workspaceId");
	if (!workspaceId) return badRequest("workspaceId query param is required");

	try {
		// Verify membership
		const member = await db.workspaceMember.findUnique({
			where: { workspaceId_userId: { workspaceId, userId: auth.userId } },
		});
		if (!member) return forbidden();

		const collections = await db.collection.findMany({
			where: { workspaceId },
			orderBy: { sortOrder: "asc" },
			include: {
				items: {
					orderBy: { sortOrder: "asc" },
				},
			},
		});

		return ok(collections);
	} catch {
		return serverError();
	}
}

/** POST /api/collections — create a new collection */
export async function POST(request: NextRequest) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const data = await validateBody(request, createCollectionSchema);
	if (isErrorResponse(data)) return data;

	try {
		const member = await db.workspaceMember.findUnique({
			where: { workspaceId_userId: { workspaceId: data.workspaceId, userId: auth.userId } },
		});
		if (!member) return forbidden();

		const collection = await db.collection.create({
			data: {
				workspaceId: data.workspaceId,
				name: data.name,
				description: data.description,
			},
		});

		return created(collection);
	} catch {
		return serverError();
	}
}
