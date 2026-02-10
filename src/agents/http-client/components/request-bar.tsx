"use client";

import { Cancel01Icon, SentIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect } from "react";
import { Button, Spinner } from "@/shared/components/ui";
import type { HttpMethod } from "@/shared/lib/catppuccin";
import { cn } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/stores/app-store";
import { useHttpRequest } from "../hooks/use-http-request";

const methods: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const methodColor: Record<string, string> = {
	GET: "text-ctp-green border-ctp-green/30",
	POST: "text-ctp-blue border-ctp-blue/30",
	PUT: "text-ctp-yellow border-ctp-yellow/30",
	DELETE: "text-ctp-red border-ctp-red/30",
	PATCH: "text-ctp-mauve border-ctp-mauve/30",
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
		<div className="flex items-center gap-2">
			<select
				value={method}
				onChange={(e) => setMethod(e.target.value as HttpMethod)}
				className={cn(
					"w-[88px] h-8 px-2 rounded-lg font-bold font-mono text-[11px] border bg-transparent outline-none transition-all cursor-pointer",
					methodColor[method],
				)}
			>
				{methods.map((m) => (
					<option key={m} value={m} className="bg-ctp-base text-ctp-text">
						{m}
					</option>
				))}
			</select>

			<div className="flex-1 flex items-center h-8 gap-1.5 bg-ctp-crust/40 rounded-lg border border-ctp-surface0/50 px-2.5 focus-within:border-ctp-lavender/40 focus-within:shadow-[0_0_0_3px] focus-within:shadow-ctp-lavender/8 transition-all">
				<input
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					placeholder="https://api.example.com/v1/resource"
					className="flex-1 bg-transparent outline-none font-mono text-[12px] text-ctp-text placeholder:text-ctp-overlay0/50"
				/>
				{url && (
					<button
						type="button"
						onClick={() => setUrl("")}
						className="text-ctp-overlay0 hover:text-ctp-text transition-colors"
					>
						<HugeiconsIcon icon={Cancel01Icon} size={12} />
					</button>
				)}
			</div>

			<Button
				variant="primary"
				size="md"
				onClick={sendRequest}
				disabled={requestInFlight}
				className="px-4 min-w-[72px]"
			>
				{requestInFlight ? (
					<Spinner size="sm" />
				) : (
					<>
						<HugeiconsIcon icon={SentIcon} size={14} />
						<span className="text-[12px]">Send</span>
					</>
				)}
			</Button>
		</div>
	);
}
