import { db } from "@/server/db";

/**
 * Ensure a user has at least one workspace.
 * If they don't, create a default "Personal" workspace.
 * Call this after sign-in / sign-up.
 */
export async function ensureDefaultWorkspace(userId: string): Promise<string> {
	const existing = await db.workspaceMember.findFirst({
		where: { userId },
		select: { workspaceId: true },
	});

	if (existing) return existing.workspaceId;

	// Create a default personal workspace
	const workspace = await db.workspace.create({
		data: {
			name: "Personal",
			slug: `personal-${userId.slice(0, 8)}`,
			ownerId: userId,
			members: {
				create: { userId, role: "OWNER" },
			},
			// Seed with default environments
			environments: {
				create: [
					{
						name: "Development",
						variables: { baseUrl: "http://localhost:3000" },
						isActive: true,
						sortOrder: 0,
					},
					{
						name: "Staging",
						variables: { baseUrl: "https://staging.example.com" },
						isActive: false,
						sortOrder: 1,
					},
					{
						name: "Production",
						variables: { baseUrl: "https://api.example.com" },
						isActive: false,
						sortOrder: 2,
					},
				],
			},
		},
	});

	return workspace.id;
}
