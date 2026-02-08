"use client";

import {
	CommandIcon,
	PaintBoardIcon,
	Shield01Icon,
	SidebarLeft01Icon,
	SidebarRight01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge, Button, Kbd, StatusDot } from "@/shared/components/ui";
import { applyTheme, getThemeById, themes } from "@/shared/lib/themes";
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
		themeId,
		setThemeId,
	} = useAppStore();

	const [themePicker, setThemePicker] = useState(false);
	const pickerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		applyTheme(getThemeById(themeId));
	}, [themeId]);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
				setThemePicker(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const handleToggleInterceptor = useCallback(() => {
		setInterceptorEnabled(!interceptorEnabled);
	}, [interceptorEnabled, setInterceptorEnabled]);

	return (
		<header className="glass-solid h-12 flex items-center justify-between px-4 shrink-0 z-20">
			<div className="flex items-center gap-2.5">
				<button
					type="button"
					onClick={toggleSidebar}
					className="text-ctp-overlay0 hover:text-ctp-text transition-colors p-1 rounded-md hover:bg-ctp-surface0/30"
				>
					<HugeiconsIcon
						icon={sidebarOpen ? SidebarLeft01Icon : SidebarRight01Icon}
						size={16}
						strokeWidth={1.5}
					/>
				</button>
				<div className="flex items-center gap-2">
					<div className="w-5 h-5 rounded-md bg-gradient-to-br from-ctp-lavender to-ctp-mauve flex items-center justify-center">
						<span className="text-[9px] font-black text-ctp-crust">N</span>
					</div>
					<span className="text-[13px] font-semibold text-ctp-text tracking-tight">Nebula</span>
				</div>
				<Badge variant="accent" className="text-[9px]">
					v0.1
				</Badge>
			</div>

			<div className="flex items-center gap-1.5">
				<Button variant="outline" size="sm" onClick={onOpenCommandPalette}>
					<HugeiconsIcon icon={CommandIcon} size={13} />
					<span className="hidden sm:inline text-[11px]">Commands</span>
					<Kbd>⌘K</Kbd>
				</Button>

				<Button
					variant="outline"
					size="sm"
					onClick={handleToggleInterceptor}
					className={interceptorEnabled ? "border-ctp-red/30 text-ctp-red" : ""}
				>
					<HugeiconsIcon icon={Shield01Icon} size={13} />
					<StatusDot color={interceptorEnabled ? "red" : "muted"} />
				</Button>

				{interceptorEnabled && (
					<select
						value={interceptorMode}
						onChange={(e) => setInterceptorMode(e.target.value as "request" | "response" | "both")}
						className="h-7 px-2 text-[11px] rounded-lg border border-ctp-surface0/60 bg-transparent text-ctp-subtext0 outline-none"
					>
						<option value="request" className="bg-ctp-base">
							Req
						</option>
						<option value="response" className="bg-ctp-base">
							Res
						</option>
						<option value="both" className="bg-ctp-base">
							Both
						</option>
					</select>
				)}

				<div className="relative" ref={pickerRef}>
					<Button variant="outline" size="sm" onClick={() => setThemePicker(!themePicker)}>
						<HugeiconsIcon icon={PaintBoardIcon} size={13} />
					</Button>

					{themePicker && (
						<div className="absolute right-0 top-full mt-2 glass rounded-xl p-2 w-48 animate-scale-in z-50">
							<div className="text-[10px] uppercase tracking-wider text-ctp-overlay0 font-semibold px-2 py-1">
								Theme
							</div>
							{themes.map((theme) => (
								<button
									key={theme.id}
									type="button"
									onClick={() => {
										setThemeId(theme.id);
										setThemePicker(false);
									}}
									className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] transition-colors ${
										themeId === theme.id
											? "bg-ctp-lavender/10 text-ctp-lavender"
											: "text-ctp-subtext0 hover:bg-ctp-surface0/40 hover:text-ctp-text"
									}`}
								>
									<div className="flex gap-0.5">
										{[
											theme.colors.lavender,
											theme.colors.green,
											theme.colors.red,
											theme.colors.yellow,
										].map((c) => (
											<div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
										))}
									</div>
									<span>{theme.name}</span>
								</button>
							))}
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
