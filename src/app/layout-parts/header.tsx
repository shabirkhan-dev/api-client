"use client";

import { Command, PanelLeftClose, PanelLeftOpen, Search, Shield } from "lucide-react";
import { useCallback, useState } from "react";
import { Badge, Button, Kbd, StatusDot } from "@/shared/components/ui";
import { useAppStore } from "@/shared/stores/app-store";

interface HeaderProps {
	onOpenCommandPalette: () => void;
}

export function Header({ onOpenCommandPalette }: HeaderProps) {
	const {
		sidebarOpen,
		toggleSidebar,
		interceptorEnabled,
		setInterceptorEnabled,
		interceptorMode,
		setInterceptorMode,
	} = useAppStore();

	const [_searchOpen, _setSearchOpen] = useState(false);

	const handleToggleInterceptor = useCallback(() => {
		setInterceptorEnabled(!interceptorEnabled);
	}, [interceptorEnabled, setInterceptorEnabled]);

	return (
		<header className="glass h-14 flex items-center justify-between px-6 shrink-0">
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={toggleSidebar}
					className="text-ctp-overlay0 hover:text-ctp-text transition-colors"
				>
					{sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
				</button>
				<span className="text-sm font-semibold text-ctp-text">Nebula</span>
				<Badge>API Client</Badge>
			</div>

			<div className="flex items-center gap-2">
				<Button variant="outline" size="sm" onClick={onOpenCommandPalette}>
					<Command size={14} />
					<span className="hidden sm:inline">Command Palette</span>
					<Kbd>⌘P</Kbd>
				</Button>

				<Button
					variant="outline"
					size="sm"
					onClick={handleToggleInterceptor}
					className={interceptorEnabled ? "border-ctp-red/40" : ""}
				>
					<Shield size={14} />
					<span className="hidden sm:inline">Interceptor</span>
					<StatusDot color={interceptorEnabled ? "red" : "muted"} />
				</Button>

				{interceptorEnabled && (
					<select
						value={interceptorMode}
						onChange={(e) => setInterceptorMode(e.target.value as "request" | "response" | "both")}
						className="h-8 px-2 text-xs rounded-lg border border-ctp-border bg-transparent text-ctp-text outline-none"
					>
						<option value="request">Request</option>
						<option value="response">Response</option>
						<option value="both">Both</option>
					</select>
				)}

				<Button variant="outline" size="sm" onClick={onOpenCommandPalette}>
					<Search size={14} />
					<Kbd>⌘K</Kbd>
				</Button>
			</div>
		</header>
	);
}
