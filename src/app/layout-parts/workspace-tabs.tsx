"use client";

import {
	Activity01Icon,
	CodeIcon,
	Database01Icon,
	GitCompareIcon,
	Globe02Icon,
	Link01Icon,
	Note01Icon,
	Refresh01Icon,
	ServerStack01Icon,
	Shield01Icon,
	Timer01Icon,
	UserGroupIcon,
	Wifi01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/stores/app-store";
import type { WorkspaceTab } from "@/shared/types";

const tabs: { id: WorkspaceTab; label: string; icon: IconSvgElement }[] = [
	{ id: "http", label: "HTTP", icon: Globe02Icon },
	{ id: "websocket", label: "WebSocket", icon: Wifi01Icon },
	{ id: "loadtest", label: "Load Test", icon: Timer01Icon },
	{ id: "graphql", label: "GraphQL", icon: CodeIcon },
	{ id: "docs", label: "Docs", icon: Note01Icon },
	{ id: "diff", label: "Diff", icon: GitCompareIcon },
	{ id: "chain", label: "Chain", icon: Link01Icon },
	{ id: "security", label: "Security", icon: Shield01Icon },
	{ id: "retry", label: "Retry", icon: Refresh01Icon },
	{ id: "data", label: "Data", icon: Database01Icon },
	{ id: "collab", label: "Collab", icon: UserGroupIcon },
	{ id: "profiler", label: "Profiler", icon: Activity01Icon },
	{ id: "mock", label: "Mock", icon: ServerStack01Icon },
];

export function WorkspaceTabs() {
	const { activeTab, setActiveTab } = useAppStore();

	return (
		<div className="flex items-center gap-0.5 overflow-x-auto shrink-0 px-1 py-1 bg-ctp-mantle/40 rounded-lg border border-ctp-surface0/20">
			{tabs.map((tab) => {
				const isActive = activeTab === tab.id;
				return (
					<button
						key={tab.id}
						type="button"
						onClick={() => setActiveTab(tab.id)}
						className={cn(
							"flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150 whitespace-nowrap",
							isActive
								? "text-ctp-text bg-ctp-surface0/60 shadow-sm"
								: "text-ctp-overlay0 hover:text-ctp-subtext1 hover:bg-ctp-surface0/25",
						)}
					>
						<HugeiconsIcon
							icon={tab.icon}
							size={13}
							strokeWidth={isActive ? 2 : 1.5}
							className={isActive ? "text-ctp-lavender" : ""}
						/>
						{tab.label}
					</button>
				);
			})}
		</div>
	);
}
