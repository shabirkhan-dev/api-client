"use client";

import {
	Add01Icon,
	ArrowDown01Icon,
	ArrowRight01Icon,
	Cancel01Icon,
	Clock01Icon,
	Folder01Icon,
	Search01Icon,
	Settings02Icon,
	StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import { Button, PromptDialog } from "@/shared/components/ui";
import type { CollectionTreeNode } from "@/shared/hooks/use-collections";
import { cn } from "@/shared/lib/utils";
import { useWorkspaceContext } from "@/shared/providers/workspace-provider";
import { useAppStore } from "@/shared/stores/app-store";
import { CollectionTree } from "./collection-tree";
import { EnvironmentSelector } from "./environment-selector";
import { FavoritesList } from "./favorites-list";
import { HistoryList } from "./history-list";

/** Recursively filter a tree, keeping nodes whose name matches the query */
function filterTree(nodes: CollectionTreeNode[], query: string): CollectionTreeNode[] {
	const lower = query.toLowerCase();
	return nodes
		.map((node) => {
			const nameMatch = node.name.toLowerCase().includes(lower);
			const methodMatch = node.method?.toLowerCase().includes(lower) ?? false;
			const filteredChildren = node.children ? filterTree(node.children, query) : undefined;
			const hasMatchingChildren = filteredChildren && filteredChildren.length > 0;

			if (nameMatch || methodMatch || hasMatchingChildren) {
				return {
					...node,
					collapsed: false,
					children: hasMatchingChildren ? filteredChildren : node.children,
				};
			}
			return null;
		})
		.filter((n): n is CollectionTreeNode => n !== null);
}

interface SidebarSectionProps {
	title: string;
	icon: typeof Folder01Icon;
	defaultOpen?: boolean;
	count?: number;
	busy?: boolean;
	action?: React.ReactNode;
	children: React.ReactNode;
	color?: "default" | "blue" | "yellow" | "green" | "purple";
	compactMode?: boolean;
}

function SidebarSection({
	title,
	icon,
	defaultOpen = true,
	count,
	busy,
	action,
	children,
	color = "default",
	compactMode = false,
}: SidebarSectionProps) {
	const [open, setOpen] = useState(defaultOpen);

	const colorStyles = {
		default: "text-ctp-overlay1",
		blue: "text-ctp-blue",
		yellow: "text-ctp-yellow",
		green: "text-ctp-green",
		purple: "text-ctp-mauve",
	};

	return (
		<div className={compactMode ? "mb-1" : "mb-2"}>
			{/* Section Header */}
			<div 
				className={cn(
					"flex items-center justify-between transition-all duration-200 cursor-pointer select-none group",
					compactMode 
						? "px-2 py-1.5 rounded-lg bg-ctp-surface0/10 hover:bg-ctp-surface0/20" 
						: "px-3 py-2 rounded-xl bg-ctp-surface0/10 hover:bg-ctp-surface0/20"
				)}
				onClick={() => setOpen(!open)}
			>
				<div className={cn(
					"flex items-center min-w-0",
					compactMode ? "gap-1.5" : "gap-2.5"
				)}>
					<HugeiconsIcon
						icon={open ? ArrowDown01Icon : ArrowRight01Icon}
						size={compactMode ? 10 : 12}
						className="text-ctp-overlay0 shrink-0 transition-transform duration-200"
					/>
					<HugeiconsIcon
						icon={icon}
						size={compactMode ? 12 : 14}
						strokeWidth={1.5}
						className={cn(colorStyles[color], "shrink-0")}
					/>
					<span className={cn(
						"font-semibold text-ctp-subtext0 truncate",
						compactMode ? "text-[11px]" : "text-[12px]"
					)}>
						{title}
					</span>
					{typeof count === "number" && count > 0 && (
						<span className={cn(
							"font-medium bg-ctp-surface0/40 tabular-nums",
							compactMode 
								? "text-[9px] px-1.5 py-px rounded" 
								: "text-[10px] px-2 py-0.5 rounded-full"
						)}>
							{count}
						</span>
					)}
				</div>
				<div className="flex items-center gap-1 shrink-0">
					{busy && (
						<span className={cn(
							"inline-block border-2 border-ctp-lavender/30 border-t-ctp-lavender rounded-full animate-spin",
							compactMode ? "w-3 h-3" : "w-3.5 h-3.5"
						)} />
					)}
					{action}
				</div>
			</div>

			{/* Section Content */}
			<div
				className={cn(
					"overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
					open 
						? (compactMode ? "max-h-[600px] opacity-100 mt-0.5" : "max-h-[600px] opacity-100 mt-1") 
						: "max-h-0 opacity-0"
				)}
			>
				<div className={compactMode ? "px-1 py-0.5" : "px-2 py-1"}>{children}</div>
			</div>
		</div>
	);
}

export function Sidebar() {
	const { sidebarOpen, interceptorEnabled, interceptorStats, favorites, history, compactMode } = useAppStore();

	const { collections, collectionsLoading, collectionsBusy, collectionsCount, addCollection } =
		useWorkspaceContext();

	const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const filteredCollections = useMemo(
		() => (searchQuery.trim() ? filterTree(collections, searchQuery.trim()) : collections),
		[collections, searchQuery],
	);

	return (
		<>
			<aside
				className={cn(
					"flex flex-col overflow-hidden transition-all duration-300 ease-out shrink-0",
					sidebarOpen ? "w-[var(--sidebar-w)] opacity-100" : "w-0 opacity-0 pointer-events-none"
				)}
			>
				{sidebarOpen && (
					<div className="flex flex-col h-full animate-slide-in-left">
						{/* Sidebar Header */}
						<div className={cn(
							compactMode ? "px-3 pt-2 pb-1.5" : "px-4 pt-4 pb-3"
						)}>
							<h2 className={cn(
								"font-bold text-ctp-text tracking-tight",
								compactMode ? "text-[12px]" : "text-[13px]"
							)}>
								Explorer
							</h2>
							{!compactMode && (
								<p className="text-[11px] text-ctp-overlay0 mt-0.5">Manage your API collections</p>
							)}
						</div>

						{/* Search */}
						<div className={cn(
							compactMode ? "px-2 pb-1.5" : "px-4 pb-3"
						)}>
							<div className={cn(
								"flex items-center bg-ctp-surface0/15 border border-ctp-surface0/20 focus-within:border-ctp-lavender/30 focus-within:ring-2 focus-within:ring-ctp-lavender/10 transition-all duration-200",
								compactMode ? "h-7 gap-1.5 rounded-lg px-2" : "h-9 gap-2 rounded-xl px-3"
							)}>
								<HugeiconsIcon
									icon={Search01Icon}
									size={compactMode ? 11 : 13}
									className="text-ctp-overlay0/60 shrink-0"
								/>
								<input
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search..."
									spellCheck={false}
									className={cn(
										"flex-1 bg-transparent text-ctp-text placeholder:text-ctp-overlay0/40 outline-none min-w-0",
									compactMode ? "text-[11px]" : "text-[12px]"
									)}
								/>
								{searchQuery && (
									<button
										type="button"
										onClick={() => setSearchQuery("")}
										className={cn(
											"text-ctp-overlay0 hover:text-ctp-text transition-colors shrink-0 hover:bg-ctp-surface0/30 rounded",
											compactMode ? "p-0.5" : "p-1 rounded-lg"
										)}
									>
										<HugeiconsIcon icon={Cancel01Icon} size={compactMode ? 9 : 11} />
									</button>
								)}
							</div>
						</div>

						{/* Scrollable Content */}
						<div className={cn(
							"flex-1 overflow-y-auto min-h-0",
							compactMode ? "px-2 pb-2" : "px-3 pb-3"
						)}>
							{/* Collections */}
							<SidebarSection
								title="Collections"
								icon={Folder01Icon}
								defaultOpen
								count={collectionsCount}
								busy={collectionsBusy}
								color="yellow"
								compactMode={compactMode}
								action={
									<Button 
										variant="subtle" 
										size="sm" 
										onClick={(e) => {
											e.stopPropagation();
											setCreateCollectionOpen(true);
										}}
										className={compactMode ? "h-5 px-1.5 text-[10px]" : "h-7 px-2 text-[11px]"}
									>
										<HugeiconsIcon icon={Add01Icon} size={compactMode ? 11 : 13} />
										{!compactMode && <span className="hidden xl:inline">New</span>}
									</Button>
								}
							>
								{collectionsLoading ? (
									<div className={cn(
										"flex items-center justify-center",
										compactMode ? "py-4" : "py-8"
									)}>
										<div className={cn(
											"border-2 border-ctp-lavender/30 border-t-ctp-lavender rounded-full animate-spin",
											compactMode ? "w-4 h-4" : "w-5 h-5"
										)} />
									</div>
								) : (
									<div className={cn(
										"overflow-y-auto",
										compactMode ? "max-h-48 pr-0.5" : "max-h-64 pr-1"
									)}>
										<CollectionTree collections={filteredCollections} />
									</div>
								)}
							</SidebarSection>

							{/* Favorites */}
							<SidebarSection
								title="Favorites"
								icon={StarIcon}
								defaultOpen={favorites.length > 0}
								count={favorites.length}
								color="green"
								compactMode={compactMode}
							>
								<FavoritesList />
							</SidebarSection>

							{/* History */}
							<SidebarSection
								title="History"
								icon={Clock01Icon}
								defaultOpen={false}
								count={history.length}
								color="blue"
								compactMode={compactMode}
							>
								<HistoryList />
							</SidebarSection>

							{/* Interceptor Stats */}
							{interceptorEnabled && (
								<SidebarSection 
									title="Interceptor" 
									icon={Settings02Icon} 
									defaultOpen
									color="purple"
									compactMode={compactMode}
								>
									<div className={cn(
										"grid grid-cols-3 bg-ctp-surface0/10",
										compactMode ? "gap-1 p-1.5 rounded-lg" : "gap-2 p-2 rounded-xl"
									)}>
										{(
											[
												{ label: "Caught", value: interceptorStats.intercepted, color: "text-ctp-blue", bg: "bg-ctp-blue/10" },
												{ label: "Edited", value: interceptorStats.modified, color: "text-ctp-yellow", bg: "bg-ctp-yellow/10" },
												{ label: "Blocked", value: interceptorStats.blocked, color: "text-ctp-red", bg: "bg-ctp-red/10" },
											] as const
										).map((s) => (
											<div
												key={s.label}
												className={cn(
													"flex flex-col items-center justify-center",
													s.bg,
													compactMode ? "p-1 rounded" : "p-2 rounded-lg"
												)}
											>
												<div className={cn(
													"font-bold tabular-nums",
													s.color,
													compactMode ? "text-[12px]" : "text-[16px]"
												)}>
													{s.value}
												</div>
												<div className={cn(
													"text-ctp-overlay0 uppercase tracking-wider font-semibold",
													compactMode ? "text-[8px] mt-0" : "text-[9px] mt-0.5"
												)}>
													{s.label}
												</div>
											</div>
										))}
									</div>
								</SidebarSection>
							)}
						</div>

						{/* Environment Selector - Fixed at bottom */}
						<div className={cn(
							"border-t border-ctp-surface0/15",
							compactMode ? "px-2 pb-2 pt-1.5" : "px-3 pb-3 pt-2"
						)}>
							<EnvironmentSelector />
						</div>
					</div>
				)}
			</aside>

			{/* Create collection prompt */}
			<PromptDialog
				open={createCollectionOpen}
				onClose={() => setCreateCollectionOpen(false)}
				onConfirm={async (name) => {
					await addCollection(name);
				}}
				title="New collection"
				placeholder="Collection name"
				confirmLabel="Create"
			/>
		</>
	);
}
