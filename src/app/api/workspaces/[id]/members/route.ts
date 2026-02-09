import type { NextRequest } from "next/server";
import { db } from "@/server/db";
import {
	requireAuth, isAuthError,
	requireWorkspacePermission, isRbacError,
	ok, serverError,
} from "@/server/api";

type Params = { params: Promise<{ id: string }> };

/** GET /api/workspaces/[id]/members — list workspace members */
export async function GET(request: NextRequest, { params }: Params) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const { id: workspaceId } = await params;

	const rbac = await requireWorkspacePermission(auth.userId, workspaceId, "workspace:read");
	if (isRbacError(rbac)) return rbac;

	try {
		const members = await db.workspaceMember.findMany({
			where: { workspaceId },
			include: {
				user: { select: { id: true, name: true, email: true, image: true } },
			},
			orderBy: { createdAt: "asc" },
		});

		return ok(members);
	} catch {
		return serverError();
	}
}
