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

const ICON_SIZE = 14;

interface TabDef {
	id: WorkspaceTab;
	label: string;
	icon: IconSvgElement;
}

interface TabGroup {
	label: string;
	tabs: TabDef[];
}

const tabGroups: TabGroup[] = [
	{
		label: "Core",
		tabs: [
			{ id: "http", label: "HTTP", icon: Globe02Icon },
			{ id: "websocket", label: "WebSocket", icon: Wifi01Icon },
			{ id: "graphql", label: "GraphQL", icon: CodeIcon },
		],
	},
	{
		label: "Testing",
		tabs: [
			{ id: "loadtest", label: "Load Test", icon: Timer01Icon },
			{ id: "security", label: "Security", icon: Shield01Icon },
			{ id: "profiler", label: "Profiler", icon: Activity01Icon },
			{ id: "mock", label: "Mock", icon: ServerStack01Icon },
		],
	},
	{
		label: "Tools",
		tabs: [
			{ id: "chain", label: "Chain", icon: Link01Icon },
			{ id: "retry", label: "Retry", icon: Refresh01Icon },
			{ id: "data", label: "Data Gen", icon: Database01Icon },
			{ id: "diff", label: "Diff", icon: GitCompareIcon },
		],
	},
	{
		label: "More",
		tabs: [
			{ id: "docs", label: "Docs", icon: Note01Icon },
			{ id: "collab", label: "Collab", icon: UserGroupIcon },
		],
	},
];

export function WorkspaceTabs() {
	const { activeTab, setActiveTab } = useAppStore();

	return (
		<div className="flex items-center gap-1 p-1.5 bg-ctp-mantle/50 rounded-[var(--radius-xl)] border border-ctp-surface0/20 overflow-x-auto overflow-y-hidden relative shrink-0 scrollbar-none">
			{tabGroups.map((group) => (
				<div
					key={group.label}
					className="flex items-center gap-0.5 relative [&+&]:before:content-[''] [&+&]:before:w-px [&+&]:before:h-5 [&+&]:before:bg-ctp-surface1/30 [&+&]:before:mx-1.5 [&+&]:before:rounded-full [&+&]:before:shrink-0"
				>
					{group.tabs.map((tab) => {
						const isActive = activeTab === tab.id;
						return (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveTab(tab.id)}
								className={cn(
									"flex items-center gap-[7px] px-3.5 py-2 rounded-[var(--radius-md)] text-[13px] font-medium whitespace-nowrap cursor-pointer border border-transparent transition-all duration-[180ms] ease-[cubic-bezier(0.4,0,0.2,1)] select-none",
									isActive
										? "text-ctp-text bg-gradient-to-b from-ctp-surface0/70 to-ctp-surface0/50 border-ctp-surface1/30 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.4),0_0_0_0.5px_inset] shadow-ctp-surface1/15"
										: "text-ctp-overlay0 hover:text-ctp-subtext1 hover:bg-ctp-surface0/25",
								)}
							>
								<HugeiconsIcon
									icon={tab.icon}
									size={ICON_SIZE}
									strokeWidth={isActive ? 2 : 1.5}
									className={cn(
										"transition-colors duration-[180ms]",
										isActive && "text-ctp-lavender",
									)}
								/>
								<span>{tab.label}</span>
							</button>
						);
					})}
				</div>
			))}
		</div>
	);
}
