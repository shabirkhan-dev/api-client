"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
				"flex flex-col gap-2 overflow-hidden transition-all duration-300 ease-out shrink-0",
				sidebarOpen ? "w-60 p-2" : "w-0 p-0",
			)}
		>
			{sidebarOpen && (
				<>
					<GlassPanel className="p-2.5 flex flex-col gap-2 flex-1 min-h-0">
						<div className="flex items-center justify-between">
							<LabelText>Collections</LabelText>
							<Button variant="subtle" size="xs" onClick={handleAddCollection}>
								<HugeiconsIcon icon={Add01Icon} size={11} />
								<span>New</span>
							</Button>
						</div>
						<CollectionTree />
					</GlassPanel>

					<GlassPanel className="p-2.5">
						<LabelText className="mb-1.5">Favorites</LabelText>
						<FavoritesList />
					</GlassPanel>

					<GlassPanel className="p-2.5">
						<LabelText className="mb-1.5">History</LabelText>
						<HistoryList />
					</GlassPanel>

					<GlassPanel className="p-2.5">
						<EnvironmentSelector />
					</GlassPanel>

					<GlassPanel className="p-2.5">
						<LabelText className="mb-1.5">Interceptor</LabelText>
						<div className="grid grid-cols-3 gap-1.5">
							{[
								{ label: "Caught", value: interceptorStats.intercepted, color: "text-ctp-blue" },
								{ label: "Edited", value: interceptorStats.modified, color: "text-ctp-yellow" },
								{ label: "Blocked", value: interceptorStats.blocked, color: "text-ctp-red" },
							].map((s) => (
								<div key={s.label} className="bg-ctp-crust/30 rounded-lg p-1.5 text-center">
									<div className={`text-[13px] font-semibold ${s.color}`}>{s.value}</div>
									<div className="text-[8px] text-ctp-overlay0 uppercase tracking-wider">
										{s.label}
									</div>
								</div>
							))}
						</div>
					</GlassPanel>
				</>
			)}
		</aside>
	);
}
