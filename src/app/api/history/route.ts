import type { NextRequest } from "next/server";
import { db } from "@/server/db";
import {
	requireAuth, isAuthError,
	validateBody, isErrorResponse,
	ok, created, badRequest, forbidden, serverError,
} from "@/server/api";
import { createHistorySchema } from "@/server/api/schemas/history";

/** GET /api/history?workspaceId=xxx&cursor=xxx&limit=50 — paginated history */
export async function GET(request: NextRequest) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const workspaceId = request.nextUrl.searchParams.get("workspaceId");
	if (!workspaceId) return badRequest("workspaceId query param is required");

	const cursor = request.nextUrl.searchParams.get("cursor");
	const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 50, 100);
	const favoritesOnly = request.nextUrl.searchParams.get("favorites") === "true";

	try {
		const member = await db.workspaceMember.findUnique({
			where: { workspaceId_userId: { workspaceId, userId: auth.userId } },
		});
		if (!member) return forbidden();

		const items = await db.requestHistory.findMany({
			where: {
				workspaceId,
				userId: auth.userId,
				...(favoritesOnly ? { isFavorite: true } : {}),
			},
			orderBy: { createdAt: "desc" },
			take: limit + 1, // fetch one extra to determine if there's a next page
			...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
		});

		const hasMore = items.length > limit;
		const data = hasMore ? items.slice(0, limit) : items;
		const nextCursor = hasMore ? data[data.length - 1]?.id : null;

		return ok({ items: data, nextCursor });
	} catch {
		return serverError();
	}
}

/** POST /api/history — record a new history entry */
export async function POST(request: NextRequest) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const data = await validateBody(request, createHistorySchema);
	if (isErrorResponse(data)) return data;

	try {
		const member = await db.workspaceMember.findUnique({
			where: { workspaceId_userId: { workspaceId: data.workspaceId, userId: auth.userId } },
		});
		if (!member) return forbidden();

		const entry = await db.requestHistory.create({
			data: {
				workspaceId: data.workspaceId,
				userId: auth.userId,
				method: data.method,
				url: data.url,
				status: data.status,
				statusText: data.statusText,
				responseTime: data.responseTime,
				responseSize: data.responseSize,
				requestHeaders: data.requestHeaders as Record<string, string> | undefined,
				requestBody: data.requestBody,
				responseHeaders: data.responseHeaders as Record<string, string> | undefined,
				responseBody: data.responseBody,
			},
		});

		return created(entry);
	} catch {
		return serverError();
	}
}
