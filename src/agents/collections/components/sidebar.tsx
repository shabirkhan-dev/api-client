"use client";

import {
	Add01Icon,
	ArrowDown01Icon,
	ArrowRight01Icon,
	Clock01Icon,
	Folder01Icon,
	Settings02Icon,
	StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useState } from "react";
import { Button } from "@/shared/components/ui";
import { cn, generateId } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/stores/app-store";
import { CollectionTree } from "./collection-tree";
import { EnvironmentSelector } from "./environment-selector";
import { FavoritesList } from "./favorites-list";
import { HistoryList } from "./history-list";

const ICON = 14;
const ICON_SM = 12;

interface SidebarSectionProps {
	title: string;
	icon: typeof Folder01Icon;
	defaultOpen?: boolean;
	count?: number;
	action?: React.ReactNode;
	children: React.ReactNode;
}

function SidebarSection({
	title,
	icon,
	defaultOpen = true,
	count,
	action,
	children,
}: SidebarSectionProps) {
	const [open, setOpen] = useState(defaultOpen);

	return (
		<div className="mx-2 my-2 border-b border-ctp-surface0/18 last:border-b-0">
			<div className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-ctp-surface0/15 transition-colors duration-150 cursor-pointer select-none rounded-[var(--radius-sm)]">
				<button
					type="button"
					onClick={() => setOpen(!open)}
					className="flex items-center gap-2.5 min-w-0 bg-transparent border-none cursor-pointer"
				>
					<HugeiconsIcon
						icon={open ? ArrowDown01Icon : ArrowRight01Icon}
						size={ICON_SM}
						className="text-ctp-overlay0 shrink-0"
					/>
					<HugeiconsIcon
						icon={icon}
						size={ICON}
						strokeWidth={1.5}
						className="text-ctp-overlay1 shrink-0"
					/>
					<span className="text-[12px] uppercase tracking-widest text-ctp-subtext0 font-semibold truncate">
						{title}
					</span>
				</button>
				<div className="flex items-center gap-1.5 shrink-0">
					{typeof count === "number" && count > 0 && (
						<button
							type="button"
							onClick={() => setOpen(!open)}
							className="text-[11px] text-ctp-overlay0 bg-ctp-surface0/30 rounded-full px-2.5 py-0.5 font-medium tabular-nums border-none cursor-pointer"
						>
							{count}
						</button>
					)}
					{action}
				</div>
			</div>

			<div
				className={cn(
					"overflow-hidden transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
					open
						? "max-h-[800px] opacity-100"
						: "max-h-0 opacity-0 py-0",
				)}
			>
				<div className="px-5 pb-4">{children}</div>
			</div>
		</div>
	);
}

export function Sidebar() {
	const {
		sidebarOpen,
		addCollection,
		interceptorEnabled,
		interceptorStats,
		favorites,
		history,
		collections,
	} = useAppStore();

	const handleAddCollection = useCallback(() => {
		addCollection({
			id: generateId("folder"),
			name: "New Collection",
			type: "folder",
			collapsed: false,
			children: [],
		});
	}, [addCollection]);

	const collectionsCount = collections.reduce((acc, node) => {
		if (node.type === "folder" && node.children) {
			return acc + node.children.length;
		}
		return acc + 1;
	}, 0);

	return (
		<aside
			className={cn(
				"flex flex-col overflow-hidden transition-all duration-300 ease-in-out shrink-0",
				sidebarOpen ? "w-72 opacity-100" : "w-0 opacity-0 pointer-events-none",
			)}
		>
			{sidebarOpen && (
				<div className="bg-gradient-to-b from-ctp-mantle/50 to-ctp-crust/40 border-r border-ctp-surface0/25 flex flex-col h-full animate-fade-in">
					{/* Collections */}
					<SidebarSection
						title="Collections"
						icon={Folder01Icon}
						defaultOpen
						count={collectionsCount}
						action={
							<Button variant="subtle" size="sm" onClick={handleAddCollection}>
								<HugeiconsIcon icon={Add01Icon} size={ICON} />
								<span>New</span>
							</Button>
						}
					>
						<div className="max-h-60 overflow-y-auto">
							<CollectionTree />
						</div>
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
						<SidebarSection
							title="Interceptor"
							icon={Settings02Icon}
							defaultOpen
						>
							<div className="grid grid-cols-3 gap-3">
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
										{
											label: "Blocked",
											value: interceptorStats.blocked,
											color: "text-ctp-red",
										},
									] as const
								).map((s) => (
									<div
										key={s.label}
										className="bg-ctp-mantle/45 rounded-[var(--radius-lg)] p-3 text-center border border-ctp-surface0/15 transition-all duration-[180ms] hover:bg-ctp-mantle/60 hover:border-ctp-surface0/30"
									>
										<div
											className={`text-[16px] font-bold tabular-nums ${s.color}`}
										>
											{s.value}
										</div>
										<div className="text-[10px] text-ctp-overlay0 uppercase tracking-wider font-medium mt-1.5">
											{s.label}
										</div>
									</div>
								))}
							</div>
						</SidebarSection>
					)}

					{/* Spacer */}
					<div className="flex-1 min-h-0" />

					{/* Environment — pinned to bottom */}
					<div className="border-t border-ctp-surface0/20 p-5">
						<EnvironmentSelector />
					</div>
				</div>
			)}
		</aside>
	);
}
