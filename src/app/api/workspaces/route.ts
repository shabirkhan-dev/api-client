import type { NextRequest } from "next/server";
import { db } from "@/server/db";
import {
	requireAuth, isAuthError,
	validateBody, isErrorResponse,
	ok, created, serverError,
} from "@/server/api";
import { createWorkspaceSchema } from "@/server/api/schemas/workspace";

/** GET /api/workspaces — list workspaces the user owns or is a member of */
export async function GET(request: NextRequest) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	try {
		const workspaces = await db.workspace.findMany({
			where: {
				OR: [
					{ ownerId: auth.userId },
					{ members: { some: { userId: auth.userId } } },
				],
			},
			orderBy: { createdAt: "asc" },
			include: {
				_count: { select: { collections: true, members: true } },
			},
		});

		return ok(workspaces);
	} catch {
		return serverError();
	}
}

/** POST /api/workspaces — create a new workspace */
export async function POST(request: NextRequest) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const data = await validateBody(request, createWorkspaceSchema);
	if (isErrorResponse(data)) return data;

	try {
		const workspace = await db.workspace.create({
			data: {
				name: data.name,
				slug: data.slug,
				ownerId: auth.userId,
				members: {
					create: { userId: auth.userId, role: "OWNER" },
				},
			},
		});

		return created(workspace);
	} catch (err: unknown) {
		if (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "P2002") {
			return ok({ error: "A workspace with this slug already exists" }, 409);
		}
		return serverError();
	}
}
