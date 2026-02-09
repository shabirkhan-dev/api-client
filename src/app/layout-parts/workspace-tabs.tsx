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

const IC = 13;

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
			{ id: "websocket", label: "WS", icon: Wifi01Icon },
			{ id: "graphql", label: "GQL", icon: CodeIcon },
		],
	},
	{
		label: "Testing",
		tabs: [
			{ id: "loadtest", label: "Load", icon: Timer01Icon },
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
			{ id: "data", label: "Data", icon: Database01Icon },
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
		<div className="flex items-center gap-px p-1 bg-ctp-mantle/40 rounded-[var(--radius-lg)] border border-ctp-surface0/15 overflow-x-auto overflow-y-hidden shrink-0 scrollbar-none">
			{tabGroups.map((group) => (
				<div
					key={group.label}
					className="flex items-center gap-px relative [&+&]:before:content-[''] [&+&]:before:w-px [&+&]:before:h-4 [&+&]:before:bg-ctp-surface1/25 [&+&]:before:mx-1 [&+&]:before:rounded-full [&+&]:before:shrink-0"
				>
					{group.tabs.map((tab) => {
						const isActive = activeTab === tab.id;
						return (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveTab(tab.id)}
								className={cn(
									"flex items-center gap-1.5 px-[var(--space-md)] py-[var(--space-sm)] rounded-[var(--radius-sm)] text-[12px] font-medium whitespace-nowrap cursor-pointer border border-transparent transition-all duration-[150ms] select-none",
									isActive
										? "text-ctp-text bg-gradient-to-b from-ctp-surface0/60 to-ctp-surface0/40 border-ctp-surface1/25 shadow-[0_1px_4px_-2px_rgba(0,0,0,0.4),0_0_0_0.5px_inset] shadow-ctp-surface1/10"
										: "text-ctp-overlay0 hover:text-ctp-subtext1 hover:bg-ctp-surface0/20",
								)}
							>
								<HugeiconsIcon
									icon={tab.icon}
									size={IC}
									strokeWidth={isActive ? 2 : 1.5}
									className={cn(
										"transition-colors duration-[150ms]",
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
