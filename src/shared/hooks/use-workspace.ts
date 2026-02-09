"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/shared/lib/auth-client";

export interface Workspace {
	id: string;
	name: string;
	slug: string;
	ownerId: string;
	counts?: { collections: number; members: number };
}

const ACTIVE_WORKSPACE_KEY = "nebula:activeWorkspaceId";

export function useWorkspace() {
	const { data: session } = useSession();
	const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
	const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(() => {
		if (typeof window === "undefined") return null;
		return localStorage.getItem(ACTIVE_WORKSPACE_KEY);
	});
	const [loading, setLoading] = useState(true);
	const [busy, setBusy] = useState(false);

	const refetch = useCallback(async () => {
		const res = await fetch("/api/workspaces");
		if (res.ok) {
			const data: Workspace[] = await res.json();
			setWorkspaces(data);
			return data;
		}
		return null;
	}, []);

	// Ensure a default workspace exists, then fetch all workspaces
	useEffect(() => {
		if (!session?.user) return;

		async function init() {
			try {
				await fetch("/api/workspaces/ensure", { method: "POST" });

				const res = await fetch("/api/workspaces");
				if (res.ok) {
					const data: Workspace[] = await res.json();
					setWorkspaces(data);

					if (data.length > 0) {
						const stored = localStorage.getItem(ACTIVE_WORKSPACE_KEY);
						const validStored = data.find((w) => w.id === stored);
						if (validStored) {
							setActiveWorkspaceId(validStored.id);
						} else {
							setActiveWorkspaceId(data[0].id);
							localStorage.setItem(ACTIVE_WORKSPACE_KEY, data[0].id);
						}
					}
				}
			} finally {
				setLoading(false);
			}
		}

		init();
	}, [session?.user]);

	const switchWorkspace = useCallback((id: string) => {
		setActiveWorkspaceId(id);
		localStorage.setItem(ACTIVE_WORKSPACE_KEY, id);
	}, []);

	const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) ?? null;

	/** Create a new workspace — throws on failure so dialogs stay open */
	const createWorkspace = useCallback(
		async (name: string) => {
			setBusy(true);
			try {
				const res = await fetch("/api/workspaces", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name }),
				});

				if (res.ok) {
					const ws: Workspace = await res.json();
					toast.success("Workspace created");
					await refetch();
					switchWorkspace(ws.id);
				} else {
					const err = await res.json().catch(() => ({}));
					toast.error(err.error ?? "Failed to create workspace");
					throw new Error("create_failed");
				}
			} finally {
				setBusy(false);
			}
		},
		[refetch, switchWorkspace],
	);

	/** Rename a workspace — throws on failure */
	const renameWorkspace = useCallback(
		async (id: string, name: string) => {
			setBusy(true);
			try {
				const res = await fetch(`/api/workspaces/${id}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name }),
				});

				if (res.ok) {
					toast.success("Workspace renamed");
					await refetch();
				} else {
					toast.error("Failed to rename workspace");
					throw new Error("rename_failed");
				}
			} finally {
				setBusy(false);
			}
		},
		[refetch],
	);

	/** Delete a workspace — throws on failure */
	const deleteWorkspace = useCallback(
		async (id: string) => {
			setBusy(true);
			try {
				const res = await fetch(`/api/workspaces/${id}`, {
					method: "DELETE",
				});

				if (res.ok) {
					toast.success("Workspace deleted");
					const data = await refetch();
					if (id === activeWorkspaceId && data && data.length > 0) {
						switchWorkspace(data[0].id);
					}
				} else {
					const err = await res.json().catch(() => ({}));
					toast.error(err.error ?? "Failed to delete workspace");
					throw new Error("delete_failed");
				}
			} finally {
				setBusy(false);
			}
		},
		[activeWorkspaceId, refetch, switchWorkspace],
	);

	return {
		workspaces,
		activeWorkspace,
		activeWorkspaceId,
		switchWorkspace,
		loading,
		busy,
		refetch,
		createWorkspace,
		renameWorkspace,
		deleteWorkspace,
	};
}
