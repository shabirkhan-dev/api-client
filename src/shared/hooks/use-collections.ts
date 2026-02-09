"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { HttpMethod } from "@/shared/lib/catppuccin";

/* ─── Server types ───────────────────────────────────── */

export interface ServerCollectionItem {
	id: string;
	collectionId: string;
	parentId: string | null;
	type: "FOLDER" | "REQUEST";
	name: string;
	sortOrder: number;
	method: string | null;
	url: string | null;
	headers: Record<string, string> | null;
	body: string | null;
	params: string | null;
	auth: Record<string, unknown> | null;
}

export interface ServerCollection {
	id: string;
	workspaceId: string;
	name: string;
	description: string | null;
	sortOrder: number;
	items: ServerCollectionItem[];
}

/* ─── Tree node (client-side) ────────────────────────── */

export interface CollectionTreeNode {
	id: string;
	name: string;
	type: "folder" | "request";
	method?: HttpMethod;
	url?: string;
	headers?: string;
	body?: string;
	params?: string;
	collapsed?: boolean;
	children?: CollectionTreeNode[];
	/** server IDs for persistence */
	serverCollectionId?: string;
	serverItemId?: string;
}

/* ─── Transform flat items → nested tree ─────────────── */

function buildTree(collection: ServerCollection): CollectionTreeNode {
	const itemMap = new Map<string, CollectionTreeNode>();
	const rootChildren: CollectionTreeNode[] = [];

	// Create nodes
	for (const item of collection.items) {
		const node: CollectionTreeNode = {
			id: item.id,
			name: item.name,
			type: item.type === "FOLDER" ? "folder" : "request",
			method: (item.method as HttpMethod) ?? undefined,
			url: item.url ?? undefined,
			headers: item.headers ? JSON.stringify(item.headers) : undefined,
			body: item.body ?? undefined,
			params: item.params ?? undefined,
			collapsed: false,
			children: item.type === "FOLDER" ? [] : undefined,
			serverCollectionId: collection.id,
			serverItemId: item.id,
		};
		itemMap.set(item.id, node);
	}

	// Build hierarchy
	for (const item of collection.items) {
		const node = itemMap.get(item.id);
		if (!node) continue;

		if (item.parentId && itemMap.has(item.parentId)) {
			const parent = itemMap.get(item.parentId);
			parent?.children?.push(node);
		} else {
			rootChildren.push(node);
		}
	}

	return {
		id: collection.id,
		name: collection.name,
		type: "folder",
		collapsed: false,
		children: rootChildren,
		serverCollectionId: collection.id,
	};
}

/* ─── Hook ───────────────────────────────────────────── */

export function useCollections(activeWorkspaceId: string | null) {
	const [collections, setCollections] = useState<CollectionTreeNode[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchCollections = useCallback(async () => {
		if (!activeWorkspaceId) {
			setCollections([]);
			setLoading(false);
			return;
		}

		try {
			const res = await fetch(`/api/collections?workspaceId=${activeWorkspaceId}`);
			if (res.ok) {
				const data: ServerCollection[] = await res.json();
				setCollections(data.map(buildTree));
			}
		} finally {
			setLoading(false);
		}
	}, [activeWorkspaceId]);

	useEffect(() => {
		setLoading(true);
		fetchCollections();
	}, [fetchCollections]);

	const [busy, setBusy] = useState(false);

	/** Create a new collection — throws on failure so dialogs stay open */
	const addCollection = useCallback(
		async (name: string) => {
			if (!activeWorkspaceId) return;
			setBusy(true);
			try {
				const res = await fetch("/api/collections", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ workspaceId: activeWorkspaceId, name }),
				});

				if (res.ok) {
					toast.success("Collection created");
					await fetchCollections();
				} else {
					toast.error("Failed to create collection");
					throw new Error("create_failed");
				}
			} finally {
				setBusy(false);
			}
		},
		[activeWorkspaceId, fetchCollections],
	);

	/** Rename a collection — throws on failure */
	const renameCollection = useCallback(
		async (collectionId: string, name: string) => {
			setBusy(true);
			try {
				const res = await fetch(`/api/collections/${collectionId}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name }),
				});

				if (res.ok) {
					toast.success("Collection renamed");
					await fetchCollections();
				} else {
					toast.error("Failed to rename");
					throw new Error("rename_failed");
				}
			} finally {
				setBusy(false);
			}
		},
		[fetchCollections],
	);

	/** Delete a collection — throws on failure */
	const deleteCollection = useCallback(
		async (collectionId: string) => {
			setBusy(true);
			try {
				const res = await fetch(`/api/collections/${collectionId}`, {
					method: "DELETE",
				});

				if (res.ok) {
					toast.success("Collection deleted");
					await fetchCollections();
				} else {
					toast.error("Failed to delete");
					throw new Error("delete_failed");
				}
			} finally {
				setBusy(false);
			}
		},
		[fetchCollections],
	);

	/** Create an item — throws on failure */
	const addItem = useCallback(
		async (
			collectionId: string,
			item: {
				type: "FOLDER" | "REQUEST";
				name: string;
				parentId?: string;
				method?: string;
				url?: string;
			},
		) => {
			setBusy(true);
			try {
				const res = await fetch("/api/collection-items", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ collectionId, ...item }),
				});

				if (res.ok) {
					toast.success("Item created");
					await fetchCollections();
				} else {
					toast.error("Failed to create item");
					throw new Error("create_item_failed");
				}
			} finally {
				setBusy(false);
			}
		},
		[fetchCollections],
	);

	/** Rename an item — throws on failure */
	const renameItem = useCallback(
		async (itemId: string, name: string) => {
			setBusy(true);
			try {
				const res = await fetch(`/api/collection-items/${itemId}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name }),
				});

				if (res.ok) {
					toast.success("Renamed");
					await fetchCollections();
				} else {
					toast.error("Failed to rename");
					throw new Error("rename_failed");
				}
			} finally {
				setBusy(false);
			}
		},
		[fetchCollections],
	);

	/** Update an item — throws on failure */
	const updateItem = useCallback(
		async (
			itemId: string,
			data: {
				name?: string;
				method?: string;
				url?: string;
				headers?: Record<string, string>;
				body?: string;
				params?: string;
				auth?: Record<string, unknown>;
			},
		) => {
			setBusy(true);
			try {
				const res = await fetch(`/api/collection-items/${itemId}`, {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(data),
				});

				if (res.ok) {
					toast.success("Request updated");
					await fetchCollections();
				} else {
					toast.error("Failed to update");
					throw new Error("update_failed");
				}
			} finally {
				setBusy(false);
			}
		},
		[fetchCollections],
	);

	/** Delete an item — throws on failure */
	const deleteItem = useCallback(
		async (itemId: string) => {
			setBusy(true);
			try {
				const res = await fetch(`/api/collection-items/${itemId}`, {
					method: "DELETE",
				});

				if (res.ok) {
					toast.success("Item deleted");
					await fetchCollections();
				} else {
					toast.error("Failed to delete item");
					throw new Error("delete_failed");
				}
			} finally {
				setBusy(false);
			}
		},
		[fetchCollections],
	);

	/** Duplicate an item (creates a copy with " (copy)" suffix) */
	const duplicateItem = useCallback(
		async (itemId: string) => {
			setBusy(true);
			try {
				// Fetch the item to copy
				const res = await fetch(`/api/collection-items/${itemId}`);
				if (!res.ok) {
					toast.error("Failed to load item for duplication");
					return;
				}

				const item = await res.json();
				const createRes = await fetch("/api/collection-items", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						collectionId: item.collectionId,
						parentId: item.parentId ?? undefined,
						type: item.type,
						name: `${item.name} (copy)`,
						method: item.method ?? undefined,
						url: item.url ?? undefined,
						headers: item.headers ?? undefined,
						body: item.body ?? undefined,
						params: item.params ?? undefined,
						auth: item.auth ?? undefined,
					}),
				});

				if (createRes.ok) {
					toast.success("Duplicated");
					await fetchCollections();
				} else {
					toast.error("Failed to duplicate");
				}
			} finally {
				setBusy(false);
			}
		},
		[fetchCollections],
	);

	/** Count of all leaf items */
	const itemCount = collections.reduce((acc, col) => {
		return acc + (col.children?.length ?? 0);
	}, 0);

	return {
		collections,
		loading,
		busy,
		itemCount,
		addCollection,
		renameCollection,
		deleteCollection,
		addItem,
		renameItem,
		updateItem,
		deleteItem,
		duplicateItem,
		refetch: fetchCollections,
	};
}
