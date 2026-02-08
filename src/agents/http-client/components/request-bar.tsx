"use client";

import { Send, X } from "lucide-react";
import { useCallback, useEffect } from "react";
import { Button, Input, Spinner } from "@/shared/components/ui";
import type { HttpMethod } from "@/shared/lib/catppuccin";
import { cn } from "@/shared/lib/utils";
import { useAppStore } from "@/shared/stores/app-store";
import { useHttpRequest } from "../hooks/use-http-request";

const methods: HttpMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const methodSelectColors: Record<HttpMethod, string> = {
	GET: "text-ctp-green border-ctp-green/40",
	POST: "text-ctp-blue border-ctp-blue/40",
	PUT: "text-ctp-yellow border-ctp-yellow/40",
	DELETE: "text-ctp-red border-ctp-red/40",
	PATCH: "text-ctp-mauve border-ctp-mauve/40",
	OPTIONS: "text-ctp-teal border-ctp-teal/40",
	HEAD: "text-ctp-peach border-ctp-peach/40",
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
		<div className="flex items-center gap-3">
			<select
				value={method}
				onChange={(e) => setMethod(e.target.value as HttpMethod)}
				className={cn(
					"w-28 px-3 py-2 rounded-xl font-semibold font-mono text-xs border bg-transparent outline-none transition-all",
					methodSelectColors[method],
				)}
			>
				{methods.map((m) => (
					<option key={m} value={m} className="bg-ctp-base text-ctp-text">
						{m}
					</option>
				))}
			</select>

			<div className="flex-1 flex items-center gap-2 glass rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-ctp-lavender/20 transition-all">
				<Input
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					placeholder="https://api.example.com/v1/resource"
					className="border-0 bg-transparent focus:ring-0 font-mono text-sm h-7 px-0"
				/>
				{url && (
					<button
						type="button"
						onClick={() => setUrl("")}
						className="text-ctp-overlay0 hover:text-ctp-text transition-colors"
					>
						<X size={14} />
					</button>
				)}
			</div>

			<Button
				variant="primary"
				size="md"
				onClick={sendRequest}
				disabled={requestInFlight}
				className="px-5"
			>
				{requestInFlight ? (
					<Spinner size="sm" />
				) : (
					<>
						<Send size={14} />
						<span>Send</span>
					</>
				)}
			</Button>
		</div>
	);
}
