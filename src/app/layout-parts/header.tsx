"use client";

import {
	CommandIcon,
	LeftToRightListBulletIcon,
	PaintBoardIcon,
	Shield01Icon,
	SidebarLeft01Icon,
	SidebarRight01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Kbd, StatusDot, UserMenu } from "@/shared/components/ui";
import { WorkspaceSwitcher } from "@/shared/components/ui/workspace-switcher";
import { applyTheme, getThemeById, themes } from "@/shared/lib/themes";
import { useAppStore } from "@/shared/stores/app-store";

interface HeaderProps {
	onOpenCommandPalette: () => void;
}

const IC = 15;

export function Header({ onOpenCommandPalette }: HeaderProps) {
	const {
		sidebarOpen,
		toggleSidebar,
		compactMode,
		setCompactMode,
		interceptorEnabled,
		setInterceptorEnabled,
		interceptorMode,
		setInterceptorMode,
		themeId,
		setThemeId,
	} = useAppStore();

	const [themePicker, setThemePicker] = useState(false);
	const pickerRef = useRef<HTMLDivElement>(null);

	// Apply theme + compact class
	useEffect(() => {
		applyTheme(getThemeById(themeId));
	}, [themeId]);

	useEffect(() => {
		document.documentElement.classList.toggle("compact", compactMode);
	}, [compactMode]);

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
		<header className="bg-gradient-to-b from-ctp-mantle/96 to-ctp-crust/90 border-b border-ctp-surface0/30 backdrop-blur-[16px] backdrop-saturate-[1.3] h-[var(--header-h)] flex items-center justify-between px-[var(--space-lg)] shrink-0 z-20">
			{/* Left: Sidebar toggle + Workspace */}
			<div className="flex items-center gap-[var(--space-md)]">
				<button
					type="button"
					onClick={toggleSidebar}
					className="flex items-center justify-center w-8 h-8 rounded-md text-ctp-overlay1 hover:text-ctp-text hover:bg-ctp-surface0/30 transition-colors duration-150"
					aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
				>
					<HugeiconsIcon
						icon={sidebarOpen ? SidebarLeft01Icon : SidebarRight01Icon}
						size={IC}
						strokeWidth={1.5}
					/>
				</button>

				<div className="w-px h-5 bg-ctp-surface0/25" />

				{/* Workspace switcher replaces branding */}
				<WorkspaceSwitcher variant="header" />
			</div>

			{/* Right: Actions */}
			<div className="flex items-center gap-[var(--space-sm)]">
				<Button variant="ghost" size="sm" onClick={onOpenCommandPalette}>
					<HugeiconsIcon icon={CommandIcon} size={IC} strokeWidth={1.5} />
					<Kbd>⌘K</Kbd>
				</Button>

				<Button
					variant="ghost"
					size="sm"
					onClick={handleToggleInterceptor}
					className={interceptorEnabled ? "text-ctp-red" : ""}
				>
					<HugeiconsIcon icon={Shield01Icon} size={IC} strokeWidth={1.5} />
					<StatusDot color={interceptorEnabled ? "red" : "muted"} pulse={interceptorEnabled} />
				</Button>

				{interceptorEnabled && (
					<select
						value={interceptorMode}
						onChange={(e) => setInterceptorMode(e.target.value as "request" | "response" | "both")}
						className="h-7 px-2 text-[12px] font-medium rounded-md border border-ctp-surface0/40 bg-ctp-mantle/40 text-ctp-subtext0 outline-none cursor-pointer"
					>
						<option value="request" className="bg-ctp-base">Request</option>
						<option value="response" className="bg-ctp-base">Response</option>
						<option value="both" className="bg-ctp-base">Both</option>
					</select>
				)}

				{/* Compact toggle */}
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setCompactMode(!compactMode)}
					className={compactMode ? "text-ctp-lavender" : ""}
					aria-label="Toggle compact mode"
				>
					<HugeiconsIcon icon={LeftToRightListBulletIcon} size={IC} strokeWidth={1.5} />
				</Button>

				{/* Theme picker */}
				<div className="relative" ref={pickerRef}>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setThemePicker(!themePicker)}
						className={themePicker ? "bg-ctp-surface0/30" : ""}
					>
						<HugeiconsIcon icon={PaintBoardIcon} size={IC} strokeWidth={1.5} />
					</Button>

					{themePicker && (
						<div className="absolute right-0 top-full mt-1.5 bg-gradient-to-b from-ctp-base/96 to-ctp-mantle/96 backdrop-blur-[24px] backdrop-saturate-[1.5] border border-ctp-surface1/25 shadow-[0_0_0_0.5px_inset,0_16px_40px_-16px_rgba(0,0,0,0.65)] shadow-ctp-surface1/10 rounded-[var(--radius-lg)] p-1.5 w-52 animate-scale-in z-50">
							<div className="text-[10px] uppercase tracking-widest text-ctp-overlay0 font-semibold px-2.5 py-1.5">
								Theme
							</div>
							<div className="space-y-px">
								{themes.map((theme) => {
									const isActive = themeId === theme.id;
									return (
										<button
											key={theme.id}
											type="button"
											onClick={() => {
												setThemeId(theme.id);
												setThemePicker(false);
											}}
											className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-[var(--radius-sm)] text-[12px] cursor-pointer transition-all duration-[130ms] ${
												isActive
													? "bg-ctp-lavender/12 text-ctp-lavender"
													: "text-ctp-subtext0 hover:bg-ctp-surface0/40 hover:text-ctp-text"
											}`}
										>
											<div className="flex gap-0.5">
												{[theme.colors.lavender, theme.colors.green, theme.colors.red, theme.colors.yellow].map((c) => (
													<div
														key={c}
														className="w-3 h-3 rounded-full ring-1 ring-black/10"
														style={{ background: c }}
													/>
												))}
											</div>
											<span>{theme.name}</span>
											{isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-ctp-lavender" />}
										</button>
									);
								})}
							</div>
						</div>
					)}
				</div>

				<div className="w-px h-4 bg-ctp-surface0/25" />

				<UserMenu />
			</div>
		</header>
	);
}
