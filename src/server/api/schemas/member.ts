import { z } from "zod";

export const updateMemberRoleSchema = z.object({
	role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
});

export const createInviteSchema = z.object({
	workspaceId: z.string().min(1),
	email: z.string().email().optional(),
	role: z.enum(["ADMIN", "MEMBER", "VIEWER"]).default("MEMBER"),
	/** Invite validity in hours (default 72h / 3 days) */
	expiresInHours: z.number().int().min(1).max(720).default(72),
});

export const acceptInviteSchema = z.object({
	token: z.string().min(1),
});
