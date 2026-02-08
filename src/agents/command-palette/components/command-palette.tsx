"use client";

import {
	Activity,
	Braces,
	Database,
	FileText,
	Gauge,
	GitCompare,
	Globe,
	Link2,
	PanelLeftClose,
	RotateCcw,
	Send,
	Server,
	Shield,
	ShieldAlert,
	Users,
	Wifi,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/stores/app-store";
import type { WorkspaceTab } from "@/shared/types";

interface CommandAction {
	id: string;
	label: string;
	icon: typeof Globe;
	action: () => void;
}

interface CommandPaletteProps {
	open: boolean;
	onClose: () => void;
	onSendRequest: () => void;
}

export function CommandPalette({ open, onClose, onSendRequest }: CommandPaletteProps) {
	const { setActiveTab, toggleSidebar, setInterceptorEnabled, interceptorEnabled } = useAppStore();
	const [query, setQuery] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);

	const actions: CommandAction[] = useMemo(
		() => [
			{ id: "send", label: "Send Request", icon: Send, action: onSendRequest },
			{ id: "sidebar", label: "Toggle Sidebar", icon: PanelLeftClose, action: toggleSidebar },
			{
				id: "interceptor",
				label: "Toggle Interceptor",
				icon: Shield,
				action: () => setInterceptorEnabled(!interceptorEnabled),
			},
			...(
				[
					{ id: "http", label: "HTTP Client", icon: Globe },
					{ id: "websocket", label: "WebSocket", icon: Wifi },
					{ id: "loadtest", label: "Load Testing", icon: Gauge },
					{ id: "graphql", label: "GraphQL", icon: Braces },
					{ id: "docs", label: "API Docs", icon: FileText },
					{ id: "diff", label: "Diff Viewer", icon: GitCompare },
					{ id: "chain", label: "Request Chain", icon: Link2 },
					{ id: "security", label: "Security Scanner", icon: ShieldAlert },
					{ id: "retry", label: "Auto-Retry", icon: RotateCcw },
					{ id: "data", label: "Data Generator", icon: Database },
					{ id: "collab", label: "Collaboration", icon: Users },
					{ id: "profiler", label: "Profiler", icon: Activity },
					{ id: "mock", label: "Mock Server", icon: Server },
				] as { id: WorkspaceTab; label: string; icon: typeof Globe }[]
			).map((tab) => ({
				...tab,
				id: `open-${tab.id}`,
				label: `Open ${tab.label}`,
				action: () => setActiveTab(tab.id as WorkspaceTab),
			})),
		],
		[onSendRequest, toggleSidebar, setInterceptorEnabled, interceptorEnabled, setActiveTab],
	);

	const filtered = useMemo(
		() => actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase())),
		[actions, query],
	);

	useEffect(() => {
		if (open) {
			setQuery("");
			setSelectedIndex(0);
			setTimeout(() => inputRef.current?.focus(), 50);
		}
	}, [open]);

	useEffect(() => {
		setSelectedIndex(0);
	}, []);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setSelectedIndex((i) => Math.max(i - 1, 0));
			} else if (e.key === "Enter") {
				e.preventDefault();
				if (filtered[selectedIndex]) {
					filtered[selectedIndex].action();
					onClose();
				}
			} else if (e.key === "Escape") {
				onClose();
			}
		},
		[filtered, selectedIndex, onClose],
	);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && (e.key === "p" || e.key === "k")) {
				e.preventDefault();
				if (open) onClose();
				else {
					/* Parent handles open */
				}
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label="Command palette"
			className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 animate-fade-in"
			onClick={onClose}
			onKeyDown={(e) => {
				if (e.key === "Escape") onClose();
			}}
		>
			<div
				role="presentation"
				className="glass rounded-xl p-4 w-[520px] animate-slide-up"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={handleKeyDown}
			>
				<input
					ref={inputRef}
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Type a command..."
					className="w-full bg-transparent border border-ctp-border rounded-lg px-3 py-2 text-sm text-ctp-text outline-none focus:border-ctp-lavender transition-all"
				/>
				<div className="mt-3 max-h-[300px] overflow-y-auto space-y-0.5">
					{filtered.map((action, i) => {
						const Icon = action.icon;
						return (
							<button
								key={action.id}
								type="button"
								onClick={() => {
									action.action();
									onClose();
								}}
								className={cn(
									"w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
									i === selectedIndex
										? "bg-ctp-lavender/10 text-ctp-lavender"
										: "text-ctp-text hover:bg-ctp-lavender/5",
								)}
							>
								<Icon size={14} />
								{action.label}
							</button>
						);
					})}
					{filtered.length === 0 && (
						<div className="text-xs text-ctp-overlay0 text-center py-4">No commands found</div>
					)}
				</div>
			</div>
		</div>
	);
}
