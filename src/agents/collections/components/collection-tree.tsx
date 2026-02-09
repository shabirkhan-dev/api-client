"use client";

import {
	ArrowDown01Icon,
	ArrowRight01Icon,
	Copy01Icon,
	Delete01Icon,
	Edit02Icon,
	Folder01Icon,
	FolderAddIcon,
	FolderOpenIcon,
	Globe02Icon,
	Layers01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useState } from "react";
import {
	ConfirmDialog,
	MethodBadge,
	PromptDialog,
	RequestEditDialog,
	RequestFormDialog,
} from "@/shared/components/ui";
import type { CollectionTreeNode } from "@/shared/hooks/use-collections";
import type { HttpMethod } from "@/shared/lib/catppuccin";
import { cn } from "@/shared/lib/utils";
import { useWorkspaceContext } from "@/shared/providers/workspace-provider";
import { useAppStore } from "@/shared/stores/app-store";

/* ─── Inline action button ───────────────────────────── */

function ActionBtn({
	icon,
	label,
	onClick,
	danger,
	compactMode = false,
}: {
	icon: typeof Delete01Icon;
	label: string;
	onClick: (e: React.MouseEvent) => void;
	danger?: boolean;
	compactMode?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex items-center justify-center rounded cursor-pointer transition-all duration-150",
				danger
					? "text-ctp-overlay0 hover:text-ctp-red hover:bg-ctp-red/10"
					: "text-ctp-overlay0 hover:text-ctp-text hover:bg-ctp-surface0/40",
				compactMode ? "w-5 h-5" : "w-6 h-6"
			)}
			aria-label={label}
		>
			<HugeiconsIcon icon={icon} size={compactMode ? 11 : 13} />
		</button>
	);
}

/* ─── Collection root node (top-level) ───────────────── */

function CollectionRoot({ node }: { node: CollectionTreeNode }) {
	const { deleteCollection, renameCollection, addItem } = useWorkspaceContext();
	const { compactMode } = useAppStore();
	const [collapsed, setCollapsed] = useState(node.collapsed ?? false);
	const [renameOpen, setRenameOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [addFolderOpen, setAddFolderOpen] = useState(false);
	const [addRouteOpen, setAddRouteOpen] = useState(false);

	const collectionId = node.serverCollectionId ?? "";
	const childCount = node.children?.length ?? 0;

	const handleAddFolder = useCallback(
		async (name: string) => {
			await addItem(collectionId, { type: "FOLDER", name });
		},
		[collectionId, addItem],
	);

	const handleAddRoute = useCallback(
		async (name: string, method: HttpMethod) => {
			await addItem(collectionId, { type: "REQUEST", name, method });
		},
		[collectionId, addItem],
	);

	return (
		<>
			<div className={compactMode ? "mb-0.5" : "mb-1"}>
				{/* Collection header — visually distinct from folders */}
				<div className={cn(
					"flex items-center transition-all duration-200 group",
					compactMode 
						? "gap-1 py-1 px-1.5 rounded-lg bg-ctp-surface0/10 hover:bg-ctp-surface0/20" 
						: "gap-1.5 py-2 px-2 rounded-xl bg-ctp-surface0/10 hover:bg-ctp-surface0/20"
				)}>
					<button
						type="button"
						onClick={() => setCollapsed(!collapsed)}
						className="flex items-center gap-1.5 flex-1 min-w-0 cursor-pointer"
					>
						<HugeiconsIcon
							icon={collapsed ? ArrowRight01Icon : ArrowDown01Icon}
							size={compactMode ? 10 : 12}
							className="text-ctp-overlay0 shrink-0"
						/>
						<div className={cn(
							"rounded-lg bg-gradient-to-br from-ctp-mauve/20 to-ctp-mauve/5 flex items-center justify-center ring-1 ring-ctp-mauve/20 shrink-0",
							compactMode ? "w-5 h-5" : "w-7 h-7"
						)}>
							<HugeiconsIcon icon={Layers01Icon} size={compactMode ? 12 : 14} className="text-ctp-mauve" />
						</div>
						<span className={cn(
							"truncate font-semibold text-ctp-text",
							compactMode ? "text-[11px]" : "text-[13px]"
						)}>
							{node.name}
						</span>
						{childCount > 0 && (
							<span className={cn(
								"text-ctp-overlay0/60 tabular-nums bg-ctp-surface0/30",
								compactMode ? "text-[9px] px-1 py-px rounded" : "text-[10px] px-1.5 py-0.5 rounded-full"
							)}>
								{childCount}
							</span>
						)}
					</button>

					{/* Hover actions */}
					<div className={cn(
						"flex items-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
						compactMode ? "gap-px" : "gap-0.5"
					)}>
						<ActionBtn icon={Globe02Icon} label="Add request" onClick={(e) => { e.stopPropagation(); setAddRouteOpen(true); }} compactMode={compactMode} />
						<ActionBtn icon={FolderAddIcon} label="Add folder" onClick={(e) => { e.stopPropagation(); setAddFolderOpen(true); }} compactMode={compactMode} />
						<ActionBtn icon={Edit02Icon} label="Rename collection" onClick={(e) => { e.stopPropagation(); setRenameOpen(true); }} compactMode={compactMode} />
						<ActionBtn icon={Delete01Icon} label="Delete collection" onClick={(e) => { e.stopPropagation(); setDeleteOpen(true); }} danger compactMode={compactMode} />
					</div>
				</div>

				{/* Children */}
				{!collapsed && (
					<div className={cn(
						"relative border-l-2 border-ctp-surface0/20",
						compactMode ? "ml-3 pl-2 mt-0.5" : "ml-4 pl-3 mt-1"
					)}>
						{node.children && node.children.length > 0 ? (
							<div className={compactMode ? "space-y-px" : "space-y-0.5"}>
								{node.children.map((child) => (
									<ItemNode key={child.id} node={child} depth={1} collectionId={collectionId} />
								))}
							</div>
						) : (
							<div className={cn(
								"text-ctp-overlay0/50 italic",
								compactMode ? "py-2 pl-1 text-[9px]" : "py-3 pl-2 text-[11px]"
							)}>
								Empty — add requests or folders
							</div>
						)}
					</div>
				)}
			</div>

			{/* Dialogs */}
			<PromptDialog
				open={renameOpen}
				onClose={() => setRenameOpen(false)}
				onConfirm={async (name) => { await renameCollection(collectionId, name); }}
				title="Rename collection"
				placeholder="Collection name"
				defaultValue={node.name}
				confirmLabel="Save"
			/>
			<ConfirmDialog
				open={deleteOpen}
				onClose={() => setDeleteOpen(false)}
				onConfirm={async () => { await deleteCollection(collectionId); }}
				title="Delete collection"
				message={`Delete "${node.name}"${childCount > 0 ? ` and all ${childCount} item(s)` : ""}? This cannot be undone.`}
				confirmLabel="Delete"
				variant="danger"
			/>
			<PromptDialog open={addFolderOpen} onClose={() => setAddFolderOpen(false)} onConfirm={handleAddFolder} title="New folder" placeholder="Folder name" confirmLabel="Create" />
			<RequestFormDialog open={addRouteOpen} onClose={() => setAddRouteOpen(false)} onConfirm={handleAddRoute} title="New request" confirmLabel="Create" />
		</>
	);
}

/* ─── Item node (folder or request, depth >= 1) ─────── */

function ItemNode({ node, depth, collectionId }: { node: CollectionTreeNode; depth: number; collectionId: string }) {
	const { loadRequestFromNode, activeRequestItemId, compactMode } = useAppStore();
	const { deleteItem, renameItem, updateItem, addItem, duplicateItem } = useWorkspaceContext();
	const [collapsed, setCollapsed] = useState(node.collapsed ?? false);

	const [renameOpen, setRenameOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [addFolderOpen, setAddFolderOpen] = useState(false);
	const [addRouteOpen, setAddRouteOpen] = useState(false);
	const [editRouteOpen, setEditRouteOpen] = useState(false);

	const isActive = node.serverItemId === activeRequestItemId;

	const handleLoadRequest = useCallback(() => {
		loadRequestFromNode({
			id: node.id, name: node.name, type: node.type, method: node.method, url: node.url,
			headers: node.headers, body: node.body, params: node.params,
			serverItemId: node.serverItemId, serverCollectionId: node.serverCollectionId,
		});
	}, [node, loadRequestFromNode]);

	const handleDelete = useCallback(async () => {
		if (node.serverItemId) await deleteItem(node.serverItemId);
	}, [node.serverItemId, deleteItem]);

	const handleRename = useCallback(async (name: string) => {
		if (node.serverItemId) await renameItem(node.serverItemId, name);
	}, [node.serverItemId, renameItem]);

	const handleAddFolder = useCallback(async (name: string) => {
		await addItem(collectionId, { type: "FOLDER", name, parentId: node.serverItemId });
	}, [collectionId, node.serverItemId, addItem]);

	const handleAddRoute = useCallback(async (name: string, method: HttpMethod) => {
		await addItem(collectionId, { type: "REQUEST", name, method, parentId: node.serverItemId });
	}, [collectionId, node.serverItemId, addItem]);

	const handleEditRoute = useCallback(async (data: { name: string; method: HttpMethod; url: string }) => {
		if (node.serverItemId) await updateItem(node.serverItemId, data);
	}, [node.serverItemId, updateItem]);

	/* ── Folder item ─────────────────────────────────── */
	if (node.type === "folder") {
		const childCount = node.children?.length ?? 0;
		return (
			<>
				<div>
					<div className={cn(
						"flex items-center transition-all duration-150 text-ctp-subtext1 group",
						compactMode 
							? "gap-1 py-1 px-1 rounded-lg hover:bg-ctp-surface0/15" 
							: "gap-1 py-1.5 px-2 rounded-xl hover:bg-ctp-surface0/15"
					)}>
						<button type="button" onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-1 flex-1 min-w-0 cursor-pointer">
							<HugeiconsIcon icon={collapsed ? ArrowRight01Icon : ArrowDown01Icon} size={compactMode ? 10 : 12} className="text-ctp-overlay0 shrink-0" />
							<div className={cn(
								"rounded-lg bg-ctp-yellow/10 flex items-center justify-center shrink-0",
								compactMode ? "w-5 h-5" : "w-6 h-6"
							)}>
								<HugeiconsIcon icon={collapsed ? Folder01Icon : FolderOpenIcon} size={compactMode ? 11 : 13} className="text-ctp-yellow/70" />
							</div>
							<span className={cn("truncate font-medium", compactMode ? "text-[11px]" : "text-[12px]")}>{node.name}</span>
							{childCount > 0 && (
								<span className={cn("text-ctp-overlay0/50 tabular-nums", compactMode ? "text-[9px]" : "text-[10px]")}>{childCount}</span>
							)}
						</button>

						<div className={cn("flex items-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity", compactMode ? "gap-px" : "gap-0.5")}>
							<ActionBtn icon={Globe02Icon} label="Add request" onClick={(e) => { e.stopPropagation(); setAddRouteOpen(true); }} compactMode={compactMode} />
							<ActionBtn icon={FolderAddIcon} label="Add subfolder" onClick={(e) => { e.stopPropagation(); setAddFolderOpen(true); }} compactMode={compactMode} />
							<ActionBtn icon={Edit02Icon} label="Rename" onClick={(e) => { e.stopPropagation(); setRenameOpen(true); }} compactMode={compactMode} />
							<ActionBtn icon={Delete01Icon} label="Delete" onClick={(e) => { e.stopPropagation(); setDeleteOpen(true); }} danger compactMode={compactMode} />
						</div>
					</div>

					{!collapsed && (
						<div className={cn("relative border-l-2 border-ctp-surface0/10", compactMode ? "ml-3 pl-2 mt-px" : "ml-4 pl-3 mt-0.5")}>
							{node.children && node.children.length > 0 ? (
								<div className={compactMode ? "space-y-px" : "space-y-0.5"}>
									{node.children.map((child) => (
										<ItemNode key={child.id} node={child} depth={depth + 1} collectionId={collectionId} />
									))}
								</div>
							) : (
								<div className={cn("text-ctp-overlay0/40 italic", compactMode ? "py-1 pl-1 text-[9px]" : "py-2 pl-1 text-[10px]")}>Empty folder</div>
							)}
						</div>
					)}
				</div>

				<PromptDialog open={renameOpen} onClose={() => setRenameOpen(false)} onConfirm={handleRename} title="Rename folder" placeholder="Folder name" defaultValue={node.name} confirmLabel="Save" />
				<ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Delete folder" message={`Delete "${node.name}"${childCount > 0 ? ` and its ${childCount} item(s)` : ""}? This cannot be undone.`} confirmLabel="Delete" variant="danger" />
				<PromptDialog open={addFolderOpen} onClose={() => setAddFolderOpen(false)} onConfirm={handleAddFolder} title="New subfolder" placeholder="Folder name" confirmLabel="Create" />
				<RequestFormDialog open={addRouteOpen} onClose={() => setAddRouteOpen(false)} onConfirm={handleAddRoute} title="New request" confirmLabel="Create" />
			</>
		);
	}

	/* ── Request item ────────────────────────────────── */
	return (
		<>
			<div className={cn(
				"flex items-center transition-all duration-200 cursor-pointer group",
				compactMode ? "gap-1 py-1 px-1 rounded-lg" : "gap-2 py-1.5 px-2 rounded-xl",
				isActive ? "bg-ctp-lavender/10 shadow-[0_0_0_1px_rgba(180,190,254,0.3)]" : "hover:bg-ctp-surface0/10"
			)}>
				<button type="button" onClick={handleLoadRequest} className="flex items-center gap-1 flex-1 min-w-0 cursor-pointer">
					<MethodBadge method={(node.method as HttpMethod) || "GET"} size={compactMode ? "sm" : "sm"} />
					<span className={cn("truncate transition-colors duration-150", isActive ? "text-ctp-lavender font-medium" : "text-ctp-subtext0 group-hover:text-ctp-text", compactMode ? "text-[11px]" : "text-[12px]")}>
						{node.name}
					</span>
				</button>

				<div className={cn("flex items-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity", compactMode ? "gap-px" : "gap-0.5")}>
					<ActionBtn icon={Copy01Icon} label="Duplicate" onClick={(e) => { e.stopPropagation(); if (node.serverItemId) duplicateItem(node.serverItemId); }} compactMode={compactMode} />
					<ActionBtn icon={Edit02Icon} label="Edit request" onClick={(e) => { e.stopPropagation(); setEditRouteOpen(true); }} compactMode={compactMode} />
					<ActionBtn icon={Delete01Icon} label="Delete" onClick={(e) => { e.stopPropagation(); setDeleteOpen(true); }} danger compactMode={compactMode} />
				</div>
			</div>

			<RequestEditDialog open={editRouteOpen} onClose={() => setEditRouteOpen(false)} onConfirm={handleEditRoute} title="Edit request" defaultName={node.name} defaultMethod={(node.method as HttpMethod) || "GET"} defaultUrl={node.url || ""} />
			<ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} title="Delete request" message={`Delete "${node.name}"? This cannot be undone.`} confirmLabel="Delete" variant="danger" />
		</>
	);
}

/* ─── Root ───────────────────────────────────────────── */

interface CollectionTreeProps {
	collections: CollectionTreeNode[];
}

export function CollectionTree({ collections }: CollectionTreeProps) {
	const { compactMode } = useAppStore();

	if (collections.length === 0) {
		return (
			<div className={cn("flex flex-col items-center justify-center text-center", compactMode ? "py-4 px-2" : "py-8 px-4")}>
				<div className={cn(
					"rounded-2xl bg-ctp-surface0/20 flex items-center justify-center mb-2",
					compactMode ? "w-8 h-8" : "w-12 h-12"
				)}>
					<HugeiconsIcon icon={Layers01Icon} size={compactMode ? 16 : 22} className="text-ctp-overlay0/50" />
				</div>
				<p className={cn("text-ctp-subtext0 font-medium", compactMode ? "text-[11px]" : "text-[12px]")}>No collections yet</p>
				{!compactMode && <p className="text-[11px] text-ctp-overlay0/50 mt-1">Click "New" to create one</p>}
			</div>
		);
	}

	return (
		<div className={compactMode ? "space-y-px" : "space-y-1"}>
			{collections.map((node) => (
				<CollectionRoot key={node.id} node={node} />
			))}
		</div>
	);
}
