import type { NextRequest } from "next/server";
import { db } from "@/server/db";
import {
	requireAuth, isAuthError,
	requireWorkspacePermission, isRbacError,
	validateBody, isErrorResponse,
	ok, notFound, badRequest, noContent, serverError,
} from "@/server/api";
import { updateMemberRoleSchema } from "@/server/api/schemas/member";

type Params = { params: Promise<{ id: string; memberId: string }> };

/** PATCH /api/workspaces/[id]/members/[memberId] — update member role */
export async function PATCH(request: NextRequest, { params }: Params) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const { id: workspaceId, memberId } = await params;

	const rbac = await requireWorkspacePermission(auth.userId, workspaceId, "workspace:manage_members");
	if (isRbacError(rbac)) return rbac;

	const data = await validateBody(request, updateMemberRoleSchema);
	if (isErrorResponse(data)) return data;

	try {
		const target = await db.workspaceMember.findUnique({ where: { id: memberId } });
		if (!target || target.workspaceId !== workspaceId) return notFound("Member");

		// Cannot change the owner's role
		if (target.role === "OWNER") {
			return badRequest("Cannot change the workspace owner's role");
		}

		// Only owner can promote to ADMIN
		if (data.role === "ADMIN" && rbac.role !== "OWNER") {
			return badRequest("Only the workspace owner can assign the ADMIN role");
		}

		const updated = await db.workspaceMember.update({
			where: { id: memberId },
			data: { role: data.role },
			include: {
				user: { select: { id: true, name: true, email: true, image: true } },
			},
		});

		return ok(updated);
	} catch {
		return serverError();
	}
}

/** DELETE /api/workspaces/[id]/members/[memberId] — remove member */
export async function DELETE(request: NextRequest, { params }: Params) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const { id: workspaceId, memberId } = await params;

	const rbac = await requireWorkspacePermission(auth.userId, workspaceId, "workspace:manage_members");
	if (isRbacError(rbac)) return rbac;

	try {
		const target = await db.workspaceMember.findUnique({ where: { id: memberId } });
		if (!target || target.workspaceId !== workspaceId) return notFound("Member");

		// Cannot remove the owner
		if (target.role === "OWNER") {
			return badRequest("Cannot remove the workspace owner");
		}

		await db.workspaceMember.delete({ where: { id: memberId } });
		return noContent();
	} catch {
		return serverError();
	}
}
