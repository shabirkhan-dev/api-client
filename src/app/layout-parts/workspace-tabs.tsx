"use client";

import { useAppStore } from "@/shared/stores/app-store";
import { cn } from "@/shared/lib/utils";
import type { WorkspaceTab } from "@/shared/types";
import {
	Globe,
	Wifi,
	Gauge,
	Braces,
	FileText,
	GitCompare,
	Link2,
	ShieldAlert,
	RotateCcw,
	Database,
	Users,
	Activity,
	Server,
} from "lucide-react";

const tabs: { id: WorkspaceTab; label: string; icon: typeof Globe }[] = [
	{ id: "http", label: "HTTP Client", icon: Globe },
	{ id: "websocket", label: "WebSocket", icon: Wifi },
	{ id: "loadtest", label: "Load Testing", icon: Gauge },
	{ id: "graphql", label: "GraphQL", icon: Braces },
	{ id: "docs", label: "API Docs", icon: FileText },
	{ id: "diff", label: "Diff Viewer", icon: GitCompare },
	{ id: "chain", label: "Request Chain", icon: Link2 },
	{ id: "security", label: "Security", icon: ShieldAlert },
	{ id: "retry", label: "Auto-Retry", icon: RotateCcw },
	{ id: "data", label: "Data Gen", icon: Database },
	{ id: "collab", label: "Collab", icon: Users },
	{ id: "profiler", label: "Profiler", icon: Activity },
	{ id: "mock", label: "Mock Server", icon: Server },
];

export function WorkspaceTabs() {
	const { activeTab, setActiveTab } = useAppStore();

	return (
		<div className="glass rounded-xl p-1 flex items-center gap-1 overflow-x-auto shrink-0">
			{tabs.map((tab) => {
				const Icon = tab.icon;
				const isActive = activeTab === tab.id;
				return (
					<button
						key={tab.id}
						type="button"
						onClick={() => setActiveTab(tab.id)}
						className={cn(
							"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap",
							isActive
								? "text-ctp-lavender bg-ctp-lavender/10 border-b-2 border-ctp-lavender"
								: "text-ctp-overlay0 hover:text-ctp-text hover:bg-ctp-lavender/5",
						)}
					>
						<Icon size={13} />
						{tab.label}
					</button>
				);
			})}
		</div>
	);
}
