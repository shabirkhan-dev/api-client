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
	SentIcon,
	ServerStack01Icon,
	Shield01Icon,
	SidebarLeft01Icon,
	Timer01Icon,
	UserGroupIcon,
	Wifi01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/stores/app-store";
import type { WorkspaceTab } from "@/shared/types";

interface CommandAction {
	id: string;
	label: string;
	icon: IconSvgElement;
	action: () => void;
}
interface Props {
	open: boolean;
	onClose: () => void;
	onSendRequest: () => void;
}

export function CommandPalette({ open, onClose, onSendRequest }: Props) {
	const { setActiveTab, toggleSidebar, setInterceptorEnabled, interceptorEnabled } = useAppStore();
	const [query, setQuery] = useState("");
	const [idx, setIdx] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);

	const actions: CommandAction[] = useMemo(
		() => [
			{ id: "send", label: "Send Request", icon: SentIcon, action: onSendRequest },
			{ id: "sidebar", label: "Toggle Sidebar", icon: SidebarLeft01Icon, action: toggleSidebar },
			{
				id: "interceptor",
				label: "Toggle Interceptor",
				icon: Shield01Icon,
				action: () => setInterceptorEnabled(!interceptorEnabled),
			},
			...(
				[
					{ id: "http", label: "HTTP Client", icon: Globe02Icon },
					{ id: "websocket", label: "WebSocket", icon: Wifi01Icon },
					{ id: "loadtest", label: "Load Testing", icon: Timer01Icon },
					{ id: "graphql", label: "GraphQL", icon: CodeIcon },
					{ id: "docs", label: "API Docs", icon: Note01Icon },
					{ id: "diff", label: "Diff Viewer", icon: GitCompareIcon },
					{ id: "chain", label: "Request Chain", icon: Link01Icon },
					{ id: "security", label: "Security", icon: Shield01Icon },
					{ id: "retry", label: "Auto-Retry", icon: Refresh01Icon },
					{ id: "data", label: "Data Generator", icon: Database01Icon },
					{ id: "collab", label: "Collaboration", icon: UserGroupIcon },
					{ id: "profiler", label: "Profiler", icon: Activity01Icon },
					{ id: "mock", label: "Mock Server", icon: ServerStack01Icon },
				] as { id: string; label: string; icon: IconSvgElement }[]
			).map((t) => ({
				...t,
				id: `open-${t.id}`,
				label: `Go to ${t.label}`,
				action: () => setActiveTab(t.id as WorkspaceTab),
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
			setIdx(0);
			setTimeout(() => inputRef.current?.focus(), 50);
		}
	}, [open]);
	useEffect(() => {
		setIdx(0);
	}, []);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setIdx((i) => Math.min(i + 1, filtered.length - 1));
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setIdx((i) => Math.max(i - 1, 0));
			} else if (e.key === "Enter") {
				e.preventDefault();
				if (filtered[idx]) {
					filtered[idx].action();
					onClose();
				}
			} else if (e.key === "Escape") onClose();
		},
		[filtered, idx, onClose],
	);

	if (!open) return null;

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label="Command palette"
			className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh] bg-black/60 backdrop-blur-sm animate-fade-in"
			onClick={onClose}
			onKeyDown={(e) => {
				if (e.key === "Escape") onClose();
			}}
		>
			<div
				role="presentation"
				className="glass rounded-[var(--radius-xl)] w-[520px] animate-scale-in overflow-hidden"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={handleKeyDown}
			>
				<div className="p-3.5 border-b border-ctp-surface1/20">
					<input
						ref={inputRef}
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Type a command..."
						className="w-full bg-transparent text-[13px] text-ctp-text outline-none placeholder:text-ctp-overlay0/50"
					/>
				</div>
				<div className="max-h-[300px] overflow-y-auto p-2">
					{filtered.map((action, i) => (
						<button
							key={action.id}
							type="button"
							onClick={() => {
								action.action();
								onClose();
							}}
							className={cn(
								"w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] transition-colors",
								i === idx
									? "bg-ctp-lavender/12 text-ctp-lavender"
									: "text-ctp-subtext1 hover:bg-ctp-surface0/35",
							)}
						>
							<HugeiconsIcon icon={action.icon} size={14} strokeWidth={1.5} />
							{action.label}
						</button>
					))}
					{filtered.length === 0 && (
						<div className="text-[11px] text-ctp-overlay0 text-center py-6">No commands found</div>
					)}
				</div>
				<div className="flex items-center justify-between px-3.5 py-2 border-t border-ctp-surface1/15 text-[10px] text-ctp-overlay0">
					<span>Use arrow keys to navigate</span>
					<span className="flex items-center gap-2">
						<span className="inline-flex items-center gap-1">
							<span className="text-ctp-subtext0">Enter</span> to run
						</span>
						<span className="inline-flex items-center gap-1">
							<span className="text-ctp-subtext0">Esc</span> to close
						</span>
					</span>
				</div>
			</div>
		</div>
	);
}
