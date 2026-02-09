import type { NextRequest } from "next/server";
import { db } from "@/server/db";
import {
	requireAuth, isAuthError,
	validateBody, isErrorResponse,
	ok, created, badRequest, forbidden, serverError,
} from "@/server/api";
import { createEnvironmentSchema } from "@/server/api/schemas/environment";

/** GET /api/environments?workspaceId=xxx — list environments for a workspace */
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

		const environments = await db.environment.findMany({
			where: { workspaceId },
			orderBy: { sortOrder: "asc" },
		});

		return ok(environments);
	} catch {
		return serverError();
	}
}

/** POST /api/environments — create a new environment */
export async function POST(request: NextRequest) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const data = await validateBody(request, createEnvironmentSchema);
	if (isErrorResponse(data)) return data;

	try {
		const member = await db.workspaceMember.findUnique({
			where: { workspaceId_userId: { workspaceId: data.workspaceId, userId: auth.userId } },
		});
		if (!member) return forbidden();

		// If setting this as active, deactivate others first
		if (data.isActive) {
			await db.environment.updateMany({
				where: { workspaceId: data.workspaceId, isActive: true },
				data: { isActive: false },
			});
		}

		const env = await db.environment.create({
			data: {
				workspaceId: data.workspaceId,
				name: data.name,
				variables: data.variables as Record<string, string>,
				isActive: data.isActive,
			},
		});
		return created(env);
	} catch (err: unknown) {
		if (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "P2002") {
			return badRequest("An environment with this name already exists in this workspace");
		}
		return serverError();
	}
}
