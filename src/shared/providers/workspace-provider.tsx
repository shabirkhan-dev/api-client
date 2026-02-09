"use client";

import { createContext, type ReactNode, useContext } from "react";
import { type CollectionTreeNode, useCollections } from "@/shared/hooks/use-collections";
import { useWorkspace, type Workspace } from "@/shared/hooks/use-workspace";

interface WorkspaceContextValue {
	/* workspaces */
	workspaces: Workspace[];
	activeWorkspace: Workspace | null;
	activeWorkspaceId: string | null;
	switchWorkspace: (id: string) => void;
	loading: boolean;
	workspaceBusy: boolean;
	refetch: () => Promise<Workspace[] | null>;
	createWorkspace: (name: string) => Promise<void>;
	renameWorkspace: (id: string, name: string) => Promise<void>;
	deleteWorkspace: (id: string) => Promise<void>;

	/* collections (server-backed) */
	collections: CollectionTreeNode[];
	collectionsLoading: boolean;
	collectionsBusy: boolean;
	collectionsCount: number;
	addCollection: (name: string) => Promise<void>;
	renameCollection: (collectionId: string, name: string) => Promise<void>;
	deleteCollection: (collectionId: string) => Promise<void>;
	addItem: (
		collectionId: string,
		item: {
			type: "FOLDER" | "REQUEST";
			name: string;
			parentId?: string;
			method?: string;
			url?: string;
			headers?: Record<string, string>;
			body?: string;
			params?: string;
		},
	) => Promise<void>;
	renameItem: (itemId: string, name: string) => Promise<void>;
	updateItem: (
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
	) => Promise<void>;
	deleteItem: (itemId: string) => Promise<void>;
	duplicateItem: (itemId: string) => Promise<void>;
	refetchCollections: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
	const ws = useWorkspace();
	const col = useCollections(ws.activeWorkspaceId);

	const value: WorkspaceContextValue = {
		...ws,
		workspaceBusy: ws.busy,
		collections: col.collections,
		collectionsLoading: col.loading,
		collectionsBusy: col.busy,
		collectionsCount: col.itemCount,
		addCollection: col.addCollection,
		renameCollection: col.renameCollection,
		deleteCollection: col.deleteCollection,
		addItem: col.addItem,
		renameItem: col.renameItem,
		updateItem: col.updateItem,
		deleteItem: col.deleteItem,
		duplicateItem: col.duplicateItem,
		refetchCollections: col.refetch,
	};

	return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaceContext(): WorkspaceContextValue {
	const ctx = useContext(WorkspaceContext);
	if (!ctx) {
		throw new Error("useWorkspaceContext must be used within a WorkspaceProvider");
	}
	return ctx;
}
