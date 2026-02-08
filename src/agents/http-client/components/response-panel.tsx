"use client";

import { useAppStore } from "@/shared/stores/app-store";
import { Badge, Button, GlassPanel, LabelText } from "@/shared/components/ui";
import { getStatusClass } from "@/shared/lib/catppuccin";
import { cn, formatBytes } from "@/shared/lib/utils";
import { Copy, Trash2 } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { ResponseTab } from "../types";

const tabs: { id: ResponseTab; label: string }[] = [
	{ id: "body", label: "Body" },
	{ id: "headers", label: "Headers" },
	{ id: "cookies", label: "Cookies" },
	{ id: "timeline", label: "Timeline" },
];

export function ResponsePanel() {
	const { lastResponse, setLastResponse } = useAppStore();
	const [activeTab, setActiveTab] = useState<ResponseTab>("body");

	const handleCopy = useCallback(async () => {
		if (!lastResponse) return;
		await navigator.clipboard.writeText(lastResponse.body);
		toast.success("Response copied to clipboard");
	}, [lastResponse]);

	const handleClear = useCallback(() => {
		setLastResponse(null);
	}, [setLastResponse]);

	const timelineSegments = lastResponse
		? [
				{ label: "DNS Lookup", value: Math.max(2, lastResponse.time * 0.1) },
				{ label: "TCP Connect", value: Math.max(4, lastResponse.time * 0.2) },
				{ label: "TLS Handshake", value: Math.max(4, lastResponse.time * 0.2) },
				{ label: "TTFB", value: Math.max(6, lastResponse.time * 0.3) },
				{ label: "Download", value: Math.max(4, lastResponse.time * 0.2) },
			]
		: [];

	return (
		<GlassPanel className="p-4 flex flex-col gap-3 flex-1">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					{lastResponse ? (
						<>
							<Badge
								variant={
									lastResponse.status < 300
										? "success"
										: lastResponse.status < 400
											? "warning"
											: lastResponse.status < 500
												? "peach"
												: "danger"
								}
								className="text-xs px-3 py-1 font-mono"
							>
								{lastResponse.status} {lastResponse.statusText}
							</Badge>
							<Badge className="font-mono">{lastResponse.time}ms</Badge>
							<Badge className="font-mono">{formatBytes(lastResponse.size)}</Badge>
							{lastResponse.isMock && <Badge variant="mauve">Mock</Badge>}
						</>
					) : (
						<span className="text-xs text-ctp-overlay0">No response yet</span>
					)}
				</div>
				<div className="flex items-center gap-1">
					<Button variant="kbd" size="sm" onClick={handleCopy} disabled={!lastResponse}>
						<Copy size={12} />
					</Button>
					<Button variant="kbd" size="sm" onClick={handleClear} disabled={!lastResponse}>
						<Trash2 size={12} />
					</Button>
				</div>
			</div>

			<div className="flex items-center gap-1 border-b border-ctp-surface0 pb-1">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						type="button"
						onClick={() => setActiveTab(tab.id)}
						className={cn(
							"px-3 py-1.5 text-xs font-medium transition-all duration-150 border-b-2",
							activeTab === tab.id
								? "text-ctp-lavender border-ctp-lavender bg-ctp-lavender/5"
								: "text-ctp-overlay0 border-transparent hover:text-ctp-text",
						)}
					>
						{tab.label}
					</button>
				))}
			</div>

			<div className="flex-1 overflow-auto">
				{activeTab === "body" && (
					<pre className="text-xs font-mono p-3 bg-ctp-crust/40 rounded-xl overflow-auto max-h-[400px] whitespace-pre-wrap break-words text-ctp-text">
						{lastResponse?.body || "// Response body will appear here"}
					</pre>
				)}

				{activeTab === "headers" && (
					<pre className="text-xs font-mono p-3 bg-ctp-crust/40 rounded-xl overflow-auto max-h-[400px] text-ctp-text">
						{lastResponse
							? JSON.stringify(lastResponse.headers, null, 2)
							: "// Response headers will appear here"}
					</pre>
				)}

				{activeTab === "cookies" && (
					<pre className="text-xs font-mono p-3 bg-ctp-crust/40 rounded-xl overflow-auto text-ctp-text">
						{lastResponse?.headers["set-cookie"] || "No cookies"}
					</pre>
				)}

				{activeTab === "timeline" && lastResponse && (
					<div className="space-y-3 p-3">
						<LabelText>Performance Timeline</LabelText>
						{timelineSegments.map((seg) => (
							<div key={seg.label} className="space-y-1">
								<div className="flex justify-between text-xs text-ctp-text">
									<span>{seg.label}</span>
									<span>{seg.value.toFixed(1)}ms</span>
								</div>
								<div className="h-2 bg-ctp-surface0 rounded-full overflow-hidden">
									<div
										className="h-full rounded-full bg-gradient-to-r from-ctp-lavender to-transparent transition-all"
										style={{ width: `${Math.min(100, (seg.value / (lastResponse.time || 1)) * 100)}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</GlassPanel>
	);
}
