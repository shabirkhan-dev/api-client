"use client";

import {
	Add01Icon,
	ArrowDown01Icon,
	CheckmarkCircle01Icon,
	Delete01Icon,
	Edit02Icon,
	Settings01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { useWorkspaceContext } from "@/shared/providers/workspace-provider";
import { ConfirmDialog, PromptDialog } from "./modal";

interface WorkspaceSwitcherProps {
	variant?: "header" | "sidebar";
	onOpenSettings?: () => void;
}

export function WorkspaceSwitcher({ variant = "sidebar", onOpenSettings }: WorkspaceSwitcherProps) {
	const {
		workspaces, activeWorkspace, switchWorkspace, createWorkspace,
		renameWorkspace, deleteWorkspace, workspaceBusy,
	} = useWorkspaceContext();
	const [open, setOpen] = useState(false);
	const [createOpen, setCreateOpen] = useState(false);
	const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const handleCreate = useCallback(async (name: string) => {
		await createWorkspace(name);
		setOpen(false);
	}, [createWorkspace]);

	const handleRename = useCallback(async (name: string) => {
		if (renameTarget) await renameWorkspace(renameTarget.id, name);
	}, [renameTarget, renameWorkspace]);

	const handleDelete = useCallback(async () => {
		if (deleteTarget) await deleteWorkspace(deleteTarget.id);
		setOpen(false);
	}, [deleteTarget, deleteWorkspace]);

	const handleOpenSettings = useCallback(() => {
		setOpen(false);
		onOpenSettings?.();
	}, [onOpenSettings]);

	if (!activeWorkspace) return null;

	const isHeader = variant === "header";

	return (
		<>
			<div className="relative" ref={ref}>
				<button
					type="button"
					onClick={() => setOpen(!open)}
					className={cn(
						"flex items-center rounded-xl transition-all duration-200 cursor-pointer hover:bg-ctp-surface0/25 active:scale-[0.98]",
						isHeader ? "h-8 px-2 gap-2" : "w-full px-3 py-2 gap-2.5",
						open && "bg-ctp-surface0/25"
					)}
				>
					<div className={cn(
						"rounded-lg bg-gradient-to-br from-ctp-blue/25 to-ctp-sapphire/15 flex items-center justify-center ring-1 ring-ctp-surface1/20 shrink-0",
						isHeader ? "w-6 h-6" : "w-8 h-8"
					)}>
						<span className={cn("font-bold text-ctp-blue leading-none", isHeader ? "text-[10px]" : "text-[12px]")}>
							{activeWorkspace.name.charAt(0).toUpperCase()}
						</span>
					</div>
					<span className={cn("font-semibold text-ctp-text truncate", isHeader ? "text-[12px] max-w-[120px]" : "text-[13px] flex-1 text-left")}>
						{activeWorkspace.name}
					</span>
					{workspaceBusy ? (
						<span className="inline-block w-3.5 h-3.5 border-2 border-ctp-lavender/30 border-t-ctp-lavender rounded-full animate-spin shrink-0" />
					) : (
						<HugeiconsIcon icon={ArrowDown01Icon} size={11} className={cn("text-ctp-overlay0 shrink-0 transition-transform duration-200", open && "rotate-180")} />
					)}
				</button>

				{/* Dropdown */}
				{open && (
					<div className={cn(
						"absolute top-full mt-2 bg-gradient-to-b from-ctp-mantle/98 to-ctp-crust/98 backdrop-blur-xl backdrop-saturate-150 border border-ctp-surface0/30 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.7)] rounded-2xl overflow-hidden animate-scale-in z-50",
						isHeader ? "left-0 w-64" : "left-0 right-0"
					)}>
						{/* Active Workspace */}
						<div className="px-3 py-3 border-b border-ctp-surface0/20">
							<div className="text-[10px] font-semibold text-ctp-overlay0 uppercase tracking-wider mb-2">Current Workspace</div>
							<div className="flex items-center gap-3">
								<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ctp-blue/25 to-ctp-sapphire/15 flex items-center justify-center ring-1 ring-ctp-surface1/20">
									<span className="text-[13px] font-bold text-ctp-blue">{activeWorkspace.name.charAt(0).toUpperCase()}</span>
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-[13px] font-semibold text-ctp-text truncate">{activeWorkspace.name}</p>
									<p className="text-[10px] text-ctp-overlay0 font-mono truncate">{activeWorkspace.slug}</p>
								</div>
							</div>
						</div>

						{/* Workspaces List */}
						<div className="p-2 max-h-56 overflow-y-auto">
							<div className="text-[10px] font-semibold text-ctp-overlay0 uppercase tracking-wider px-2 py-1.5">Switch Workspace</div>
							{workspaces.map((ws) => {
								const isActive = ws.id === activeWorkspace.id;
								return (
									<div
										key={ws.id}
										className={cn(
											"flex items-center gap-2 w-full px-2.5 py-2 rounded-xl text-[12px] transition-all duration-150 group",
											isActive ? "bg-ctp-lavender/10 text-ctp-lavender" : "text-ctp-subtext0 hover:bg-ctp-surface0/40 hover:text-ctp-text"
										)}
									>
										<button
											type="button"
											onClick={() => { switchWorkspace(ws.id); setOpen(false); }}
											className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
										>
											<div className="w-6 h-6 rounded-lg bg-gradient-to-br from-ctp-blue/20 to-ctp-sapphire/10 flex items-center justify-center">
												<span className="text-[10px] font-bold text-ctp-blue">{ws.name.charAt(0).toUpperCase()}</span>
											</div>
											<span className="truncate flex-1 text-left font-medium">{ws.name}</span>
											{isActive && <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-ctp-lavender shrink-0" />}
										</button>

										{!isActive && (
											<div className="flex items-center gap-px shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
												<button type="button" onClick={(e) => { e.stopPropagation(); setRenameTarget({ id: ws.id, name: ws.name }); }} className="w-5 h-5 flex items-center justify-center rounded-lg text-ctp-overlay0 hover:text-ctp-text hover:bg-ctp-surface0/40 cursor-pointer transition-colors" aria-label="Rename workspace">
													<HugeiconsIcon icon={Edit02Icon} size={12} />
												</button>
												{workspaces.length > 1 && (
													<button type="button" onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: ws.id, name: ws.name }); }} className="w-5 h-5 flex items-center justify-center rounded-lg text-ctp-overlay0 hover:text-ctp-red hover:bg-ctp-red/10 cursor-pointer transition-colors" aria-label="Delete workspace">
														<HugeiconsIcon icon={Delete01Icon} size={12} />
													</button>
												)}
											</div>
										)}
									</div>
								);
							})}
						</div>

						{/* Footer Actions */}
						<div className="border-t border-ctp-surface0/20 p-2 space-y-1">
							<button type="button" onClick={() => { setOpen(false); setCreateOpen(true); }} className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-[12px] text-ctp-subtext0 hover:bg-ctp-surface0/40 hover:text-ctp-text cursor-pointer transition-all duration-150">
								<div className="w-6 h-6 rounded-lg bg-ctp-green/10 flex items-center justify-center"><HugeiconsIcon icon={Add01Icon} size={13} className="text-ctp-green" /></div>
								<span className="font-medium">New workspace</span>
							</button>
							<button type="button" onClick={handleOpenSettings} className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-[12px] text-ctp-subtext0 hover:bg-ctp-surface0/40 hover:text-ctp-text cursor-pointer transition-all duration-150">
								<div className="w-6 h-6 rounded-lg bg-ctp-lavender/10 flex items-center justify-center"><HugeiconsIcon icon={Settings01Icon} size={13} className="text-ctp-lavender" /></div>
								<span className="font-medium">Manage workspaces</span>
							</button>
						</div>
					</div>
				)}
			</div>

			<PromptDialog open={createOpen} onClose={() => setCreateOpen(false)} onConfirm={handleCreate} title="New workspace" placeholder="Workspace name" confirmLabel="Create" />
			<PromptDialog open={!!renameTarget} onClose={() => setRenameTarget(null)} onConfirm={handleRename} title="Rename workspace" placeholder="Workspace name" defaultValue={renameTarget?.name ?? ""} confirmLabel="Save" />
			<ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete workspace" message={`Are you sure you want to delete "${deleteTarget?.name}"? This will permanently remove all collections, items, and settings in this workspace.`} confirmLabel="Delete" variant="danger" />
		</>
	);
}
