"use client";

import { Cancel01Icon, FloppyDiskIcon, RocketIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect } from "react";
import { Button, Spinner } from "@/shared/components/ui";
import type { HttpMethod } from "@/shared/lib/catppuccin";
import { cn } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/stores/app-store";
import { useHttpRequest } from "../hooks/use-http-request";
import { useSaveRequest } from "../hooks/use-save-request";

const methods: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const methodStyles: Record<string, { bg: string; border: string; text: string; glow: string }> = {
	GET: { 
		bg: "bg-ctp-green/10", border: "border-ctp-green/30", text: "text-ctp-green",
		glow: "shadow-[0_0_12px_rgba(166,227,161,0.2)]"
	},
	POST: { 
		bg: "bg-ctp-blue/10", border: "border-ctp-blue/30", text: "text-ctp-blue",
		glow: "shadow-[0_0_12px_rgba(137,180,250,0.2)]"
	},
	PUT: { 
		bg: "bg-ctp-yellow/10", border: "border-ctp-yellow/30", text: "text-ctp-yellow",
		glow: "shadow-[0_0_12px_rgba(249,226,175,0.2)]"
	},
	DELETE: { 
		bg: "bg-ctp-red/10", border: "border-ctp-red/30", text: "text-ctp-red",
		glow: "shadow-[0_0_12px_rgba(243,139,168,0.2)]"
	},
	PATCH: { 
		bg: "bg-ctp-mauve/10", border: "border-ctp-mauve/30", text: "text-ctp-mauve",
		glow: "shadow-[0_0_12px_rgba(203,166,247,0.2)]"
	},
};

export function RequestBar() {
	const {
		method, url, requestInFlight, activeRequestItemId, activeRequestName, requestDirty,
		compactMode, setMethod, setUrl, clearActiveRequest,
	} = useAppStore();
	const { sendRequest } = useHttpRequest();
	const { saveRequest } = useSaveRequest();

	const handleKeyDown = useCallback((e: KeyboardEvent) => {
		if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
			e.preventDefault();
			sendRequest();
		}
		if ((e.metaKey || e.ctrlKey) && e.key === "s") {
			e.preventDefault();
			if (activeRequestItemId && requestDirty) saveRequest();
		}
	}, [sendRequest, saveRequest, activeRequestItemId, requestDirty]);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	const currentStyle = methodStyles[method] ?? methodStyles.GET;

	return (
		<div className={cn("flex flex-col", compactMode ? "gap-1.5" : "gap-3")}>
			{/* Active request indicator */}
			{activeRequestItemId && (
				<div className={cn("flex items-center", compactMode ? "gap-2 px-1" : "gap-3 px-1")}>
					<div className="flex items-center gap-1.5">
						<div className={cn("rounded-full bg-ctp-lavender animate-pulse", compactMode ? "w-1.5 h-1.5" : "w-2 h-2")} />
						{!compactMode && (
							<span className="text-[11px] text-ctp-overlay0 font-medium uppercase tracking-wider">Editing</span>
						)}
					</div>
					<span className={cn("font-medium text-ctp-text truncate", compactMode ? "text-[11px] max-w-[200px]" : "text-[13px] max-w-[300px]")}>
						{activeRequestName || "Untitled"}
					</span>
					{requestDirty && (
						<span className={cn(
							"font-semibold text-ctp-peach bg-ctp-peach/10 border border-ctp-peach/20",
							compactMode ? "text-[9px] px-1.5 py-px rounded" : "text-[10px] px-2 py-0.5 rounded-full"
						)}>
							Modified
						</span>
					)}
					<div className="flex-1" />
					<button
						type="button"
						onClick={clearActiveRequest}
						className={cn(
							"text-ctp-overlay0 hover:text-ctp-text transition-colors rounded-lg hover:bg-ctp-surface0/20",
							compactMode ? "text-[10px] px-1.5 py-0.5" : "text-[11px] px-2 py-1"
						)}
					>
						+ New
					</button>
				</div>
			)}

			{/* Method + URL + Actions row */}
			<div className={cn("flex items-center", compactMode ? "gap-2" : "gap-3")}>
				{/* Method Selector */}
				<div className="relative">
					<select
						value={method}
						onChange={(e) => setMethod(e.target.value as HttpMethod)}
						className={cn(
							"font-bold font-mono tracking-wide border outline-none cursor-pointer transition-all duration-200 appearance-none",
							"hover:brightness-110 active:scale-[0.98]",
							currentStyle.bg, currentStyle.border, currentStyle.text,
							compactMode 
								? "h-8 pl-3 pr-8 rounded-lg text-[11px]" 
								: "h-11 pl-4 pr-10 rounded-xl text-[13px]"
						)}
					>
						{methods.map((m) => (
							<option key={m} value={m} className="bg-ctp-base text-ctp-text font-mono">{m}</option>
						))}
					</select>
					<div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
						<svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={currentStyle.text}>
							<path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
					</div>
				</div>

				{/* URL Input */}
				<div className={cn(
					"flex-1 flex items-center gap-2 rounded-xl border transition-all duration-200",
					"bg-ctp-mantle/50 border-ctp-surface0/30",
					"focus-within:border-ctp-lavender/40 focus-within:ring-2 focus-within:ring-ctp-lavender/10 focus-within:bg-ctp-mantle/80",
					compactMode ? "h-8 px-2" : "h-11 px-4"
				)}>
					<input
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder={compactMode ? "Enter URL..." : "Enter request URL..."}
						spellCheck={false}
						autoComplete="off"
						className={cn(
							"flex-1 bg-transparent outline-none font-mono text-ctp-text placeholder:text-ctp-overlay0/40 min-w-0",
							compactMode ? "text-[11px]" : "text-[13px]"
						)}
					/>
					{url && (
						<button
							type="button"
							onClick={() => setUrl("")}
							className={cn(
								"flex items-center justify-center rounded-lg text-ctp-overlay0 hover:text-ctp-text hover:bg-ctp-surface0/30 transition-colors duration-150 shrink-0",
								compactMode ? "w-6 h-6" : "w-7 h-7"
							)}
							aria-label="Clear URL"
						>
							<HugeiconsIcon icon={Cancel01Icon} size={compactMode ? 12 : 14} strokeWidth={1.5} />
						</button>
					)}
				</div>

				{/* Save Button */}
				{activeRequestItemId && (
					<Button
						variant="secondary"
						size="md"
						onClick={saveRequest}
						disabled={!requestDirty}
						className={cn("shrink-0", compactMode ? "h-8 px-2 text-[11px]" : "h-11 px-4")}
						title="Save to collection (Ctrl+S)"
					>
						<HugeiconsIcon icon={FloppyDiskIcon} size={compactMode ? 14 : 15} />
						{!compactMode && <span className="hidden sm:inline ml-1.5">Save</span>}
					</Button>
				)}

				{/* Send Button */}
				<Button
					variant="primary"
					size="md"
					onClick={sendRequest}
					disabled={requestInFlight}
					className={cn(
						"shrink-0 bg-gradient-to-r from-ctp-lavender to-ctp-mauve hover:shadow-[0_4px_20px_rgba(180,190,254,0.4)] active:scale-[0.98]",
						compactMode ? "h-8 px-3 text-[11px]" : "h-11 px-6 min-w-[100px]"
					)}
				>
					{requestInFlight ? (
						<Spinner size="sm" className="border-ctp-crust/30 border-t-ctp-crust" />
					) : (
						<>
							<HugeiconsIcon icon={RocketIcon} size={compactMode ? 14 : 16} />
							{!compactMode && <span className="ml-1.5">Send</span>}
						</>
					)}
				</Button>
			</div>
		</div>
	);
}
