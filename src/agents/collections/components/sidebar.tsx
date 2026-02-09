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

const IC = 13;
const IC_SM = 11;

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
}

function SidebarSection({
	title,
	icon,
	defaultOpen = true,
	count,
	busy,
	action,
	children,
}: SidebarSectionProps) {
	const [open, setOpen] = useState(defaultOpen);

	return (
		<div className="border-b border-ctp-surface0/15 last:border-b-0">
			<div className="flex items-center justify-between px-[var(--space-lg)] py-[var(--space-md)] hover:bg-ctp-surface0/10 transition-colors duration-150 cursor-pointer select-none">
				<button
					type="button"
					onClick={() => setOpen(!open)}
					className="flex items-center gap-[var(--space-sm)] min-w-0 bg-transparent border-none cursor-pointer"
				>
					<HugeiconsIcon
						icon={open ? ArrowDown01Icon : ArrowRight01Icon}
						size={IC_SM}
						className="text-ctp-overlay0 shrink-0"
					/>
					<HugeiconsIcon
						icon={icon}
						size={IC}
						strokeWidth={1.5}
						className="text-ctp-overlay1 shrink-0"
					/>
					<span className="text-[11px] uppercase tracking-widest text-ctp-subtext0 font-semibold truncate">
						{title}
					</span>
				</button>
				<div className="flex items-center gap-[var(--space-xs)] shrink-0">
					{busy && (
						<span className="inline-block w-3 h-3 border-[1.5px] border-ctp-lavender/25 border-t-ctp-lavender rounded-full animate-spin" />
					)}
					{typeof count === "number" && count > 0 && (
						<button
							type="button"
							onClick={() => setOpen(!open)}
							className="text-[10px] text-ctp-overlay0 bg-ctp-surface0/25 rounded-full px-[var(--space-sm)] py-px font-medium tabular-nums border-none cursor-pointer"
						>
							{count}
						</button>
					)}
					{action}
				</div>
			</div>

			<div
				className={cn(
					"overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
					open ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0",
				)}
			>
				<div className="px-[var(--space-lg)] pb-[var(--space-md)]">{children}</div>
			</div>
		</div>
	);
}

export function Sidebar() {
	const { sidebarOpen, interceptorEnabled, interceptorStats, favorites, history } = useAppStore();

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
					"flex flex-col overflow-hidden transition-all duration-300 ease-in-out shrink-0",
					sidebarOpen ? "w-[var(--sidebar-w)] opacity-100" : "w-0 opacity-0 pointer-events-none",
				)}
			>
				{sidebarOpen && (
					<div className="bg-gradient-to-b from-ctp-mantle/50 to-ctp-crust/40 border-r border-ctp-surface0/25 flex flex-col h-full animate-fade-in">
						{/* Search */}
						<div className="px-[var(--space-lg)] pt-[var(--space-md)] pb-[var(--space-xs)]">
							<div className="flex items-center gap-[var(--space-xs)] h-7 rounded-md bg-ctp-mantle/30 border border-ctp-surface0/20 px-[var(--space-sm)] focus-within:border-ctp-lavender/30 transition-colors">
								<HugeiconsIcon
									icon={Search01Icon}
									size={11}
									className="text-ctp-overlay0/50 shrink-0"
								/>
								<input
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search collections..."
									spellCheck={false}
									className="flex-1 bg-transparent text-[11px] text-ctp-text placeholder:text-ctp-overlay0/35 outline-none min-w-0"
								/>
								{searchQuery && (
									<button
										type="button"
										onClick={() => setSearchQuery("")}
										className="text-ctp-overlay0 hover:text-ctp-text cursor-pointer shrink-0"
									>
										<HugeiconsIcon icon={Cancel01Icon} size={10} />
									</button>
								)}
							</div>
						</div>

						{/* Collections */}
						<SidebarSection
							title="Collections"
							icon={Folder01Icon}
							defaultOpen
							count={collectionsCount}
							busy={collectionsBusy}
							action={
								<Button variant="subtle" size="sm" onClick={() => setCreateCollectionOpen(true)}>
									<HugeiconsIcon icon={Add01Icon} size={IC} />
									<span>New</span>
								</Button>
							}
						>
							{collectionsLoading ? (
								<div className="flex items-center justify-center py-[var(--space-lg)]">
									<span className="inline-block w-4 h-4 border-2 border-ctp-lavender/25 border-t-ctp-lavender rounded-full animate-spin" />
								</div>
							) : (
								<div className="max-h-56 overflow-y-auto">
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
						>
							<FavoritesList />
						</SidebarSection>

						{/* History */}
						<SidebarSection
							title="History"
							icon={Clock01Icon}
							defaultOpen={false}
							count={history.length}
						>
							<HistoryList />
						</SidebarSection>

						{/* Interceptor Stats */}
						{interceptorEnabled && (
							<SidebarSection title="Interceptor" icon={Settings02Icon} defaultOpen>
								<div className="grid grid-cols-3 gap-[var(--space-sm)]">
									{(
										[
											{
												label: "Caught",
												value: interceptorStats.intercepted,
												color: "text-ctp-blue",
											},
											{
												label: "Edited",
												value: interceptorStats.modified,
												color: "text-ctp-yellow",
											},
											{ label: "Blocked", value: interceptorStats.blocked, color: "text-ctp-red" },
										] as const
									).map((s) => (
										<div
											key={s.label}
											className="bg-ctp-mantle/40 rounded-[var(--radius-md)] p-[var(--space-md)] text-center border border-ctp-surface0/12 hover:bg-ctp-mantle/55 transition-colors"
										>
											<div className={`text-[14px] font-bold tabular-nums ${s.color}`}>
												{s.value}
											</div>
											<div className="text-[9px] text-ctp-overlay0 uppercase tracking-wider font-medium mt-0.5">
												{s.label}
											</div>
										</div>
									))}
								</div>
							</SidebarSection>
						)}

						{/* Spacer */}
						<div className="flex-1 min-h-0" />

						{/* Environment */}
						<div className="border-t border-ctp-surface0/15 p-[var(--space-lg)]">
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
