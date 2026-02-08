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

const ICON_SIZE = 16;

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
		<header className="bg-gradient-to-b from-ctp-mantle/96 to-ctp-crust/90 border-b border-ctp-surface0/30 backdrop-blur-[16px] backdrop-saturate-[1.3] h-14 flex items-center justify-between px-5 shrink-0 z-20">
			{/* Left: Sidebar toggle + Branding */}
			<div className="flex items-center gap-4">
				<button
					type="button"
					onClick={toggleSidebar}
					className="flex items-center justify-center w-9 h-9 rounded-lg text-ctp-overlay1 hover:text-ctp-text hover:bg-ctp-surface0/30 transition-colors duration-150"
					aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
				>
					<HugeiconsIcon
						icon={sidebarOpen ? SidebarLeft01Icon : SidebarRight01Icon}
						size={ICON_SIZE}
						strokeWidth={1.5}
					/>
				</button>

				<div className="flex items-center gap-3">
					<div className="w-[26px] h-[26px] rounded-lg flex items-center justify-center bg-gradient-to-br from-ctp-lavender to-ctp-mauve shadow-[0_2px_8px] shadow-ctp-lavender/30 shrink-0">
						<span className="text-[12px] font-extrabold text-ctp-crust leading-none tracking-tight">
							A
						</span>
					</div>
					<span className="text-[14px] font-semibold text-ctp-text tracking-tight">API Client</span>
					<Badge variant="accent">v0.1</Badge>
				</div>
			</div>

			{/* Right: Actions */}
			<div className="flex items-center gap-2.5">
				<Button variant="outline" size="md" onClick={onOpenCommandPalette}>
					<HugeiconsIcon icon={CommandIcon} size={ICON_SIZE} strokeWidth={1.5} />
					<span className="hidden sm:inline">Commands</span>
					<Kbd>⌘K</Kbd>
				</Button>

				<Button
					variant="outline"
					size="md"
					onClick={handleToggleInterceptor}
					className={interceptorEnabled ? "border-ctp-red/30 text-ctp-red" : ""}
				>
					<HugeiconsIcon icon={Shield01Icon} size={ICON_SIZE} strokeWidth={1.5} />
					<StatusDot color={interceptorEnabled ? "red" : "muted"} pulse={interceptorEnabled} />
				</Button>

				{interceptorEnabled && (
					<select
						value={interceptorMode}
						onChange={(e) => setInterceptorMode(e.target.value as "request" | "response" | "both")}
						className="h-9 px-3 text-[13px] font-medium rounded-lg border border-ctp-surface0/50 bg-ctp-mantle/40 text-ctp-subtext0 outline-none cursor-pointer transition-all duration-[180ms] focus-visible:border-ctp-lavender/45 focus-visible:shadow-[0_0_0_1px_inset,0_0_0_3px] focus-visible:shadow-ctp-lavender/15"
					>
						<option value="request" className="bg-ctp-base">
							Request
						</option>
						<option value="response" className="bg-ctp-base">
							Response
						</option>
						<option value="both" className="bg-ctp-base">
							Both
						</option>
					</select>
				)}

				<div className="relative" ref={pickerRef}>
					<Button
						variant="outline"
						size="md"
						onClick={() => setThemePicker(!themePicker)}
						className={themePicker ? "bg-ctp-surface0/30" : ""}
					>
						<HugeiconsIcon icon={PaintBoardIcon} size={ICON_SIZE} strokeWidth={1.5} />
					</Button>

					{themePicker && (
						<div className="absolute right-0 top-full mt-2 bg-gradient-to-b from-ctp-base/96 to-ctp-mantle/96 backdrop-blur-[24px] backdrop-saturate-[1.5] border border-ctp-surface1/25 shadow-[0_0_0_0.5px_inset,0_16px_40px_-16px_rgba(0,0,0,0.65),0_0_1px_rgba(0,0,0,0.4)] shadow-ctp-surface1/10 rounded-[var(--radius-lg)] p-2.5 w-56 animate-scale-in z-50">
							<div className="text-[11px] uppercase tracking-widest text-ctp-overlay0 font-semibold px-3 py-2.5">
								Theme
							</div>
							<div className="space-y-0.5">
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
											className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-[var(--radius-md)] text-[13px] cursor-pointer transition-all duration-[130ms] ${
												isActive
													? "bg-ctp-lavender/12 text-ctp-lavender"
													: "text-ctp-subtext0 hover:bg-ctp-surface0/40 hover:text-ctp-text"
											}`}
										>
											<div className="flex gap-1">
												{[
													theme.colors.lavender,
													theme.colors.green,
													theme.colors.red,
													theme.colors.yellow,
												].map((c) => (
													<div
														key={c}
														className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10"
														style={{ background: c }}
													/>
												))}
											</div>
											<span className="text-[13px]">{theme.name}</span>
											{isActive && (
												<div className="ml-auto w-1.5 h-1.5 rounded-full bg-ctp-lavender" />
											)}
										</button>
									);
								})}
							</div>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
