"use client";

import { Cancel01Icon, SentIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect } from "react";
import { Button, GlassPanel, Spinner } from "@/shared/components/ui";
import type { HttpMethod } from "@/shared/lib/catppuccin";
import { cn } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/stores/app-store";
import { useHttpRequest } from "../hooks/use-http-request";

const ICON = 16;

const methods: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const methodColor: Record<string, string> = {
	GET: "text-ctp-green border-ctp-green/25 bg-ctp-green/6",
	POST: "text-ctp-blue border-ctp-blue/25 bg-ctp-blue/6",
	PUT: "text-ctp-yellow border-ctp-yellow/25 bg-ctp-yellow/6",
	DELETE: "text-ctp-red border-ctp-red/25 bg-ctp-red/6",
	PATCH: "text-ctp-mauve border-ctp-mauve/25 bg-ctp-mauve/6",
};

export function RequestBar() {
	const { method, url, requestInFlight, setMethod, setUrl } = useAppStore();
	const { sendRequest } = useHttpRequest();

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
				e.preventDefault();
				sendRequest();
			}
		},
		[sendRequest],
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	return (
		<GlassPanel className="flex items-center gap-4">
			{/* Method Selector */}
			<select
				value={method}
				onChange={(e) => setMethod(e.target.value as HttpMethod)}
				className={cn(
					"h-10 w-28 px-3.5 rounded-lg font-bold font-mono text-[13px] tracking-wide border outline-none cursor-pointer transition-colors duration-150",
					methodColor[method] ??
						"text-ctp-text border-ctp-surface1/30 bg-ctp-mantle/40",
				)}
			>
				{methods.map((m) => (
					<option
						key={m}
						value={m}
						className="bg-ctp-base text-ctp-text font-mono"
					>
						{m}
					</option>
				))}
			</select>

			{/* URL Input */}
			<div className="flex-1 flex items-center h-10 gap-3 bg-ctp-mantle/30 rounded-lg border border-ctp-surface0/30 px-4 focus-within:border-ctp-lavender/40 focus-within:shadow-[0_0_0_2px_rgba(180,190,254,0.08)] transition-all duration-200">
				<input
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					placeholder="https://api.example.com/v1/resource"
					spellCheck={false}
					autoComplete="off"
					className="flex-1 bg-transparent outline-none font-mono text-[14px] text-ctp-text placeholder:text-ctp-overlay0/40 min-w-0"
				/>
				{url && (
					<button
						type="button"
						onClick={() => setUrl("")}
						className="flex items-center justify-center w-7 h-7 rounded-md text-ctp-overlay0 hover:text-ctp-text hover:bg-ctp-surface0/25 transition-colors duration-150 shrink-0"
						aria-label="Clear URL"
					>
						<HugeiconsIcon icon={Cancel01Icon} size={ICON} strokeWidth={1.5} />
					</button>
				)}
			</div>

			{/* Send Button */}
			<Button
				variant="primary"
				size="lg"
				onClick={sendRequest}
				disabled={requestInFlight}
				className="px-6 min-w-24 shrink-0"
			>
				{requestInFlight ? (
					<Spinner
						size="sm"
						className="border-ctp-crust/30 border-t-ctp-crust"
					/>
				) : (
					<>
						<HugeiconsIcon icon={SentIcon} size={ICON} />
						<span>Send</span>
					</>
				)}
			</Button>
		</GlassPanel>
	);
}
