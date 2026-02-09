import type { NextRequest } from "next/server";
import { db } from "@/server/db";
import {
	requireAuth, isAuthError,
	requireWorkspacePermission, isRbacError,
	validateBody, isErrorResponse,
	ok, created, serverError,
} from "@/server/api";
import { createInviteSchema } from "@/server/api/schemas/member";

type Params = { params: Promise<{ id: string }> };

/** GET /api/workspaces/[id]/invites — list pending invites */
export async function GET(request: NextRequest, { params }: Params) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const { id: workspaceId } = await params;

	const rbac = await requireWorkspacePermission(auth.userId, workspaceId, "workspace:invite");
	if (isRbacError(rbac)) return rbac;

	try {
		const invites = await db.workspaceInvite.findMany({
			where: {
				workspaceId,
				expiresAt: { gt: new Date() }, // only show non-expired
			},
			include: {
				createdBy: { select: { id: true, name: true, email: true } },
			},
			orderBy: { createdAt: "desc" },
		});

		return ok(invites);
	} catch {
		return serverError();
	}
}

/** POST /api/workspaces/[id]/invites — create an invite */
export async function POST(request: NextRequest, { params }: Params) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const { id: workspaceId } = await params;

	const rbac = await requireWorkspacePermission(auth.userId, workspaceId, "workspace:invite");
	if (isRbacError(rbac)) return rbac;

	const data = await validateBody(request, createInviteSchema);
	if (isErrorResponse(data)) return data;

	try {
		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + data.expiresInHours);

		const invite = await db.workspaceInvite.create({
			data: {
				workspaceId,
				email: data.email,
				role: data.role,
				expiresAt,
				createdById: auth.userId,
			},
		});

		const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/invite/${invite.token}`;

		return created({ ...invite, inviteUrl });
	} catch {
		return serverError();
	}
}
