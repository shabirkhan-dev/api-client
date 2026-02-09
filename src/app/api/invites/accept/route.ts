import type { NextRequest } from "next/server";
import { db } from "@/server/db";
import {
	requireAuth, isAuthError,
	validateBody, isErrorResponse,
	ok, badRequest, conflict, serverError,
} from "@/server/api";
import { acceptInviteSchema } from "@/server/api/schemas/member";

/** POST /api/invites/accept — accept a workspace invite */
export async function POST(request: NextRequest) {
	const auth = await requireAuth(request);
	if (isAuthError(auth)) return auth;

	const data = await validateBody(request, acceptInviteSchema);
	if (isErrorResponse(data)) return data;

	try {
		const invite = await db.workspaceInvite.findUnique({
			where: { token: data.token },
			include: { workspace: { select: { id: true, name: true, slug: true } } },
		});

		if (!invite) {
			return badRequest("Invalid invite link");
		}

		if (invite.expiresAt < new Date()) {
			return badRequest("This invite has expired");
		}

		// If invite was for a specific email, check it matches
		if (invite.email && invite.email !== auth.user.email) {
			return badRequest("This invite was sent to a different email address");
		}

		// Check if already a member
		const existing = await db.workspaceMember.findUnique({
			where: {
				workspaceId_userId: {
					workspaceId: invite.workspaceId,
					userId: auth.userId,
				},
			},
		});

		if (existing) {
			return conflict("You are already a member of this workspace");
		}

		// Add user as member and delete the invite
		const [member] = await db.$transaction([
			db.workspaceMember.create({
				data: {
					workspaceId: invite.workspaceId,
					userId: auth.userId,
					role: invite.role,
				},
				include: {
					workspace: { select: { id: true, name: true, slug: true } },
				},
			}),
			db.workspaceInvite.delete({ where: { id: invite.id } }),
		]);

		return ok(member);
	} catch {
		return serverError();
	}
}
