import { NextResponse } from "next/server";
import type { WorkspaceRole } from "@/generated/prisma/client";
import { db } from "@/server/db";
import { forbidden } from "./errors";

/**
 * Role hierarchy: OWNER > ADMIN > MEMBER > VIEWER
 * Higher roles inherit all lower-role permissions.
 */
const ROLE_LEVEL: Record<WorkspaceRole, number> = {
	VIEWER: 0,
	MEMBER: 1,
	ADMIN: 2,
	OWNER: 3,
};

export type Permission =
	| "workspace:read"
	| "workspace:update"
	| "workspace:delete"
	| "workspace:manage_members"
	| "workspace:invite"
	| "collection:read"
	| "collection:write"
	| "collection:delete"
	| "environment:read"
	| "environment:write"
	| "environment:delete"
	| "history:read"
	| "history:write"
	| "mock:read"
	| "mock:write"
	| "mock:delete";

/** Minimum role required for each permission */
const PERMISSION_MAP: Record<Permission, WorkspaceRole> = {
	"workspace:read": "VIEWER",
	"workspace:update": "ADMIN",
	"workspace:delete": "OWNER",
	"workspace:manage_members": "ADMIN",
	"workspace:invite": "ADMIN",
	"collection:read": "VIEWER",
	"collection:write": "MEMBER",
	"collection:delete": "ADMIN",
	"environment:read": "VIEWER",
	"environment:write": "MEMBER",
	"environment:delete": "ADMIN",
	"history:read": "VIEWER",
	"history:write": "MEMBER",
	"mock:read": "VIEWER",
	"mock:write": "MEMBER",
	"mock:delete": "ADMIN",
};

/** Check if a role has a given permission */
export function hasPermission(role: WorkspaceRole, permission: Permission): boolean {
	const requiredLevel = ROLE_LEVEL[PERMISSION_MAP[permission]];
	const userLevel = ROLE_LEVEL[role];
	return userLevel >= requiredLevel;
}

export interface MemberContext {
	memberId: string;
	role: WorkspaceRole;
	workspaceId: string;
	userId: string;
}

/**
 * Check that a user is a member of a workspace and has the required permission.
 * Returns the member context or a 403 response.
 */
export async function requireWorkspacePermission(
	userId: string,
	workspaceId: string,
	permission: Permission,
): Promise<MemberContext | NextResponse> {
	const member = await db.workspaceMember.findUnique({
		where: { workspaceId_userId: { workspaceId, userId } },
	});

	if (!member) {
		return forbidden("You are not a member of this workspace");
	}

	if (!hasPermission(member.role, permission)) {
		return forbidden(`Insufficient permissions: requires ${PERMISSION_MAP[permission]} role or higher`);
	}

	return {
		memberId: member.id,
		role: member.role,
		workspaceId: member.workspaceId,
		userId: member.userId,
	};
}

/** Type guard for RBAC check failure */
export function isRbacError(
	result: MemberContext | NextResponse,
): result is NextResponse {
	return result instanceof NextResponse;
}
