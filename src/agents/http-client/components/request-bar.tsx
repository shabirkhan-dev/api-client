"use client";

import { Cancel01Icon, FloppyDiskIcon, SentIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect } from "react";
import { Button, GlassPanel, Spinner } from "@/shared/components/ui";
import type { HttpMethod } from "@/shared/lib/catppuccin";
import { cn } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/stores/app-store";
import { useHttpRequest } from "../hooks/use-http-request";
import { useSaveRequest } from "../hooks/use-save-request";

const IC = 15;

const methods: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const methodColor: Record<string, string> = {
	GET: "text-ctp-green border-ctp-green/25 bg-ctp-green/6",
	POST: "text-ctp-blue border-ctp-blue/25 bg-ctp-blue/6",
	PUT: "text-ctp-yellow border-ctp-yellow/25 bg-ctp-yellow/6",
	DELETE: "text-ctp-red border-ctp-red/25 bg-ctp-red/6",
	PATCH: "text-ctp-mauve border-ctp-mauve/25 bg-ctp-mauve/6",
};

export function RequestBar() {
	const {
		method,
		url,
		requestInFlight,
		activeRequestItemId,
		activeRequestName,
		requestDirty,
		setMethod,
		setUrl,
		clearActiveRequest,
	} = useAppStore();
	const { sendRequest } = useHttpRequest();
	const { saveRequest } = useSaveRequest();

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
				e.preventDefault();
				sendRequest();
			}
			// Ctrl/Cmd + S to save
			if ((e.metaKey || e.ctrlKey) && e.key === "s") {
				e.preventDefault();
				if (activeRequestItemId && requestDirty) {
					saveRequest();
				}
			}
		},
		[sendRequest, saveRequest, activeRequestItemId, requestDirty],
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	return (
		<GlassPanel className="flex flex-col gap-[var(--space-sm)]">
			{/* Active request indicator */}
			{activeRequestItemId && (
				<div className="flex items-center gap-[var(--space-sm)] text-[11px]">
					<span className="text-ctp-overlay0">Editing:</span>
					<span className="font-medium text-ctp-text truncate max-w-[200px]">
						{activeRequestName || "Untitled"}
					</span>
					{requestDirty && (
						<span className="text-ctp-peach text-[10px] font-medium bg-ctp-peach/10 px-1.5 py-px rounded-full border border-ctp-peach/15">
							Modified
						</span>
					)}
					<div className="flex-1" />
					<button
						type="button"
						onClick={clearActiveRequest}
						className="text-ctp-overlay0 hover:text-ctp-text text-[10px] cursor-pointer transition-colors"
					>
						New request
					</button>
				</div>
			)}

			{/* Method + URL + Actions row */}
			<div className="flex items-center gap-[var(--space-md)]">
				{/* Method Selector */}
				<select
					value={method}
					onChange={(e) => setMethod(e.target.value as HttpMethod)}
					className={cn(
						"h-9 w-24 px-[var(--space-md)] rounded-md font-bold font-mono text-[12px] tracking-wide border outline-none cursor-pointer transition-colors duration-150",
						methodColor[method] ?? "text-ctp-text border-ctp-surface1/30 bg-ctp-mantle/40",
					)}
				>
					{methods.map((m) => (
						<option key={m} value={m} className="bg-ctp-base text-ctp-text font-mono">
							{m}
						</option>
					))}
				</select>

				{/* URL Input */}
				<div className="flex-1 flex items-center h-9 gap-[var(--space-sm)] bg-ctp-mantle/30 rounded-md border border-ctp-surface0/30 px-[var(--space-md)] focus-within:border-ctp-lavender/40 focus-within:shadow-[0_0_0_2px_rgba(180,190,254,0.08)] transition-all duration-200">
					<input
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder="https://api.example.com/v1/resource"
						spellCheck={false}
						autoComplete="off"
						className="flex-1 bg-transparent outline-none font-mono text-[13px] text-ctp-text placeholder:text-ctp-overlay0/40 min-w-0"
					/>
					{url && (
						<button
							type="button"
							onClick={() => setUrl("")}
							className="flex items-center justify-center w-6 h-6 rounded text-ctp-overlay0 hover:text-ctp-text hover:bg-ctp-surface0/25 transition-colors duration-150 shrink-0"
							aria-label="Clear URL"
						>
							<HugeiconsIcon icon={Cancel01Icon} size={IC} strokeWidth={1.5} />
						</button>
					)}
				</div>

				{/* Save Button (only when editing a collection item) */}
				{activeRequestItemId && (
					<Button
						variant="secondary"
						size="md"
						onClick={saveRequest}
						disabled={!requestDirty}
						className="px-[var(--space-lg)] shrink-0"
						title="Save to collection (Ctrl+S)"
					>
						<HugeiconsIcon icon={FloppyDiskIcon} size={14} />
						<span>Save</span>
					</Button>
				)}

				{/* Send Button */}
				<Button
					variant="primary"
					size="md"
					onClick={sendRequest}
					disabled={requestInFlight}
					className="px-[var(--space-xl)] min-w-20 shrink-0"
				>
					{requestInFlight ? (
						<Spinner size="sm" className="border-ctp-crust/30 border-t-ctp-crust" />
					) : (
						<>
							<HugeiconsIcon icon={SentIcon} size={IC} />
							<span>Send</span>
						</>
					)}
				</Button>
			</div>
		</GlassPanel>
	);
}
