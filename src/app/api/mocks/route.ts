import type { NextRequest } from "next/server";
import { db } from "@/server/db";
import {
	requireAuth, isAuthError,
	validateBody, isErrorResponse,
	ok, created, badRequest, forbidden, serverError,
} from "@/server/api";
import { createMockRouteSchema } from "@/server/api/schemas/mock-route";

/** GET /api/mocks?workspaceId=xxx — list mock routes for a workspace */
export async function GET(request: NextRequest) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const workspaceId = request.nextUrl.searchParams.get("workspaceId");
	if (!workspaceId) return badRequest("workspaceId query param is required");

	try {
		const member = await db.workspaceMember.findUnique({
			where: { workspaceId_userId: { workspaceId, userId: auth.userId } },
		});
		if (!member) return forbidden();

		const mocks = await db.mockRoute.findMany({
			where: { workspaceId },
			orderBy: { createdAt: "desc" },
		});

		return ok(mocks);
	} catch {
		return serverError();
	}
}

/** POST /api/mocks — create a mock route */
export async function POST(request: NextRequest) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const data = await validateBody(request, createMockRouteSchema);
	if (isErrorResponse(data)) return data;

	try {
		const member = await db.workspaceMember.findUnique({
			where: { workspaceId_userId: { workspaceId: data.workspaceId, userId: auth.userId } },
		});
		if (!member) return forbidden();

		const mock = await db.mockRoute.create({ data });
		return created(mock);
	} catch (err: unknown) {
		if (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "P2002") {
			return badRequest("A mock route with this method and path already exists");
		}
		return serverError();
	}
}
