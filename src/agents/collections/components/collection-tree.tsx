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

const IC = 13;
const IC_SM = 11;
const IC_ACT = 12;

/* ─── Inline action button ───────────────────────────── */

function ActionBtn({
	icon,
	label,
	onClick,
	danger,
}: {
	icon: typeof Delete01Icon;
	label: string;
	onClick: (e: React.MouseEvent) => void;
	danger?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`w-[18px] h-[18px] flex items-center justify-center rounded cursor-pointer transition-colors ${
				danger
					? "text-ctp-overlay0 hover:text-ctp-red hover:bg-ctp-red/10"
					: "text-ctp-overlay0 hover:text-ctp-text hover:bg-ctp-surface0/40"
			}`}
			aria-label={label}
		>
			<HugeiconsIcon icon={icon} size={IC_ACT} />
		</button>
	);
}

/* ─── Collection root node (top-level) ───────────────── */

function CollectionRoot({ node }: { node: CollectionTreeNode }) {
	const { deleteCollection, renameCollection, addItem } = useWorkspaceContext();
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
			<div className="mb-px">
				{/* Collection header — visually distinct from folders */}
				<div className="w-full flex items-center gap-[var(--space-sm)] py-[var(--space-sm)] px-[var(--space-md)] rounded-[var(--radius-sm)] text-[12px] hover:bg-ctp-surface0/20 transition-colors duration-150 group">
					<button
						type="button"
						onClick={() => setCollapsed(!collapsed)}
						className="flex items-center gap-[var(--space-sm)] flex-1 min-w-0 cursor-pointer"
					>
						<HugeiconsIcon
							icon={collapsed ? ArrowRight01Icon : ArrowDown01Icon}
							size={IC_SM}
							className="text-ctp-overlay0 shrink-0"
						/>
						<HugeiconsIcon icon={Layers01Icon} size={IC} className="text-ctp-mauve/70 shrink-0" />
						<span className="truncate font-semibold text-ctp-text">{node.name}</span>
						{childCount > 0 && (
							<span className="text-[10px] text-ctp-overlay0/50 tabular-nums">{childCount}</span>
						)}
					</button>

					{/* Hover actions */}
					<div className="flex items-center gap-px shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
						<ActionBtn
							icon={Globe02Icon}
							label="Add request"
							onClick={(e) => {
								e.stopPropagation();
								setAddRouteOpen(true);
							}}
						/>
						<ActionBtn
							icon={FolderAddIcon}
							label="Add folder"
							onClick={(e) => {
								e.stopPropagation();
								setAddFolderOpen(true);
							}}
						/>
						<ActionBtn
							icon={Edit02Icon}
							label="Rename collection"
							onClick={(e) => {
								e.stopPropagation();
								setRenameOpen(true);
							}}
						/>
						<ActionBtn
							icon={Delete01Icon}
							label="Delete collection"
							onClick={(e) => {
								e.stopPropagation();
								setDeleteOpen(true);
							}}
							danger
						/>
					</div>
				</div>

				{/* Children */}
				{!collapsed && (
					<div className="relative ml-2 pl-2 border-l border-ctp-surface0/15">
						{node.children && node.children.length > 0 ? (
							node.children.map((child) => (
								<ItemNode key={child.id} node={child} depth={1} collectionId={collectionId} />
							))
						) : (
							<div className="py-[var(--space-sm)] pl-2 text-[10px] text-ctp-overlay0/40 italic">
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
				onConfirm={async (name) => {
					await renameCollection(collectionId, name);
				}}
				title="Rename collection"
				placeholder="Collection name"
				defaultValue={node.name}
				confirmLabel="Save"
			/>
			<ConfirmDialog
				open={deleteOpen}
				onClose={() => setDeleteOpen(false)}
				onConfirm={async () => {
					await deleteCollection(collectionId);
				}}
				title="Delete collection"
				message={`Delete "${node.name}"${childCount > 0 ? ` and all ${childCount} item(s)` : ""}? This cannot be undone.`}
				confirmLabel="Delete"
				variant="danger"
			/>
			<PromptDialog
				open={addFolderOpen}
				onClose={() => setAddFolderOpen(false)}
				onConfirm={handleAddFolder}
				title="New folder"
				placeholder="Folder name"
				confirmLabel="Create"
			/>
			<RequestFormDialog
				open={addRouteOpen}
				onClose={() => setAddRouteOpen(false)}
				onConfirm={handleAddRoute}
				title="New request"
				confirmLabel="Create"
			/>
		</>
	);
}

/* ─── Item node (folder or request, depth >= 1) ─────── */

function ItemNode({
	node,
	depth,
	collectionId,
}: {
	node: CollectionTreeNode;
	depth: number;
	collectionId: string;
}) {
	const { loadRequestFromNode, activeRequestItemId } = useAppStore();
	const { deleteItem, renameItem, updateItem, addItem, duplicateItem } = useWorkspaceContext();
	const [collapsed, setCollapsed] = useState(node.collapsed ?? false);

	// Dialog state
	const [renameOpen, setRenameOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [addFolderOpen, setAddFolderOpen] = useState(false);
	const [addRouteOpen, setAddRouteOpen] = useState(false);
	const [editRouteOpen, setEditRouteOpen] = useState(false);

	const isActive = node.serverItemId === activeRequestItemId;

	const handleLoadRequest = useCallback(() => {
		loadRequestFromNode({
			id: node.id,
			name: node.name,
			type: node.type,
			method: node.method,
			url: node.url,
			headers: node.headers,
			body: node.body,
			params: node.params,
			serverItemId: node.serverItemId,
			serverCollectionId: node.serverCollectionId,
		});
	}, [node, loadRequestFromNode]);

	const handleDelete = useCallback(async () => {
		if (node.serverItemId) await deleteItem(node.serverItemId);
	}, [node.serverItemId, deleteItem]);

	const handleRename = useCallback(
		async (name: string) => {
			if (node.serverItemId) await renameItem(node.serverItemId, name);
		},
		[node.serverItemId, renameItem],
	);

	const handleAddFolder = useCallback(
		async (name: string) => {
			await addItem(collectionId, {
				type: "FOLDER",
				name,
				parentId: node.serverItemId,
			});
		},
		[collectionId, node.serverItemId, addItem],
	);

	const handleAddRoute = useCallback(
		async (name: string, method: HttpMethod) => {
			await addItem(collectionId, {
				type: "REQUEST",
				name,
				method,
				parentId: node.serverItemId,
			});
		},
		[collectionId, node.serverItemId, addItem],
	);

	const handleEditRoute = useCallback(
		async (data: { name: string; method: HttpMethod; url: string }) => {
			if (node.serverItemId) await updateItem(node.serverItemId, data);
		},
		[node.serverItemId, updateItem],
	);

	/* ── Folder item ─────────────────────────────────── */
	if (node.type === "folder") {
		const childCount = node.children?.length ?? 0;
		return (
			<>
				<div>
					<div className="w-full flex items-center gap-[var(--space-sm)] py-[var(--space-xs)] px-1 rounded-[var(--radius-sm)] text-[12px] hover:bg-ctp-surface0/15 transition-colors duration-150 text-ctp-subtext1 group">
						<button
							type="button"
							onClick={() => setCollapsed(!collapsed)}
							className="flex items-center gap-[var(--space-sm)] flex-1 min-w-0 cursor-pointer"
						>
							<HugeiconsIcon
								icon={collapsed ? ArrowRight01Icon : ArrowDown01Icon}
								size={IC_SM}
								className="text-ctp-overlay0 shrink-0"
							/>
							<HugeiconsIcon
								icon={collapsed ? Folder01Icon : FolderOpenIcon}
								size={IC}
								className="text-ctp-yellow/50 shrink-0"
							/>
							<span className="truncate font-medium">{node.name}</span>
							{childCount > 0 && (
								<span className="text-[10px] text-ctp-overlay0/50 tabular-nums">{childCount}</span>
							)}
						</button>

						<div className="flex items-center gap-px shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
							<ActionBtn
								icon={Globe02Icon}
								label="Add request"
								onClick={(e) => {
									e.stopPropagation();
									setAddRouteOpen(true);
								}}
							/>
							<ActionBtn
								icon={FolderAddIcon}
								label="Add subfolder"
								onClick={(e) => {
									e.stopPropagation();
									setAddFolderOpen(true);
								}}
							/>
							<ActionBtn
								icon={Edit02Icon}
								label="Rename"
								onClick={(e) => {
									e.stopPropagation();
									setRenameOpen(true);
								}}
							/>
							<ActionBtn
								icon={Delete01Icon}
								label="Delete"
								onClick={(e) => {
									e.stopPropagation();
									setDeleteOpen(true);
								}}
								danger
							/>
						</div>
					</div>

					{!collapsed && (
						<div className="relative ml-2 pl-2 border-l border-ctp-surface0/10">
							{node.children && node.children.length > 0 ? (
								node.children.map((child) => (
									<ItemNode
										key={child.id}
										node={child}
										depth={depth + 1}
										collectionId={collectionId}
									/>
								))
							) : (
								<div className="py-[var(--space-xs)] pl-1 text-[10px] text-ctp-overlay0/35 italic">
									Empty folder
								</div>
							)}
						</div>
					)}
				</div>

				{/* Dialogs */}
				<PromptDialog
					open={renameOpen}
					onClose={() => setRenameOpen(false)}
					onConfirm={handleRename}
					title="Rename folder"
					placeholder="Folder name"
					defaultValue={node.name}
					confirmLabel="Save"
				/>
				<ConfirmDialog
					open={deleteOpen}
					onClose={() => setDeleteOpen(false)}
					onConfirm={handleDelete}
					title="Delete folder"
					message={`Delete "${node.name}"${childCount > 0 ? ` and its ${childCount} item(s)` : ""}? This cannot be undone.`}
					confirmLabel="Delete"
					variant="danger"
				/>
				<PromptDialog
					open={addFolderOpen}
					onClose={() => setAddFolderOpen(false)}
					onConfirm={handleAddFolder}
					title="New subfolder"
					placeholder="Folder name"
					confirmLabel="Create"
				/>
				<RequestFormDialog
					open={addRouteOpen}
					onClose={() => setAddRouteOpen(false)}
					onConfirm={handleAddRoute}
					title="New request"
					confirmLabel="Create"
				/>
			</>
		);
	}

	/* ── Request item ────────────────────────────────── */
	return (
		<>
			<div
				className={cn(
					"w-full flex items-center gap-[var(--space-sm)] py-[var(--space-xs)] px-1 rounded-[var(--radius-sm)] text-[12px] transition-colors duration-150 cursor-pointer group",
					isActive ? "bg-ctp-lavender/10 ring-1 ring-ctp-lavender/15" : "hover:bg-ctp-surface0/15",
				)}
			>
				<button
					type="button"
					onClick={handleLoadRequest}
					className="flex items-center gap-[var(--space-sm)] flex-1 min-w-0 cursor-pointer"
				>
					<MethodBadge method={(node.method as HttpMethod) || "GET"} />
					<span
						className={cn(
							"truncate transition-colors duration-150",
							isActive
								? "text-ctp-lavender font-medium"
								: "text-ctp-subtext0 group-hover:text-ctp-text",
						)}
					>
						{node.name}
					</span>
				</button>

				{/* Hover actions */}
				<div className="flex items-center gap-px shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
					<ActionBtn
						icon={Copy01Icon}
						label="Duplicate"
						onClick={(e) => {
							e.stopPropagation();
							if (node.serverItemId) duplicateItem(node.serverItemId);
						}}
					/>
					<ActionBtn
						icon={Edit02Icon}
						label="Edit request"
						onClick={(e) => {
							e.stopPropagation();
							setEditRouteOpen(true);
						}}
					/>
					<ActionBtn
						icon={Delete01Icon}
						label="Delete"
						onClick={(e) => {
							e.stopPropagation();
							setDeleteOpen(true);
						}}
						danger
					/>
				</div>
			</div>

			{/* Edit dialog: name + method + URL */}
			<RequestEditDialog
				open={editRouteOpen}
				onClose={() => setEditRouteOpen(false)}
				onConfirm={handleEditRoute}
				title="Edit request"
				defaultName={node.name}
				defaultMethod={(node.method as HttpMethod) || "GET"}
				defaultUrl={node.url || ""}
			/>
			<ConfirmDialog
				open={deleteOpen}
				onClose={() => setDeleteOpen(false)}
				onConfirm={handleDelete}
				title="Delete request"
				message={`Delete "${node.name}"? This cannot be undone.`}
				confirmLabel="Delete"
				variant="danger"
			/>
		</>
	);
}

/* ─── Root ───────────────────────────────────────────── */

interface CollectionTreeProps {
	collections: CollectionTreeNode[];
}

export function CollectionTree({ collections }: CollectionTreeProps) {
	if (collections.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-[var(--space-xl)] px-[var(--space-lg)] text-center text-ctp-overlay0 text-[11px] gap-[var(--space-sm)]">
				<HugeiconsIcon icon={Layers01Icon} size={20} className="opacity-30 text-ctp-overlay0" />
				<span>No collections yet</span>
				<span className="text-[10px] text-ctp-overlay0/40">Click "New" above to create one</span>
			</div>
		);
	}

	return (
		<div className="flex-1 overflow-y-auto space-y-1">
			{collections.map((node) => (
				<CollectionRoot key={node.id} node={node} />
			))}
		</div>
	);
}
