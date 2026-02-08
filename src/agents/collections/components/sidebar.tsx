"use client";

import { Plus } from "lucide-react";
import { Button, GlassPanel, LabelText } from "@/shared/components/ui";
import { cn, generateId } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/stores/app-store";
import { CollectionTree } from "./collection-tree";
import { EnvironmentSelector } from "./environment-selector";
import { FavoritesList } from "./favorites-list";
import { HistoryList } from "./history-list";

export function Sidebar() {
	const { sidebarOpen, addCollection, interceptorStats } = useAppStore();

	const handleAddCollection = () => {
		addCollection({
			id: generateId("folder"),
			name: "New Collection",
			type: "folder",
			collapsed: false,
			children: [],
		});
	};

	return (
		<aside
			className={cn(
				"flex flex-col gap-3 overflow-hidden transition-all duration-300 ease-in-out",
				sidebarOpen ? "w-72 p-3" : "w-0 p-0",
			)}
		>
			{sidebarOpen && (
				<>
					<GlassPanel className="p-3 flex flex-col gap-3 flex-1 min-h-0">
						<div className="flex items-center justify-between">
							<LabelText>Collections</LabelText>
							<Button variant="kbd" size="sm" onClick={handleAddCollection}>
								<Plus size={12} />
								New
							</Button>
						</div>
						<CollectionTree />
					</GlassPanel>

					<GlassPanel className="p-3">
						<LabelText className="mb-2">Favorites</LabelText>
						<FavoritesList />
					</GlassPanel>

					<GlassPanel className="p-3">
						<LabelText className="mb-2">History (Last 50)</LabelText>
						<HistoryList />
					</GlassPanel>

					<GlassPanel className="p-3">
						<EnvironmentSelector />
					</GlassPanel>

					<GlassPanel className="p-3">
						<LabelText className="mb-2">Interceptor Stats</LabelText>
						<div className="grid grid-cols-3 gap-2">
							{[
								{ label: "Intercepted", value: interceptorStats.intercepted },
								{ label: "Modified", value: interceptorStats.modified },
								{ label: "Blocked", value: interceptorStats.blocked },
							].map((stat) => (
								<div key={stat.label} className="glass rounded-lg p-2 text-center">
									<div className="text-sm font-semibold text-ctp-text">{stat.value}</div>
									<div className="text-[9px] text-ctp-overlay0">{stat.label}</div>
								</div>
							))}
						</div>
					</GlassPanel>
				</>
			)}
		</aside>
	);
}
