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

interface TabDef {
	id: WorkspaceTab;
	label: string;
	icon: IconSvgElement;
	description: string;
}

interface TabGroup {
	label: string;
	tabs: TabDef[];
}

const tabGroups: TabGroup[] = [
	{
		label: "Core",
		tabs: [
			{ id: "http", label: "HTTP", icon: Globe02Icon, description: "Send HTTP requests" },
			{ id: "websocket", label: "WebSocket", icon: Wifi01Icon, description: "Real-time WebSocket connections" },
			{ id: "graphql", label: "GraphQL", icon: CodeIcon, description: "GraphQL queries and mutations" },
		],
	},
	{
		label: "Testing",
		tabs: [
			{ id: "loadtest", label: "Load Test", icon: Timer01Icon, description: "Performance testing" },
			{ id: "security", label: "Security", icon: Shield01Icon, description: "Security scanner" },
			{ id: "profiler", label: "Profiler", icon: Activity01Icon, description: "Request profiling" },
			{ id: "mock", label: "Mock", icon: ServerStack01Icon, description: "Mock server" },
		],
	},
	{
		label: "Tools",
		tabs: [
			{ id: "chain", label: "Chain", icon: Link01Icon, description: "Request chaining" },
			{ id: "retry", label: "Retry", icon: Refresh01Icon, description: "Auto-retry logic" },
			{ id: "data", label: "Data", icon: Database01Icon, description: "Data generator" },
			{ id: "diff", label: "Diff", icon: GitCompareIcon, description: "Response diff viewer" },
		],
	},
	{
		label: "More",
		tabs: [
			{ id: "docs", label: "Docs", icon: Note01Icon, description: "API documentation" },
			{ id: "collab", label: "Collab", icon: UserGroupIcon, description: "Collaboration tools" },
		],
	},
];

export function WorkspaceTabs() {
	const { activeTab, setActiveTab, compactMode } = useAppStore();

	return (
		<div 
			className={cn(
				"flex items-center bg-ctp-mantle/60 backdrop-blur-xl backdrop-saturate-150 border border-ctp-surface0/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_16px_rgba(0,0,0,0.2)]",
				compactMode ? "gap-0.5 p-0.5 rounded-xl" : "gap-1 p-1.5 rounded-2xl"
			)}
		>
			{tabGroups.map((group, groupIndex) => (
				<div key={group.label} className="flex items-center">
					{/* Group label - shown on hover (hidden in compact) */}
					{!compactMode && (
						<div className="hidden lg:flex items-center px-2 py-1 mr-1">
							<span className="text-[10px] font-semibold text-ctp-overlay0/60 uppercase tracking-wider">
								{group.label}
							</span>
						</div>
					)}

					{/* Tabs in group */}
					<div className={cn(
						"flex items-center",
						compactMode ? "gap-px" : "gap-0.5"
					)}>
						{group.tabs.map((tab) => {
							const isActive = activeTab === tab.id;
							return (
								<button
									key={tab.id}
									type="button"
									onClick={() => setActiveTab(tab.id)}
									title={tab.description}
									className={cn(
										"relative flex items-center whitespace-nowrap cursor-pointer transition-all duration-200 select-none",
										compactMode 
											? "gap-1 px-2 py-1 rounded-lg text-[10px]" 
											: "gap-2 px-3 py-2 rounded-xl text-[12px] font-medium",
										isActive
											? "text-ctp-text bg-gradient-to-b from-ctp-surface0/80 to-ctp-surface0/50 shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]"
											: "text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-surface0/30"
									)}
								>
									<HugeiconsIcon
										icon={tab.icon}
										size={compactMode ? 12 : isActive ? 15 : 14}
										strokeWidth={isActive ? 2 : 1.5}
										className={cn(
											"transition-all duration-200",
											isActive ? "text-ctp-lavender" : "text-ctp-overlay1"
										)}
									/>
									{!compactMode && <span className="hidden sm:inline">{tab.label}</span>}
									
									{/* Active indicator dot */}
									{isActive && !compactMode && (
										<span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-ctp-lavender shadow-[0_0_8px_rgba(180,190,254,0.8)]" />
									)}
								</button>
							);
						})}
					</div>

					{/* Divider between groups */}
					{groupIndex < tabGroups.length - 1 && !compactMode && (
						<div className="w-px h-5 bg-ctp-surface0/30 mx-2" />
					)}
				</div>
			))}
		</div>
	);
}
