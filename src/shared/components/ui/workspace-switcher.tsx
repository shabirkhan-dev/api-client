"use client";

import {
	Add01Icon,
	ArrowDown01Icon,
	Delete01Icon,
	Edit02Icon,
	Settings01Icon,
	Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { useWorkspaceContext } from "@/shared/providers/workspace-provider";
import { ConfirmDialog, PromptDialog } from "./modal";

interface WorkspaceSwitcherProps {
	variant?: "header" | "sidebar";
}

export function WorkspaceSwitcher({ variant = "sidebar" }: WorkspaceSwitcherProps) {
	const {
		workspaces,
		activeWorkspace,
		switchWorkspace,
		createWorkspace,
		renameWorkspace,
		deleteWorkspace,
		workspaceBusy,
	} = useWorkspaceContext();
	const [open, setOpen] = useState(false);
	const [createOpen, setCreateOpen] = useState(false);
	const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
	const ref = useRef<HTMLDivElement>(null);
	const router = useRouter();

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const handleCreate = useCallback(
		async (name: string) => {
			await createWorkspace(name);
			setOpen(false);
		},
		[createWorkspace],
	);

	const handleRename = useCallback(
		async (name: string) => {
			if (renameTarget) await renameWorkspace(renameTarget.id, name);
		},
		[renameTarget, renameWorkspace],
	);

	const handleDelete = useCallback(async () => {
		if (deleteTarget) await deleteWorkspace(deleteTarget.id);
		setOpen(false);
	}, [deleteTarget, deleteWorkspace]);

	if (!activeWorkspace) return null;

	const isHeader = variant === "header";

	return (
		<>
			<div className="relative" ref={ref}>
				<button
					type="button"
					onClick={() => setOpen(!open)}
					className={cn(
						"flex items-center gap-2 rounded-md transition-all duration-150 cursor-pointer",
						"hover:bg-ctp-surface0/25",
						open && "bg-ctp-surface0/25",
						isHeader ? "h-8 px-2" : "w-full px-2.5 py-2",
					)}
				>
					<div
						className={cn(
							"rounded-md bg-gradient-to-br from-ctp-blue/20 to-ctp-sapphire/15 flex items-center justify-center ring-1 ring-ctp-surface1/20 shrink-0",
							isHeader ? "w-5 h-5" : "w-6 h-6",
						)}
					>
						<span
							className={cn(
								"font-bold text-ctp-blue leading-none",
								isHeader ? "text-[9px]" : "text-[10px]",
							)}
						>
							{activeWorkspace.name.charAt(0).toUpperCase()}
						</span>
					</div>
					<span
						className={cn(
							"font-medium text-ctp-text truncate",
							isHeader ? "text-[13px] max-w-[140px]" : "text-[13px] flex-1 text-left",
						)}
					>
						{activeWorkspace.name}
					</span>
					{workspaceBusy && (
						<span className="inline-block w-3 h-3 border-2 border-ctp-lavender/30 border-t-ctp-lavender rounded-full animate-spin shrink-0" />
					)}
					<HugeiconsIcon
						icon={ArrowDown01Icon}
						size={11}
						className={cn(
							"text-ctp-overlay0 shrink-0 transition-transform duration-150",
							open && "rotate-180",
						)}
					/>
				</button>

				{open && (
					<div
						className={cn(
							"absolute top-full mt-1 bg-gradient-to-b from-ctp-base/96 to-ctp-mantle/96 backdrop-blur-[24px] backdrop-saturate-[1.5] border border-ctp-surface1/25 shadow-[0_0_0_0.5px_inset,0_16px_40px_-16px_rgba(0,0,0,0.65)] shadow-ctp-surface1/10 rounded-[var(--radius-lg)] overflow-hidden animate-scale-in z-50",
							isHeader ? "left-0 w-60" : "left-0 right-0",
						)}
					>
						<div className="p-1 max-h-52 overflow-y-auto">
							{workspaces.map((ws) => (
								<div
									key={ws.id}
									className={cn(
										"flex items-center gap-2 w-full px-2.5 py-1.5 rounded-[var(--radius-sm)] text-[12px] transition-all duration-[130ms] group",
										ws.id === activeWorkspace.id
											? "bg-ctp-lavender/10 text-ctp-lavender"
											: "text-ctp-subtext0 hover:bg-ctp-surface0/40 hover:text-ctp-text",
									)}
								>
									<button
										type="button"
										onClick={() => {
											switchWorkspace(ws.id);
											setOpen(false);
										}}
										className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
									>
										<div className="w-[18px] h-[18px] rounded bg-gradient-to-br from-ctp-blue/20 to-ctp-sapphire/15 flex items-center justify-center shrink-0">
											<span className="text-[8px] font-bold text-ctp-blue leading-none">
												{ws.name.charAt(0).toUpperCase()}
											</span>
										</div>
										<span className="truncate flex-1 text-left">{ws.name}</span>
										{ws.id === activeWorkspace.id && (
											<HugeiconsIcon
												icon={Tick01Icon}
												size={13}
												className="text-ctp-lavender shrink-0"
											/>
										)}
									</button>

									{/* Inline actions */}
									<div className="flex items-center gap-px shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												setRenameTarget({ id: ws.id, name: ws.name });
											}}
											className="w-5 h-5 flex items-center justify-center rounded text-ctp-overlay0 hover:text-ctp-text hover:bg-ctp-surface0/40 cursor-pointer transition-colors"
											aria-label="Rename workspace"
										>
											<HugeiconsIcon icon={Edit02Icon} size={11} />
										</button>
										{workspaces.length > 1 && (
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													setDeleteTarget({ id: ws.id, name: ws.name });
												}}
												className="w-5 h-5 flex items-center justify-center rounded text-ctp-overlay0 hover:text-ctp-red hover:bg-ctp-red/10 cursor-pointer transition-colors"
												aria-label="Delete workspace"
											>
												<HugeiconsIcon icon={Delete01Icon} size={11} />
											</button>
										)}
									</div>
								</div>
							))}
						</div>

						<div className="border-t border-ctp-surface0/20 p-1 flex flex-col gap-px">
							<button
								type="button"
								onClick={() => {
									setOpen(false);
									setCreateOpen(true);
								}}
								className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-[var(--radius-sm)] text-[12px] text-ctp-subtext0 hover:bg-ctp-surface0/40 hover:text-ctp-text cursor-pointer transition-all duration-[130ms]"
							>
								<HugeiconsIcon icon={Add01Icon} size={13} />
								New workspace
							</button>
							<button
								type="button"
								onClick={() => {
									setOpen(false);
									router.push("/settings?tab=workspaces");
								}}
								className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-[var(--radius-sm)] text-[12px] text-ctp-subtext0 hover:bg-ctp-surface0/40 hover:text-ctp-text cursor-pointer transition-all duration-[130ms]"
							>
								<HugeiconsIcon icon={Settings01Icon} size={13} />
								Manage workspaces
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Create workspace dialog */}
			<PromptDialog
				open={createOpen}
				onClose={() => setCreateOpen(false)}
				onConfirm={handleCreate}
				title="New workspace"
				placeholder="Workspace name"
				confirmLabel="Create"
			/>

			{/* Rename workspace dialog */}
			<PromptDialog
				open={!!renameTarget}
				onClose={() => setRenameTarget(null)}
				onConfirm={handleRename}
				title="Rename workspace"
				placeholder="Workspace name"
				defaultValue={renameTarget?.name ?? ""}
				confirmLabel="Save"
			/>

			{/* Delete workspace confirm */}
			<ConfirmDialog
				open={!!deleteTarget}
				onClose={() => setDeleteTarget(null)}
				onConfirm={handleDelete}
				title="Delete workspace"
				message={`Are you sure you want to delete "${deleteTarget?.name}"? This will permanently remove all collections, items, and settings in this workspace.`}
				confirmLabel="Delete"
				variant="danger"
			/>
		</>
	);
}
